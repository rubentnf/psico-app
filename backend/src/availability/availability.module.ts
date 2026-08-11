import { Module } from '@nestjs/common';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeeklyAvailabilityTemplate } from './entities/weekly-availability-template.entity';
import { AvailabilityException } from './entities/availability-exception.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WeeklyAvailabilityTemplate, AvailabilityException])],
  controllers: [AvailabilityController],
  providers: [AvailabilityService]
})
export class AvailabilityModule { }
