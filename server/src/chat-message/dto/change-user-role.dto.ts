import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class ChangeUserRoleDto {
  @ApiProperty({
    description: 'ID пользователя, у которого изменяется роль',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'ID пользователя не должно быть пустой строкой' })
  changeRoleUserId: number;

  @ApiProperty({
    description: 'ID чата, в котором изменяется роль',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty({ message: 'ID чата не должно быть пустой строкой' })
  chatId: number;

  @ApiProperty({
    description: 'ID новой роли',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty({ message: 'ID роли не должно быть пустой строкой' })
  newRoleId: number;
}
