import { ArrayMaxSize, ArrayMinSize, IsArray } from 'class-validator'

export class RandomDTO {
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  gate: number[];
}
