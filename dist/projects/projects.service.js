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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("./project.entity");
const project_comment_entity_1 = require("./project-comment.entity");
const project_reaction_entity_1 = require("./project-reaction.entity");
let ProjectsService = class ProjectsService {
    projectRepo;
    commentRepo;
    reactionRepo;
    constructor(projectRepo, commentRepo, reactionRepo) {
        this.projectRepo = projectRepo;
        this.commentRepo = commentRepo;
        this.reactionRepo = reactionRepo;
    }
    async findAll() {
        return this.projectRepo.find({
            where: { isActive: true },
            order: { id: 'ASC' },
        });
    }
    async findOne(id) {
        const project = await this.projectRepo.findOne({ where: { id } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return project;
    }
    async findAllAdmin() {
        return this.projectRepo.find({ order: { id: 'ASC' } });
    }
    async create(dto) {
        const project = this.projectRepo.create(dto);
        return this.projectRepo.save(project);
    }
    async update(id, dto) {
        const project = await this.findOne(id);
        Object.assign(project, dto);
        return this.projectRepo.save(project);
    }
    async remove(id) {
        const project = await this.findOne(id);
        await this.projectRepo.remove(project);
        return { message: 'Project deleted' };
    }
    async react(id, dto) {
        const project = await this.findOne(id);
        const existing = await this.reactionRepo.findOne({
            where: { project: { id }, fingerprint: dto.fingerprint },
        });
        if (existing) {
            throw new common_1.ConflictException('You have already reacted to this project');
        }
        const reaction = this.reactionRepo.create({
            type: dto.type,
            fingerprint: dto.fingerprint,
            project,
        });
        await this.reactionRepo.save(reaction);
        if (dto.type === 'like') {
            await this.projectRepo.increment({ id }, 'likeCount', 1);
            project.likeCount += 1;
        }
        else {
            await this.projectRepo.increment({ id }, 'dislikeCount', 1);
            project.dislikeCount += 1;
        }
        return {
            likeCount: dto.type === 'like' ? project.likeCount : project.likeCount,
            dislikeCount: dto.type === 'dislike' ? project.dislikeCount : project.dislikeCount,
            reacted: dto.type,
        };
    }
    async getReactionStatus(id, fingerprint) {
        const existing = await this.reactionRepo.findOne({
            where: { project: { id }, fingerprint },
        });
        return { reacted: existing ? existing.type : null };
    }
    async submitComment(id, dto) {
        const project = await this.findOne(id);
        const comment = this.commentRepo.create({ ...dto, project });
        await this.commentRepo.save(comment);
        return { message: 'Comment submitted and awaiting moderation.' };
    }
    async getComments(id) {
        return this.commentRepo.find({
            where: { project: { id }, status: project_comment_entity_1.ProjectCommentStatus.APPROVED },
            order: { createdAt: 'ASC' },
        });
    }
    async getPendingComments() {
        return this.commentRepo.find({
            where: { status: project_comment_entity_1.ProjectCommentStatus.PENDING },
            relations: ['project'],
            order: { createdAt: 'DESC' },
        });
    }
    async approveComment(commentId) {
        const comment = await this.commentRepo.findOne({ where: { id: commentId } });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        comment.status = project_comment_entity_1.ProjectCommentStatus.APPROVED;
        return this.commentRepo.save(comment);
    }
    async rejectComment(commentId) {
        const comment = await this.commentRepo.findOne({ where: { id: commentId } });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        comment.status = project_comment_entity_1.ProjectCommentStatus.REJECTED;
        return this.commentRepo.save(comment);
    }
    async deleteComment(commentId) {
        const comment = await this.commentRepo.findOne({ where: { id: commentId } });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        await this.commentRepo.remove(comment);
        return { message: 'Comment deleted' };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_comment_entity_1.ProjectComment)),
    __param(2, (0, typeorm_1.InjectRepository)(project_reaction_entity_1.ProjectReaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map