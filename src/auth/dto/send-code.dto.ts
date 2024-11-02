import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, Length } from 'class-validator';

export class SendCodeDto {
  @ApiProperty({
    description:
      'Номер телефона пользователя в формате международного стандарта E.164',
    example: '+12345678901',
  })
  @IsString()
  @Matches(/^\+\d{10,15}$/, {
    message: 'Номер телефона должен быть в международном формате (E.164)',
  })
  @Length(11, 16)
  phone: string;
}
