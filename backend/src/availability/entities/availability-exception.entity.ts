import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum ExceptionType {
    BLOCKED = 'blocked',
    EXTRA = 'extra',
}

@Entity('availability_exceptions')
export class AvailabilityException {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'date' })
    date!: string;

    @Column({ type: 'enum', enum: ExceptionType })
    type!: ExceptionType;

    @Column({ type: 'time', nullable: true })
    startTime?: string;

    @Column({ type: 'time', nullable: true })
    endTime?: string;

    @Column({ nullable: true })
    reason?: string;

    @CreateDateColumn()
    createdAt!: Date;
}