import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AddContactDto {
  @ApiProperty({
    description: 'ID пользователя, которого нужно добавить в контакт',
    example: 456,
  })
  @IsInt({ message: 'ID контакта должно быть числом' })
  contactId: number;
}
