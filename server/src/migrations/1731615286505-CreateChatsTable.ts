import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

export class CreateChatsTable1731615286505 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'chats',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'avatar',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'chat-roles',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
          },
        ],
      }),
    );

    await queryRunner.query(`
      INSERT INTO "chat-roles" ("name") 
      VALUES 
        ('owner'), 
        ('admin'), 
        ('user');
    `);

    await queryRunner.createTable(
      new Table({
        name: 'chat-members',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'chat_id',
            type: 'int',
          },
          {
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'chat_role_id',
            type: 'int',
          },
        ],
        uniques: [
          new TableUnique({
            columnNames: ['chat_id', 'user_id'],
          }),
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'chat-members',
      new TableForeignKey({
        columnNames: ['chat_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chats',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'chat-members',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'chat-members',
      new TableForeignKey({
        columnNames: ['chat_role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chat-roles',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('chat-members');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('chat-members', fk);
      }
    }

    await queryRunner.dropTable('chat-members');
    await queryRunner.dropTable('chat-roles');
    await queryRunner.dropTable('chats');
  }
}
