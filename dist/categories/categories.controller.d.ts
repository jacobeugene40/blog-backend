import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesController {
    private readonly svc;
    constructor(svc: CategoriesService);
    findAll(): Promise<import("./category.entity").Category[]>;
    findOne(id: string): Promise<import("./category.entity").Category>;
    create(dto: CreateCategoryDto): Promise<import("./category.entity").Category>;
    update(id: string, dto: CreateCategoryDto): Promise<import("./category.entity").Category>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
