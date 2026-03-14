import {
  Controller, Get, Post, Patch, Delete, Put,
  Param, Body, ParseIntPipe, UseGuards, Query,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, CreateProjectCommentDto, CreateReactionDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

// ── Cloudinary config (reads from env vars) ──────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Upload buffer to Cloudinary ───────────────────────────────────
function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 1200, height: 630, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly svc: ProjectsService) {}

  // ── Admin: project list ───────────────────────────────────────
  @Get('admin/all')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'List all projects including inactive (admin)' })
  findAllAdmin() { return this.svc.findAllAdmin(); }

  // ── Admin: project comments ───────────────────────────────────
  @Get('admin/comments/pending')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pending project comments (admin)' })
  getPendingComments() { return this.svc.getPendingComments(); }

  @Put('admin/comments/:commentId/approve')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a project comment (admin)' })
  approveComment(@Param('commentId') commentId: string) { return this.svc.approveComment(commentId); }

  @Put('admin/comments/:commentId/reject')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a project comment (admin)' })
  rejectComment(@Param('commentId') commentId: string) { return this.svc.rejectComment(commentId); }

  @Delete('admin/comments/:commentId')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project comment (admin)' })
  deleteComment(@Param('commentId') commentId: string) { return this.svc.deleteComment(commentId); }

  // ── Admin: create ─────────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a project (admin)' })
  create(@Body() dto: CreateProjectDto) { return this.svc.create(dto); }

  // ── Admin: update ─────────────────────────────────────────────
  @Patch(':id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project (admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateProjectDto) {
    return this.svc.update(id, dto);
  }

  // ── Admin: delete ─────────────────────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }

  // ── Admin: image upload → Cloudinary ─────────────────────────
  // Uses memoryStorage — file goes to buffer, then straight to Cloudinary
  // No local disk write — survives Render redeploys perfectly
  @Post(':id/upload-image')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload cover image for a project (stored on Cloudinary)' })
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      throw new BadRequestException('Only JPG, PNG and WEBP images are allowed');
    }

    // Upload buffer directly to Cloudinary — auto-optimised to 1200×630
    const imageUrl = await uploadToCloudinary(file.buffer, 'jce-portfolio/projects');

    await this.svc.update(id, { coverImage: imageUrl });
    return { imageUrl };
  }

  // ── Public routes ─────────────────────────────────────────────

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