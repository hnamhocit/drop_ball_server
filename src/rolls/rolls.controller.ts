import { IRequest } from 'src/common/types/request';

import { Body, Controller, Get, Req } from '@nestjs/common';

import { RandomDTO } from './dtos/random.dto';
import { RollsService } from './rolls.service';

@Controller('rolls')
export class RollsController {
  constructor(private readonly rollsService: RollsService) {}

  @Get()
  random(@Body() data: RandomDTO, @Req() req: IRequest) {
    return this.rollsService.random(req.user.uin, data);
  }

  @Get('pool')
  getPool(@Req() req: IRequest) {
    return this.rollsService.getPool(req.user.uin);
  }
}
