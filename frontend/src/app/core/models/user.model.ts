export enum UserRole {
    ADMIN = 'admin',
    PACIENTE = 'paciente',
}

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: UserRole;
    createdAt: string;
}