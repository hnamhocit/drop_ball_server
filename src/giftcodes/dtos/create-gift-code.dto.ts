import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGiftCodeDTO {
  @IsString()
  @IsNotEmpty()
  code: string;
}
