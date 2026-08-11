import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum UserRole {
    ADMIN = 'admin',
    PACIENTE = 'paciente',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Exclude()
    @Column()
    passwordHash!: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.PACIENTE })
    role!: UserRole;

    @Column()
    name!: string;

    @Column({ nullable: true })
    phone?: string;

    @CreateDateColumn()
    createdAt!: Date;
}