import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class RemoveMemberFromChatDto {
  @ApiProperty({
    description: 'ID пользователя которого удаляем из чата',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty({ message: 'ID пользователя не должно быть пустой строкой' })
  memberIdToRemove: number;

  @ApiProperty({
    description: 'ID чата откуда будет удален участник',
    example: 3,
  })
  @IsInt()
  @IsNotEmpty({ message: 'ID чата не должно быть пустой строкой' })
  chatId: number;
}
