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
import { UserDto } from '../dto/user.dto';
import { SendCodeResponseDto } from '../dto/send-code-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  @ApiResponse({
    status: 201,
    description: 'Код успешно отправлен',
    type: SendCodeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Неверные входные данные' })
  @ApiResponse({ status: 429, description: 'Код уже был отправлен' })
  async sendCode(
    @Body() sendCodeDto: SendCodeDto,
  ): Promise<SendCodeResponseDto> {
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
  @ApiResponse({ status: 400, description: 'Неверные входные данные' })
  @ApiResponse({
    status: 410,
    description: 'Истек срок действия кода авторизации',
  })
  @ApiResponse({
    status: 401,
    description: 'Неверный код авторизации',
  })
  async validateCode(
    @Body() validateCodeDto: ValidateCodeDto,
  ): Promise<{ token: string }> {
    return await this.authService.validateCode(
      validateCodeDto.phone,
      validateCodeDto.code,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя',
    type: UserDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getProfile(@Request() req): Promise<UserDto> {
    return req.user;
  }
}
