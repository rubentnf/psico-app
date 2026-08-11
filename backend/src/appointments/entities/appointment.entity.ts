import { SessionType } from "src/session-types/entities/session-type.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum AppointmentStatus {
    CONFIRMED = 'confirmada',
    CANCELLED = 'cancelada',
    COMPLETED = 'completada',
    NO_SHOW = 'no_show'
}

@Entity('appointments')
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'patient_id' })
    patient!: User;

    @ManyToOne(() => SessionType, { eager: true })
    @JoinColumn({ name: 'session_type_id' })
    sessionType!: SessionType;

    @Column({ type: 'timestamptz' })
    startAt!: Date;

    @Column({ type: 'timestamptz' })
    endAt!: Date;

    @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.CONFIRMED })
    status!: AppointmentStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    priceCharged!: string;

    @Column({ default: false })
    cancellationPenaltyApplied!: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    cancelledAt?: Date;

    @CreateDateColumn()
    createdAt!: Date;
}