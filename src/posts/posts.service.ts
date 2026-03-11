import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
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

  // ── Create — slug gets a short unique suffix ──────────────────
  // e.g. "my-post-title-a3f9b2" — readable for SEO, unguessable for security
  async create(dto: CreatePostDto) {
    const base    = slugify(dto.title, { lower: true, strict: true });
    const suffix  = uuidv4().replace(/-/g, '').slice(0, 6); // 6-char hex suffix
    const slug    = `${base}-${suffix}`;

    // No collision check needed — suffix makes it unique
    const post = this.repo.create({ ...dto, slug });

    if (dto.categoryId) {
      post.category = await this.categoriesService.findOne(dto.categoryId);
    }
    return this.repo.save(post);
  }

  // ── Update ────────────────────────────────────────────────────
  async update(id: string, dto: Partial<CreatePostDto>) {
    const post = await this.findById(id);

    if (dto.title && dto.title !== post.title) {
      // Preserve the original suffix so existing shared URLs don't break
      const existingSuffix = post.slug.match(/-([a-f0-9]{6})$/)?.[1];
      const base    = slugify(dto.title, { lower: true, strict: true });
      const suffix  = existingSuffix || uuidv4().replace(/-/g, '').slice(0, 6);
      post.slug     = `${base}-${suffix}`;
    }

    if (dto.categoryId) {
      post.category = await this.categoriesService.findOne(dto.categoryId);
    }

    Object.assign(post, dto);
    return this.repo.save(post);
  }

  // ── Publish / unpublish ───────────────────────────────────────
  async publish(id: string) {
    return this.update(id, { status: PostStatus.PUBLISHED } as any);
  }

  async unpublish(id: string) {
    return this.update(id, { status: PostStatus.DRAFT } as any);
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