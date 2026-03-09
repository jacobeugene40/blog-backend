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

