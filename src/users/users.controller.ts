import { Controller, Get, Req } from '@nestjs/common';

import { IRequest } from '../common/types/request';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  getUser(@Req() req: IRequest) {
    return this.usersService.getUser(req.user.uin);
  }
}
