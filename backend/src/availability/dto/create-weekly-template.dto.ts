import { IsBoolean, IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";

export class CreateWeeklyTemplateDto {
    @IsInt()
    @Min(0)
    @Max(6)
    dayOfWeek!: number;

    @IsString()
    @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, { message: 'startTime debe tener formato HH:mm' })
    startTime!: string;

    @IsString()
    @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, { message: 'endTime debe tener formato HH:mm' })
    endTime!: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}