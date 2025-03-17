import { Injectable } from '@nestjs/common';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithDTO } from './dtos/create-wish.dto';

@Injectable()
export class WishesService {
  constructor(private readonly prisma: PrismaService) {}

  async createWish(uin: string, data: CreateWithDTO) {
    try {
      const existingWish = await this.prisma.wish.findFirst({
        where: { userUin: uin },
      });

      if (existingWish) {
        return {
          code: 0,
          msg: 'Wish already exists!',
        };
      }

      const newWish = await this.prisma.wish.create({
        data: {
          message: data.message,
          user: {
            connect: { uin },
          },
        },
      });

      await this.prisma.user.update({
        where: { uin },
        data: {
          ballCount: { increment: 5 },
        },
      });

      return { code: 1, msg: 'Success!', data: newWish };
    } catch (error) {
      return { code: 0, msg: 'Create wish error: ' + JSON.stringify(error) };
    }
  }

  async getWishes({ page, pageSize }: PaginationDto) {
    try {
      const [wishes, totalRecords] = await Promise.all([
        this.prisma.wish.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.wish.count(),
      ]);

      const totalPages = Math.ceil(totalRecords / pageSize);

      return {
        code: 1,
        msg: 'Success',
        data: {
          wishes,
          pagination: {
            currentPage: page,
            pageSize: pageSize,
            totalPages: totalPages,
          },
        },
      };
    } catch (error) {
      return {
        code: 0,
        msg: 'Get wishes error: ' + JSON.stringify(error),
      };
    }
  }
}
