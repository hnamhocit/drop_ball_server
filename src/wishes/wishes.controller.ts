import { IRequest } from 'src/common/types/request';

import { Body, Controller, Post, Req } from '@nestjs/common';

import { WishesService } from './wishes.service';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  createWish(@Req() req: IRequest, @Body('userUin') userUin: string) {
    return this.wishesService.createWish(req.user.uin, userUin);
  }
}
