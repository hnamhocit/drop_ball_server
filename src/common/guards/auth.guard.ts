import { PrismaService } from 'src/prisma/prisma.service'

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'

import { decrypt } from '../utils/crypto'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const uin = decrypt(token);

      const existingUser = await this.prisma.user.findUnique({
        where: { uin: uin },
      });

      if (!existingUser) {
        console.log('[USER] not found, create new...');
        await this.prisma.user.create({
          data: { uin, ballCount: 10 },
        });
      }

      request['user'] = { uin: uin };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or tampered token');
    }
  }
}
