import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class SendCodeResponseDto {
  @ApiProperty({ description: 'HTTP статус код' })
  statusCode: HttpStatus;

  @ApiProperty({ description: 'Сообщение об успехе' })
  message: string;
}
