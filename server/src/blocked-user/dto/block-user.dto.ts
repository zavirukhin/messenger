import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class BlockUserDto {
  @ApiProperty({
    description:
      'ID пользователя, которого нужно заблокировать или разблокировать',
    example: 123,
  })
  @IsInt({ message: 'ID пользователя должно быть числом' })
  userId: number;
}
