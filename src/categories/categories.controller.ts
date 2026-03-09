import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly svc: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories (public)' })
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID (public)' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (admin)' })
  create(@Body() dto: CreateCategoryDto) { return this.svc.create(dto); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category (admin)' })
  update(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category (admin)' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}

