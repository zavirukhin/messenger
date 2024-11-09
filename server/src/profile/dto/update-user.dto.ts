import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Имя пользователя (необязательно)',
    example: 'Иван',
    required: false,
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({
    description: 'Фамилия пользователя (необязательно)',
    example: 'Иванов',
    required: false,
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({
    description: 'Пользовательское имя (необязательно)',
    example: 'Ваня',
    required: false,
  })
  @IsOptional()
  @IsString()
  custom_name?: string;

  @ApiProperty({
    description: 'Аватар пользователя в формате base64 (необязательно)',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar_base64?: string;
}
