import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'jwt-token-example',
    description: 'Старый JWT токен',
  })
  @IsNotEmpty()
  oldToken: string;
}
