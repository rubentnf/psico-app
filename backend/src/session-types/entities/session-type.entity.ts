import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('session_types')
export class SessionType {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'int' })
    durationMinutes!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price!: string;

    @Column({ default: true })
    active!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}