import {
  Controller, Get, Post, Patch, Delete, Put,
  Param, Body, ParseIntPipe, UseGuards, Query,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, CreateProjectCommentDto, CreateReactionDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

const imageStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'projects'),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + extname(file.originalname));
  },
});

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly svc: ProjectsService) {}

  // ================================================================
  // IMPORTANT: All static/admin routes MUST come before :id routes
  // otherwise NestJS matches "admin" as the :id param → 400 error
  // ================================================================

  // ── Admin: project list ───────────────────────────────────────
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all projects including inactive (admin)' })
  findAllAdmin() { return this.svc.findAllAdmin(); }

  // ── Admin: project comments ───────────────────────────────────
  @Get('admin/comments/pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pending project comments (admin)' })
  getPendingComments() { return this.svc.getPendingComments(); }

  @Put('admin/comments/:commentId/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a project comment (admin)' })
  approveComment(@Param('commentId') commentId: string) { return this.svc.approveComment(commentId); }

  @Put('admin/comments/:commentId/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a project comment (admin)' })
  rejectComment(@Param('commentId') commentId: string) { return this.svc.rejectComment(commentId); }

  @Delete('admin/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project comment (admin)' })
  deleteComment(@Param('commentId') commentId: string) { return this.svc.deleteComment(commentId); }

  // ── Admin: create ─────────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a project (admin)' })
  create(@Body() dto: CreateProjectDto) { return this.svc.create(dto); }

  // ── Admin: update ─────────────────────────────────────────────
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project (admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateProjectDto) {
    return this.svc.update(id, dto);
  }

  // ── Admin: delete ─────────────────────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }

  // ── Admin: image upload ───────────────────────────────────────
  @Post(':id/upload-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload cover image for a project (admin)' })
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      throw new BadRequestException('Only JPG, PNG and WEBP images are allowed');
    }
    const imageUrl = `/uploads/projects/${file.filename}`;
    await this.svc.update(id, { coverImage: imageUrl });
    return { imageUrl };
  }

  // ── Public routes (AFTER all static routes) ───────────────────

  @Get()
  @ApiOperation({ summary: 'List all active projects (public)' })
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single project (public)' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get approved comments for a project (public)' })
  getComments(@Param('id', ParseIntPipe) id: number) { return this.svc.getComments(id); }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Submit a comment (goes to moderation)' })
  submitComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProjectCommentDto,
  ) { return this.svc.submitComment(id, dto); }

  @Post(':id/react')
  @ApiOperation({ summary: 'Like or dislike a project' })
  react(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReactionDto,
  ) { return this.svc.react(id, dto); }

  @Get(':id/reaction-status')
  @ApiOperation({ summary: 'Check if fingerprint already reacted' })
  reactionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('fingerprint') fingerprint: string,
  ) { return this.svc.getReactionStatus(id, fingerprint); }
}

