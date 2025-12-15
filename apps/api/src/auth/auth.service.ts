import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { PasetoService } from './paseto.service';
import type { SignupDto } from './dto/signup.dto';
import type { LoginDto } from './dto/login.dto';
import type { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private prisma: PrismaService,
    private pasetoService: PasetoService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: signupDto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(signupDto.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: signupDto.email.toLowerCase(),
        passwordHash,
      },
    });

    return this.createAuthResponse(user.id, user.email);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthResponse(user.id, user.email);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = await this.pasetoService.verifyRefreshToken(refreshToken);

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { id: payload.tokenId },
        include: { user: true },
      });

      if (!storedToken || storedToken.revokedAt) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      if (storedToken.user.deletedAt) {
        throw new UnauthorizedException('User account is deactivated');
      }

      // Revoke old token (token rotation)
      await this.prisma.refreshToken.update({
        where: { id: payload.tokenId },
        data: { revokedAt: new Date() },
      });

      return this.createAuthResponse(storedToken.user.id, storedToken.user.email);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = await this.pasetoService.verifyRefreshToken(refreshToken);

      await this.prisma.refreshToken.update({
        where: { id: payload.tokenId },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Silently ignore invalid tokens during logout
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  private async createAuthResponse(
    userId: string,
    email: string,
  ): Promise<AuthResponseDto> {
    const expiresAt = this.pasetoService.getRefreshTokenExpiryDate();

    const refreshTokenRecord = await this.prisma.refreshToken.create({
      data: {
        userId,
        token: '',
        expiresAt,
      },
    });

    const tokens = await this.pasetoService.generateTokenPair(
      userId,
      email,
      refreshTokenRecord.id,
    );

    // Store hashed version of refresh token for additional security
    const tokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.refreshToken.update({
      where: { id: refreshTokenRecord.id },
      data: { token: tokenHash },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: { id: userId, email },
    };
  }
}
