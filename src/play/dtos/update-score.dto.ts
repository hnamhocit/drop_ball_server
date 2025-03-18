import { IsNumber } from 'class-validator'

export class UpdateScoreDTO {
  @IsNumber()
  score: number;
}
