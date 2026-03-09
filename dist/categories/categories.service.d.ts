import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesService {
    private repo;
    constructor(repo: Repository<Category>);
    findAll(): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    create(dto: CreateCategoryDto): Promise<Category>;
    update(id: string, dto: Partial<CreateCategoryDto>): Promise<Category>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
