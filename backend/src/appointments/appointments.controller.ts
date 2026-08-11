import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { AppointmentStatus } from './entities/appointment.entity';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
    constructor(private readonly service: AppointmentsService) { }

    @Get('available-slots')
    getAvailableSlots(
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo') dateTo: string,
        @Query('sessionTypeId') sessionTypeId: string,
    ) {
        return this.service.getAvailableSlots(dateFrom, dateTo, sessionTypeId);
    }

    @Post()
    create(@Body() dto: CreateAppointmentDto, @Req() req: any) {
        return this.service.create(dto, req.user.userId);
    }

    @Get('mine')
    findMine(@Req() req: any) {
        return this.service.findMyAppointments(req.user.userId);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    findAll(
        @Query('status') status?: AppointmentStatus,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
    ) {
        return this.service.findAll(status, dateFrom, dateTo);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
        return this.service.updateStatus(id, dto.status);
    }

    @Patch(':id/cancel')
    cancel(@Param('id') id: string, @Req() req: any) {
        return this.service.cancel(id, req.user.userId, req.user.role);
    }

}
