import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ContactService } from '../service/contact.service';
import { AddRemoveContactDto } from '../dto/add-remove-contact.dto';
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
    type: AddRemoveContactDto,
  })
  async addContact(
    @Request() req,
    @Body() addRemoveContactDto: AddRemoveContactDto,
  ): Promise<void> {
    const userId = req.user.id;
    const contactId = addRemoveContactDto.contactId;
    await this.contactService.addContact(contactId, userId);
  }

  @Post('remove')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Удаление контакта' })
  @ApiResponse({
    status: 201,
    description: 'Контакт удалён.',
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
  @ApiBody({
    description: 'Данные для удаления контакта',
    type: AddRemoveContactDto,
  })
  async removeContact(
    @Request() req,
    @Body() addRemoveContactDto: AddRemoveContactDto,
  ): Promise<void> {
    const userId = req.user.id;
    const contactId = addRemoveContactDto.contactId;
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
          first_name: 'Иван',
          last_name: 'Иванов',
          avatar: 'data:image/png;base64,...',
          custom_name: 'Кастомное имя',
        },
        {
          id: 2,
          first_name: 'Мария',
          last_name: 'Петрова',
          avatar: 'data:image/png;base64,...',
          custom_name: 'Другой пользователь',
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
