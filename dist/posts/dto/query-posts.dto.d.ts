import { PostStatus } from '../post.entity';
export declare class QueryPostsDto {
    page?: string;
    limit?: string;
    search?: string;
    categoryId?: string;
    tag?: string;
    status?: PostStatus;
}
