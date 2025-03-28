import { PaginationDto } from '../common/dtos/pagination.dto';
import * as XLSX from 'xlsx';

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

  async getGiftCodes({ page, pageSize }: PaginationDto) {
    try {
      const [giftCodes, totalRecords] = await Promise.all([
        this.prisma.giftCode.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.giftCode.count(),
      ]);

      const totalPages = Math.ceil(totalRecords / pageSize);

      return {
        code: 1,
        msg: 'Success',
        data: {
          giftCodes,
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
        msg: 'Get gift codes error: ' + JSON.stringify(error),
      };
    }
  }

  async uploadGiftCodes(file: Express.Multer.File) {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      const data = this.extractValues(jsonData).map((code) => ({
        code,
        usedByUins: [],
      }));

      await this.prisma.giftCode.createMany({
        data,
      });

      return {
        code: 1,
        msg: 'Success',
        data: data,
      };
    } catch (error) {
      return {
        code: 0,
        msg: 'Upload gift codes error: ' + JSON.stringify(error),
      };
    }
  }

  private extractValues(data: any[]): string[] {
    const valuesArray: string[] = [];

    for (const row of data) {
      const key = Object.keys(row)[0];
      if (key) {
        const value = row[key].trim();
        valuesArray.push(value);
      }
    }

    return valuesArray;
  }
}
