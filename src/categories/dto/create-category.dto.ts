import { IsString, IsOptional, IsHexColor } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'JavaScript' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'All things JavaScript' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '#c9a84c' })
  @IsHexColor()
  @IsOptional()
  color?: string;
}

