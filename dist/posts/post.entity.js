"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = exports.PostStatus = void 0;
const typeorm_1 = require("typeorm");
const category_entity_1 = require("../categories/category.entity");
const comment_entity_1 = require("../comments/comment.entity");
var PostStatus;
(function (PostStatus) {
    PostStatus["DRAFT"] = "draft";
    PostStatus["PUBLISHED"] = "published";
    PostStatus["ARCHIVED"] = "archived";
})(PostStatus || (exports.PostStatus = PostStatus = {}));
let Post = class Post {
    id;
    title;
    slug;
    excerpt;
    content;
    coverImage;
    status;
    tags;
    viewCount;
    likeCount;
    readTimeMinutes;
    category;
    comments;
    createdAt;
    updatedAt;
};
exports.Post = Post;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Post.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Post.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Post.prototype, "excerpt", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "coverImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PostStatus, default: PostStatus.DRAFT }),
    __metadata("design:type", String)
], Post.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Post.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Post.prototype, "viewCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Post.prototype, "likeCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 5 }),
    __metadata("design:type", Number)
], Post.prototype, "readTimeMinutes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, (cat) => cat.posts, { nullable: true, eager: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", category_entity_1.Category)
], Post.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comment_entity_1.Comment, (comment) => comment.post),
    __metadata("design:type", Array)
], Post.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Post.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Post.prototype, "updatedAt", void 0);
exports.Post = Post = __decorate([
    (0, typeorm_1.Entity)('posts')
], Post);
//# sourceMappingURL=post.entity.js.map