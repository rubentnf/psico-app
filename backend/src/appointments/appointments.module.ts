import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { WeeklyAvailabilityTemplate } from 'src/availability/entities/weekly-availability-template.entity';
import { AvailabilityException } from 'src/availability/entities/availability-exception.entity';
import { SessionType } from 'src/session-types/entities/session-type.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, WeeklyAvailabilityTemplate, AvailabilityException, SessionType]),
    UsersModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService]
})
export class AppointmentsModule { }
