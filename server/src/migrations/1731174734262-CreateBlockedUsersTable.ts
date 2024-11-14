import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

export class CreateBlockedUsersTable1731174734262
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'blocked_users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'blocked_user_id',
            type: 'int',
          },
          {
            name: 'blocked_by_user_id',
            type: 'int',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'blocked_users',
      new TableForeignKey({
        columnNames: ['blocked_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_blocked_user',
      }),
    );

    await queryRunner.createForeignKey(
      'blocked_users',
      new TableForeignKey({
        columnNames: ['blocked_by_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_blocked_by_user',
      }),
    );

    await queryRunner.createUniqueConstraint(
      'blocked_users',
      new TableUnique({
        columnNames: ['blocked_user_id', 'blocked_by_user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('blocked_users');
    const foreignKey1 = table?.foreignKeys.find(
      (fk) => fk.name === 'FK_blocked_user',
    );
    const foreignKey2 = table?.foreignKeys.find(
      (fk) => fk.name === 'FK_blocked_by_user',
    );

    if (foreignKey1) {
      await queryRunner.dropForeignKey('blocked_users', foreignKey1);
    }
    if (foreignKey2) {
      await queryRunner.dropForeignKey('blocked_users', foreignKey2);
    }

    await queryRunner.dropTable('blocked_users');
  }
}
