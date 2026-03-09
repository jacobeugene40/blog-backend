import { Project } from './project.entity';
export declare enum ProjectCommentStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class ProjectComment {
    id: string;
    authorName: string;
    authorEmail: string;
    body: string;
    status: ProjectCommentStatus;
    project: Project;
    createdAt: Date;
}
