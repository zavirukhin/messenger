import {
  Controller,
  Body,
  Request,
  UseGuards,
  HttpStatus,
  Post,
  Patch,
  Get,
  Delete,
  Param,
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
import { UpdateChatDto } from '../dto/update-chat.dto';
import { RemoveMemberFromChatDto } from '../dto/remove-member-from-chat.dto';
import { AddMemberToChatDto } from '../dto/add-member-to-chat.dto';

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
    description: 'Данные для изменения роли пользователя в чате.',
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

  @Patch('update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Обновить информацию о чате',
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
  @ApiResponse({
    status: 403,
    schema: {
      example: {
        message: 'Недостаточно прав для обновления чата.',
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS_UPDATE_CHAT,
        statusCode: HttpStatus.FORBIDDEN,
      },
    },
    description: 'Недостаточно прав для обновления чата.',
  })
  @ApiResponse({
    status: 200,
    description: 'Данные чата обновлены.',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiBody({
    description: 'Данные для обновлении чата.',
    type: UpdateChatDto,
  })
  async updateUser(@Request() req, @Body() updateUserDto: UpdateChatDto) {
    const userId = req.user.id;
    return await this.chatService.updateChat(userId, updateUserDto);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить список чатов пользователя.' })
  @ApiResponse({
    status: 200,
    description: 'Получен список чатов пользователя.',
    schema: {
      example: [
        {
          id: 1,
          name: 'Мой чат',
          avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
          latestMessage: 'Последнее сообщение',
          latestMessageDate: '2024-01-01T12:00:00.000Z',
          unreadCount: 2,
        },
        {
          id: 2,
          name: 'Мой чат 2',
          avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
          latestMessage: 'Последнее сообщение 3',
          latestMessageDate: '2024-01-01T12:00:00.000Z',
          unreadCount: 2,
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
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  async getUserChats(@Request() req) {
    const userId = req.user.id;
    return await this.chatService.getUserChats(userId);
  }

  @Get(':chatId/listMembers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить список участников чата.' })
  @ApiResponse({
    status: 200,
    description: 'Получен список участников чата.',
    schema: {
      example: [
        {
          id: 1,
          name: 'Мой чат',
          avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
          latestMessage: 'Последнее сообщение',
          latestMessageDate: '2024-01-01T12:00:00.000Z',
          unreadCount: 2,
        },
        {
          id: 2,
          name: 'Мой чат 2',
          avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
          latestMessage: 'Последнее сообщение 3',
          latestMessageDate: '2024-01-01T12:00:00.000Z',
          unreadCount: 2,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  async getChatMembers(@Param('chatId') chatId: number, @Request() req) {
    const userId = req.user.id;
    return await this.chatService.getChatMembers(userId, chatId);
  }

  @Post('add-member')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавление участника в чат' })
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
    status: 403,
    schema: {
      example: {
        message: 'Недостаточно прав для добавления пользователя в чат.',
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS_ADD_USER_TO_CHAT,
        statusCode: HttpStatus.FORBIDDEN,
      },
    },
    description: 'Недостаточно прав для добавления пользователя в чат.',
  })
  @ApiResponse({
    status: 409,
    schema: {
      example: {
        message: 'Пользователь уже участник чата.',
        errorCode: ErrorCode.USER_ALREADY_IN_CHAT,
        statusCode: HttpStatus.CONFLICT,
      },
    },
    description: 'Пользователь уже участник чата.',
  })
  @ApiResponse({
    status: 201,
    description: 'Пользователь добавлен в чат.',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  async addMemberToChat(
    @Request() req,
    @Body() addMemberToChatDto: AddMemberToChatDto,
  ) {
    const userId = req.user.id;
    return this.chatService.addMemberToChat(
      userId,
      addMemberToChatDto.newMemberId,
      addMemberToChatDto.chatId,
    );
  }

  @Delete('remove-member')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удаление участника из чата' })
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
    status: 403,
    schema: {
      example: {
        message: 'Недостаточно прав для удаления пользователя из чата.',
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS_DELETE_USER_FROM_CHAT,
        statusCode: HttpStatus.FORBIDDEN,
      },
    },
    description: 'Недостаточно прав для удаления пользователя из чата.',
  })
  @ApiResponse({
    status: 409,
    schema: {
      example: {
        message: 'Нельзя удалить себя из чата',
        errorCode: ErrorCode.CANNOT_REMOVE_SELF_FROM_CHAT,
        statusCode: HttpStatus.CONFLICT,
      },
    },
    description: 'Нельзя удалить себя из чата',
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь удален из чата.',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  async removeMemberFromChat(
    @Request() req,
    @Body() removeMemberFromChatDto: RemoveMemberFromChatDto,
  ) {
    const userId = req.user.id;
    return this.chatService.removeMemberFromChat(
      userId,
      removeMemberFromChatDto.memberIdToRemove,
      removeMemberFromChatDto.chatId,
    );
  }
}
