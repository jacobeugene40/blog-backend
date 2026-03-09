import { Category } from '../categories/category.entity';
import { Comment } from '../comments/comment.entity';
export declare enum PostStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
export declare class Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    status: PostStatus;
    tags: string[];
    viewCount: number;
    likeCount: number;
    readTimeMinutes: number;
    category: Category;
    comments: Comment[];
    createdAt: Date;
    updatedAt: Date;
}
