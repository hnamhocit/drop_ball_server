import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { CreateGiftCodeDTO } from './dtos/create-gift-code.dto';
import { GiftcodesService } from './giftcodes.service';

@Controller('giftcodes')
export class GiftcodesController {
  constructor(private readonly giftcodesService: GiftcodesService) {}

  @Get()
  getGiftCodes(@Query() query: PaginationDto) {
    return this.giftcodesService.getGiftCodes(query);
  }

  @Post()
  createGiftCode(@Body() data: CreateGiftCodeDTO) {
    return this.giftcodesService.createGiftCode(data);
  }
}
