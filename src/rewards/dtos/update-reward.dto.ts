import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateRewardDTO {
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  Address: string;
}
