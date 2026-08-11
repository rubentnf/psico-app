export interface SessionType {
    id: string;
    name: string;
    description?: string;
    durationMinutes: number;
    price: string;
    active: boolean;
    createdAt: string;
}