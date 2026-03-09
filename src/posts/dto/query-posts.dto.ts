import { IsOptional, IsEnum, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from '../post.entity';

export class QueryPostsDto {
  @ApiPropertyOptional() @IsOptional() @IsNumberString() page?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumberString() limit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()       search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()       categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()       tag?: string;
  @ApiPropertyOptional({ enum: PostStatus })
  @IsOptional() @IsEnum(PostStatus)                      status?: PostStatus;
}

