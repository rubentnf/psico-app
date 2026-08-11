# Psico App

Aplicación web full-stack de gestión de citas para consulta psicológica. Permite a una profesional gestionar su disponibilidad y a sus pacientes reservar, consultar y cancelar citas de forma autónoma, aplicando automáticamente la política de cancelación del centro.

## Motivación

Proyecto desarrollado como pieza de portfolio para practicar un dominio con lógica de negocio real (cálculo de disponibilidad, prevención de solapes, penalizaciones por cancelación tardía) más allá de un CRUD genérico, usando un stack alineado con el mercado laboral actual (Angular + NestJS).

## Stack técnico

**Frontend**
- Angular 20 (standalone components, Signals)
- Angular Material
- RxJS

**Backend**
- NestJS
- TypeORM + PostgreSQL
- JWT + Passport para autenticación
- class-validator / class-transformer
- Swagger para documentación de API

**Infraestructura**
- Docker Compose (PostgreSQL)
- Migraciones versionadas con TypeORM CLI

## Funcionalidades

### Paciente
- Registro e inicio de sesión
- Consulta de tipos de sesión disponibles (con duración y precio)
- Calendario de huecos libres calculado dinámicamente
- Reserva de cita con confirmación previa
- Listado de citas propias (próximas e historial)
- Cancelación de citas, con aviso de penalización si aplica

### Administración (psicóloga)
- Gestión de tipos de sesión (crear, editar, activar/desactivar)
- Configuración de disponibilidad: plantilla semanal recurrente + excepciones puntuales (bloqueos y huecos extra)
- Gestión de todas las citas: filtrado por estado, marcar como completada o no asistió
- Listado de pacientes registrados

## Reglas de negocio destacadas

- **Cálculo de disponibilidad**: combina la plantilla semanal recurrente con excepciones puntuales (bloqueos/huecos extra) y las citas ya confirmadas, para devolver únicamente los huecos realmente libres.
- **Prevención de doble reserva**: validada tanto en frontend (UX) como en backend (fuente de verdad), evitando condiciones de carrera si dos personas intentan reservar el mismo hueco simultáneamente.
- **Política de cancelación**: cancelaciones con más de 24h de antelación no tienen coste; por debajo de ese margen se aplica una penalización del 50% sobre el precio de la sesión, calculada en el momento de cancelar.
- **Precio histórico**: el precio cobrado en cada cita queda fijado en el momento de la reserva, independiente de cambios posteriores en la tarifa del tipo de sesión.

## Arquitectura

Monorepo con backend y frontend en carpetas independientes, orquestados con Docker Compose para la base de datos.

### Tests E2E

\`\`\`bash
npm run e2e        # ejecutar tests
npm run e2e:ui     # modo interactivo
\`\`\`

## Cómo levantar el proyecto en local

### Requisitos
- Node.js 20+
- Docker Desktop

### 1. Base de datos

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # completar variables si es necesario
npm run migration:run
npm run start:dev
```

API disponible en `http://localhost:3000`. Documentación Swagger en `http://localhost:3000/api-docs`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Aplicación disponible en `http://localhost:4200`.

## Modelo de datos

- **User**: pacientes y administradora, diferenciados por rol.
- **SessionType**: tipos de sesión configurables (nombre, duración, precio).
- **WeeklyAvailabilityTemplate**: horario semanal recurrente.
- **AvailabilityException**: bloqueos o huecos puntuales fuera de la plantilla.
- **Appointment**: citas, con estado (confirmada / cancelada / completada / no asistió), precio cobrado y datos de cancelación.

## Decisiones técnicas

- **NestJS sobre Express puro**: arquitectura modular con inyección de dependencias, familiar viniendo de Angular, y con buena adopción en el mercado.
- **Migraciones en vez de `synchronize: true`**: control de versiones real sobre el esquema, seguro para un eventual despliegue a producción.
- **Interceptor global de serialización**: excluye automáticamente campos sensibles (como el hash de contraseña) de cualquier respuesta, en vez de depender de exclusión manual en cada endpoint.
- **Doble capa de validación**: cualquier regla de negocio con impacto en integridad de datos (solapes, límites de reserva) se aplica en el backend, incluso si ya existe una validación equivalente en el frontend por UX.

## Próximos pasos

- Notificaciones por email (confirmación de reserva, recordatorio 24h antes)
- Tests end-to-end con Playwright
- Despliegue a producción