import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum TestimonialStatus {
  PENDING  = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  position: string;

  @Column({ nullable: true })
  organization: string;

  @Column('text')
  message: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  refCode: string; // tracks which share link was used

  @Column({ type: 'enum', enum: TestimonialStatus, default: TestimonialStatus.PENDING })
  status: TestimonialStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}