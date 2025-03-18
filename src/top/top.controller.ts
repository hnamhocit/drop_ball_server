import { Controller, Get, Query } from '@nestjs/common'

import { TopService } from './top.service'

@Controller('top')
export class TopController {
  constructor(private readonly topService: TopService) {}

  @Get()
  getTopUsers(@Query('max') max: number = 10) {
    return this.topService.getTopUsers(max);
  }
}
