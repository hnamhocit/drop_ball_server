import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidateException extends HttpException {
  constructor(message: string[]) {
    super(
      {
        code: 0,
        msg: message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
