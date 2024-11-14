import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, Length, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: '+12345678901',
    description: 'Телефонный номер пользователя',
  })
  @IsNotEmpty({ message: 'Номер телефона не может быть пустым' })
  @IsPhoneNumber(null, { message: 'Неверный формат номера телефона' })
  phone: string;

  @ApiProperty({
    example: '123456',
    description: '6-значный код подтверждения',
  })
  @IsString({ message: 'Код должен быть строкой' })
  @Length(6, 6, { message: 'Код должен содержать 6 символов' })
  code: string;

  @ApiProperty({
    example: 'Иван',
    description: 'Имя пользователя',
  })
  @IsString({ message: 'Имя должно быть строкой' })
  @Length(1, 50, { message: 'Имя должно быть длиной от 1 до 50 символов' })
  firstName: string;

  @ApiProperty({
    example: 'Иванов',
    description: 'Фамилия пользователя',
  })
  @IsString({ message: 'Фамилия должна быть строкой' })
  @Length(1, 50, { message: 'Фамилия должна быть длиной от 1 до 50 символов' })
  lastName: string;
}
