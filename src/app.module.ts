import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { InteractionsModule } from './interactions/interactions.module';
import { ProjectsModule } from './projects/projects.module';
import { TestimonialsModule } from './testimonials/testimonials.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ── Rate limiting — 60 requests per minute globally ────────
    // Individual endpoints can override with @Throttle() or opt out with @SkipThrottle()
    ThrottlerModule.forRoot([{
      ttl:   60000,  // 1 minute window (ms)
      limit: 60,     // max 60 requests per IP per window
    }]),

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
        synchronize: true,
        logging: config.get('NODE_ENV') !== 'production',
      }),
    }),

    AuthModule,
    PostsModule,
    CategoriesModule,
    CommentsModule,
    InteractionsModule,
    ProjectsModule,
    TestimonialsModule
  ],
  providers: [
    // ── Apply ThrottlerGuard globally to all routes ─────────────
    {
      provide:  APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}