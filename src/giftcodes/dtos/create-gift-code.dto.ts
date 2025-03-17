import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateGiftCodeDTO {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  remainingCount: number;
}
