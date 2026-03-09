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
exports.CreateReactionDto = exports.CreateProjectCommentDto = exports.CreateProjectDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateProjectDto {
    title;
    description;
    viewLink;
    coverImage;
    tags;
    technologies;
    overview;
    features;
    outcomes;
    isActive;
}
exports.CreateProjectDto = CreateProjectDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'My Portfolio Website' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A full-stack portfolio built with React and NestJS.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://my-portfolio.vercel.app' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "viewLink", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "coverImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['React', 'NestJS', 'PostgreSQL'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['React', 'NestJS', 'PostgreSQL'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "technologies", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'This project was built to...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "overview", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['Feature 1', 'Feature 2'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['Outcome 1', 'Outcome 2'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "outcomes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateProjectDto.prototype, "isActive", void 0);
class CreateProjectCommentDto {
    authorName;
    authorEmail;
    body;
}
exports.CreateProjectCommentDto = CreateProjectCommentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectCommentDto.prototype, "authorName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john@example.com' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectCommentDto.prototype, "authorEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Great project!' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectCommentDto.prototype, "body", void 0);
class CreateReactionDto {
    type;
    fingerprint;
}
exports.CreateReactionDto = CreateReactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['like', 'dislike'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReactionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReactionDto.prototype, "fingerprint", void 0);
//# sourceMappingURL=project.dto.js.map