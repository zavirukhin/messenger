import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'jwt-token-example',
    description: 'Старый JWT токен',
  })
  @IsNotEmpty({ message: 'Токен не должен быть пустым' })
  @Matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, {
    message: 'Неверный формат токена',
  })
  oldToken: string;
}
