import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AppointmentsService } from "../../../core/services/appointments.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SessionType } from "../../../core/models/session-type.model";
import { AvailableSlot } from "../../../core/models/appointment.model";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmBookingDialogComponent } from "../confirm-booking-dialog/confirm-booking-dialog.component";

interface DayGroup {
    dayKey: string;
    slots: AvailableSlot[];
}

@Component({
    selector: 'app-book-appointment',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    templateUrl: './book-appointment.component.html',
    styleUrl: './book-appointment.component.scss'
})
export class BookAppointmentComponent implements OnInit {
    private readonly appointmentsService = inject(AppointmentsService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly dialog = inject(MatDialog);

    readonly sessionTypes = signal<SessionType[]>([]);
    readonly selectedSessionType = signal<SessionType | null>(null);
    readonly availableSlots = signal<AvailableSlot[]>([]);
    readonly isLoadingSlots = signal(false);
    readonly isBooking = signal(false);

    readonly lockedDayKey = signal<string | null>(null);

    readonly dateControl = new FormControl<Date | null>(new Date());

    // Agrupamos los slots por día para pintarlos organizados en el template
    readonly slotsByDay = computed<[string, DayGroup][]>(() => {
        const groups = new Map<string, DayGroup>();
        for (const slot of this.availableSlots()) {
            const date = new Date(slot.start);
            const dayKey = date.toDateString();
            const dayLabel = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

            if (!groups.has(dayLabel)) {
                groups.set(dayLabel, { dayKey, slots: [] });
            }
            groups.get(dayLabel)!.slots.push(slot);
        }
        return Array.from(groups.entries());
    });

    ngOnInit(): void {
        this.appointmentsService.getSessionTypes().subscribe({
            next: (types) => this.sessionTypes.set(types),
            error: () => this.snackBar.open('Error al cargar los tipos de sesión', 'Cerrar', { duration: 3000 }),
        });
    }

    selectSessionType(sessionType: SessionType): void {
        this.selectedSessionType.set(sessionType);
        this.lockedDayKey.set(null);
        this.loadAvailableSlots();
    }

    loadAvailableSlots(): void {
        const sessionType = this.selectedSessionType();
        const selectedDate = this.dateControl.value;
        if (!sessionType || !selectedDate) return;

        this.isLoadingSlots.set(true);

        const dateFrom = this.formatDate(selectedDate);
        const dateTo = this.formatDate(this.addDays(selectedDate, 6));

        this.appointmentsService.getAvailableSlots(dateFrom, dateTo, sessionType.id).subscribe({
            next: (slots) => {
                this.availableSlots.set(slots);
                this.isLoadingSlots.set(false);
            },
            error: () => {
                this.isLoadingSlots.set(false);
                this.snackBar.open('Error al cargar la disponibilidad', 'Cerrar', { duration: 3000 });
            },
        });
    }

    isDayLocked(dayKey: string): boolean {
        return this.lockedDayKey() === dayKey;
    }

    openConfirmDialog(slot: AvailableSlot, dayKey: string): void {
        const sessionType = this.selectedSessionType();
        if (!sessionType) return;

        const date = new Date(slot.start);
        const dayLabel = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        const timeLabel = this.formatSlotTime(slot.start);

        const dialogRef = this.dialog.open(ConfirmBookingDialogComponent, {
            data: { sessionType, dayLabel, timeLabel },
            width: '400px',
        });

        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
                this.bookSlot(slot, dayKey);
            }
        });
    }

    bookSlot(slot: AvailableSlot, dayKey: string): void {
        const sessionType = this.selectedSessionType();
        if (!sessionType) return;

        this.isBooking.set(true);
        this.lockedDayKey.set(dayKey);

        this.appointmentsService.createAppointment(sessionType.id, slot.start).subscribe({
            next: () => {
                this.isBooking.set(false);
                this.snackBar.open('Cita reservada correctamente', 'Cerrar', { duration: 3000 });
                this.loadAvailableSlots();
            },
            error: (err) => {
                this.isBooking.set(false);
                this.lockedDayKey.set(null);
                const message = err.status === 409 ? 'Ese horario ya no está disponible' : 'Error al reservar la cita';
                this.snackBar.open(message, 'Cerrar', { duration: 3000 });
            },
        });
    }

    formatSlotTime(isoString: string): string {
        return new Date(isoString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    private addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}