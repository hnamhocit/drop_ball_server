import * as cron from 'node-cron'

import { Module } from '@nestjs/common'

import { AttendanceController } from './attendance.controller'
import { AttendanceService } from './attendance.service'

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {
  constructor(private readonly attendanceService: AttendanceService) {
    cron.schedule('0 0 * * *', () => {
      this.attendanceService.resetDailyCheckIn().catch((error) => {
        console.error('Error resetting daily check-in:', error);
      });
    });
  }
}
