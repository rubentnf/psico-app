import { Component, inject } from '@angular/core';
import { SessionType } from '../../../core/models/session-type.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SessionTypesService } from '../../../core/services/session-types.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInput } from "@angular/material/input";
import { MatAnchor } from "@angular/material/button";

export interface SessionTypeFormData {
  sessionType: SessionType | null;
}

@Component({
  selector: 'app-session-type-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInput, MatAnchor],
  templateUrl: './session-type-form-dialog.component.html',
  styleUrl: './session-type-form-dialog.component.scss',
})
export class SessionTypeFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<SessionTypeFormDialogComponent>);
  private readonly sessionTypesService = inject(SessionTypesService);
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject<SessionTypeFormData>(MAT_DIALOG_DATA);

  readonly isEditMode = this.data.sessionType !== null;

  readonly form = this.fb.group({
    name: [this.data.sessionType?.name ?? '', [Validators.required]],
    description: [this.data.sessionType?.description ?? ''],
    durationMinutes: [this.data.sessionType?.durationMinutes ?? 60, [Validators.required]],
    price: [
      this.data.sessionType ? parseFloat(this.data.sessionType.price) : 0,
      [Validators.required, Validators.min(0)],
    ],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const dto = {
      name: value.name!,
      description: value.description || undefined,
      durationMinutes: value.durationMinutes!,
      price: value.price!,
    };

    const request = this.isEditMode
      ? this.sessionTypesService.update(this.data.sessionType!.id, dto)
      : this.sessionTypesService.create(dto);

    request.subscribe({
      next: () => {
        this.snackBar.open(this.isEditMode ? 'Actualizado' : 'Creado', 'Cerrar', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: () => this.snackBar.open('Error al guardar', 'Cerrar', { duration: 3000 }),
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

}
