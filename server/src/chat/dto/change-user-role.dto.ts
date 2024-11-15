import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ChangeUserRoleDto {
  @ApiProperty({
    description: 'ID пользователя, у которого изменяется роль',
    example: 1,
  })
  @IsNumber()
  changeRoleUserId: number;

  @ApiProperty({
    description: 'ID чата, в котором изменяется роль',
    example: 2,
  })
  @IsNumber()
  chatId: number;

  @ApiProperty({
    description: 'ID новой роли',
    example: 2,
  })
  @IsNumber()
  newRoleId: number;
}
