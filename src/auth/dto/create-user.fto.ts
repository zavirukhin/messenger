import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: '+12345678901',
    description: 'Телефонный номер пользователя',
  })
  @IsPhoneNumber(null)
  phone: string;

  @ApiProperty({
    example: '123456',
    description: '6-значный код подтверждения',
  })
  @IsString()
  @Length(6, 6, { message: 'Код должен содержать 6 символов' })
  code: string;

  @ApiProperty({
    example: 'Иван',
    description: 'Имя пользователя',
  })
  @IsString()
  @Length(1, 50, { message: 'Имя должно быть длиной от 1 до 50 символов' })
  first_name: string;

  @ApiProperty({
    example: 'Иванов',
    description: 'Фамилия пользователя',
  })
  @IsString()
  @Length(1, 50, { message: 'Фамилия должна быть длиной от 1 до 50 символов' })
  last_name: string;
}
