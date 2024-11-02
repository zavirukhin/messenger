import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    example: 1,
    description: 'Уникальный идентификатор пользователя',
  })
  id: number;

  @ApiProperty({
    example: '+1234567890',
    description: 'Телефонный номер пользователя',
  })
  phone: string;

  @ApiProperty({
    example: 'Иван',
    description: 'Имя пользователя',
    nullable: true,
  })
  first_name?: string;

  @ApiProperty({
    example: 'Иванов',
    description: 'Фамилия пользователя',
    nullable: true,
  })
  last_name?: string;

  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    description: 'Последняя активность пользователя',
    nullable: true,
  })
  last_activity?: Date;

  @ApiProperty({
    example: 'data:image/png;base64,...',
    description: 'Аватар пользователя в формате base64',
    nullable: true,
  })
  avatar?: string;

  @ApiProperty({
    example: 'Кастомное имя',
    description: 'Кастомное имя пользователя',
    nullable: true,
  })
  custom_name?: string;

  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    description: 'Дата создания пользователя',
  })
  created_at: Date;

  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    description: 'Дата последнего обновления пользователя',
  })
  updated_at: Date;
}
