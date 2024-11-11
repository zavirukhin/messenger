import { Controller, Post, Body, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { SendCodeDto } from '../dto/send-code.dto';
import { ValidateCodeDto } from '../dto/validate-code.dto';
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../jwt/guard/jwt-auth.guard';
import { ErrorCode } from '../../error-codes';
import { CreateUserDto } from '../dto/create-user.fto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { MyJwtService } from 'src/jwt/service/jwt.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: MyJwtService,
  ) {}

  @Post('send-code')
  @ApiOperation({ summary: 'Отправить смс на номер телефона' })
  @ApiResponse({
    status: 201,
    description: 'Код успешно отправлен',
    schema: {
      example: {
        nextAttempt: 60000,
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
  @ApiResponse({
    status: 503,
    schema: {
      example: {
        message: 'Ошибка Twilio.',
        errorCode: ErrorCode.TWILIO_ERROR,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      },
    },
    description: 'Ошибка Twilio.',
  })
  async sendCode(
    @Body() sendCodeDto: SendCodeDto,
  ): Promise<{ nextAttempt: number; message: string; statusCode: HttpStatus }> {
    return await this.authService.sendCode(sendCodeDto.phone);
  }

  @Post('validate-code')
  @ApiOperation({ summary: 'Авторизация по смс коду отправленного на телефон' })
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
    description: 'Пользователь не найден',
  })
  @ApiResponse({
    status: 503,
    schema: {
      example: {
        message: 'Ошибка Twilio.',
        errorCode: ErrorCode.TWILIO_ERROR,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      },
    },
    description: 'Ошибка Twilio.',
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
  @ApiOperation({ summary: 'Регистрация по смс коду отправленного на телефон' })
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

  @Post('refresh-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновление токена авторизованного пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Токен успешно обновлен',
    schema: {
      example: {
        token: 'jwt-token-example',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Предоставленный токен недействителен',
    schema: {
      example: {
        message: 'Предоставленный токен недействителен.',
        errorCode: ErrorCode.INVALID_TOKEN,
        statusCode: HttpStatus.FORBIDDEN,
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
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ token: string }> {
    return await this.jwtService.refreshToken(refreshTokenDto.oldToken);
  }
}
