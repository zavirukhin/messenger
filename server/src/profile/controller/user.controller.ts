import {
  Controller,
  Body,
  Request,
  Get,
  UseGuards,
  HttpStatus,
  Patch,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../jwt/guard/jwt-auth.guard';
import { User } from '../../entity/user.entity';
import { UserService } from '../service/user.service';
import { ErrorCode } from 'src/error-codes';

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
    description: 'Пользователь не найден',
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
    description: 'Неверные входные данные',
  })
  @ApiResponse({
    status: 304,
    schema: {
      example: {
        message: 'Нет изменений для обновления.',
        errorCode: ErrorCode.NO_CHANGES_DETECTED,
        statusCode: HttpStatus.NOT_MODIFIED,
      },
    },
    description: 'Нет изменений для обновления',
  })
  @ApiResponse({
    status: 409,
    schema: {
      example: {
        message: 'Пользователь с таким кастомным именем уже существует.',
        errorCode: ErrorCode.CUSTOM_NAME_ALREADY_EXISTS,
        statusCode: HttpStatus.CONFLICT,
      },
    },
    description: 'Пользователь с таким кастомным именем уже существует.',
  })
  @ApiResponse({
    status: 500,
    schema: {
      example: {
        message: 'Ошибка при обновлении данных пользователя',
        errorCode: ErrorCode.USER_UPDATE_ERROR,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    },
    description: 'Ошибка при обновлении данных пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя обновлены',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
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
    description: 'Профиль пользователя',
    schema: {
      example: {
        id: 1,
        phone: '+1234567890',
        first_name: 'Иван',
        last_name: 'Иванов',
        last_activity: '2024-01-01T12:00:00.000Z',
        avatar: 'data:image/png;base64,...',
        custom_name: 'Кастомное имя',
        created_at: '2024-01-01T12:00:00.000Z',
        updated_at: '2024-01-01T12:00:00.000Z',
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
  async getProfile(@Request() req): Promise<User> {
    const userId = req.user.id;
    await this.userService.updateLastActivityUser(userId);
    return req.user;
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удаление текущего пользователя' })
  @ApiResponse({
    status: 204,
    description: 'Пользователь успешно удален',
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
  @ApiResponse({
    status: 500,
    schema: {
      example: {
        message: 'Ошибка при удалении пользователя',
        errorCode: ErrorCode.USER_DELETE_ERROR,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    },
    description: 'Ошибка при удалении пользователя',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async delete(@Request() req) {
    const userId = req.user.id;
    await this.userService.deleteUser(userId);
  }
}
