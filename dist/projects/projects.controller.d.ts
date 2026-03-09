import { ProjectsService } from './projects.service';
import { CreateProjectDto, CreateProjectCommentDto, CreateReactionDto } from './dto/project.dto';
export declare class ProjectsController {
    private readonly svc;
    constructor(svc: ProjectsService);
    findAllAdmin(): Promise<import("./project.entity").Project[]>;
    getPendingComments(): Promise<import("./project-comment.entity").ProjectComment[]>;
    approveComment(commentId: string): Promise<import("./project-comment.entity").ProjectComment>;
    rejectComment(commentId: string): Promise<import("./project-comment.entity").ProjectComment>;
    deleteComment(commentId: string): Promise<{
        message: string;
    }>;
    create(dto: CreateProjectDto): Promise<import("./project.entity").Project>;
    update(id: number, dto: CreateProjectDto): Promise<import("./project.entity").Project>;
    remove(id: number): Promise<{
        message: string;
    }>;
    uploadImage(id: number, file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
    findAll(): Promise<import("./project.entity").Project[]>;
    findOne(id: number): Promise<import("./project.entity").Project>;
    getComments(id: number): Promise<import("./project-comment.entity").ProjectComment[]>;
    submitComment(id: number, dto: CreateProjectCommentDto): Promise<{
        message: string;
    }>;
    react(id: number, dto: CreateReactionDto): Promise<{
        likeCount: number;
        dislikeCount: number;
        reacted: "like" | "dislike";
    }>;
    reactionStatus(id: number, fingerprint: string): Promise<{
        reacted: import("./project-reaction.entity").ReactionType | null;
    }>;
}
