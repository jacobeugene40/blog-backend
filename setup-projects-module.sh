#!/bin/bash
# JCE — Projects Module Setup
# Run from inside your blog-backend folder:
#   bash setup-projects-module.sh
set -e
echo "📁 Creating projects module..."
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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, CreateProjectCommentDto, CreateReactionDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly svc: ProjectsService) {}

  // ── Public ────────────────────────────────────────────────────

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
  @ApiOperation({ summary: 'Submit a comment (public — goes to moderation)' })
  submitComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProjectCommentDto,
  ) { return this.svc.submitComment(id, dto); }

  @Post(':id/react')
  @ApiOperation({ summary: 'Like or dislike a project (public)' })
  react(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReactionDto,
  ) { return this.svc.react(id, dto); }

  @Get(':id/reaction-status')
  @ApiOperation({ summary: 'Check if fingerprint has already reacted (public)' })
  reactionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('fingerprint') fingerprint: string,
  ) { return this.svc.getReactionStatus(id, fingerprint); }

  // ── Admin ─────────────────────────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all projects including inactive (admin)' })
  findAllAdmin() { return this.svc.findAllAdmin(); }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a project (admin)' })
  create(@Body() dto: CreateProjectDto) { return this.svc.create(dto); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project (admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateProjectDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }

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
}

JCEEOF
echo "  ✓ src/projects/projects.controller.ts"
cat > src/projects/projects.module.ts << 'JCEEOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectComment } from './project-comment.entity';
import { ProjectReaction } from './project-reaction.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectComment, ProjectReaction])],
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
import { IsString, IsOptional, IsUrl, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'My Portfolio Website' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'A full-stack portfolio built with React and NestJS.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'https://my-portfolio.vercel.app' })
  @IsString()
  @IsOptional()
  viewLink?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ example: ['React', 'NestJS', 'PostgreSQL'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateProjectCommentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  authorName: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsString()
  @IsOptional()
  authorEmail?: string;

  @ApiProperty({ example: 'Great project, very well built!' })
  @IsString()
  body: string;
}

export class CreateReactionDto {
  @ApiProperty({ enum: ['like', 'dislike'] })
  @IsString()
  type: 'like' | 'dislike';

  @ApiProperty({ description: 'Browser fingerprint to prevent duplicate reactions' })
  @IsString()
  fingerprint: string;
}

JCEEOF
echo "  ✓ src/projects/dto/project.dto.ts"
echo ""
echo "✅ Projects module files written!"
echo "The server will auto-restart and create the new database tables."