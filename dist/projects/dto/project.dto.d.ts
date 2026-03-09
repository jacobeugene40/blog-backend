export declare class CreateProjectDto {
    title: string;
    description: string;
    viewLink?: string;
    coverImage?: string;
    tags?: string[];
    technologies?: string[];
    overview?: string;
    features?: string[];
    outcomes?: string[];
    isActive?: boolean;
}
export declare class CreateProjectCommentDto {
    authorName: string;
    authorEmail?: string;
    body: string;
}
export declare class CreateReactionDto {
    type: 'like' | 'dislike';
    fingerprint: string;
}
