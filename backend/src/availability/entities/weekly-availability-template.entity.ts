import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('weekly_availability_templates')
export class WeeklyAvailabilityTemplate {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'int' })
    dayOfWeek!: number;

    @Column({ type: 'time' })
    startTime!: string;

    @Column({ type: 'time' })
    endTime!: string;

    @Column({ default: true })
    active!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

}