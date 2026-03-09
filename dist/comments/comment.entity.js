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
exports.Comment = exports.CommentStatus = void 0;
const typeorm_1 = require("typeorm");
const post_entity_1 = require("../posts/post.entity");
var CommentStatus;
(function (CommentStatus) {
    CommentStatus["PENDING"] = "pending";
    CommentStatus["APPROVED"] = "approved";
    CommentStatus["REJECTED"] = "rejected";
})(CommentStatus || (exports.CommentStatus = CommentStatus = {}));
let Comment = class Comment {
    id;
    authorName;
    authorEmail;
    body;
    status;
    post;
    createdAt;
};
exports.Comment = Comment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Comment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Comment.prototype, "authorName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Comment.prototype, "authorEmail", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Comment.prototype, "body", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CommentStatus, default: CommentStatus.PENDING }),
    __metadata("design:type", String)
], Comment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => post_entity_1.Post, (post) => post.comments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", post_entity_1.Post)
], Comment.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Comment.prototype, "createdAt", void 0);
exports.Comment = Comment = __decorate([
    (0, typeorm_1.Entity)('comments')
], Comment);
//# sourceMappingURL=comment.entity.js.map