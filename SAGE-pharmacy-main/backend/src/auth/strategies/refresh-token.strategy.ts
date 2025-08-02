import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

type JwtPayload = {
  name: string;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('REFRESH_SECRET'),
      passReqToCallback: true,
    };
    super(options);
  }

  validate(req: Request, payload: JwtPayload) {
    const header = req.headers.authorization;
    if (!header) {
      throw new ForbiddenException('Not allowed');
    }

    const refreshToken = header.split(' ')[1];
    return {
      // Content appended to request as user field
      ...payload,
      refreshToken,
    };
  }
}
