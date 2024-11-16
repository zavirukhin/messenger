import {
  Controller,
  Body,
  Request,
  UseGuards,
  HttpStatus,
  Post,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../jwt/guard/jwt-auth.guard';
import { ErrorCode } from '../../error-codes';
import { ApiMultipleResponse } from '../../swagger/decorator/api-multi-response.decorator';
import { MessageService } from '../service/message.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageStatusDto } from '../dto/update-message-status.dto';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Отправить сообщение',
  })
  @ApiResponse({
    status: 201,
    description: 'Сообщение отправлено.',
    schema: {
      example: {
        id: 1,
        chatId: 2,
        userId: 3,
        messageStatus: 'send',
        content: 'Мое сообщение',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
      },
    },
  })
  @ApiMultipleResponse(
    {
      status: 404,
      schema: {
        example: {
          message: 'Чат не найден.',
          errorCode: ErrorCode.CHAT_NOT_FOUND,
          statusCode: HttpStatus.NOT_FOUND,
        },
      },
      description: 'Чат не найден.',
    },
    {
      status: 404,
      schema: {
        example: {
          message: 'Пользователь не является членом чата.',
          errorCode: ErrorCode.USER_NOT_A_MEMBER_CHAT,
          statusCode: HttpStatus.FORBIDDEN,
        },
      },
      description: 'Пользователь не является членом чата.',
    },
  )
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
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiBody({
    description: 'Данные для отправки сообщения.',
    type: CreateMessageDto,
  })
  async createMessage(
    @Request() req,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const userId = req.user.id;
    return await this.messageService.createMessage(createMessageDto, userId);
  }

  @Post('markChatMessagesAsRead')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Обновить статус сообщений на прочитанное',
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
  @ApiMultipleResponse(
    {
      status: 404,
      schema: {
        example: {
          message: 'Чат не найден.',
          errorCode: ErrorCode.CHAT_NOT_FOUND,
          statusCode: HttpStatus.NOT_FOUND,
        },
      },
      description: 'Чат не найден.',
    },
    {
      status: 404,
      schema: {
        example: {
          message: 'Пользователь не является членом чата.',
          errorCode: ErrorCode.USER_NOT_A_MEMBER_CHAT,
          statusCode: HttpStatus.FORBIDDEN,
        },
      },
      description: 'Пользователь не является членом чата.',
    },
  )
  @ApiResponse({
    status: 201,
    description: 'Статус сообщений обновлен.',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiBody({
    description: 'Данные для статуса сообщений.',
    type: UpdateMessageStatusDto,
  })
  async updateUser(
    @Request() req,
    @Body() updateMessageStatusDto: UpdateMessageStatusDto,
  ) {
    const userId = req.user.id;
    return await this.messageService.markChatMessagesAsRead(
      updateMessageStatusDto.chatId,
      userId,
    );
  }

  @Get(':chatId/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить историю сообщений с пагинацией' })
  @ApiResponse({
    status: 200,
    description: 'История сообщений успешно получена',
    schema: {
      example: [
        {
          id: 1,
          chatId: 2,
          userId: 3,
          messageStatus: 'send',
          content: 'Мое сообщение',
          createdAt: '2024-01-01T12:00:00.000Z',
          updatedAt: '2024-01-01T12:00:00.000Z',
        },
        {
          id: 2,
          chatId: 2,
          userId: 2,
          messageStatus: 'read',
          content: 'Мое сообщение 2',
          createdAt: '2024-01-01T12:00:00.000Z',
          updatedAt: '2024-01-01T12:00:00.000Z',
        },
      ],
    },
  })
  @ApiMultipleResponse(
    {
      status: 404,
      schema: {
        example: {
          message: 'Чат не найден.',
          errorCode: ErrorCode.CHAT_NOT_FOUND,
          statusCode: HttpStatus.NOT_FOUND,
        },
      },
      description: 'Чат не найден.',
    },
    {
      status: 404,
      schema: {
        example: {
          message: 'Пользователь не является членом чата.',
          errorCode: ErrorCode.USER_NOT_A_MEMBER_CHAT,
          statusCode: HttpStatus.FORBIDDEN,
        },
      },
      description: 'Пользователь не является членом чата.',
    },
  )
  async getChatHistory(
    @Request() req,
    @Param('chatId') chatId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const userId = req.user.id;
    return await this.messageService.getChatHistory(
      chatId,
      userId,
      page,
      limit,
    );
  }
}
