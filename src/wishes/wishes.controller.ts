import { IRequest } from 'src/common/types/request';

import { Body, Controller, Post, Req } from '@nestjs/common';

import { CreateWithDTO } from './dtos/create-wish.dto';
import { WishesService } from './wishes.service';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  createWish(@Req() req: IRequest, @Body() data: CreateWithDTO) {
    return this.wishesService.createWish(req.user.uin, data);
  }
}
