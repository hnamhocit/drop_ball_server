import { Module } from '@nestjs/common';
import { RollsService } from './rolls.service';
import { RollsController } from './rolls.controller';

@Module({
  controllers: [RollsController],
  providers: [RollsService],
})
export class RollsModule {}
