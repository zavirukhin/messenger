import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateMessageStatusDto {
  @ApiProperty({
    description: 'ID чата, для изменения статуса сообщений',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty({ message: 'ID чата не должно быть пустой строкой' })
  chatId: number;
}
