import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial, TestimonialStatus } from './testimonial.entity';
import { CreateTestimonialDto } from './create-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial) private repo: Repository<Testimonial>,
  ) {}

  // Public — submit a new testimonial
  async submit(dto: CreateTestimonialDto): Promise<{ message: string }> {
    // Honeypot check — bots fill the hidden "website" field
    if (dto.website) {
      return { message: 'Thank you for your submission!' }; // silent reject
    }
    const t = this.repo.create({
      name:         dto.name,
      position:     dto.position,
      organization: dto.organization,
      message:      dto.message,
      linkedinUrl:  dto.linkedinUrl,
      refCode:      dto.refCode,
      status:       TestimonialStatus.PENDING,
    });
    await this.repo.save(t);
    return { message: 'Thank you! Your testimonial is awaiting approval.' };
  }

  // Public — list approved testimonials only
  async findApproved(): Promise<Testimonial[]> {
    return this.repo.find({
      where: { status: TestimonialStatus.APPROVED },
      order: { createdAt: 'DESC' },
    });
  }

  // Admin — list all
  async findAll(status?: string): Promise<Testimonial[]> {
    const where: any = {};
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  // Admin — approve
  async approve(id: string): Promise<Testimonial> {
    const t = await this.findOne(id);
    t.status = TestimonialStatus.APPROVED;
    return this.repo.save(t);
  }

  // Admin — reject
  async reject(id: string): Promise<Testimonial> {
    const t = await this.findOne(id);
    t.status = TestimonialStatus.REJECTED;
    return this.repo.save(t);
  }

  // Admin — delete
  async remove(id: string): Promise<{ message: string }> {
    const t = await this.findOne(id);
    await this.repo.remove(t);
    return { message: 'Testimonial deleted' };
  }

  private async findOne(id: string): Promise<Testimonial> {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Testimonial not found');
    return t;
  }
}