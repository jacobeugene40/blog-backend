import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private repo: Repository<Category>,
  ) {}

  async findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });
    const exists = await this.repo.findOne({ where: { slug } });
    if (exists) throw new ConflictException('Category already exists');
    const cat = this.repo.create({ ...dto, slug });
    return this.repo.save(cat);
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    const cat = await this.findOne(id);
    if (dto.name) cat.slug = slugify(dto.name, { lower: true, strict: true });
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }

  async remove(id: string) {
    const cat = await this.findOne(id);
    await this.repo.remove(cat);
    return { message: 'Category deleted' };
  }
}

