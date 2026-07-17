import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  @IsNotEmpty()
  campaignId!: string;

  @IsString()
  @IsNotEmpty()
  platform!: string;

  @IsString()
  @IsNotEmpty()
  postUrl!: string;

  @IsBoolean()
  codeConfirmed!: boolean;
}
