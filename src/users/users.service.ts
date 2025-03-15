import { PrismaService } from 'src/prisma/prisma.service'

import { Injectable } from '@nestjs/common'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(uin: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { uin } });
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
