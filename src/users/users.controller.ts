import { Body, Controller, Get, Patch, Req } from '@nestjs/common'

import { IRequest } from '../common/types/request'
import { UpdateUserDTO } from './dtos/update-user.dto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  getUser(@Req() req: IRequest) {
    return this.usersService.getUser(req.user.uin);
  }

  @Patch('/me')
  updateUser(@Req() req: IRequest, @Body() data: UpdateUserDTO) {
    return this.usersService.updateUser(data, req.user.uin);
  }

  @Get('/me/rewards')
  getUserRewards(@Req() req: IRequest) {
    return this.usersService.getUserRewards(req.user.uin);
  }
}
