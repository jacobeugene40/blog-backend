import {
  IsString, IsOptional, IsEnum, IsArray,
  IsUrl, IsNumber, MinLength, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from '../post.entity';

export class CreatePostDto {
  @ApiProperty({ example: 'How to Build a Portfolio Website' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'A step-by-step guide to building a portfolio.' })
  @IsString()
  @MinLength(20)
  @MaxLength(500)
  excerpt: string;

  @ApiProperty({ example: 'Full article content goes here...' })
  @IsString()
  @MinLength(50)
  content: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.jpg' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ enum: PostStatus, default: PostStatus.DRAFT })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @ApiPropertyOptional({ example: ['react', 'portfolio', 'webdev'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  readTimeMinutes?: number;

  @ApiPropertyOptional({ description: 'Category UUID' })
  @IsString()
  @IsOptional()
  categoryId?: string;
}

