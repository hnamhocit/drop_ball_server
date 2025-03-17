import { Controller, Get, Req } from '@nestjs/common'

import { IRequest } from '../common/types/request'
import { AttendanceService } from './attendance.service'

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  getAttendance(@Req() req: IRequest) {
    return this.attendanceService.checkIn(req.user.uin);
  }
}
