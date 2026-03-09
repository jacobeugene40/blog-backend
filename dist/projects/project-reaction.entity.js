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
exports.ProjectReaction = exports.ReactionType = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("./project.entity");
var ReactionType;
(function (ReactionType) {
    ReactionType["LIKE"] = "like";
    ReactionType["DISLIKE"] = "dislike";
})(ReactionType || (exports.ReactionType = ReactionType = {}));
let ProjectReaction = class ProjectReaction {
    id;
    type;
    fingerprint;
    project;
    createdAt;
};
exports.ProjectReaction = ProjectReaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProjectReaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ReactionType }),
    __metadata("design:type", String)
], ProjectReaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectReaction.prototype, "fingerprint", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, (p) => p.reactions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", project_entity_1.Project)
], ProjectReaction.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProjectReaction.prototype, "createdAt", void 0);
exports.ProjectReaction = ProjectReaction = __decorate([
    (0, typeorm_1.Entity)('project_reactions')
], ProjectReaction);
//# sourceMappingURL=project-reaction.entity.js.map