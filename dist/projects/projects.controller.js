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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const swagger_1 = require("@nestjs/swagger");
const projects_service_1 = require("./projects.service");
const project_dto_1 = require("./dto/project.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const imageStorage = (0, multer_1.diskStorage)({
    destination: (0, path_1.join)(process.cwd(), 'uploads', 'projects'),
    filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + (0, path_1.extname)(file.originalname));
    },
});
let ProjectsController = class ProjectsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    findAllAdmin() { return this.svc.findAllAdmin(); }
    getPendingComments() { return this.svc.getPendingComments(); }
    approveComment(commentId) { return this.svc.approveComment(commentId); }
    rejectComment(commentId) { return this.svc.rejectComment(commentId); }
    deleteComment(commentId) { return this.svc.deleteComment(commentId); }
    create(dto) { return this.svc.create(dto); }
    update(id, dto) {
        return this.svc.update(id, dto);
    }
    remove(id) { return this.svc.remove(id); }
    async uploadImage(id, file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const ext = (0, path_1.extname)(file.originalname).toLowerCase();
        if (!ALLOWED_EXT.includes(ext)) {
            throw new common_1.BadRequestException('Only JPG, PNG and WEBP images are allowed');
        }
        const imageUrl = `/uploads/projects/${file.filename}`;
        await this.svc.update(id, { coverImage: imageUrl });
        return { imageUrl };
    }
    findAll() { return this.svc.findAll(); }
    findOne(id) { return this.svc.findOne(id); }
    getComments(id) { return this.svc.getComments(id); }
    submitComment(id, dto) { return this.svc.submitComment(id, dto); }
    react(id, dto) { return this.svc.react(id, dto); }
    reactionStatus(id, fingerprint) { return this.svc.getReactionStatus(id, fingerprint); }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all projects including inactive (admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('admin/comments/pending'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all pending project comments (admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getPendingComments", null);
__decorate([
    (0, common_1.Put)('admin/comments/:commentId/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a project comment (admin)' }),
    __param(0, (0, common_1.Param)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "approveComment", null);
__decorate([
    (0, common_1.Put)('admin/comments/:commentId/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a project comment (admin)' }),
    __param(0, (0, common_1.Param)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "rejectComment", null);
__decorate([
    (0, common_1.Delete)('admin/comments/:commentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a project comment (admin)' }),
    __param(0, (0, common_1.Param)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a project (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a project (admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a project (admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/upload-image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', { storage: imageStorage })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } }),
    (0, swagger_1.ApiOperation)({ summary: 'Upload cover image for a project (admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all active projects (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single project (public)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get approved comments for a project (public)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a comment (goes to moderation)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, project_dto_1.CreateProjectCommentDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "submitComment", null);
__decorate([
    (0, common_1.Post)(':id/react'),
    (0, swagger_1.ApiOperation)({ summary: 'Like or dislike a project' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, project_dto_1.CreateReactionDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "react", null);
__decorate([
    (0, common_1.Get)(':id/reaction-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if fingerprint already reacted' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('fingerprint')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "reactionStatus", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('Projects'),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map