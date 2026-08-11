import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-appointments-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './appointments-management.component.html',
  styleUrl: './appointments-management.component.scss',
})
export class AppointmentsManagementComponent implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly snackBar = inject(MatSnackBar);

  readonly appointments = signal<Appointment[]>([]);
  readonly isLoading = signal(true);
  readonly AppointmentStatus = AppointmentStatus;
  readonly displayedColumns = ['patient', 'sessionType', 'startAt', 'status', 'price', 'actions'];

  readonly statusFilter = new FormControl<AppointmentStatus | 'all'>('all');

  ngOnInit(): void {
    this.statusFilter.valueChanges.subscribe(() => this.loadAppointments());
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    const filterValue = this.statusFilter.value;
    const status = filterValue === 'all' ? undefined : (filterValue ?? undefined);

    this.appointmentsService.getAllAppointments(status).subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Error al cargar las citas', 'Cerrar', { duration: 3000 });
      },
    });
  }

  markAsCompleted(appointment: Appointment): void {
    this.updateStatus(appointment, AppointmentStatus.COMPLETED);
  }

  markAsNoShow(appointment: Appointment): void {
    this.updateStatus(appointment, AppointmentStatus.NO_SHOW);
  }

  private updateStatus(appointment: Appointment, status: AppointmentStatus): void {
    this.appointmentsService.updateAppointmentStatus(appointment.id, status).subscribe({
      next: () => {
        this.snackBar.open('Cita actualizada', 'Cerrar', { duration: 2000 });
        this.loadAppointments();
      },
      error: () => this.snackBar.open('Error al actualizar la cita', 'Cerrar', { duration: 3000 }),
    });
  }

  formatDateTime(isoString: string): string {
    return new Date(isoString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
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
