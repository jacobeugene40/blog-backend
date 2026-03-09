// Interactions are handled directly in PostsService (like/view)
// This module is a placeholder for future analytics expansion
import { Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';

@Module({ imports: [PostsModule] })
export class InteractionsModule {}

