import { IRequest } from 'src/common/types/request';

import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { CreateWithDTO } from './dtos/create-wish.dto';
import { WishesService } from './wishes.service';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  createWish(@Req() req: IRequest, @Body() data: CreateWithDTO) {
    return this.wishesService.createWish(req.user.uin, data);
  }

  @Get()
  getWishes(@Query() query: PaginationDto) {
    return this.wishesService.getWishes(query);
  }
}
