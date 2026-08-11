import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { AvailabilityService } from '../../../core/services/availability.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AvailabilityException, ExceptionType, WeeklyTemplate } from '../../../core/models/availability.model';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

@Component({
  selector: 'app-availability-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './availability-management.component.html',
  styleUrl: './availability-management.component.scss',
})
export class AvailabilityManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly availabilityService = inject(AvailabilityService);
  private readonly snackBar = inject(MatSnackBar);

  readonly templates = signal<WeeklyTemplate[]>([]);
  readonly exceptions = signal<AvailabilityException[]>([]);
  readonly isLoadingTemplates = signal(true);
  readonly isLoadingExceptions = signal(true);
  readonly dayNames = DAY_NAMES;
  readonly ExceptionType = ExceptionType;

  readonly templateForm = this.fb.group({
    dayOfWeek: [1, [Validators.required]],
    startTime: ['09:00', [Validators.required]],
    endTime: ['14:00', [Validators.required]],
  });

  readonly exceptionForm = this.fb.group({
    date: [new Date(), [Validators.required]],
    type: [ExceptionType.BLOCKED, [Validators.required]],
    fullDay: [true],
    startTime: [''],
    endTime: [''],
    reason: [''],
  });

  ngOnInit(): void {
    this.loadTemplates();
    this.loadExceptions();
  }

  loadTemplates(): void {
    this.isLoadingTemplates.set(true);
    this.availabilityService.getTemplates().subscribe({
      next: (templates) => {
        this.templates.set(templates);
        this.isLoadingTemplates.set(false);
      },
      error: () => {
        this.isLoadingTemplates.set(false);
        this.snackBar.open('Error al cargar la disponibilidad semanal', 'Cerrar', { duration: 3000 });
      },
    });
  }

  loadExceptions(): void {
    this.isLoadingExceptions.set(true);
    const today = new Date();
    const dateFrom = this.formatDate(today);
    const dateTo = this.formatDate(this.addDays(today, 90));

    this.availabilityService.getExceptions(dateFrom, dateTo).subscribe({
      next: (exceptions) => {
        this.exceptions.set(exceptions);
        this.isLoadingExceptions.set(false);
      },
      error: () => {
        this.isLoadingExceptions.set(false);
        this.snackBar.open('Error al cargar las excepciones', 'Cerrar', { duration: 3000 });
      },
    });
  }

  addTemplate(): void {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      return;
    }

    const value = this.templateForm.getRawValue();
    this.availabilityService
      .createTemplate({
        dayOfWeek: value.dayOfWeek!,
        startTime: value.startTime!,
        endTime: value.endTime!,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Disponibilidad añadida', 'Cerrar', { duration: 3000 });
          this.loadTemplates();
        },
        error: (err) => {
          const message = err.status === 409 ? err.error?.message ?? 'Ese horario se solapa con otro existente' : 'Error al añadir disponibilidad';
          this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        }
      });
  }

  removeTemplate(template: WeeklyTemplate): void {
    this.availabilityService.deactivateTemplate(template.id).subscribe({
      next: () => {
        this.snackBar.open('Disponibilidad eliminada', 'Cerrar', { duration: 2000 });
        this.loadTemplates();
      },
      error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }),
    });
  }

  addException(): void {
    if (this.exceptionForm.invalid) {
      this.exceptionForm.markAllAsTouched();
      return;
    }

    const value = this.exceptionForm.getRawValue();
    const isFullDay = value.fullDay;

    this.availabilityService
      .createException({
        date: this.formatDate(value.date!),
        type: value.type!,
        startTime: isFullDay ? undefined : value.startTime || undefined,
        endTime: isFullDay ? undefined : value.endTime || undefined,
        reason: value.reason || undefined,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Excepción añadida', 'Cerrar', { duration: 2000 });
          this.exceptionForm.reset({ date: new Date(), type: ExceptionType.BLOCKED, fullDay: true });
          this.loadExceptions();
        },
        error: () => this.snackBar.open('Error al añadir la excepción', 'Cerrar', { duration: 3000 }),
      });
  }

  removeException(exception: AvailabilityException): void {
    this.availabilityService.deleteException(exception.id).subscribe({
      next: () => {
        this.snackBar.open('Excepción eliminada', 'Cerrar', { duration: 2000 });
        this.loadExceptions();
      },
      error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }),
    });
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  formatExceptionDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
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
