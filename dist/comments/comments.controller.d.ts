import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsController {
    private readonly svc;
    constructor(svc: CommentsService);
    findByPost(postId: string): Promise<import("./comment.entity").Comment[]>;
    create(dto: CreateCommentDto): Promise<{
        message: string;
    }>;
    findPending(): Promise<import("./comment.entity").Comment[]>;
    approve(id: string): Promise<import("./comment.entity").Comment>;
    reject(id: string): Promise<import("./comment.entity").Comment>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
