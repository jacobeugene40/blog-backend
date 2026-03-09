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
exports.Project = void 0;
const typeorm_1 = require("typeorm");
const project_comment_entity_1 = require("./project-comment.entity");
const project_reaction_entity_1 = require("./project-reaction.entity");
let Project = class Project {
    id;
    title;
    description;
    viewLink;
    coverImage;
    tags;
    overview;
    features;
    outcomes;
    technologies;
    isActive;
    likeCount;
    dislikeCount;
    comments;
    reactions;
    createdAt;
    updatedAt;
};
exports.Project = Project;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Project.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Project.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "viewLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "coverImage", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Project.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "overview", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Project.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Project.prototype, "outcomes", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Project.prototype, "technologies", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Project.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Project.prototype, "likeCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Project.prototype, "dislikeCount", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_comment_entity_1.ProjectComment, (c) => c.project),
    __metadata("design:type", Array)
], Project.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_reaction_entity_1.ProjectReaction, (r) => r.project),
    __metadata("design:type", Array)
], Project.prototype, "reactions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Project.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Project.prototype, "updatedAt", void 0);
exports.Project = Project = __decorate([
    (0, typeorm_1.Entity)('projects')
], Project);
//# sourceMappingURL=project.entity.js.map