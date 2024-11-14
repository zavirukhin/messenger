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
            name: 'firstName',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'lastName',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'lastActivity',
            type: 'timestamp',
          },
          {
            name: 'avatarBase64',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'customName',
            type: 'varchar',
            length: '50',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
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
