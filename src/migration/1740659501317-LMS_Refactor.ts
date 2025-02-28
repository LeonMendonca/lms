import { MigrationInterface, QueryRunner } from 'typeorm';

export class LMSRefactor1740659501317 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //test eg
    //await queryRunner.query(`ALTER TABLE "students_table" RENAME COLUMN "full_name" TO "student_name"`);
    await queryRunner.query(
      `UPDATE students_table SET "is_archived" = false, "department" = 'it'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //test eg
    //await queryRunner.query(`ALTER TABLE "students_table" RENAME COLUMN "student_name" TO "full_name"`);
    await queryRunner.query(
      `UPDATE students_table SET "is_archived" = false, "department" = NULL`,
    );
  }
}
