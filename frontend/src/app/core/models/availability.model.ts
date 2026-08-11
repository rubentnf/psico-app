export interface WeeklyTemplate {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    active: boolean;
    createdAt: string;
}

export enum ExceptionType {
    BLOCKED = 'blocked',
    EXTRA = 'extra'
}

export interface AvailabilityException {
    id: string;
    date: string;
    type: ExceptionType;
    startTime?: string;
    endTime?: string;
    reason?: string;
    createdAt: string;
}