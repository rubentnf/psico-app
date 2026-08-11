import { Module } from '@nestjs/common';
import { SessionTypesService } from './session-types.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionType } from './entities/session-type.entity';
import { SessionTypesController } from './session-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SessionType])],
  controllers: [SessionTypesController],
  providers: [SessionTypesService]
})
export class SessionTypesModule { }
