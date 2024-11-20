import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  Length,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatWithMembersDto {
  @ApiProperty({
    description: 'Наименование создаваемого чата',
    example: 'Учебная группа',
  })
  @IsString({ message: 'Наименование чата должно быть строкой' })
  @IsNotEmpty({ message: 'Наименование чата не может быть пустым' })
  @Length(1, 50, {
    message: 'Наименование чата должно быть длиной от 1 до 50 символов',
  })
  chatName: string;

  @ApiProperty({
    description: 'Список ID пользователей, которых нужно добавить в чат',
    example: [2, 3, 4],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Список ID пользователей должен быть массивом' })
  @ArrayNotEmpty({ message: 'Список ID пользователей не может быть пустым' })
  memberIds: number[];
}
