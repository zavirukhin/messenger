import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpStatus,
  Delete,
  Param,
} from '@nestjs/common';
import { ContactService } from '../service/contact.service';
import { AddContactDto } from '../dto/add-contact.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { User } from '../../entity/user.entity';
import { JwtAuthGuard } from '../../jwt/guard/jwt-auth.guard';
import { ErrorCode } from '../../error-codes';

@ApiTags('contacts')
@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('add')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Добавление контакта' })
  @ApiResponse({
    status: 201,
    description: 'Контакт добавлен.',
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        message: ['Message'],
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
      },
    },
    description: 'Неверные входные данные.',
  })
  @ApiResponse({
    status: 409,
    schema: {
      example: {
        message: 'Контакт уже существует.',
        errorCode: ErrorCode.CONTACT_ALREADY_EXISTS,
        statusCode: HttpStatus.CONFLICT,
      },
    },
    description: 'Контакт уже существует.',
  })
  @ApiResponse({
    status: 403,
    schema: {
      example: {
        message: 'Нельзя добавить самого себя в контакт.',
        errorCode: ErrorCode.CANNOT_ADD_SELF_AS_CONTACT,
        statusCode: HttpStatus.FORBIDDEN,
      },
    },
    description: 'Нельзя добавить самого себя в контакт.',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован.',
  })
  @ApiBody({
    description: 'Данные для добавления контакта',
    type: AddContactDto,
  })
  async addContact(
    @Request() req,
    @Body() addRemoveContactDto: AddContactDto,
  ): Promise<void> {
    const userId = req.user.id;
    const contactId = addRemoveContactDto.contactId;
    await this.contactService.addContact(contactId, userId);
  }

  @Delete('remove/:contactId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Удаление контакта' })
  @ApiResponse({
    status: 200,
    description: 'Контакт удалён.',
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        message: 'Контакт не найден.',
        errorCode: ErrorCode.CONTACT_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
    description: 'Контакт не найден.',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован.',
  })
  async removeContact(
    @Request() req,
    @Param('contactId') contactId: number,
  ): Promise<void> {
    const userId = req.user.id;
    await this.contactService.removeContact(contactId, userId);
  }

  @Get('list')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить список контактов' })
  @ApiResponse({
    status: 200,
    description: 'Список контактов',
    schema: {
      example: [
        {
          id: 1,
          firstName: 'Иван',
          lastName: 'Иванов',
          avatar: 'data:image/png;base64,...',
          customName: 'Кастомное имя',
        },
        {
          id: 2,
          firstName: 'Мария',
          lastName: 'Петрова',
          avatar: 'data:image/png;base64,...',
          customName: 'Другой пользователь',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован.',
  })
  async getContacts(@Request() req): Promise<User[]> {
    const userId = req.user.id;
    return this.contactService.getContacts(userId);
  }
}
