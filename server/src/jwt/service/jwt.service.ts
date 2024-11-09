import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../jwt/jwt-payload';
import { InvalidTokenException } from '../../exception/invalid-token.exception';

@Injectable()
export class MyJwtService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(userId: number): Promise<string> {
    return await this.jwtService.sign({ id: userId });
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return await this.jwtService.verify(token);
  }

  async refreshToken(oldToken: string): Promise<{ token: string }> {
    try {
      const payload = await this.verifyToken(oldToken);
      return { token: await this.generateToken(payload.id) };
    } catch {
      throw new InvalidTokenException();
    }
  }
}
