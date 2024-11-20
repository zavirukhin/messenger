import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateChatDto {
  @ApiProperty({
    description: 'ID чата, для обновления данных',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty({ message: 'ID чата не должно быть пустой строкой' })
  chatId: number;

  @ApiProperty({
    description: 'Наименование чата (необязательно)',
    example: 'Группа 1',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Наименование чата должно быть строкой' })
  @IsNotEmpty({ message: 'Наименование чата не должно быть пустой строкой' })
  @Length(1, 50, {
    message: 'Наименование чата должно быть длиной от 1 до 50 символов',
  })
  name?: string;

  @ApiProperty({
    description: 'Аватар чата в формате base64 (необязательно)',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Аватар чата должен быть строкой' })
  @IsNotEmpty({ message: 'Аватар чата не должно быть пустой строкой' })
  avatar?: string;
}
