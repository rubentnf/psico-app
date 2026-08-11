import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { Appointment } from "../../../core/models/appointment.model";

export interface ConfirmCancelData {
    appointment: Appointment;
    willHavePenalty: boolean;
}

@Component({
    selector: 'app-confirm-cancel-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
    templateUrl: './confirm-cancel-dialog.component.html',
    styleUrl: './confirm-cancel-dialog.component.scss',
})
export class ConfirmCancelDialogComponent {
    private readonly dialogRef = inject(MatDialogRef<ConfirmCancelDialogComponent>);
    readonly data = inject<ConfirmCancelData>(MAT_DIALOG_DATA);

    confirm(): void {
        this.dialogRef.close(true);
    }

    cancel(): void {
        this.dialogRef.close(false);
    }
}