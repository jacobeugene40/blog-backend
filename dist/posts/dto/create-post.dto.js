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
exports.CreatePostDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const post_entity_1 = require("../post.entity");
class CreatePostDto {
    title;
    excerpt;
    content;
    coverImage;
    status;
    tags;
    readTimeMinutes;
    categoryId;
}
exports.CreatePostDto = CreatePostDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'How to Build a Portfolio Website' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreatePostDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A step-by-step guide to building a portfolio.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreatePostDto.prototype, "excerpt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Full article content goes here...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50),
    __metadata("design:type", String)
], CreatePostDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://cdn.example.com/cover.jpg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "coverImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: post_entity_1.PostStatus, default: post_entity_1.PostStatus.DRAFT }),
    (0, class_validator_1.IsEnum)(post_entity_1.PostStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['react', 'portfolio', 'webdev'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePostDto.prototype, "readTimeMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category UUID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "categoryId", void 0);
//# sourceMappingURL=create-post.dto.js.map