import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class MemberRoleNotFoundException extends HttpException {
  constructor() {
    const message = 'Роль пользователя не найдена.';
    const status = HttpStatus.NOT_FOUND;
    super(
      {
        message,
        errorCode: ErrorCode.MEMBER_ROLE_NOT_FOUND,
        statusCode: status,
      },
      status,
    );
  }
}
