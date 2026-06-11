import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { RedisCacheService } from '../../storage/redis-cache.service';
import { User } from '../../users/entities/user.entity';
import { AuthenticatedUser } from '../types/authenticated-user.type';

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly redisCache: RedisCacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const cacheKey = `auth:user:${payload.sub}`;
    const cachedUser =
      await this.redisCache.getJson<AuthenticatedUser>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub, isActive: true },
      relations: { roles: { permissions: true }, shops: true },
    });

    if (!user) {
      throw new UnauthorizedException('User is inactive or does not exist');
    }

    const roles = user.roles?.map((role) => role.name) ?? [];
    const permissions =
      user.roles?.flatMap((role) =>
        role.permissions?.map((permission) => permission.name),
      ) ?? [];

    const authenticatedUser = {
      id: user.id,
      email: user.email,
      roles,
      permissions: [...new Set(permissions)],
      shopIds: user.shops?.map((shop) => shop.id) ?? [],
    };

    await this.redisCache.setJson(cacheKey, authenticatedUser, 300);

    return authenticatedUser;
  }
}
