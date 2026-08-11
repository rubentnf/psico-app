import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const databaseUrl = process.env.DATABASE_URL;

export const AppDataSource = new DataSource(
    databaseUrl
        ? {
            type: 'postgres',
            url: databaseUrl,
            entities: ['src/**/*.entity.ts'],
            migrations: ['src/migrations/*.ts'],
            synchronize: false,
            ssl: { rejectUnauthorized: false },
        }
        : {
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: ['src/**/*.entity.ts'],
            migrations: ['src/migrations/*.ts'],
            synchronize: false,
        },
);

