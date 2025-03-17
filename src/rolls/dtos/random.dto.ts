import { ArrayMinSize, IsArray } from 'class-validator';

export class RandomDTO {
  @IsArray()
  @ArrayMinSize(1)
  gate: number[];
}
