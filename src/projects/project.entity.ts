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

