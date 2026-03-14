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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const posts_service_1 = require("./posts.service");
const create_post_dto_1 = require("./dto/create-post.dto");
const query_posts_dto_1 = require("./dto/query-posts.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://jacob-chidi-eugene.vercel.app';
const BACKEND_URL = process.env.BACKEND_URL || 'https://blog-backend-8oer.onrender.com';
const FALLBACK_IMG = `${FRONTEND_URL}/og-cover.jpg`;
function esc(str) {
    return (str || '')
        .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function resolveImg(path) {
    if (!path)
        return FALLBACK_IMG;
    if (path.startsWith('http'))
        return path;
    return BACKEND_URL + (path.startsWith('/') ? '' : '/') + path;
}
let PostsController = class PostsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    findAll(query) {
        return this.svc.findAll(query, false);
    }
    findBySlug(slug) {
        return this.svc.findBySlug(slug, true);
    }
    like(id) {
        return this.svc.like(id);
    }
    async ogProxy(slug, res) {
        let post = null;
        try {
            post = await this.svc.findBySlug(slug, false);
        }
        catch {
        }
        const title = esc(post?.title || 'Jacob Chidi Eugene — Tech Blog');
        const description = esc(post?.excerpt || 'Practical insights on web development and software engineering.');
        const image = esc(resolveImg(post?.coverImage));
        const url = esc(`${FRONTEND_URL}/blog/${slug}`);
        const siteName = 'Jacob Chidi Eugene';
        const author = 'Jacob Chidi Eugene';
        const readTime = post?.readTimeMinutes ? `${post.readTimeMinutes} min read` : '';
        const category = esc(post?.category?.name || 'Technology');
        const published = post?.createdAt ? new Date(post.createdAt).toISOString() : '';
        const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | ${siteName}</title>

  <meta name="description"    content="${description}" />
  <meta name="author"         content="${author}" />
  <meta name="robots"         content="index, follow" />
  <!-- Tell Facebook to use site_name not the domain -->
  <meta property="og:site_name" content="${siteName}" />

  <meta property="og:type"         content="article" />
  <meta property="og:site_name"    content="${siteName}" />
  <meta property="og:title"        content="${title}" />
  <meta property="og:description"  content="${description}" />
  <meta property="og:url"          content="${url}" />
  <meta property="og:image"        content="${image}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt"    content="${title}" />
  <meta property="og:locale"       content="en_GB" />
  ${published ? `<meta property="article:published_time" content="${published}" />` : ''}
  <meta property="article:author"  content="${author}" />
  <meta property="article:section" content="${category}" />

  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:site"        content="@JacobChidiEugene" />
  <meta name="twitter:creator"     content="@JacobChidiEugene" />
  <meta name="twitter:title"       content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image"       content="${image}" />
  <meta name="twitter:image:alt"   content="${title}" />

  <script>window.location.replace("${url}");</script>
  <noscript><meta http-equiv="refresh" content="0;url=${url}" /></noscript>

  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#0d0f10;color:#eae6df;
         display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
    .card{max-width:560px;width:100%;text-align:center}
    .label{font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:#c9a84c;margin-bottom:12px}
    h1{font-size:1.6rem;font-weight:300;line-height:1.2;color:#fff;margin-bottom:12px}
    p{font-size:.9rem;color:#8a8680;margin-bottom:24px}
    a{display:inline-block;padding:10px 28px;background:#c9a84c;color:#000;
      border-radius:2px;font-size:.78rem;font-weight:600;letter-spacing:.08em;
      text-transform:uppercase;text-decoration:none}
    ${readTime ? `.meta{font-size:.75rem;color:#55524e;margin-bottom:20px}` : ''}
  </style>
</head>
<body>
  <div class="card">
    <p class="label">${category}</p>
    <h1>${title}</h1>
    ${readTime ? `<p class="meta">${readTime}</p>` : ''}
    <p>${description}</p>
    <a href="${url}">Read Article →</a>
  </div>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=600, stale-while-revalidate=60');
        res.status(200).send(html);
    }
    findAllAdmin(query) {
        return this.svc.findAll(query, true);
    }
    findById(id) {
        return this.svc.findById(id);
    }
    create(dto) {
        return this.svc.create(dto);
    }
    update(id, dto) {
        return this.svc.update(id, dto);
    }
    publish(id) { return this.svc.publish(id); }
    unpublish(id) { return this.svc.unpublish(id); }
    remove(id) { return this.svc.remove(id); }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Get)(),
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiOperation)({ summary: 'List published posts with pagination & filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_posts_dto_1.QueryPostsDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':slug/slug'),
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single published post by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Like a post' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "like", null);
__decorate([
    (0, common_1.Get)(':slug/og'),
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiOperation)({ summary: 'Open Graph proxy — crawlers must never be throttled' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "ogProxy", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List ALL posts including drafts (admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_posts_dto_1.QueryPostsDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get any post by ID (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new post (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_dto_1.CreatePostDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a post (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_post_dto_1.CreatePostDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/publish'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a post (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "publish", null);
__decorate([
    (0, common_1.Put)(':id/unpublish'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Unpublish / revert to draft (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "unpublish", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a post (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "remove", null);
exports.PostsController = PostsController = __decorate([
    (0, swagger_1.ApiTags)('Posts'),
    (0, common_1.Controller)('posts'),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], PostsController);
//# sourceMappingURL=posts.controller.js.map