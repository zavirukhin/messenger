import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../jwt/jwt.strategy';

@Injectable()
export class MyJwtService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(userId: number): string {
    return this.jwtService.sign({ id: userId });
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }
}
