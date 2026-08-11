import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { SessionType } from "../../../core/models/session-type.model";

export interface ConfirmBookingData {
    sessionType: SessionType;
    dayLabel: string;
    timeLabel: string;
}

@Component({
    selector: 'app-confirm-booking-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
    templateUrl: './confirm-booking-dialog.component.html',
    styleUrl: './confirm-booking-dialog.component.scss',
})
export class ConfirmBookingDialogComponent {
    private readonly dialogRef = inject(MatDialogRef<ConfirmBookingDialogComponent>);
    readonly data = inject<ConfirmBookingData>(MAT_DIALOG_DATA);

    confirm(): void {
        this.dialogRef.close(true);
    }

    cancel(): void {
        this.dialogRef.close(false);
    }

}