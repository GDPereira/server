import { Injectable, OnModuleInit } from '@nestjs/common';
import * as paseto from 'paseto';
import * as crypto from 'crypto';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPair,
} from './interfaces/token-payload.interface';

const { V3 } = paseto;

@Injectable()
export class PasetoService implements OnModuleInit {
  private secretKey: Buffer;

  private readonly ACCESS_TOKEN_DURATION_SECONDS = 15 * 60; // 15 minutes
  private readonly REFRESH_TOKEN_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

  async onModuleInit() {
    const keyBase64 = process.env.PASETO_SECRET_KEY;
    if (!keyBase64) {
      throw new Error('PASETO_SECRET_KEY environment variable is required');
    }
    this.secretKey = Buffer.from(keyBase64, 'base64');

    // V3 local encryption requires a 32-byte key
    if (this.secretKey.length !== 32) {
      throw new Error('PASETO_SECRET_KEY must be a 32-byte key (base64 encoded)');
    }
  }

  async generateTokenPair(
    userId: string,
    email: string,
    tokenId: string,
  ): Promise<TokenPair> {
    const accessPayload = {
      sub: userId,
      email,
      type: 'access' as const,
    };

    const refreshPayload = {
      sub: userId,
      tokenId,
      type: 'refresh' as const,
    };

    const accessToken = await V3.encrypt(accessPayload, this.secretKey, {
      expiresIn: `${this.ACCESS_TOKEN_DURATION_SECONDS}s`,
    });

    const refreshToken = await V3.encrypt(refreshPayload, this.secretKey, {
      expiresIn: `${this.REFRESH_TOKEN_DURATION_SECONDS}s`,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_DURATION_SECONDS,
    };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const payload = await V3.decrypt<AccessTokenPayload>(token, this.secretKey);

    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      type: 'access',
    };
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    const payload = await V3.decrypt<RefreshTokenPayload>(token, this.secretKey);

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return {
      sub: payload.sub,
      tokenId: payload.tokenId,
      type: 'refresh',
    };
  }

  getRefreshTokenExpiryDate(): Date {
    return new Date(Date.now() + this.REFRESH_TOKEN_DURATION_SECONDS * 1000);
  }

  /**
   * Generates a new 32-byte secret key for PASETO V3 local encryption.
   * Run this once during setup and store the result in PASETO_SECRET_KEY env var.
   */
  static generateSecretKey(): string {
    const key = crypto.randomBytes(32);
    return key.toString('base64');
  }
}
