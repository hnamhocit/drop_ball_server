import { Body, Controller, Post, Req } from '@nestjs/common'

import { IRequest } from '../common/types/request'
import { UpdateScoreDTO } from './dtos/update-score.dto'
import { PlayService } from './play.service'

@Controller('play')
export class PlayController {
  constructor(private readonly playService: PlayService) {}

  @Post('/me/score')
  updateUserScore(@Req() req: IRequest, @Body() data: UpdateScoreDTO) {
    return this.playService.updateUserScore(data, req.user.uin);
  }
}
