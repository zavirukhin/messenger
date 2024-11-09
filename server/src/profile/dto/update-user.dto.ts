import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Имя пользователя (необязательно)',
    example: 'Иван',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  first_name?: string;

  @ApiProperty({
    description: 'Фамилия пользователя (необязательно)',
    example: 'Иванов',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Фамилия пользователя должна быть строкой' })
  last_name?: string;

  @ApiProperty({
    description: 'Пользовательское имя (необязательно)',
    example: 'Ваня',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: 'Пользовательское имя пользователя должно быть строкой',
  })
  @Matches(/^[A-Za-z]+$/, {
    message: 'Пользовательское имя должно содержать только английские буквы',
  })
  custom_name?: string;

  @ApiProperty({
    description: 'Аватар пользователя в формате base64 (необязательно)',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Аватар пользователя должен быть строкой' })
  avatar_base64?: string;
}
