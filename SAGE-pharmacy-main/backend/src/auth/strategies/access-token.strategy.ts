import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

type JwtPayload = {
  name: string;
};

@Injectable()
export class AccessTokenStartegy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('ACCESS_SECRET'),
    };
    super(options);
  }

  validate(payload: JwtPayload) {
    return payload; // content appended to request as "user" field
  }
}
