import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './create-testimonial.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly svc: TestimonialsService) {}

  // ── Public: submit — 3 per 10 min per IP (prevent spam) ──────
  @Post()
  @Throttle({ default: { limit: 3, ttl: 600000 } })
  @ApiOperation({ summary: 'Submit a testimonial' })
  submit(@Body() dto: CreateTestimonialDto) {
    return this.svc.submit(dto);
  }

  // ── Public: list approved ─────────────────────────────────────
  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: 'List approved testimonials' })
  findApproved() {
    return this.svc.findApproved();
  }

  // ── Admin: list all with optional status filter ───────────────
  @Get('admin/all')
  @UseGuards(JwtAuthGuard) @SkipThrottle() @ApiBearerAuth()
  @ApiOperation({ summary: 'List all testimonials (admin)' })
  findAll(@Query('status') status?: string) {
    return this.svc.findAll(status);
  }

  // ── Admin: approve ────────────────────────────────────────────
  @Put(':id/approve')
  @UseGuards(JwtAuthGuard) @SkipThrottle() @ApiBearerAuth()
  approve(@Param('id') id: string) {
    return this.svc.approve(id);
  }

  // ── Admin: reject ─────────────────────────────────────────────
  @Put(':id/reject')
  @UseGuards(JwtAuthGuard) @SkipThrottle() @ApiBearerAuth()
  reject(@Param('id') id: string) {
    return this.svc.reject(id);
  }

  // ── Admin: delete ─────────────────────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard) @SkipThrottle() @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}