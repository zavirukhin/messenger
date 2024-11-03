import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber } from 'class-validator';

export class SendCodeDto {
  @ApiProperty({
    example: '+12345678901',
    description: 'Телефонный номер пользователя',
  })
  @IsPhoneNumber(null)
  phone: string;
}
