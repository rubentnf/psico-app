import { SessionType } from "./session-type.model";
import { User } from "./user.model";

export enum AppointmentStatus {
    CONFIRMED = 'confirmada',
    CANCELLED = 'cancelada',
    COMPLETED = 'completada',
    NO_SHOW = 'no_show'
}

export interface Appointment {
    id: string;
    patient: User;
    sessionType: SessionType;
    startAt: string;
    endAt: string;
    status: AppointmentStatus;
    priceCharged: string;
    cancellationPenaltyApplied: boolean;
    cancelledAt?: string;
    createdAt: string;
}

export interface AvailableSlot {
    start: string;
    end: string;
}