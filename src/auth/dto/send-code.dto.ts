import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class SendCodeDto {
  @ApiProperty({
    example: '+12345678901',
    description: 'Телефонный номер пользователя',
  })
  @IsNotEmpty({ message: 'Номер телефона не может быть пустым' })
  @IsPhoneNumber(null, { message: 'Неверный формат номера телефона' })
  phone: string;
}
