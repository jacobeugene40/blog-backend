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

