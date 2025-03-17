import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDTO {
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}
