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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const slugify_1 = __importDefault(require("slugify"));
const category_entity_1 = require("./category.entity");
let CategoriesService = class CategoriesService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findAll() {
        return this.repo.find({ order: { name: 'ASC' } });
    }
    async findOne(id) {
        const cat = await this.repo.findOne({ where: { id } });
        if (!cat)
            throw new common_1.NotFoundException('Category not found');
        return cat;
    }
    async create(dto) {
        const slug = (0, slugify_1.default)(dto.name, { lower: true, strict: true });
        const exists = await this.repo.findOne({ where: { slug } });
        if (exists)
            throw new common_1.ConflictException('Category already exists');
        const cat = this.repo.create({ ...dto, slug });
        return this.repo.save(cat);
    }
    async update(id, dto) {
        const cat = await this.findOne(id);
        if (dto.name)
            cat.slug = (0, slugify_1.default)(dto.name, { lower: true, strict: true });
        Object.assign(cat, dto);
        return this.repo.save(cat);
    }
    async remove(id) {
        const cat = await this.findOne(id);
        await this.repo.remove(cat);
        return { message: 'Category deleted' };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map