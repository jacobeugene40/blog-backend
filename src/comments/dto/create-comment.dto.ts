import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  authorName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  authorEmail: string;

  @ApiProperty({ example: 'Great article, very helpful!' })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  body: string;

  @ApiProperty({ description: 'Post UUID' })
  @IsString()
  postId: string;
}

