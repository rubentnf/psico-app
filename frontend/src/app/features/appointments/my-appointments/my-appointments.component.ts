import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AppointmentsService } from "../../../core/services/appointments.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { Appointment, AppointmentStatus } from "../../../core/models/appointment.model";
import { ConfirmCancelDialogComponent } from "../confirm-cancel-dialog/confirm-cancel-dialog.component";

@Component({
    selector: 'app-my-appointments',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatChipsModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './my-appointments.component.html',
    styleUrl: './my-appointments.component.scss',
})
export class MyAppointmentsComponent implements OnInit {
    private readonly appointmentsService = inject(AppointmentsService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly dialog = inject(MatDialog);

    readonly appointments = signal<Appointment[]>([]);
    readonly isLoading = signal(true);
    readonly cancellingId = signal<string | null>(null);

    readonly AppointmentStatus = AppointmentStatus;

    readonly upcomingAppointments = computed(() =>
        this.appointments()
            .filter((a) => a.status === AppointmentStatus.CONFIRMED)
            .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
    );

    readonly pastAppointments = computed(() =>
        this.appointments()
            .filter((a) => a.status !== AppointmentStatus.CONFIRMED)
            .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()),
    );

    ngOnInit(): void {
        this.loadAppointments();
    }

    loadAppointments(): void {
        this.isLoading.set(true);
        this.appointmentsService.getMyAppointments().subscribe({
            next: (appointments) => {
                this.appointments.set(appointments);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                this.snackBar.open('Error al cargar tus citas', 'Cerrar', { duration: 3000 });
            },
        });
    }

    openCancelDialog(appointment: Appointment): void {
        const hoursUntil = (new Date(appointment.startAt).getTime() - Date.now()) / (1000 * 60 * 60);
        const willHavePenalty = hoursUntil < 24;

        const dialogRef = this.dialog.open(ConfirmCancelDialogComponent, {
            data: { appointment, willHavePenalty },
            width: '400px',
        });

        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
                this.cancelAppointment(appointment.id);
            }
        });
    }

    private cancelAppointment(id: string): void {
        this.cancellingId.set(id);
        this.appointmentsService.cancelAppointment(id).subscribe({
            next: () => {
                this.cancellingId.set(null);
                this.snackBar.open('Cita cancelada', 'Cerrar', { duration: 3000 });
                this.loadAppointments();
            },
            error: () => {
                this.cancellingId.set(null);
                this.snackBar.open('Error al cancelar la cita', 'Cerrar', { duration: 3000 });
            },
        });
    }

    formatDateTime(isoString: string): string {
        return new Date(isoString).toLocaleString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    statusLabel(status: AppointmentStatus): string {
        const labels: Record<AppointmentStatus, string> = {
            [AppointmentStatus.CONFIRMED]: 'Confirmada',
            [AppointmentStatus.CANCELLED]: 'Cancelada',
            [AppointmentStatus.COMPLETED]: 'Completada',
            [AppointmentStatus.NO_SHOW]: 'No asistió',
        };
        return labels[status];
    }
}