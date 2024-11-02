import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateCodeDto {
  @ApiProperty({
    description:
      'Номер телефона пользователя в формате международного стандарта E.164',
    example: '+12345678901',
  })
  @IsString()
  @Matches(/^\+\d{10,15}$/, {
    message: 'Номер телефона должен быть в международном формате (E.164)',
  })
  phone: string;

  @ApiProperty({
    description: '6-значный код подтверждения',
    example: '432665',
  })
  @IsString()
  @Length(6, 6, {
    message: 'Код должен быть 6-значным числом',
  })
  code: string;
}
