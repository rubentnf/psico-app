import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";

export class CreateSessionTypeDto {
    @ApiProperty({ example: 'Primera visita', description: 'Nombre del tipo de sesión' })
    @IsString()
    name!: string;

    @ApiPropertyOptional({ example: 'Sesión inicial de evaluación' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 60, description: 'Duración en minutos' })
    @IsInt()
    @IsPositive()
    durationMinutes!: number;

    @ApiProperty({ example: 50, description: 'Precio en euros' })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price!: number;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

}