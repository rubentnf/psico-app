import { IsDateString, IsUUID } from "class-validator";

export class CreateAppointmentDto {
    @IsUUID()
    sessionTypeId!: string;

    @IsDateString()
    startAt!: string;
}