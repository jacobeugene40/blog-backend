import {
  Controller, Get, Post, Patch, Delete, Put,
  Param, Body, Query, UseGuards, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/* ── Config ─────────────────────────────────────────────────── */
const FRONTEND_URL  = process.env.FRONTEND_URL  || 'https://jacob-chidi-eugene.vercel.app';
const BACKEND_URL   = process.env.BACKEND_URL   || 'https://blog-backend-8oer.onrender.com';
const FALLBACK_IMG  = `${FRONTEND_URL}/og-cover.jpg`;

/* ── HTML escape helper ─────────────────────────────────────── */
function esc(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ── Resolve image to absolute URL ─────────────────────────── */
function resolveImg(path: string | null | undefined): string {
  if (!path) return FALLBACK_IMG;
  if (path.startsWith('http')) return path;
  return BACKEND_URL + (path.startsWith('/') ? '' : '/') + path;
}

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly svc: PostsService) {}

  // ── Public endpoints ─────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List published posts with pagination & filters' })
  findAll(@Query() query: QueryPostsDto) {
    return this.svc.findAll(query, false);
  }

  @Get(':slug/slug')
  @ApiOperation({ summary: 'Get a single published post by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug, true);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Like a post' })
  like(@Param('id') id: string) {
    return this.svc.like(id);
  }

  // ── OG proxy endpoint ────────────────────────────────────────
  // Share buttons point here. Social crawlers read the OG tags.
  // Real browsers get a 0ms JS redirect to the frontend post page.
  @Get(':slug/og')
  @ApiOperation({ summary: 'Open Graph proxy page for social sharing' })
  async ogProxy(
    @Param('slug') slug: string,
    @Res() res: Response,
  ) {
    let post: any = null;

    try {
      post = await this.svc.findBySlug(slug, false); // don't increment view on bot hit
    } catch {
      // fall through — use site defaults
    }

    const title       = esc(post?.title       || 'Jacob Chidi Eugene — Tech Blog');
    const description = esc(post?.excerpt     || 'Practical insights on web development and software engineering.');
    const image       = esc(resolveImg(post?.coverImage));
    const url         = esc(`${FRONTEND_URL}/blog/${slug}`);
    const siteName    = 'Jacob Chidi Eugene';
    const author      = 'Jacob Chidi Eugene';
    const readTime    = post?.readTimeMinutes ? `${post.readTimeMinutes} min read` : '';
    const category    = esc(post?.category?.name || 'Technology');
    const published   = post?.createdAt ? new Date(post.createdAt).toISOString() : '';

    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | ${siteName}</title>

  <!-- Primary meta -->
  <meta name="description"       content="${description}" />
  <meta name="author"            content="${author}" />
  <meta name="robots"            content="index, follow" />

  <!-- Open Graph (Facebook, LinkedIn, WhatsApp, Telegram, Pinterest) -->
  <meta property="og:type"          content="article" />
  <meta property="og:site_name"     content="${siteName}" />
  <meta property="og:title"         content="${title}" />
  <meta property="og:description"   content="${description}" />
  <meta property="og:url"           content="${url}" />
  <meta property="og:image"         content="${image}" />
  <meta property="og:image:width"   content="1200" />
  <meta property="og:image:height"  content="630" />
  <meta property="og:image:alt"     content="${title}" />
  <meta property="og:locale"        content="en_GB" />
  ${published ? `<meta property="article:published_time" content="${published}" />` : ''}
  <meta property="article:author"   content="${author}" />
  <meta property="article:section"  content="${category}" />

  <!-- Twitter Card (X) -->
  <meta name="twitter:card"         content="summary_large_image" />
  <meta name="twitter:site"         content="@JacobChidiEugene" />
  <meta name="twitter:creator"      content="@JacobChidiEugene" />
  <meta name="twitter:title"        content="${title}" />
  <meta name="twitter:description"  content="${description}" />
  <meta name="twitter:image"        content="${image}" />
  <meta name="twitter:image:alt"    content="${title}" />

  <!-- Redirect real browsers immediately — bots/crawlers don't run JS -->
  <script>window.location.replace("${url}");</script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${url}" />
  </noscript>

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
    // Cache for 10 min — long enough for crawlers, short enough to pick up edits
    res.setHeader('Cache-Control', 'public, max-age=600, stale-while-revalidate=60');
    res.status(200).send(html);
  }

  // ── Admin endpoints ──────────────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List ALL posts including drafts (admin)' })
  findAllAdmin(@Query() query: QueryPostsDto) {
    return this.svc.findAll(query, true);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get any post by ID (admin)' })
  findById(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post (admin)' })
  create(@Body() dto: CreatePostDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post (admin)' })
  update(@Param('id') id: string, @Body() dto: CreatePostDto) {
    return this.svc.update(id, dto);
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a post (admin)' })
  publish(@Param('id') id: string) { return this.svc.publish(id); }

  @Put(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish / revert to draft (admin)' })
  unpublish(@Param('id') id: string) { return this.svc.unpublish(id); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post (admin)' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}