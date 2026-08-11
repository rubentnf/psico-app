import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Between, Repository } from 'typeorm';
import { WeeklyAvailabilityTemplate } from 'src/availability/entities/weekly-availability-template.entity';
import { AvailabilityException, ExceptionType } from 'src/availability/entities/availability-exception.entity';
import { SessionType } from 'src/session-types/entities/session-type.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { NotificationsService } from 'src/notifications/notifications.service';

const CANCELLATION_FULL_REFUND_HOURS = 24;
const CANCELLATION_PENALTY_RATE = 0.5;

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectRepository(Appointment)
        private readonly appointmentRepo: Repository<Appointment>,
        @InjectRepository(WeeklyAvailabilityTemplate)
        private readonly templateRepo: Repository<WeeklyAvailabilityTemplate>,
        @InjectRepository(AvailabilityException)
        private readonly exceptionRepo: Repository<AvailabilityException>,
        @InjectRepository(SessionType)
        private readonly sessionTypeRepo: Repository<SessionType>,
        private readonly usersService: UsersService,
        private readonly notificationsService: NotificationsService,
    ) { }

    // CÁLCULO DE HUECOS DISPONIBLES
    async getAvailableSlots(dateFrom: string, dateTo: string, sessionTypeId: string) {
        const sessionType = await this.sessionTypeRepo.findOne({ where: { id: sessionTypeId } });
        if (!sessionType) {
            throw new NotFoundException('Tipo de sesión no encontrado');
        }
        const durationMs = sessionType.durationMinutes * 60 * 1000;

        const templates = await this.templateRepo.find({ where: { active: true } });
        const exceptions = await this.exceptionRepo
            .createQueryBuilder('exception')
            .where('exception.date BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo })
            .getMany();

        const existingAppointments = await this.appointmentRepo.find({
            where: {
                status: AppointmentStatus.CONFIRMED,
                startAt: Between(new Date(dateFrom), new Date(`${dateTo}T23:59:59`)),
            },
        });

        const slots: { start: Date; end: Date }[] = [];
        const start = new Date(dateFrom);
        const end = new Date(dateTo);

        // Recorremos día a día el rango solicitado
        for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
            const dayOfWeek = day.getDay();
            const dateStr = day.toISOString().split('T')[0];

            // Excepción de día completo bloqueado
            const fullDayBlocked = exceptions.some(
                (e) => e.date === dateStr && e.type === ExceptionType.BLOCKED && !e.startTime && !e.endTime,
            );
            if (fullDayBlocked) continue;

            // Plantillas que aplican a este día de la semana
            const dayTemplates = templates.filter((t) => t.dayOfWeek === dayOfWeek);

            // Excepciones "extra" puntuales para este día concreto
            const dayExtras = exceptions.filter(
                (e) => e.date === dateStr && e.type === ExceptionType.EXTRA && e.startTime && e.endTime,
            );

            // Excepciones "blocked" parciales (bloquean solo una franja horaria)
            const dayPartialBlocks = exceptions.filter(
                (e) => e.date === dateStr && e.type === ExceptionType.BLOCKED && e.startTime && e.endTime,
            );

            const ranges = [
                ...dayTemplates.map((t) => ({ start: t.startTime, end: t.endTime })),
                ...dayExtras.map((e) => ({ start: e.startTime!, end: e.endTime! })),
            ];

            for (const range of ranges) {
                let slotStart = this.combineDateAndTime(dateStr, range.start);
                const rangeEnd = this.combineDateAndTime(dateStr, range.end);

                while (slotStart.getTime() + durationMs <= rangeEnd.getTime()) {
                    const slotEnd = new Date(slotStart.getTime() + durationMs);

                    const overlapsPartialBlock = dayPartialBlocks.some((block) => {
                        const blockStart = this.combineDateAndTime(dateStr, block.startTime!);
                        const blockEnd = this.combineDateAndTime(dateStr, block.endTime!);
                        return slotStart < blockEnd && slotEnd > blockStart;
                    });

                    const overlapsAppointment = existingAppointments.some((appt) => {
                        return slotStart < appt.endAt && slotEnd > appt.startAt;
                    });

                    const isInPast = slotStart < new Date();

                    if (!overlapsPartialBlock && !overlapsAppointment && !isInPast) {
                        slots.push({ start: new Date(slotStart), end: slotEnd });
                    }

                    slotStart = new Date(slotStart.getTime() + durationMs);
                }
            }
        }

        return slots;
    }

    private combineDateAndTime(dateStr: string, timeStr: string): Date {
        return new Date(`${dateStr}T${timeStr}`);
    }

    // CREAR CITA
    async create(dto: CreateAppointmentDto, patientId: string) {
        const patient = await this.usersService.findById(patientId);
        if (!patient) {
            throw new NotFoundException('Paciente no encontrado');
        }

        const sessionType = await this.sessionTypeRepo.findOne({ where: { id: dto.sessionTypeId } });
        if (!sessionType) {
            throw new NotFoundException('Tipo de sesión no encontrado');
        }

        const startAt = new Date(dto.startAt);
        const endAt = new Date(startAt.getTime() + sessionType.durationMinutes * 60 * 1000);

        if (startAt < new Date()) {
            throw new BadRequestException('No se puede reservar una cita en el pasado');
        }

        const dayStart = new Date(startAt);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(startAt);
        dayEnd.setHours(23, 59, 59, 999);

        const existingSameDay = await this.appointmentRepo
            .createQueryBuilder('appt')
            .where('appt.patient_id = :patientId', { patientId })
            .andWhere('appt.status = :status', { status: AppointmentStatus.CONFIRMED })
            .andWhere('appt.startAt BETWEEN :dayStart AND :dayEnd', { dayStart, dayEnd })
            .getOne();

        if (existingSameDay) {
            throw new ConflictException('Ya tienes una cita confirmada ese día');
        }

        // Revalidamos el solape en el momento de guardar (no solo confiar en lo que el frontend mostró)
        const overlapping = await this.appointmentRepo
            .createQueryBuilder('appt')
            .where('appt.status = :status', { status: AppointmentStatus.CONFIRMED })
            .andWhere('appt.startAt < :endAt', { endAt })
            .andWhere('appt.endAt > :startAt', { startAt })
            .getOne();

        if (overlapping) {
            throw new ConflictException('Ese horario ya no está disponible');
        }

        const appointment = this.appointmentRepo.create({
            patient,
            sessionType,
            startAt,
            endAt,
            status: AppointmentStatus.CONFIRMED,
            priceCharged: sessionType.price,
        });

        const saved = await this.appointmentRepo.save(appointment);

        // Enviamos el email de forma asíncrona, sin bloquear la respuesta al usuario
        this.notificationsService.sendBookingConfirmation({
            to: patient.email,
            patientName: patient.name,
            sessionTypeName: sessionType.name,
            startAt: saved.startAt,
            price: saved.priceCharged,
        });

        return saved;
    }

    // CANCELAR CITA (con lógica de penalización)
    async cancel(id: string, userId: string, role: string) {
        const appointment = await this.appointmentRepo.findOne({ where: { id } });
        if (!appointment) {
            throw new NotFoundException('Cita no encontrada');
        }

        if (appointment.patient.id !== userId && role !== 'admin') {
            throw new ForbiddenException('No puedes cancelar una cita que no es tuya');
        }

        if (appointment.status !== AppointmentStatus.CONFIRMED) {
            throw new BadRequestException('Esta cita ya no está activa');
        }

        const hoursUntilAppointment = (appointment.startAt.getTime() - Date.now()) / (100 * 60 * 60);
        const penaltyApplies = hoursUntilAppointment < CANCELLATION_FULL_REFUND_HOURS;

        appointment.status = AppointmentStatus.CANCELLED;
        appointment.cancelledAt = new Date();
        appointment.cancellationPenaltyApplied = penaltyApplies;

        if (penaltyApplies) {
            const originalPrice = parseFloat(appointment.priceCharged);
            appointment.priceCharged = (originalPrice * CANCELLATION_PENALTY_RATE).toFixed(2);
        }

        const saved = await this.appointmentRepo.save(appointment);

        this.notificationsService.sendCancellationNotice({
            to: appointment.patient.email,
            patientName: appointment.patient.name,
            sessionTypeName: appointment.sessionType.name,
            startAt: appointment.startAt,
            penaltyApplied: penaltyApplies,
        });

        return saved;
    }

    async updateStatus(id: string, status: AppointmentStatus) {
        const appointment = await this.appointmentRepo.findOne({ where: { id } });
        if (!appointment) {
            throw new NotFoundException('Cita no encontrada');
        }

        const allowedTransitions: AppointmentStatus[] = [AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW];
        if (!allowedTransitions.includes(status)) {
            throw new BadRequestException('Estado no permitido para esta transición');
        }

        if (appointment.status !== AppointmentStatus.CONFIRMED) {
            throw new BadRequestException('Solo se puede actualizar una cita que esté confirmada');
        }

        appointment.status = status;
        return this.appointmentRepo.save(appointment);
    }

    // LISTADOS
    findMyAppointments(patientId: string) {
        return this.appointmentRepo.find({
            where: { patient: { id: patientId } },
            order: { startAt: 'DESC' },
        });
    }

    async findAll(status?: AppointmentStatus, dateFrom?: string, dateTo?: string) {
        const query = this.appointmentRepo
            .createQueryBuilder('appt')
            .leftJoinAndSelect('appt.patient', 'patient')
            .leftJoinAndSelect('appt.sessionType', 'sessionType')
            .orderBy('appt.startAt', 'DESC');

        if (status) {
            query.andWhere('appt.status = :status', { status });
        }

        if (dateFrom) {
            query.andWhere('appt.startAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
        }

        if (dateTo) {
            query.andWhere('appt.startAt <= :dateTo', { dateTo: new Date(`${dateTo}T23:59:59`) });
        }

        return query.getMany();
    }
}
