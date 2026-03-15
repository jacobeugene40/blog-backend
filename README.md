# JCE Blog Backend API

NestJS + PostgreSQL REST API for Jacob Chidi Eugene's portfolio blog.

## Tech Stack
- **Framework**: NestJS 10
- **Database**: PostgreSQL + TypeORM
- **Auth**: JWT (Bearer tokens, 7-day expiry)
- **Validation**: class-validator + class-transformer
- **Docs**: Swagger UI at `/api/docs`

## Quick Start (local)

```bash
npm install
cp .env.example .env   # fill in your values
npm run start:dev
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/login | ❌ | Admin login → returns JWT |
| GET  | /api/v1/auth/profile | ✅ | Get admin profile |
| PATCH| /api/v1/auth/change-password | ✅ | Change password |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | /api/v1/posts | ❌ | List published posts |
| GET  | /api/v1/posts/:slug/slug | ❌ | Get post by slug |
| POST | /api/v1/posts/:id/like | ❌ | Like a post |
| GET  | /api/v1/posts/admin/all | ✅ | All posts incl. drafts |
| POST | /api/v1/posts | ✅ | Create post |
| PATCH| /api/v1/posts/:id | ✅ | Update post |
| PUT  | /api/v1/posts/:id/publish | ✅ | Publish post |
| PUT  | /api/v1/posts/:id/unpublish | ✅ | Unpublish post |
| DELETE | /api/v1/posts/:id | ✅ | Delete post |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | /api/v1/categories | ❌ | List categories |
| POST | /api/v1/categories | ✅ | Create category |
| PATCH| /api/v1/categories/:id | ✅ | Update category |
| DELETE | /api/v1/categories/:id | ✅ | Delete category |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | /api/v1/comments/post/:postId | ❌ | Approved comments |
| POST | /api/v1/comments | ❌ | Submit comment (moderated) |
| GET  | /api/v1/comments/pending | ✅ | Pending comments |
| PUT  | /api/v1/comments/:id/approve | ✅ | Approve comment |
| PUT  | /api/v1/comments/:id/reject | ✅ | Reject comment |
| DELETE | /api/v1/comments/:id | ✅ | Delete comment |

## Deploy to Railway

1. Push this folder to a GitHub repo
2. Create new Railway project → Deploy from GitHub
3. Add a PostgreSQL plugin in Railway
4. Set environment variables (copy from `.env.example`)
5. Railway auto-detects NestJS and runs `npm run start:prod`

## Deploy to Render

1. Push to GitHub
2. New Web Service → Connect repo
3. Build command: `npm install && npm run build`
4. Start command: `npm run start:prod`
5. Add PostgreSQL database in Render
6. Set env vars

## Database
[![Powered by Neon](https://neon.com/brand/neon-badge.svg)](https://neon.com)

This project uses [Neon](https://neon.com) — serverless PostgreSQL.
```

**3. Publish your Neon $1B post TODAY**
You already have it written. Publishing it before Neon responds shows them you are actively promoting them — not just collecting credits. When they review your application and Google your name, they will find a full article about their acquisition. That is a very strong signal.

**4. Apply for DigitalOcean affiliate in parallel**
Don't wait for Neon — DigitalOcean approves instantly:
```
digitalocean.com/affiliates
