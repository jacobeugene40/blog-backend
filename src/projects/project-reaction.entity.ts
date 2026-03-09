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

