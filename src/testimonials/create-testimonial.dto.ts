import { IsString, IsNotEmpty, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  position: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  organization?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;

  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  refCode?: string;

  // Honeypot — must be empty; bots fill it in
  @IsOptional()
  @IsString()
  website?: string;
}