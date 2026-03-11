"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const slugify_1 = __importDefault(require("slugify"));
const uuid_1 = require("uuid");
const post_entity_1 = require("./post.entity");
const categories_service_1 = require("../categories/categories.service");
let PostsService = class PostsService {
    repo;
    categoriesService;
    constructor(repo, categoriesService) {
        this.repo = repo;
        this.categoriesService = categoriesService;
    }
    async findAll(query, isAdmin = false) {
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '10', 10);
        const skip = (page - 1) * limit;
        const where = {};
        if (!isAdmin)
            where.status = post_entity_1.PostStatus.PUBLISHED;
        else if (query.status)
            where.status = query.status;
        if (query.categoryId)
            where.category = { id: query.categoryId };
        if (query.search)
            where.title = (0, typeorm_2.ILike)(`%${query.search}%`);
        if (query.tag)
            where.tags = (0, typeorm_2.ILike)(`%${query.tag}%`);
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
    async findBySlug(slug, incrementView = true) {
        const post = await this.repo.findOne({
            where: { slug, status: post_entity_1.PostStatus.PUBLISHED },
            relations: ['category', 'comments'],
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        if (incrementView) {
            await this.repo.increment({ id: post.id }, 'viewCount', 1);
            post.viewCount += 1;
        }
        return post;
    }
    async findById(id) {
        const post = await this.repo.findOne({
            where: { id },
            relations: ['category', 'comments'],
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return post;
    }
    async create(dto) {
        const base = (0, slugify_1.default)(dto.title, { lower: true, strict: true });
        const suffix = (0, uuid_1.v4)().replace(/-/g, '').slice(0, 6);
        const slug = `${base}-${suffix}`;
        const post = this.repo.create({ ...dto, slug });
        if (dto.categoryId) {
            post.category = await this.categoriesService.findOne(dto.categoryId);
        }
        return this.repo.save(post);
    }
    async update(id, dto) {
        const post = await this.findById(id);
        if (dto.title && dto.title !== post.title) {
            const existingSuffix = post.slug.match(/-([a-f0-9]{6})$/)?.[1];
            const base = (0, slugify_1.default)(dto.title, { lower: true, strict: true });
            const suffix = existingSuffix || (0, uuid_1.v4)().replace(/-/g, '').slice(0, 6);
            post.slug = `${base}-${suffix}`;
        }
        if (dto.categoryId) {
            post.category = await this.categoriesService.findOne(dto.categoryId);
        }
        Object.assign(post, dto);
        return this.repo.save(post);
    }
    async publish(id) {
        return this.update(id, { status: post_entity_1.PostStatus.PUBLISHED });
    }
    async unpublish(id) {
        return this.update(id, { status: post_entity_1.PostStatus.DRAFT });
    }
    async remove(id) {
        const post = await this.findById(id);
        await this.repo.remove(post);
        return { message: 'Post deleted' };
    }
    async like(id) {
        const post = await this.repo.findOne({ where: { id, status: post_entity_1.PostStatus.PUBLISHED } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        await this.repo.increment({ id }, 'likeCount', 1);
        return { likeCount: post.likeCount + 1 };
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        categories_service_1.CategoriesService])
], PostsService);
//# sourceMappingURL=posts.service.js.map