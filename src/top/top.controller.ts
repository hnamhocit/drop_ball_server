import { Controller, Get, Query } from '@nestjs/common';

import { TopService } from './top.service';

@Controller('top')
export class TopController {
  constructor(private readonly topService: TopService) {}

  @Get()
  getTopScores(@Query('count') count: string = '10') {
    return this.topService.getTopScores(Number(count));
  }
}
