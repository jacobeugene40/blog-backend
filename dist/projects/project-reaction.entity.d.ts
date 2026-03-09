import { Project } from './project.entity';
export declare enum ReactionType {
    LIKE = "like",
    DISLIKE = "dislike"
}
export declare class ProjectReaction {
    id: string;
    type: ReactionType;
    fingerprint: string;
    project: Project;
    createdAt: Date;
}
