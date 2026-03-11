import type { Response } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
export declare class PostsController {
    private readonly svc;
    constructor(svc: PostsService);
    findAll(query: QueryPostsDto): Promise<{
        data: import("./post.entity").Post[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findBySlug(slug: string): Promise<import("./post.entity").Post>;
    like(id: string): Promise<{
        likeCount: number;
    }>;
    ogProxy(slug: string, res: Response): Promise<void>;
    findAllAdmin(query: QueryPostsDto): Promise<{
        data: import("./post.entity").Post[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<import("./post.entity").Post>;
    create(dto: CreatePostDto): Promise<import("./post.entity").Post>;
    update(id: string, dto: CreatePostDto): Promise<import("./post.entity").Post>;
    publish(id: string): Promise<import("./post.entity").Post>;
    unpublish(id: string): Promise<import("./post.entity").Post>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
