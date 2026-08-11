import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateWeeklyTemplateDto } from './dto/create-weekly-template.dto';
import { CreateExceptionDto } from './dto/create-exception.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('availability')
export class AvailabilityController {
    constructor(private readonly service: AvailabilityService) { }

    @Get('templates')
    findAllTemplates() {
        return this.service.findAllTemplates();
    }

    @Post('templates')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    createTemplate(@Body() dto: CreateWeeklyTemplateDto) {
        return this.service.createTemplate(dto);
    }

    @Patch('templates/:id/deactivate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    deactivateTemplate(@Param('id') id: string) {
        return this.service.deactivateTemplate(id);
    }

    @Post('exceptions')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    createException(@Body() dto: CreateExceptionDto) {
        return this.service.createException(dto);
    }

    @Get('exceptions')
    findExceptions(@Query('dateFrom') dateFrom: string, @Query('dateTo') dateTo: string) {
        return this.service.findExceptionsInRange(dateFrom, dateTo);
    }

    @Delete('exceptions/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    deleteException(@Param('id') id: string) {
        return this.service.deleteException(id);
    }
}