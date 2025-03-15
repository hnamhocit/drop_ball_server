import { Module } from '@nestjs/common';
import { GiftcodesService } from './giftcodes.service';
import { GiftcodesController } from './giftcodes.controller';

@Module({
  controllers: [GiftcodesController],
  providers: [GiftcodesService],
})
export class GiftcodesModule {}
