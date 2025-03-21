import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIP,
  IsNumber,
} from 'class-validator';

export class RandomDTO {
  @IsArray()
  @ArrayMinSize(1)
  gate: number[];

  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  ratios: number[] = [5, 10, 10, 30, 30];
}
