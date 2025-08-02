import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`No matching user with ID ${id}`);
    }

    return user;
  }

  async getUserByName(name: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: name },
    });
    if (!user) {
      throw new NotFoundException(`No matching user with username ${name}`);
    }

    return user;
  }
}
