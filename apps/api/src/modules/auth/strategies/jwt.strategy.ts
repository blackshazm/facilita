import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret', // Should use ConfigService in production
    });
  }

  async validate(payload: any) {
    if (!payload.userId || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return { userId: payload.userId, role: payload.role };
  }
}
