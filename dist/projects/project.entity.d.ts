import { ProjectComment } from './project-comment.entity';
import { ProjectReaction } from './project-reaction.entity';
export declare class Project {
    id: number;
    title: string;
    description: string;
    viewLink: string;
    coverImage: string;
    tags: string[];
    overview: string;
    features: string[];
    outcomes: string[];
    technologies: string[];
    isActive: boolean;
    likeCount: number;
    dislikeCount: number;
    comments: ProjectComment[];
    reactions: ProjectReaction[];
    createdAt: Date;
    updatedAt: Date;
}
