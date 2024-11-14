import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Имя пользователя (необязательно)',
    example: 'Иван',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя пользователя не должно быть пустой строкой' })
  @Length(1, 50, { message: 'Имя должно быть длиной от 1 до 50 символов' })
  firstName?: string;

  @ApiProperty({
    description: 'Фамилия пользователя (необязательно)',
    example: 'Иванов',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Фамилия пользователя должна быть строкой' })
  @IsNotEmpty({ message: 'Фамилия пользователя не должна быть пустой строкой' })
  @Length(1, 50, { message: 'Фамилия должна быть длиной от 1 до 50 символов' })
  lastName?: string;

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
  @IsNotEmpty({ message: 'Пользовательское имя не должно быть пустой строкой' })
  @Length(1, 50, {
    message: 'Пользовательское имя должно быть длиной от 1 до 50 символов',
  })
  customName?: string;

  @ApiProperty({
    description: 'Аватар пользователя в формате base64 (необязательно)',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Аватар пользователя должен быть строкой' })
  @IsNotEmpty({ message: 'Аватар пользователя не должно быть пустой строкой' })
  avatarBase64?: string;
}
