import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, In, Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { KafkaTopic } from '../common/enums/kafka-topic.enum';
import { RoleType } from '../common/enums/role.enum';
import { OutboxService } from '../events/outbox.service';
import { Role } from '../roles/entities/role.entity';
import { Shop } from '../shops/entities/shop.entity';
import { RedisCacheService } from '../storage/redis-cache.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
    private readonly outboxService: OutboxService,
    private readonly redisCache: RedisCacheService,
  ) {}

  async create(createUserDto: CreateUserDto, creator?: AuthenticatedUser) {
    this.assertCreatorCanCreateRoles(createUserDto.roles, creator);

    const email = createUserDto.email.toLowerCase().trim();
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('A user with this email already exists');
    }

    const roles = await this.rolesRepository.find({
      where: { name: In(createUserDto.roles) },
    });

    if (roles.length !== createUserDto.roles.length) {
      throw new BadRequestException('One or more roles do not exist');
    }

    const shops = await this.resolveAssignableShops(
      createUserDto.shopIds ?? [],
      creator,
    );

    const createdBy = creator
      ? await this.usersRepository.findOne({ where: { id: creator.id } })
      : undefined;

    const savedUser = await this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email,
        passwordHash: await bcrypt.hash(createUserDto.password, 10),
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        roles,
        shops,
        createdBy: createdBy ?? undefined,
      });

      const savedUser = await manager.save(user);

      await this.outboxService.enqueue(
        KafkaTopic.USER_CREATED,
        {
          userId: savedUser.id,
          email: savedUser.email,
          roles: roles.map((role) => role.name),
          shopIds: shops.map((shop) => shop.id),
          createdById: createdBy?.id,
        },
        {
          aggregateId: savedUser.id,
          aggregateType: 'User',
          partitionKey: shops[0]?.id ?? savedUser.id,
          manager,
        },
      );

      return savedUser;
    });

    await this.invalidateUserAuthCache(savedUser.id);

    return savedUser;
  }

  async findByEmailWithRoles(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase().trim(), isActive: true },
      relations: { roles: { permissions: true }, shops: true },
    });
  }

  async findById(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { roles: { permissions: true }, shops: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByIdForCurrentUser(id: string, currentUser: AuthenticatedUser) {
    const user = await this.findById(id);

    if (
      currentUser.roles.includes(RoleType.SUPER_ADMIN) ||
      currentUser.roles.includes(RoleType.ADMIN)
    ) {
      return user;
    }

    const requestedUserShopIds = new Set(user.shops?.map((shop) => shop.id));
    const canReadUser = currentUser.shopIds.some((shopId) =>
      requestedUserShopIds.has(shopId),
    );

    if (!canReadUser) {
      throw new ForbiddenException('You cannot read this user');
    }

    return user;
  }

  async findAll() {
    const users = await this.usersRepository.find({
      relations: { roles: true, shops: true },
      order: { createdAt: 'DESC' },
    });

    return users;
  }

  async invalidateUserAuthCache(userId: string) {
    await this.redisCache.delete(`auth:user:${userId}`);
  }

  private assertCreatorCanCreateRoles(
    rolesToCreate: RoleType[],
    creator?: AuthenticatedUser,
  ) {
    if (!creator) {
      return;
    }

    const creatorRoles = creator.roles;

    if (creatorRoles.includes(RoleType.SUPER_ADMIN)) {
      return;
    }

    if (
      creatorRoles.includes(RoleType.ADMIN) &&
      rolesToCreate.every((role) =>
        [RoleType.OWNER, RoleType.EMPLOYEE].includes(role),
      )
    ) {
      return;
    }

    if (
      creatorRoles.includes(RoleType.OWNER) &&
      rolesToCreate.every((role) => role === RoleType.EMPLOYEE)
    ) {
      return;
    }

    throw new ForbiddenException('You cannot create a user with these roles');
  }

  private async resolveAssignableShops(
    shopIds: string[],
    creator?: AuthenticatedUser,
  ) {
    if (!shopIds.length) {
      return [];
    }

    const shops = await this.shopsRepository.find({
      where: { id: In(shopIds) },
    });

    if (shops.length !== shopIds.length) {
      throw new BadRequestException('One or more shops do not exist');
    }

    if (!creator || creator.roles.includes(RoleType.SUPER_ADMIN)) {
      return shops;
    }

    const allowedShopIds = new Set(
      (
        await this.shopsRepository
          .createQueryBuilder('shop')
          .innerJoin('shop.users', 'user', 'user.id = :userId', {
            userId: creator.id,
          })
          .select('shop.id', 'id')
          .getRawMany<{ id: string }>()
      ).map((shop) => shop.id),
    );

    if (shops.some((shop) => !allowedShopIds.has(shop.id))) {
      throw new ForbiddenException('You cannot assign users to these shops');
    }

    return shops;
  }

}
