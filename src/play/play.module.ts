import { Module } from '@nestjs/common';
import { PlayService } from './play.service';
import { PlayController } from './play.controller';

@Module({
  controllers: [PlayController],
  providers: [PlayService],
})
export class PlayModule {}
