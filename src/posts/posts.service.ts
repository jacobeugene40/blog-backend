import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import slugify from 'slugify';
import { Post, PostStatus } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private repo: Repository<Post>,
    private categoriesService: CategoriesService,
  ) {}

  // ── List / search ────────────────────────────────────────────
  async findAll(query: QueryPostsDto, isAdmin = false) {
    const page  = parseInt(query.page  || '1',  10);
    const limit = parseInt(query.limit || '10', 10);
    const skip  = (page - 1) * limit;

    const where: any = {};

    // Public users only see published posts
    if (!isAdmin) where.status = PostStatus.PUBLISHED;
    else if (query.status) where.status = query.status;

    if (query.categoryId) where.category = { id: query.categoryId };
    if (query.search)     where.title     = ILike(`%${query.search}%`);
    if (query.tag)        where.tags      = ILike(`%${query.tag}%`);

    const [posts, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['category'],
    });

    return {
      data: posts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Single post by slug (public) ─────────────────────────────
  async findBySlug(slug: string, incrementView = true) {
    const post = await this.repo.findOne({
      where: { slug, status: PostStatus.PUBLISHED },
      relations: ['category', 'comments'],
    });
    if (!post) throw new NotFoundException('Post not found');

    if (incrementView) {
      await this.repo.increment({ id: post.id }, 'viewCount', 1);
      post.viewCount += 1;
    }
    return post;
  }

  // ── Single post by ID (admin) ─────────────────────────────────
  async findById(id: string) {
    const post = await this.repo.findOne({
      where: { id },
      relations: ['category', 'comments'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // ── Create ────────────────────────────────────────────────────
  async create(dto: CreatePostDto) {
    const slug = slugify(dto.title, { lower: true, strict: true });
    const exists = await this.repo.findOne({ where: { slug } });
    if (exists) throw new ConflictException('A post with this title already exists');

    const post = this.repo.create({ ...dto, slug });

    if (dto.categoryId) {
      post.category = await this.categoriesService.findOne(dto.categoryId);
    }
    return this.repo.save(post);
  }

  // ── Update ────────────────────────────────────────────────────
  async update(id: string, dto: Partial<CreatePostDto>) {
    const post = await this.findById(id);
    if (dto.title) {
      const newSlug = slugify(dto.title, { lower: true, strict: true });
      if (newSlug !== post.slug) {
        const conflict = await this.repo.findOne({ where: { slug: newSlug } });
        if (conflict) throw new ConflictException('A post with this title already exists');
        post.slug = newSlug;
      }
    }
    if (dto.categoryId) {
      post.category = await this.categoriesService.findOne(dto.categoryId);
    }
    Object.assign(post, dto);
    return this.repo.save(post);
  }

  // ── Publish / unpublish ───────────────────────────────────────
  async publish(id: string) {
    return this.update(id, { status: PostStatus.PUBLISHED });
  }

  async unpublish(id: string) {
    return this.update(id, { status: PostStatus.DRAFT });
  }

  // ── Delete ────────────────────────────────────────────────────
  async remove(id: string) {
    const post = await this.findById(id);
    await this.repo.remove(post);
    return { message: 'Post deleted' };
  }

  // ── Like ──────────────────────────────────────────────────────
  async like(id: string) {
    const post = await this.repo.findOne({ where: { id, status: PostStatus.PUBLISHED } });
    if (!post) throw new NotFoundException('Post not found');
    await this.repo.increment({ id }, 'likeCount', 1);
    return { likeCount: post.likeCount + 1 };
  }
}

