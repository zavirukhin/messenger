import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { SendCodeDto } from '../dto/send-code.dto';
import { ValidateCodeDto } from '../dto/validate-code.dto';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { ErrorCode } from '../error-codes';
import { User } from '../entity/user.entity';
import { CreateUserDto } from '../dto/create-user.fto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  @ApiResponse({
    status: 201,
    description: 'Код успешно отправлен',
    schema: {
      example: {
        message: 'Код успешно отправлен',
        statusCode: HttpStatus.CREATED,
      },
    },
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
    status: 429,
    schema: {
      example: {
        message: 'Пожалуйста, подождите, прежде чем запрашивать новый код.',
        errorCode: ErrorCode.CODE_COOLDOWN,
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
      },
    },
    description: 'Код уже был отправлен',
  })
  async sendCode(
    @Body() sendCodeDto: SendCodeDto,
  ): Promise<{ message: string; statusCode: HttpStatus }> {
    await this.authService.sendCode(sendCodeDto.phone);
    return { message: 'Код успешно отправлен', statusCode: HttpStatus.CREATED };
  }

  @Post('validate-code')
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно авторизован, возвращает токен',
    schema: {
      example: {
        token: 'jwt-token-example',
      },
    },
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
    status: 401,
    schema: {
      example: {
        message: 'Истек срок действия кода авторизации.',
        errorCode: ErrorCode.CODE_EXPIRED,
        statusCode: HttpStatus.UNAUTHORIZED,
      },
    },
    description: 'Истек срок действия кода авторизации',
  })
  @ApiResponse({
    status: 403,
    schema: {
      example: {
        message: 'Предоставленный код недействителен.',
        errorCode: ErrorCode.INVALID_CODE,
        statusCode: HttpStatus.FORBIDDEN,
      },
    },
    description: 'Неверный код авторизации',
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
    description: 'Пользователь не зарегистрирован',
  })
  async validateCode(
    @Body() validateCodeDto: ValidateCodeDto,
  ): Promise<{ token: string }> {
    return await this.authService.validateCode(
      validateCodeDto.phone,
      validateCodeDto.code,
    );
  }

  @Post('create-user')
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован, возвращает токен',
    schema: {
      example: {
        token: 'jwt-token-example',
      },
    },
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
    status: 401,
    schema: {
      example: {
        message: 'Истек срок действия кода авторизации.',
        errorCode: ErrorCode.CODE_EXPIRED,
        statusCode: HttpStatus.UNAUTHORIZED,
      },
    },
    description: 'Истек срок действия кода авторизации',
  })
  @ApiResponse({
    status: 409,
    schema: {
      example: {
        message: 'Пользователь с таким номером телефона уже существует.',
        errorCode: ErrorCode.USER_ALREADY_EXISTS,
        statusCode: HttpStatus.CONFLICT,
      },
    },
    description: 'Пользователь с таким номером телефона уже существует.',
  })
  @ApiResponse({
    status: 403,
    schema: {
      example: {
        message: 'Предоставленный код недействителен.',
        errorCode: ErrorCode.INVALID_CODE,
        statusCode: HttpStatus.FORBIDDEN,
      },
    },
    description: 'Неверный код авторизации',
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ token: string }> {
    return await this.authService.create(
      createUserDto.phone,
      createUserDto.code,
      createUserDto.first_name,
      createUserDto.last_name,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
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
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getProfile(@Request() req): Promise<User> {
    return req.user;
  }
}
