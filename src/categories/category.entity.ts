import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany,
} from 'typeorm';
import { Post } from '../posts/post.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: '#c9a84c' })
  color: string;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;
}

