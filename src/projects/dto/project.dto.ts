import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'My Portfolio Website' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'A full-stack portfolio built with React and NestJS.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'https://my-portfolio.vercel.app' })
  @IsString() @IsOptional()
  viewLink?: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ example: ['React', 'NestJS', 'PostgreSQL'] })
  @IsArray() @IsString({ each: true }) @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: ['React', 'NestJS', 'PostgreSQL'] })
  @IsArray() @IsString({ each: true }) @IsOptional()
  technologies?: string[];

  @ApiPropertyOptional({ example: 'This project was built to...' })
  @IsString() @IsOptional()
  overview?: string;

  @ApiPropertyOptional({ example: ['Feature 1', 'Feature 2'] })
  @IsArray() @IsString({ each: true }) @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ example: ['Outcome 1', 'Outcome 2'] })
  @IsArray() @IsString({ each: true }) @IsOptional()
  outcomes?: string[];

  @ApiPropertyOptional()
  @IsBoolean() @IsOptional()
  isActive?: boolean;
}

export class CreateProjectCommentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  authorName: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsString() @IsOptional()
  authorEmail?: string;

  @ApiProperty({ example: 'Great project!' })
  @IsString()
  body: string;
}

export class CreateReactionDto {
  @ApiProperty({ enum: ['like', 'dislike'] })
  @IsString()
  type: 'like' | 'dislike';

  @ApiProperty()
  @IsString()
  fingerprint: string;
}

