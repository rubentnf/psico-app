import { IsDateString, IsEnum, IsOptional, IsString, Matches } from "class-validator";
import { ExceptionType } from "../entities/availability-exception.entity";

export class CreateExceptionDto {
    @IsDateString()
    date!: string;

    @IsEnum(ExceptionType)
    type!: ExceptionType;

    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, { message: 'startTime debe tener formato HH:mm' })
    startTime?: string;

    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, { message: 'endTime debe tener formato HH:mm' })
    endTime?: string;

    @IsOptional()
    @IsString()
    reason?: string;

}