import {
  Controller,
  Body,
  Request,
  Get,
  UseGuards,
  HttpStatus,
  Patch,
  Param,
} from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../jwt/guard/jwt-auth.guard';
import { User } from '../../entity/user.entity';
import { UserService } from '../service/user.service';
import { ErrorCode } from '../../error-codes';
import { ApiMultipleResponse } from '../../swagger/decorator/api-multi-response.decorator';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Обновить информацию об авторизованном пользователе',
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        message: 'Пользователь не найден.',
        errorCode: ErrorCode.USER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
    description: 'Пользователь не найден.',
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
      status: 409,
      schema: {
        example: {
          message: 'Нет изменений для обновления.',
          errorCode: ErrorCode.NO_CHANGES_DETECTED,
          statusCode: HttpStatus.CONFLICT,
        },
      },
      description: 'Нет изменений для обновления.',
    },
    {
      status: 409,
      schema: {
        example: {
          message: 'Пользователь с таким кастомным именем уже существует.',
          errorCode: ErrorCode.CUSTOM_NAME_ALREADY_EXISTS,
          statusCode: HttpStatus.CONFLICT,
        },
      },
      description: 'Пользователь с таким кастомным именем уже существует.',
    },
  )
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя обновлены.',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiBody({
    description: 'Данные для обновлении пользователя.',
    type: UpdateUserDto,
  })
  async updateUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateUser(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить информацию об авторизованном пользователе',
  })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя.',
    schema: {
      example: {
        id: 1,
        firstName: 'Иван',
        lastName: 'Иванов',
        lastActivity: '2024-01-01T12:00:00.000Z',
        avatarBase64: 'data:image/png;base64,...',
        customName: 'Кастомное имя',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getProfile(@Request() req): Promise<User> {
    return req.user;
  }

  @Get('profile/:id([0-9]+)')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить информацию о пользователе по ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя.',
    schema: {
      example: {
        id: 1,
        first_name: 'Иван',
        last_name: 'Иванов',
        last_activity: '2024-01-01T12:00:00.000Z',
        avatar: 'data:image/png;base64,...',
        custom_name: 'Кастомное имя',
        created_at: '2024-01-01T12:00:00.000Z',
        updated_at: '2024-01-01T12:00:00.000Z',
        isBlockedByUser: 'true если вы заблокированы найденным пользователем',
        isBlockedByMe: 'true если вы заблокировали найденного пользователя',
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        message: 'Пользователь не найден.',
        errorCode: ErrorCode.USER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
    description: 'Пользователь не найден.',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getUserProfileById(
    @Request() req,
    @Param('id') requestedUserId: number,
  ) {
    const userId = req.user.id;
    return this.userService.getProfileById(requestedUserId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/:customName([A-Za-z]+)')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить информацию о пользователе по customName',
  })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя.',
    schema: {
      example: {
        id: 1,
        firstName: 'Иван',
        lastName: 'Иванов',
        lastActivity: '2024-01-01T12:00:00.000Z',
        avatarBase64: 'data:image/png;base64,...',
        customName: 'Кастомное имя',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
        isBlockedByUser: 'true если вы заблокированы найденным пользователем',
        isBlockedByMe: 'true если вы заблокировали найденного пользователя',
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        message: 'Пользователь не найден.',
        errorCode: ErrorCode.USER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
    description: 'Пользователь не найден',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getUserProfileByCustomName(
    @Request() req,
    @Param('customName') customName: string,
  ) {
    const userId = req.user.id;
    return this.userService.getProfileByCustomName(customName, userId);
  }
}
