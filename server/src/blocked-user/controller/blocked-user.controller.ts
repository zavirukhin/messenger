import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { BlockedUserService } from '../service/blocked-user.service';
import { BlockUnblockUserDto } from '../dto/block-unblock-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { User } from '../../entity/user.entity';
import { JwtAuthGuard } from 'src/jwt/guard/jwt-auth.guard';
import { ErrorCode } from 'src/error-codes';

@ApiTags('blocked-users')
@Controller('blocked-users')
export class BlockedUserController {
  constructor(private readonly blockedUserService: BlockedUserService) {}

  @Post('block')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Блокировка пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь заблокирован.',
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
        message: 'Пользователь уже заблокирован.',
        errorCode: ErrorCode.USER_ALREADY_BLOCKED,
        statusCode: HttpStatus.CONFLICT,
      },
    },
    description: 'Пользователь не найден.',
  })
  @ApiResponse({
    status: 403,
    schema: {
      example: {
        message: 'Нельзя заблокировать самого себя.',
        errorCode: ErrorCode.CANNOT_BLOCK_SELF,
        statusCode: HttpStatus.FORBIDDEN,
      },
    },
    description: 'Нельзя заблокировать самого себя.',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован.',
  })
  @ApiBody({
    description: 'Данные для блокировки пользователя',
    type: BlockUnblockUserDto,
  })
  async blockUser(
    @Request() req,
    @Body() blockUnblockUserDto: BlockUnblockUserDto,
  ): Promise<void> {
    const userId = req.user.id;
    const blockedUserId = blockUnblockUserDto.userId;
    await this.blockedUserService.blockUser(blockedUserId, userId);
  }

  @Post('unblock')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Разблокировка пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь разблокирован.',
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
        message: 'Запись блокировки не найдена.',
        errorCode: ErrorCode.BLOCK_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
    description: 'Запись блокировки не найдена.',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован.',
  })
  @ApiBody({
    description: 'Данные для разблокировки пользователя',
    type: BlockUnblockUserDto,
  })
  async unblockUser(
    @Request() req,
    @Body() blockUnblockUserDto: BlockUnblockUserDto,
  ): Promise<void> {
    const userId = req.user.id;
    const blockedUserId = blockUnblockUserDto.userId;
    await this.blockedUserService.unblockUser(blockedUserId, userId);
  }

  @Get('list')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить список заблокированных пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Список заблокированных пользователей',
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
          first_name: 'Иван',
          last_name: 'Иванов',
          avatar: 'data:image/png;base64,...',
          custom_name: 'Кастомное имя',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован.',
  })
  async getBlockedUsers(@Request() req): Promise<User[]> {
    const userId = req.user.id;
    return this.blockedUserService.getBlockedUsers(userId);
  }
}
