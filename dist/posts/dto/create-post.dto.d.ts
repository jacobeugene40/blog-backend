import { PostStatus } from '../post.entity';
export declare class CreatePostDto {
    title: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    status?: PostStatus;
    tags?: string[];
    readTimeMinutes?: number;
    categoryId?: string;
}
