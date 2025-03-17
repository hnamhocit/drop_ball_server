import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidTokenException extends HttpException {
  constructor(message: string = 'Invalid or tampered token') {
    super(
      {
        code: 0,
        msg: message,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
