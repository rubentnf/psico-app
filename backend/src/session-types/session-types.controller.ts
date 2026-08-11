import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SessionTypesService } from './session-types.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { CreateSessionTypeDto } from './dto/create-session-type.dto';
import { UpdateSessionTypeDto } from './dto/update-session-type.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('session-types')
@Controller('session-types')
export class SessionTypesController {
    constructor(private readonly service: SessionTypesService) { }

    @Get()
    @ApiOperation({ summary: 'Listar tipos de sesión activos (público)' })
    @ApiResponse({ status: 200, description: 'Lista de tipos de sesión disponibles para reservar' })
    findAllActive() {
        return this.service.findAllActive();
    }

    @Get('all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar todos los tipos de sesión, activos e inactivos (solo admin)' })
    @ApiResponse({ status: 200, description: 'Lista completa de tipos de sesión' })
    findAll() {
        return this.service.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear un nuevo tipo de sesión (solo admin)' })
    @ApiResponse({ status: 201, description: 'Tipo de sesión creado' })
    @ApiResponse({ status: 403, description: 'No tienes permisos de administrador ' })
    create(@Body() dto: CreateSessionTypeDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Editar un tipo de sesión (solo admin) ' })
    @ApiResponse({ status: 200, description: 'Tipo de sesión actualizado' })
    @ApiResponse({ status: 404, description: 'Tipo de sesión no encontrado' })
    update(@Param('id') id: string, @Body() dto: UpdateSessionTypeDto) {
        return this.service.update(id, dto);
    }
}
