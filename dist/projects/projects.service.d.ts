import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { ProjectComment } from './project-comment.entity';
import { ProjectReaction, ReactionType } from './project-reaction.entity';
import { CreateProjectDto, CreateProjectCommentDto, CreateReactionDto } from './dto/project.dto';
export declare class ProjectsService {
    private projectRepo;
    private commentRepo;
    private reactionRepo;
    constructor(projectRepo: Repository<Project>, commentRepo: Repository<ProjectComment>, reactionRepo: Repository<ProjectReaction>);
    findAll(): Promise<Project[]>;
    findOne(id: number): Promise<Project>;
    findAllAdmin(): Promise<Project[]>;
    create(dto: CreateProjectDto): Promise<Project>;
    update(id: number, dto: Partial<CreateProjectDto>): Promise<Project>;
    remove(id: number): Promise<{
        message: string;
    }>;
    react(id: number, dto: CreateReactionDto): Promise<{
        likeCount: number;
        dislikeCount: number;
        reacted: "like" | "dislike";
    }>;
    getReactionStatus(id: number, fingerprint: string): Promise<{
        reacted: ReactionType | null;
    }>;
    submitComment(id: number, dto: CreateProjectCommentDto): Promise<{
        message: string;
    }>;
    getComments(id: number): Promise<ProjectComment[]>;
    getPendingComments(): Promise<ProjectComment[]>;
    approveComment(commentId: string): Promise<ProjectComment>;
    rejectComment(commentId: string): Promise<ProjectComment>;
    deleteComment(commentId: string): Promise<{
        message: string;
    }>;
}
