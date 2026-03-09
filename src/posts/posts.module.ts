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

