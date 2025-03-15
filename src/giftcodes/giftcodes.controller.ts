import { Body, Controller, Get, Post } from '@nestjs/common'

import { CreateGiftCodeDTO } from './dtos/create-gift-code.dto'
import { GiftcodesService } from './giftcodes.service'

@Controller('giftcodes')
export class GiftcodesController {
  constructor(private readonly giftcodesService: GiftcodesService) {}

  @Get()
  getGiftCodes() {
    return this.giftcodesService.getGiftCodes();
  }

  @Post()
  createGiftCode(@Body() data: CreateGiftCodeDTO) {
    return this.giftcodesService.createGiftCode(data);
  }
}
