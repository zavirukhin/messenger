import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../jwt/jwt-payload';

@Injectable()
export class MyJwtService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(userId: number): string {
    return this.jwtService.sign({ id: userId });
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }

  refreshToken(oldToken: string): string {
    const payload = this.verifyToken(oldToken);
    return this.generateToken(payload.sub);
  }
}
