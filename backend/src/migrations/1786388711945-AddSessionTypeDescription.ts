import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSessionTypeDescription1786388711945 implements MigrationInterface {
    name = 'AddSessionTypeDescription1786388711945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session_types" ADD "description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session_types" DROP COLUMN "description"`);
    }

}
