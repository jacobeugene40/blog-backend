import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { CategoriesService } from '../categories/categories.service';
export declare class PostsService {
    private repo;
    private categoriesService;
    constructor(repo: Repository<Post>, categoriesService: CategoriesService);
    findAll(query: QueryPostsDto, isAdmin?: boolean): Promise<{
        data: Post[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findBySlug(slug: string, incrementView?: boolean): Promise<Post>;
    findById(id: string): Promise<Post>;
    create(dto: CreatePostDto): Promise<Post>;
    update(id: string, dto: Partial<CreatePostDto>): Promise<Post>;
    publish(id: string): Promise<Post>;
    unpublish(id: string): Promise<Post>;
    remove(id: string): Promise<{
        message: string;
    }>;
    like(id: string): Promise<{
        likeCount: number;
    }>;
}
