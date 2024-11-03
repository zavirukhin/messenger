import { IsPhoneNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateCodeDto {
  @ApiProperty({
    example: '+12345678901',
    description: 'Телефонный номер пользователя',
  })
  @IsPhoneNumber(null)
  phone: string;

  @ApiProperty({
    description: '6-значный код подтверждения',
    example: '432665',
  })
  @IsString()
  @Length(6, 6, {
    message: 'Код должен содержать 6 символов',
  })
  code: string;
}
