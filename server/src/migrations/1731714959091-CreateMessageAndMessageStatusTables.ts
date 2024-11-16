import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateMessageAndMessageStatusTables1731714959091
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'message-statuses',
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
            length: '25',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.query(`
          INSERT INTO "message-statuses"("name") VALUES
          ('send'),
          ('read');
        `);

    await queryRunner.createTable(
      new Table({
        name: 'messages',
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
            name: 'message_status_id',
            type: 'int',
          },
          {
            name: 'content',
            type: 'varchar',
            length: '1024',
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

    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['chat_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chats',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['message_status_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'message-statuses',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const messageTable = await queryRunner.getTable('messages');
    const chatForeignKey = messageTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('chat_id') !== -1,
    );
    const userForeignKey = messageTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    const messageStatusForeignKey = messageTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('message_status_id') !== -1,
    );

    if (chatForeignKey)
      await queryRunner.dropForeignKey('messages', chatForeignKey);
    if (userForeignKey)
      await queryRunner.dropForeignKey('messages', userForeignKey);
    if (messageStatusForeignKey)
      await queryRunner.dropForeignKey('messages', messageStatusForeignKey);

    await queryRunner.dropTable('messages');
    await queryRunner.dropTable('message-statuses');
  }
}
