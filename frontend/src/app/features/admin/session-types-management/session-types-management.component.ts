import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { SessionTypesService } from '../../../core/services/session-types.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionType } from '../../../core/models/session-type.model';
import { SessionTypeFormDialogComponent } from '../session-type-form-dialog/session-type-form-dialog.component';

@Component({
  selector: 'app-session-types-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSlideToggleModule, MatProgressSpinnerModule],
  templateUrl: './session-types-management.component.html',
  styleUrl: './session-types-management.component.scss',
})
export class SessionTypesManagementComponent implements OnInit {
  private readonly sessionTypesService = inject(SessionTypesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly sessionTypes = signal<SessionType[]>([]);
  readonly isLoading = signal(true);
  readonly displayedColumns = ['name', 'duration', 'price', 'active', 'actions'];

  ngOnInit(): void {
    this.loadSessionTypes();
  }

  loadSessionTypes(): void {
    this.isLoading.set(true);
    this.sessionTypesService.getAll().subscribe({
      next: (types) => {
        this.sessionTypes.set(types);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Error al cargar los tipos de sesión', 'Cerrar', { duration: 3000 });
      },
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(SessionTypeFormDialogComponent, {
      width: '450px',
      data: { sessionType: null },
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.loadSessionTypes();
    });
  }

  openEditDialog(sessionType: SessionType): void {
    const dialogRef = this.dialog.open(SessionTypeFormDialogComponent, {
      width: '450px',
      data: { sessionType },
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.loadSessionTypes();
    });
  }

  toggleActive(sessionType: SessionType): void {
    this.sessionTypesService.update(sessionType.id, { active: !sessionType.active }).subscribe({
      next: () => {
        this.snackBar.open(sessionType.active ? 'Desactivado' : 'Activado', 'Cerrar', { duration: 2000 });
      },
      error: () => this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 }),
    });
  }
}
