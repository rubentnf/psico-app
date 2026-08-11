import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionType } from './entities/session-type.entity';
import { Repository } from 'typeorm';
import { CreateSessionTypeDto } from './dto/create-session-type.dto';
import { UpdateSessionTypeDto } from './dto/update-session-type.dto';

@Injectable()
export class SessionTypesService {
    constructor(
        @InjectRepository(SessionType)
        private readonly repo: Repository<SessionType>,
    ) { }

    create(dto: CreateSessionTypeDto) {
        const sessionType = this.repo.create({
            ...dto,
            price: dto.price.toString(),
        });
        return this.repo.save(sessionType);
    }

    findAllActive() {
        return this.repo.find({ where: { active: true } });
    }

    findAll() {
        return this.repo.find();
    }

    async update(id: string, dto: UpdateSessionTypeDto) {
        const sessionType = await this.repo.findOne({ where: { id } });
        if (!sessionType) {
            throw new NotFoundException('Tipo de sesión no encontrado');
        }
        Object.assign(sessionType, {
            ...dto,
            ...(dto.price !== undefined && { price: dto.price.toString() }),
        });
        return this.repo.save(sessionType);
    }
}
