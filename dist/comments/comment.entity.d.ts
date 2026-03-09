import { Post } from '../posts/post.entity';
export declare enum CommentStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class Comment {
    id: string;
    authorName: string;
    authorEmail: string;
    body: string;
    status: CommentStatus;
    post: Post;
    createdAt: Date;
}
