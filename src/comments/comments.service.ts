import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentStatus } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private repo: Repository<Comment>) {}

  async findByPost(postId: string) {
    return this.repo.find({
      where: { post: { id: postId }, status: CommentStatus.APPROVED },
      order: { createdAt: 'ASC' },
    });
  }

  async findAllPending() {
    return this.repo.find({
      where: { status: CommentStatus.PENDING },
      relations: ['post'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateCommentDto) {
    const comment = this.repo.create({
      authorName:  dto.authorName,
      authorEmail: dto.authorEmail,
      body:        dto.body,
      post:        { id: dto.postId } as any,
    });
    await this.repo.save(comment);
    return { message: 'Comment submitted and awaiting moderation.' };
  }

  async approve(id: string) {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.status = CommentStatus.APPROVED;
    return this.repo.save(comment);
  }

  async reject(id: string) {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.status = CommentStatus.REJECTED;
    return this.repo.save(comment);
  }

  async remove(id: string) {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.repo.remove(comment);
    return { message: 'Comment deleted' };
  }
}

