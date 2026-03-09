import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsService {
    private repo;
    constructor(repo: Repository<Comment>);
    findByPost(postId: string): Promise<Comment[]>;
    findAllPending(): Promise<Comment[]>;
    create(dto: CreateCommentDto): Promise<{
        message: string;
    }>;
    approve(id: string): Promise<Comment>;
    reject(id: string): Promise<Comment>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
