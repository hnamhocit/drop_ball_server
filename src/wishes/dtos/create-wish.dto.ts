import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWithDTO {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  userUin: string;
}
