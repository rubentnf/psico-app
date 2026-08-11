import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { UsersService } from '../../../core/services/users.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './patients-list.component.html',
  styleUrl: './patients-list.component.scss',
})
export class PatientsListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly snackBar = inject(MatSnackBar);

  readonly patients = signal<User[]>([]);
  readonly isLoading = signal(true);
  readonly displayedColumns = ['name', 'email', 'phone', 'createdAt'];

  ngOnInit(): void {
    this.usersService.getPatients().subscribe({
      next: (patients) => {
        this.patients.set(patients);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Error al cargar los pacientes', 'Cerrar', { duration: 3000 });
      },
    });
  }

  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
