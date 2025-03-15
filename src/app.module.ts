import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GiftcodesModule } from './giftcodes/giftcodes.module';
import { PrismaModule } from './prisma/prisma.module';
import { RewardsModule } from './rewards/rewards.module';
import { RollsModule } from './rolls/rolls.module';
import { UsersModule } from './users/users.module';
import { WishesModule } from './wishes/wishes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    GiftcodesModule,
    RewardsModule,
    UsersModule,
    RollsModule,
    WishesModule,
  ],
})
export class AppModule {}
