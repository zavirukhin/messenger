import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty, Length } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'ID чата в которое отправляется сообщение.',
    example: 2,
  })
  @IsInt()
  chatId: number;

  @ApiProperty({
    description: 'Сообщение',
    example: 'Это сообщение',
  })
  @IsString({ message: 'Сообщение должно быть строкой' })
  @IsNotEmpty({ message: 'Сообщение не должно быть пустой строкой' })
  @Length(1, 50, {
    message: 'Сообщение должно быть длиной от 1 до 1024 символов',
  })
  content: string;
}
