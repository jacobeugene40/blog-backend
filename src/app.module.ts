import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { InteractionsModule } from './interactions/interactions.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

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
  ],
})
export class AppModule {}

