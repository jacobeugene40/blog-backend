import {
  Controller, Get, Post, Patch, Delete, Put,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly svc: PostsService) {}

  // ── Public endpoints ─────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'List published posts with pagination & filters' })
  findAll(@Query() query: QueryPostsDto) {
    return this.svc.findAll(query, false);
  }

  @Get(':slug/slug')
  @ApiOperation({ summary: 'Get a single published post by slug (increments view count)' })
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug, true);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Like a post' })
  like(@Param('id') id: string) {
    return this.svc.like(id);
  }

  // ── Admin endpoints ──────────────────────────────────────────
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List ALL posts including drafts (admin)' })
  findAllAdmin(@Query() query: QueryPostsDto) {
    return this.svc.findAll(query, true);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get any post by ID (admin)' })
  findById(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post (admin)' })
  create(@Body() dto: CreatePostDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post (admin)' })
  update(@Param('id') id: string, @Body() dto: CreatePostDto) {
    return this.svc.update(id, dto);
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a post (admin)' })
  publish(@Param('id') id: string) { return this.svc.publish(id); }

  @Put(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish / revert to draft (admin)' })
  unpublish(@Param('id') id: string) { return this.svc.unpublish(id); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post (admin)' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}

