import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Admin } from './admin.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthService {
    private adminRepo;
    private jwtService;
    private config;
    constructor(adminRepo: Repository<Admin>, jwtService: JwtService, config: ConfigService);
    seedAdmin(): Promise<void>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        expiresIn: any;
        admin: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    getProfile(adminId: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(adminId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
