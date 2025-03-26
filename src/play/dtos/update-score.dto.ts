import { IsNumber, Validator } from 'class-validator';

export class UpdateScoreDTO {
  @IsNumber()
  score: number;
}
