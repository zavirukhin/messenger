import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateMessageStatusDto {
  @ApiProperty({
    description: 'ID чата, для изменения статуса сообщений',
    example: 2,
  })
  @IsNumber()
  chatId: number;
}
