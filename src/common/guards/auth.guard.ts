import { PrismaService } from 'src/prisma/prisma.service'

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

import { InvalidTokenException } from '../exceptions/invalid-token.exception'
import { decrypt } from '../utils/crypto'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization) {
      throw new InvalidTokenException('Authorization header is required!');
    }

    const token = authorization.split(' ')[1];
    if (!token || token.length === 0 || !authorization.includes('Bearer')) {
      throw new InvalidTokenException('Token, Bearer is required!');
    }

    const uin = decrypt(token);

    if (!uin) {
      throw new InvalidTokenException('UIN is invalid!');
    }

    try {
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
      throw new InvalidTokenException();
    }
  }
}
