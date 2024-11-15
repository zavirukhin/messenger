import {
  Controller,
  Body,
  Request,
  UseGuards,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../jwt/guard/jwt-auth.guard';
import { CreateChatWithMembersDto } from '../dto/create-chat-with-members.dto';
import { ChatService } from '../service/chat.service';
import { ErrorCode } from '../../error-codes';
import { ApiMultipleResponse } from '../../swagger/decorator/api-multi-response.decorator';
import { ChangeUserRoleDto } from '../dto/change-user-role.dto';

@ApiTags('chats')
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('createWithMembers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Создать чат с пользователями',
  })
  @ApiResponse({
    status: 201,
    description: 'Чат с пользователями создан.',
    schema: {
      example: {
        id: 1,
        name: 'Мой чат',
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
        memberIds: [1, 2, 3],
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        message: 'Пользователи не найдены.',
        errorCode: ErrorCode.USERS_NOT_FOUND,
        missingUsers: [1, 2, 3],
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
    description: 'Пользователи не найдены.',
  })
  @ApiMultipleResponse(
    {
      status: 403,
      schema: {
        example: {
          message: 'Нельзя добавить в пользователей чатов самого себя.',
          errorCode: ErrorCode.CANNOT_ADD_SELF_AS_MEMBER_CHAT,
          statusCode: HttpStatus.FORBIDDEN,
        },
      },
      description: 'Нельзя добавить в пользователей чатов самого себя.',
    },
    {
      status: 403,
      schema: {
        example: {
          message: 'Нельзя создать чат с пользователями заблокировавших нас.',
          errorCode: ErrorCode.CANNOT_CREATE_CHAT_BY_BLOCKED_USERS,
          blockedByUsers: [1, 2, 3],
          statusCode: HttpStatus.FORBIDDEN,
        },
      },
      description: 'Нельзя создать чат с пользователями заблокировавших нас.',
    },
    {
      status: 403,
      schema: {
        example: {
          message: 'Нельзя создать чат с заблокированными пользователями.',
          errorCode: ErrorCode.CANNOT_CREATE_CHAT_WITH_BLOCKED_USERS,
          blockedUsers: [1, 2, 3],
          statusCode: HttpStatus.FORBIDDEN,
        },
      },
      description: 'Нельзя создать чат с заблокированными пользователями.',
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
    description: 'Данные для создания чата с пользователями.',
    type: CreateChatWithMembersDto,
  })
  async createChatWithMembers(
    @Request() req,
    @Body() createChatWithMembersDto: CreateChatWithMembersDto,
  ) {
    const userId = req.user.id;
    return await this.chatService.createChatWithMembers(
      createChatWithMembersDto.chatName,
      userId,
      createChatWithMembersDto.memberIds,
    );
  }

  @Post('change-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить роль пользователя в чате' })
  @ApiResponse({
    status: 201,
    description: 'Роль пользователя успешно обновлена',
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
          message: 'Роль пользователя не найдена.',
          errorCode: ErrorCode.MEMBER_ROLE_NOT_FOUND,
          statusCode: HttpStatus.NOT_FOUND,
        },
      },
      description: 'Роль пользователя не найдена.',
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
  @ApiMultipleResponse(
    {
      status: 403,
      schema: {
        example: {
          message: 'Недостаточно прав для изменения роли пользователя.',
          errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS_CHANGE_CHAT_MEMBER_ROLE,
          statusCode: HttpStatus.FORBIDDEN,
        },
      },
      description: 'Недостаточно прав для изменения роли пользователя.',
    },
    {
      status: 403,
      schema: {
        example: {
          message: 'Нельзя изменить роль пользователя в чате у самого себя.',
          errorCode: ErrorCode.CANNOT_CHANGE_SELF_CHAT_MEMBER_ROLE,
          statusCode: HttpStatus.FORBIDDEN,
        },
      },
      description: 'Нельзя изменить роль пользователя в чате у самого себя.',
    },
  )
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiBody({
    description: 'Данные для создания чата с пользователями.',
    type: ChangeUserRoleDto,
  })
  async changeUserRole(
    @Request() req,
    @Body() changeUserRoleDto: ChangeUserRoleDto,
  ) {
    const userId = req.user.id;

    await this.chatService.changeUserRole(
      userId,
      changeUserRoleDto.changeRoleUserId,
      changeUserRoleDto.chatId,
      changeUserRoleDto.newRoleId,
    );
  }
}
