#!/bin/bash
# ── JCE Blog Backend — Source File Setup Script ──────────────────
# Run this from inside your blog-backend directory:
#   bash setup-blog-src.sh
# It will create all src/ folders and files automatically.

set -e
echo "📁 Creating directory structure..."
mkdir -p src/auth/dto
mkdir -p src/posts/dto
mkdir -p src/categories/dto
mkdir -p src/comments/dto
mkdir -p src/interactions
mkdir -p src/common/guards
mkdir -p src/common/decorators
echo "✅ Directories created"
echo ""
echo "📝 Writing source files..."
cat > src/app.module.ts << 'ENDOFFILE'
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { InteractionsModule } from './interactions/interactions.module';

@Module({
  imports: [
    // ── Config (loads .env) ──────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

    // ── PostgreSQL via TypeORM ───────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: config.get('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
        autoLoadEntities: true,
        synchronize: true, // set to false after first deploy, use migrations
        logging: config.get('NODE_ENV') !== 'production',
      }),
    }),

    AuthModule,
    PostsModule,
    CategoriesModule,
    CommentsModule,
    InteractionsModule,
  ],
})
export class AppModule {}

ENDOFFILE
echo "  ✓ src/app.module.ts"
cat > src/main.ts << 'ENDOFFILE'
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS (allow your React frontend) ──────────────────────────
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://my-portifolio-tau-eight.vercel.app',
      'https://jacobchidieugen.com',
    ],
    credentials: true,
  });

  // ── Global validation pipe ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,          // auto-transform payloads to DTO types
    }),
  );

  // ── API prefix ────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Swagger docs (available at /api/docs) ─────────────────────
  const config = new DocumentBuilder()
    .setTitle('JCE Blog API')
    .setDescription('Jacob Chidi Eugene — Blog Backend REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 JCE Blog API running on port ${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();

ENDOFFILE
echo "  ✓ src/main.ts"
cat > src/auth/admin.entity.ts << 'ENDOFFILE'
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;  // bcrypt hashed

  @Column({ default: 'Jacob Chidi Eugene' })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

ENDOFFILE
echo "  ✓ src/auth/admin.entity.ts"
cat > src/auth/jwt.strategy.ts << 'ENDOFFILE'
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException();
    }
    return { id: payload.sub, email: payload.email };
  }
}

ENDOFFILE
echo "  ✓ src/auth/jwt.strategy.ts"
cat > src/auth/jwt-auth.guard.ts << 'ENDOFFILE'
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

ENDOFFILE
echo "  ✓ src/auth/jwt-auth.guard.ts"
cat > src/auth/auth.service.ts << 'ENDOFFILE'
import {
  Injectable, UnauthorizedException,
  ConflictException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Admin } from './admin.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ── Seed admin on first run ──────────────────────────────────
  async seedAdmin() {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) return;

    const exists = await this.adminRepo.findOne({ where: { email } });
    if (exists) return;

    const hashed = await bcrypt.hash(password, 12);
    const admin = this.adminRepo.create({ email, password: hashed });
    await this.adminRepo.save(admin);
    console.log(`✅ Admin seeded: ${email}`);
  }

  // ── Login ────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const admin = await this.adminRepo.findOne({ where: { email: dto.email } });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, admin.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: admin.id, email: admin.email };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  }

  // ── Get profile ──────────────────────────────────────────────
  async getProfile(adminId: string) {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');
    const { password, ...safe } = admin;
    return safe;
  }

  // ── Change password ──────────────────────────────────────────
  async changePassword(adminId: string, dto: ChangePasswordDto) {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    const valid = await bcrypt.compare(dto.currentPassword, admin.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    admin.password = await bcrypt.hash(dto.newPassword, 12);
    await this.adminRepo.save(admin);
    return { message: 'Password updated successfully' };
  }
}

ENDOFFILE
echo "  ✓ src/auth/auth.service.ts"
cat > src/auth/auth.controller.ts << 'ENDOFFILE'
import { Controller, Post, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login — returns JWT token' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin profile' })
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change admin password' })
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto);
  }
}

ENDOFFILE
echo "  ✓ src/auth/auth.controller.ts"
cat > src/auth/auth.module.ts << 'ENDOFFILE'
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Admin } from './admin.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule implements OnModuleInit {
  constructor(private authService: AuthService) {}
  // Auto-seed admin on startup if not yet created
  async onModuleInit() {
    await this.authService.seedAdmin();
  }
}

ENDOFFILE
echo "  ✓ src/auth/auth.module.ts"
cat > src/auth/dto/login.dto.ts << 'ENDOFFILE'
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@jacobchidieugen.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @MinLength(8)
  password: string;
}

ENDOFFILE
echo "  ✓ src/auth/dto/login.dto.ts"
cat > src/auth/dto/change-password.dto.ts << 'ENDOFFILE'
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

ENDOFFILE
echo "  ✓ src/auth/dto/change-password.dto.ts"
cat > src/categories/category.entity.ts << 'ENDOFFILE'
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany,
} from 'typeorm';
import { Post } from '../posts/post.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: '#c9a84c' })
  color: string;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;
}

ENDOFFILE
echo "  ✓ src/categories/category.entity.ts"
cat > src/categories/categories.service.ts << 'ENDOFFILE'
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

ENDOFFILE
echo "  ✓ src/categories/categories.service.ts"
cat > src/categories/categories.controller.ts << 'ENDOFFILE'
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

ENDOFFILE
echo "  ✓ src/categories/categories.controller.ts"
cat > src/categories/categories.module.ts << 'ENDOFFILE'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}

ENDOFFILE
echo "  ✓ src/categories/categories.module.ts"
cat > src/categories/dto/create-category.dto.ts << 'ENDOFFILE'
import { IsString, IsOptional, IsHexColor } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'JavaScript' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'All things JavaScript' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '#c9a84c' })
  @IsHexColor()
  @IsOptional()
  color?: string;
}

ENDOFFILE
echo "  ✓ src/categories/dto/create-category.dto.ts"
cat > src/posts/post.entity.ts << 'ENDOFFILE'
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { Comment } from '../comments/comment.entity';

export enum PostStatus {
  DRAFT     = 'draft',
  PUBLISHED = 'published',
  ARCHIVED  = 'archived',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  excerpt: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.DRAFT })
  status: PostStatus;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 5 })
  readTimeMinutes: number;

  @ManyToOne(() => Category, (cat) => cat.posts, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn()
  category: Category;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

ENDOFFILE
echo "  ✓ src/posts/post.entity.ts"
cat > src/posts/posts.service.ts << 'ENDOFFILE'
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

ENDOFFILE
echo "  ✓ src/posts/posts.service.ts"
cat > src/posts/posts.controller.ts << 'ENDOFFILE'
import {
  Controller, Get, Post, Patch, Delete, Put,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
  @ApiOperation({ summary: 'Get a single published post by slug (increments view count)' })
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug, true);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Like a post' })
  like(@Param('id') id: string) {
    return this.svc.like(id);
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

ENDOFFILE
echo "  ✓ src/posts/posts.controller.ts"
cat > src/posts/posts.module.ts << 'ENDOFFILE'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), CategoriesModule],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}

ENDOFFILE
echo "  ✓ src/posts/posts.module.ts"
cat > src/posts/dto/create-post.dto.ts << 'ENDOFFILE'
import {
  IsString, IsOptional, IsEnum, IsArray,
  IsUrl, IsNumber, MinLength, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from '../post.entity';

export class CreatePostDto {
  @ApiProperty({ example: 'How to Build a Portfolio Website' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'A step-by-step guide to building a portfolio.' })
  @IsString()
  @MinLength(20)
  @MaxLength(500)
  excerpt: string;

  @ApiProperty({ example: 'Full article content goes here...' })
  @IsString()
  @MinLength(50)
  content: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.jpg' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ enum: PostStatus, default: PostStatus.DRAFT })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @ApiPropertyOptional({ example: ['react', 'portfolio', 'webdev'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  readTimeMinutes?: number;

  @ApiPropertyOptional({ description: 'Category UUID' })
  @IsString()
  @IsOptional()
  categoryId?: string;
}

ENDOFFILE
echo "  ✓ src/posts/dto/create-post.dto.ts"
cat > src/posts/dto/query-posts.dto.ts << 'ENDOFFILE'
import { IsOptional, IsEnum, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from '../post.entity';

export class QueryPostsDto {
  @ApiPropertyOptional() @IsOptional() @IsNumberString() page?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumberString() limit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()       search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()       categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()       tag?: string;
  @ApiPropertyOptional({ enum: PostStatus })
  @IsOptional() @IsEnum(PostStatus)                      status?: PostStatus;
}

ENDOFFILE
echo "  ✓ src/posts/dto/query-posts.dto.ts"
cat > src/comments/comment.entity.ts << 'ENDOFFILE'
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Post } from '../posts/post.entity';

export enum CommentStatus {
  PENDING  = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  authorName: string;

  @Column()
  authorEmail: string;

  @Column('text')
  body: string;

  @Column({ type: 'enum', enum: CommentStatus, default: CommentStatus.PENDING })
  status: CommentStatus;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}

ENDOFFILE
echo "  ✓ src/comments/comment.entity.ts"
cat > src/comments/comments.service.ts << 'ENDOFFILE'
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentStatus } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private repo: Repository<Comment>) {}

  async findByPost(postId: string) {
    return this.repo.find({
      where: { post: { id: postId }, status: CommentStatus.APPROVED },
      order: { createdAt: 'ASC' },
    });
  }

  async findAllPending() {
    return this.repo.find({
      where: { status: CommentStatus.PENDING },
      relations: ['post'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateCommentDto) {
    const comment = this.repo.create({
      authorName:  dto.authorName,
      authorEmail: dto.authorEmail,
      body:        dto.body,
      post:        { id: dto.postId } as any,
    });
    await this.repo.save(comment);
    return { message: 'Comment submitted and awaiting moderation.' };
  }

  async approve(id: string) {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.status = CommentStatus.APPROVED;
    return this.repo.save(comment);
  }

  async reject(id: string) {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.status = CommentStatus.REJECTED;
    return this.repo.save(comment);
  }

  async remove(id: string) {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.repo.remove(comment);
    return { message: 'Comment deleted' };
  }
}

ENDOFFILE
echo "  ✓ src/comments/comments.service.ts"
cat > src/comments/comments.controller.ts << 'ENDOFFILE'
import {
  Controller, Get, Post, Delete, Put,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly svc: CommentsService) {}

  @Get('post/:postId')
  @ApiOperation({ summary: 'Get approved comments for a post (public)' })
  findByPost(@Param('postId') postId: string) {
    return this.svc.findByPost(postId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a comment (public — goes to moderation)' })
  create(@Body() dto: CreateCommentDto) {
    return this.svc.create(dto);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pending comments (admin)' })
  findPending() { return this.svc.findAllPending(); }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a comment (admin)' })
  approve(@Param('id') id: string) { return this.svc.approve(id); }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a comment (admin)' })
  reject(@Param('id') id: string) { return this.svc.reject(id); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment (admin)' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}

ENDOFFILE
echo "  ✓ src/comments/comments.controller.ts"
cat > src/comments/comments.module.ts << 'ENDOFFILE'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}

ENDOFFILE
echo "  ✓ src/comments/comments.module.ts"
cat > src/comments/dto/create-comment.dto.ts << 'ENDOFFILE'
import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  authorName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  authorEmail: string;

  @ApiProperty({ example: 'Great article, very helpful!' })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  body: string;

  @ApiProperty({ description: 'Post UUID' })
  @IsString()
  postId: string;
}

ENDOFFILE
echo "  ✓ src/comments/dto/create-comment.dto.ts"
cat > src/interactions/interactions.module.ts << 'ENDOFFILE'
// Interactions are handled directly in PostsService (like/view)
// This module is a placeholder for future analytics expansion
import { Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';

@Module({ imports: [PostsModule] })
export class InteractionsModule {}

ENDOFFILE
echo "  ✓ src/interactions/interactions.module.ts"

echo ""
echo "✅ All source files written successfully!"
echo ""
echo "Next steps:"
echo "  1. Create your .env file:  cp .env.example .env  (then fill in your values)"
echo "  2. Build the project:      npm run build"
echo "  3. Start dev server:       npm run start:dev"
