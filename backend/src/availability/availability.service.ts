import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeeklyAvailabilityTemplate } from './entities/weekly-availability-template.entity';
import { AvailabilityException } from './entities/availability-exception.entity';
import { CreateWeeklyTemplateDto } from './dto/create-weekly-template.dto';
import { CreateExceptionDto } from './dto/create-exception.dto';

@Injectable()
export class AvailabilityService {
    constructor(
        @InjectRepository(WeeklyAvailabilityTemplate)
        private readonly templateRepo: Repository<WeeklyAvailabilityTemplate>,
        @InjectRepository(AvailabilityException)
        private readonly exceptionRepo: Repository<AvailabilityException>,
    ) { }

    async createTemplate(dto: CreateWeeklyTemplateDto) {
        const existingSameDay = await this.templateRepo.find({
            where: { dayOfWeek: dto.dayOfWeek, active: true },
        });

        const overlaps = existingSameDay.some((existing) => {
            return dto.startTime < existing.endTime && dto.endTime > existing.startTime;
        });

        if (overlaps) {
            throw new ConflictException('Ya existe una franja horaria que se solapa con esta para ese día');
        }

        const template = this.templateRepo.create(dto);
        return this.templateRepo.save(template);
    }

    findAllTemplates() {
        return this.templateRepo.find({ where: { active: true } });
    }

    async deactivateTemplate(id: string) {
        const template = await this.templateRepo.findOne({ where: { id } });
        if (!template) {
            throw new NotFoundException('Plantilla no encontrada');
        }
        template.active = false;
        return this.templateRepo.save(template);
    }

    createException(dto: CreateExceptionDto) {
        const exception = this.exceptionRepo.create(dto);
        return this.exceptionRepo.save(exception);
    }

    findExceptionsInRange(dateFrom: string, dateTo: string) {
        return this.exceptionRepo
            .createQueryBuilder('exception')
            .where('exception.date BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo })
            .getMany();
    }

    async deleteException(id: string) {
        const exception = await this.exceptionRepo.findOne({ where: { id } });
        if (!exception) {
            throw new NotFoundException('Excepción no encontrada');
        }
        return this.exceptionRepo.remove(exception);
    }
}