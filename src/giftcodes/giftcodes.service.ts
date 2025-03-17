import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateGiftCodeDTO } from './dtos/create-gift-code.dto';

@Injectable()
export class GiftcodesService {
  constructor(private readonly prisma: PrismaService) {}

  async createGiftCode(data: CreateGiftCodeDTO) {
    try {
      const existingGiftCode = await this.prisma.giftCode.findUnique({
        where: { code: data.code },
      });

      if (existingGiftCode) {
        return {
          code: 0,
          msg: 'Gift code already exists!',
        };
      }

      const newGiftCode = await this.prisma.giftCode.create({
        data: {
          code: data.code,
          usedByUins: [],
        },
      });

      return {
        code: 1,
        msg: 'Success',
        data: newGiftCode,
      };
    } catch (error) {
      return {
        code: 0,
        msg: 'Create gift code error: ' + JSON.stringify(error),
      };
    }
  }

  async getGiftCodes() {
    try {
      const giftCodes = await this.prisma.giftCode.findMany();
      return { code: 1, msg: 'Success', data: giftCodes };
    } catch (error) {
      return {
        code: 0,
        msg: 'Get gift codes error: ' + JSON.stringify(error),
      };
    }
  }
}
