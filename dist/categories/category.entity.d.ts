import { Post } from '../posts/post.entity';
export declare class Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string;
    posts: Post[];
    createdAt: Date;
}
