import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        expiresIn: any;
        admin: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
