import { MigrationInterface, QueryRunner } from "typeorm";

export class LMSRefactor1740659501317 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students_table" RENAME COLUMN "full_name" TO "student_name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students_table" RENAME COLUMN "student_name" TO "full_name"`);
    }

}
