import { IRequest } from 'src/common/types/request';

import { Body, Controller, Post, Req } from '@nestjs/common';

import { RandomDTO } from './dtos/random.dto';
import { RollsService } from './rolls.service';

@Controller('rolls')
export class RollsController {
  constructor(private readonly rollsService: RollsService) {}

  @Post()
  random(@Body() data: RandomDTO, @Req() req: IRequest) {
    return this.rollsService.random(req.user.uin, data);
  }
}
