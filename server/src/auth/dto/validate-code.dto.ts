import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateCodeDto {
  @ApiProperty({
    example: '+12345678901',
    description: 'Телефонный номер пользователя',
  })
  @IsNotEmpty({ message: 'Номер телефона не может быть пустым' })
  @IsPhoneNumber(null, { message: 'Неверный формат номера телефона' })
  phone: string;

  @ApiProperty({
    description: '6-значный код подтверждения',
    example: '432665',
  })
  @IsString({ message: 'Код должен быть строкой' })
  @Length(6, 6, {
    message: 'Код должен содержать 6 символов',
  })
  code: string;
}
