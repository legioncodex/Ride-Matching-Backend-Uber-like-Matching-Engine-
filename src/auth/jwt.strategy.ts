import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!, // Pulls directly from .env now!
    });
  }

  async validate(payload: any) {
    // This magically attaches the decoded user info to the Request object
    // so you can use it in your controllers!
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
