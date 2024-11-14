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
    status: 200,
    description: 'Чат с пользователями создан.',
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
}
