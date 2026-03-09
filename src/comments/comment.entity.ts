import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Post } from '../posts/post.entity';

export enum CommentStatus {
  PENDING  = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  authorName: string;

  @Column()
  authorEmail: string;

  @Column('text')
  body: string;

  @Column({ type: 'enum', enum: CommentStatus, default: CommentStatus.PENDING })
  status: CommentStatus;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}

