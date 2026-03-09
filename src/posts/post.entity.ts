import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { Comment } from '../comments/comment.entity';

export enum PostStatus {
  DRAFT     = 'draft',
  PUBLISHED = 'published',
  ARCHIVED  = 'archived',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  excerpt: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.DRAFT })
  status: PostStatus;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 5 })
  readTimeMinutes: number;

  @ManyToOne(() => Category, (cat) => cat.posts, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn()
  category: Category;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

