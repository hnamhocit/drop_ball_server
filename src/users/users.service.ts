import { Injectable } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(uin: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { uin },
        include: { wish: true },
      });

      return { code: 1, msg: 'Success', data: user };
    } catch (error) {
      return {
        code: 0,
        msg: 'Get user error: ' + JSON.stringify(error),
        data: null,
      };
    }
  }
}
