import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    async create(dto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
        const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
        if (existing) {
            throw new ConflictException('Ya existe un usuario con ese email');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = this.usersRepository.create({
            email: dto.email,
            passwordHash,
            name: dto.name,
            phone: dto.phone,
            role: dto.role,
        });

        return this.usersRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findAllPatients(): Promise<User[]> {
        return this.usersRepository.find({
            where: { role: UserRole.PACIENTE },
            order: { createdAt: 'DESC' },
        });
    }
}
