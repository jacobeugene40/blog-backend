import {
  Injectable, UnauthorizedException,
  ConflictException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Admin } from './admin.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ── Seed admin on first run ──────────────────────────────────
  async seedAdmin() {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) return;

    const exists = await this.adminRepo.findOne({ where: { email } });
    if (exists) return;

    const hashed = await bcrypt.hash(password, 12);
    const admin = this.adminRepo.create({ email, password: hashed });
    await this.adminRepo.save(admin);
    console.log(`✅ Admin seeded: ${email}`);
  }

  // ── Login ────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const admin = await this.adminRepo.findOne({ where: { email: dto.email } });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, admin.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: admin.id, email: admin.email };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  }

  // ── Get profile ──────────────────────────────────────────────
  async getProfile(adminId: string) {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');
    const { password, ...safe } = admin;
    return safe;
  }

  // ── Change password ──────────────────────────────────────────
  async changePassword(adminId: string, dto: ChangePasswordDto) {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    const valid = await bcrypt.compare(dto.currentPassword, admin.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    admin.password = await bcrypt.hash(dto.newPassword, 12);
    await this.adminRepo.save(admin);
    return { message: 'Password updated successfully' };
  }
}

