import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class UserInit1730566248080 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '15',
            isUnique: true,
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'last_activity',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'avatar_base64',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'custom_name',
            type: 'varchar',
            length: '50',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
