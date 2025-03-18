import { Module } from '@nestjs/common';
import { TopService } from './top.service';
import { TopController } from './top.controller';

@Module({
  controllers: [TopController],
  providers: [TopService],
})
export class TopModule {}
