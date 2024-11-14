import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

export class CreateContactsTable1731195410302 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'contacts',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'contacted_user_id',
            type: 'int',
          },
          {
            name: 'contacted_by_user_id',
            type: 'int',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'contacts',
      new TableForeignKey({
        columnNames: ['contacted_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_contacted_user',
      }),
    );

    await queryRunner.createForeignKey(
      'contacts',
      new TableForeignKey({
        columnNames: ['contacted_by_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_contacted_by_user',
      }),
    );

    await queryRunner.createUniqueConstraint(
      'contacts',
      new TableUnique({
        columnNames: ['contacted_user_id', 'contacted_by_user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('contacts');
    const foreignKey1 = table?.foreignKeys.find(
      (fk) => fk.name === 'FK_contacted_user',
    );
    const foreignKey2 = table?.foreignKeys.find(
      (fk) => fk.name === 'FK_contacted_by_user',
    );

    if (foreignKey1) {
      await queryRunner.dropForeignKey('contacts', foreignKey1);
    }
    if (foreignKey2) {
      await queryRunner.dropForeignKey('contacts', foreignKey2);
    }

    await queryRunner.dropTable('contacts');
  }
}
