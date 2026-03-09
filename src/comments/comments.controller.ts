import {
  Controller, Get, Post, Delete, Put,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly svc: CommentsService) {}

  @Get('post/:postId')
  @ApiOperation({ summary: 'Get approved comments for a post (public)' })
  findByPost(@Param('postId') postId: string) {
    return this.svc.findByPost(postId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a comment (public — goes to moderation)' })
  create(@Body() dto: CreateCommentDto) {
    return this.svc.create(dto);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pending comments (admin)' })
  findPending() { return this.svc.findAllPending(); }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a comment (admin)' })
  approve(@Param('id') id: string) { return this.svc.approve(id); }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a comment (admin)' })
  reject(@Param('id') id: string) { return this.svc.reject(id); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment (admin)' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}

