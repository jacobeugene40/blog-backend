#!/bin/bash
# JCE — Projects V2 update (fixes route order 400 errors)
set -e
echo "📁 Updating projects module..."
mkdir -p src/projects/dto
cat > src/app.module.ts << 'JCEEOF'
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { InteractionsModule } from './interactions/interactions.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: config.get('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
        autoLoadEntities: true,
        synchronize: true,
        logging: config.get('NODE_ENV') !== 'production',
      }),
    }),

    AuthModule,
    PostsModule,
    CategoriesModule,
    CommentsModule,
    InteractionsModule,
    ProjectsModule,
  ],
})
export class AppModule {}

JCEEOF
echo "  ✓ src/app.module.ts"
cat > src/main.ts << 'JCEEOF'
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── Ensure uploads folder exists ──────────────────────────────
  const uploadsDir = join(process.cwd(), 'uploads', 'projects');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // ── Serve uploaded images as static files ─────────────────────
  // Access via: http://localhost:3001/uploads/projects/filename.jpg
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // ── CORS ──────────────────────────────────────────────────────
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'https://my-portifolio-tau-eight.vercel.app',
      'https://jacobchidieugen.com',
    ],
    credentials: true,
  });

  // ── Global validation pipe ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // ── API prefix ────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Swagger ───────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('JCE Blog API')
    .setDescription('Jacob Chidi Eugene — Blog Backend REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 JCE Blog API running on port ${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
  console.log(`🖼️  Uploads served at http://localhost:${port}/uploads/`);
}
bootstrap();

JCEEOF
echo "  ✓ src/main.ts"
cat > src/projects/project-comment.entity.ts << 'JCEEOF'
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

export enum ProjectCommentStatus {
  PENDING  = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('project_comments')
export class ProjectComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  authorName: string;

  @Column({ nullable: true })
  authorEmail: string;

  @Column('text')
  body: string;

  @Column({
    type: 'enum',
    enum: ProjectCommentStatus,
    default: ProjectCommentStatus.PENDING,
  })
  status: ProjectCommentStatus;

  @ManyToOne(() => Project, (p) => p.comments, { onDelete: 'CASCADE' })
  @JoinColumn()
  project: Project;

  @CreateDateColumn()
  createdAt: Date;
}

JCEEOF
echo "  ✓ src/projects/project-comment.entity.ts"
cat > src/projects/project-reaction.entity.ts << 'JCEEOF'
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

export enum ReactionType {
  LIKE    = 'like',
  DISLIKE = 'dislike',
}

@Entity('project_reactions')
export class ProjectReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ReactionType })
  type: ReactionType;

  // Browser fingerprint — IP + user-agent hash to prevent spam
  @Column()
  fingerprint: string;

  @ManyToOne(() => Project, (p) => p.reactions, { onDelete: 'CASCADE' })
  @JoinColumn()
  project: Project;

  @CreateDateColumn()
  createdAt: Date;
}

JCEEOF
echo "  ✓ src/projects/project-reaction.entity.ts"
cat > src/projects/project.entity.ts << 'JCEEOF'
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { ProjectComment } from './project-comment.entity';
import { ProjectReaction } from './project-reaction.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  viewLink: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  // ── Detail page fields ─────────────────────────────
  @Column('text', { nullable: true })
  overview: string;

  @Column('simple-array', { nullable: true })
  features: string[];

  @Column('simple-array', { nullable: true })
  outcomes: string[];

  @Column('simple-array', { nullable: true })
  technologies: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  dislikeCount: number;

  @OneToMany(() => ProjectComment, (c) => c.project)
  comments: ProjectComment[];

  @OneToMany(() => ProjectReaction, (r) => r.project)
  reactions: ProjectReaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

JCEEOF
echo "  ✓ src/projects/project.entity.ts"
cat > src/projects/projects.controller.ts << 'JCEEOF'
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

JCEEOF
echo "  ✓ src/projects/projects.controller.ts"
cat > src/projects/projects.module.ts << 'JCEEOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { Project } from './project.entity';
import { ProjectComment } from './project-comment.entity';
import { ProjectReaction } from './project-reaction.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectComment, ProjectReaction]),
    MulterModule.register({ dest: join(process.cwd(), 'uploads') }),
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}

JCEEOF
echo "  ✓ src/projects/projects.module.ts"
cat > src/projects/projects.service.ts << 'JCEEOF'
import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { ProjectComment, ProjectCommentStatus } from './project-comment.entity';
import { ProjectReaction, ReactionType } from './project-reaction.entity';
import { CreateProjectDto, CreateProjectCommentDto, CreateReactionDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)         private projectRepo:  Repository<Project>,
    @InjectRepository(ProjectComment)  private commentRepo:  Repository<ProjectComment>,
    @InjectRepository(ProjectReaction) private reactionRepo: Repository<ProjectReaction>,
  ) {}

  // ── Public: list active projects ─────────────────────────────
  async findAll() {
    return this.projectRepo.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });
  }

  // ── Public: single project ────────────────────────────────────
  async findOne(id: number) {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  // ── Admin: all projects ────────────────────────────────────────
  async findAllAdmin() {
    return this.projectRepo.find({ order: { id: 'ASC' } });
  }

  // ── Admin: create ─────────────────────────────────────────────
  async create(dto: CreateProjectDto) {
    const project = this.projectRepo.create(dto);
    return this.projectRepo.save(project);
  }

  // ── Admin: update ─────────────────────────────────────────────
  async update(id: number, dto: Partial<CreateProjectDto>) {
    const project = await this.findOne(id);
    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  // ── Admin: delete ─────────────────────────────────────────────
  async remove(id: number) {
    const project = await this.findOne(id);
    await this.projectRepo.remove(project);
    return { message: 'Project deleted' };
  }

  // ── Public: react (like / dislike) ────────────────────────────
  async react(id: number, dto: CreateReactionDto) {
    const project = await this.findOne(id);

    // Check if this fingerprint already reacted
    const existing = await this.reactionRepo.findOne({
      where: { project: { id }, fingerprint: dto.fingerprint },
    });
    if (existing) {
      throw new ConflictException('You have already reacted to this project');
    }

    const reaction = this.reactionRepo.create({
      type: dto.type as ReactionType,
      fingerprint: dto.fingerprint,
      project,
    });
    await this.reactionRepo.save(reaction);

    // Increment counter
    if (dto.type === 'like') {
      await this.projectRepo.increment({ id }, 'likeCount', 1);
      project.likeCount += 1;
    } else {
      await this.projectRepo.increment({ id }, 'dislikeCount', 1);
      project.dislikeCount += 1;
    }

    return {
      likeCount:    dto.type === 'like'    ? project.likeCount    : project.likeCount,
      dislikeCount: dto.type === 'dislike' ? project.dislikeCount : project.dislikeCount,
      reacted:      dto.type,
    };
  }

  // ── Public: check if fingerprint already reacted ──────────────
  async getReactionStatus(id: number, fingerprint: string) {
    const existing = await this.reactionRepo.findOne({
      where: { project: { id }, fingerprint },
    });
    return { reacted: existing ? existing.type : null };
  }

  // ── Public: submit comment ────────────────────────────────────
  async submitComment(id: number, dto: CreateProjectCommentDto) {
    const project = await this.findOne(id);
    const comment = this.commentRepo.create({ ...dto, project });
    await this.commentRepo.save(comment);
    return { message: 'Comment submitted and awaiting moderation.' };
  }

  // ── Public: get approved comments ────────────────────────────
  async getComments(id: number) {
    return this.commentRepo.find({
      where: { project: { id }, status: ProjectCommentStatus.APPROVED },
      order: { createdAt: 'ASC' },
    });
  }

  // ── Admin: get all pending project comments ───────────────────
  async getPendingComments() {
    return this.commentRepo.find({
      where: { status: ProjectCommentStatus.PENDING },
      relations: ['project'],
      order: { createdAt: 'DESC' },
    });
  }

  // ── Admin: approve comment ────────────────────────────────────
  async approveComment(commentId: string) {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.status = ProjectCommentStatus.APPROVED;
    return this.commentRepo.save(comment);
  }

  // ── Admin: reject comment ─────────────────────────────────────
  async rejectComment(commentId: string) {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.status = ProjectCommentStatus.REJECTED;
    return this.commentRepo.save(comment);
  }

  // ── Admin: delete comment ─────────────────────────────────────
  async deleteComment(commentId: string) {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.commentRepo.remove(comment);
    return { message: 'Comment deleted' };
  }
}

JCEEOF
echo "  ✓ src/projects/projects.service.ts"
cat > src/projects/dto/project.dto.ts << 'JCEEOF'
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

JCEEOF
echo "  ✓ src/projects/dto/project.dto.ts"
echo ""
echo "✅ Done! Backend will restart automatically."