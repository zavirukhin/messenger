import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../jwt.strategy';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { InvalidTokenException } from '../exception/invalid-token.exception';

@Injectable()
export class MyJwtService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(userId: number): string {
    return this.jwtService.sign({ id: userId });
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ token: string }> {
    try {
      const payload = this.verifyToken(refreshTokenDto.oldToken);
      const newToken = this.generateToken(payload.sub);
      return { token: newToken };
    } catch {
      throw new InvalidTokenException();
    }
  }
}
