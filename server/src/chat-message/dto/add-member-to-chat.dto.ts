import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AddMemberToChatDto {
  @ApiProperty({
    description: 'ID пользователя которого добавляем в чат',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty({ message: 'ID пользователя не должно быть пустой строкой' })
  newMemberId: number;

  @ApiProperty({
    description: 'ID чата куда будет добавлен участник',
    example: 3,
  })
  @IsInt()
  @IsNotEmpty({ message: 'ID чата не должно быть пустой строкой' })
  chatId: number;
}
