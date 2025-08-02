import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignupUserDto } from './dto/SignupUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  refreshTokens(refreshToken: string) {
    try {
      const { name: username } = this.jwt.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_SECRET'),
      });

      refreshToken = this.generateRefreshToken(username);
      const accessToken = this.generateAccessToken(username);

      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Invalid token provided');
    }
  }

  generateAccessToken(name: string) {
    return this.jwt.sign(
      {
        name,
      },
      {
        expiresIn: '15m',
      },
    );
  }

  generateRefreshToken(name: string) {
    return this.jwt.sign(
      {
        name,
      },
      {
        expiresIn: '1d',
        secret: this.configService.get<string>('REFRESH_SECRET'),
      },
    );
  }

  // Register user and returns the ID
  async register(user: SignupUserDto) {
    try {
      await this.userService.getUserByName(user.name);
    } catch {
      const hashed = await argon.hash(user.password);
      let id: string;

      if (user.role) {
        const record = await this.prisma.user.create({
          data: {
            username: user.name,
            password: hashed,
            role: user.role,
          },
          select: {
            id: true,
          },
        });
        id = record.id;
      } else {
        const record = await this.prisma.user.create({
          data: {
            username: user.name,
            password: hashed,
          },
          select: {
            id: true,
          },
        });
        id = record.id;
      }
      return id;
    }

    throw new ConflictException(
      `Username '${user.name}' has already been taken`,
    );
  }

  // Returns new access-token and user-id with valid credentials, otherwise returns unauthorized exception
  async login(name: string, password: string) {
    try {
      const user = await this.userService.getUserByName(name);

      const correct = await argon.verify(user.password, password);
      if (correct) {
        const token = this.generateAccessToken(name);
        return {
          token,
          id: user.id,
        };
      } else {
        throw new UnauthorizedException('Invalid username or password');
      }
    } catch {
      throw new UnauthorizedException('Invalid username or password');
    }
  }
}
