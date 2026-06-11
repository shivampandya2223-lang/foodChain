import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { KafkaTopic } from '../common/enums/kafka-topic.enum';
import { OutboxService } from '../events/outbox.service';
import { RedisCacheService } from '../storage/redis-cache.service';
import { User } from '../users/entities/user.entity';
import { AssignShopUsersDto } from './dto/assign-shop-users.dto';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';

@Injectable()
export class ShopsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly outboxService: OutboxService,
    private readonly redisCache: RedisCacheService,
  ) {}

  async create(createShopDto: CreateShopDto) {
    const savedShop = await this.dataSource.transaction(async (manager) => {
      const slug = createShopDto.slug ?? this.slugify(createShopDto.name);
      await this.assertSlugIsAvailable(slug, manager);

      const owner = createShopDto.ownerId
        ? await this.findUser(createShopDto.ownerId, manager)
        : undefined;

      const shop = manager.create(Shop, {
        name: createShopDto.name,
        slug,
        address: createShopDto.address,
        phone: createShopDto.phone,
        owner,
        users: owner ? [owner] : [],
      });

      const savedShop = await manager.save(shop);

      await this.outboxService.enqueue(
        KafkaTopic.SHOP_CREATED,
        {
          shopId: savedShop.id,
          name: savedShop.name,
          slug: savedShop.slug,
          ownerId: savedShop.owner?.id,
        },
        {
          aggregateId: savedShop.id,
          aggregateType: 'Shop',
          partitionKey: savedShop.id,
          manager,
        },
      );

      return savedShop;
    });

    if (savedShop.owner?.id) {
      await this.invalidateUserAuthCache(savedShop.owner.id);
    }

    return savedShop;
  }

  findAll() {
    return this.shopsRepository.find({
      relations: { owner: true, users: true, subscription: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const shop = await this.shopsRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        users: { roles: true },
        products: true,
        inventoryItems: true,
        subscription: true,
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  async update(id: string, updateShopDto: UpdateShopDto) {
    const shop = await this.findOne(id);
    const previousOwnerId = shop.owner?.id;

    if (updateShopDto.slug && updateShopDto.slug !== shop.slug) {
      await this.assertSlugIsAvailable(updateShopDto.slug);
    }

    const owner = updateShopDto.ownerId
      ? await this.findUser(updateShopDto.ownerId)
      : shop.owner;

    Object.assign(shop, {
      name: updateShopDto.name ?? shop.name,
      slug: updateShopDto.slug ?? shop.slug,
      address: updateShopDto.address ?? shop.address,
      phone: updateShopDto.phone ?? shop.phone,
      isActive: updateShopDto.isActive ?? shop.isActive,
      owner,
    });

    if (owner && !shop.users?.some((user) => user.id === owner.id)) {
      shop.users = [...(shop.users ?? []), owner];
    }

    const savedShop = await this.shopsRepository.save(shop);
    await this.invalidateUserAuthCache(previousOwnerId);
    await this.invalidateUserAuthCache(savedShop.owner?.id);

    return savedShop;
  }

  async assignUsers(id: string, assignShopUsersDto: AssignShopUsersDto) {
    const shop = await this.findOne(id);
    const users = await this.usersRepository.find({
      where: { id: In(assignShopUsersDto.userIds) },
    });

    if (users.length !== assignShopUsersDto.userIds.length) {
      throw new BadRequestException('One or more users do not exist');
    }

    const existingUserIds = new Set(shop.users?.map((user) => user.id) ?? []);
    shop.users = [
      ...(shop.users ?? []),
      ...users.filter((user) => !existingUserIds.has(user.id)),
    ];

    const savedShop = await this.shopsRepository.save(shop);
    await Promise.all(
      savedShop.users?.map((user) => this.invalidateUserAuthCache(user.id)) ??
        [],
    );

    return savedShop;
  }

  async deactivate(id: string) {
    const shop = await this.findOne(id);
    shop.isActive = false;
    const savedShop = await this.shopsRepository.save(shop);
    await Promise.all(
      savedShop.users?.map((user) => this.invalidateUserAuthCache(user.id)) ??
        [],
    );

    return savedShop;
  }

  private async findUser(id: string, manager = this.dataSource.manager) {
    const user = await manager.findOne(User, { where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async assertSlugIsAvailable(
    slug: string,
    manager = this.dataSource.manager,
  ) {
    const existingShop = await manager.findOne(Shop, {
      where: { slug },
    });

    if (existingShop) {
      throw new BadRequestException('A shop with this slug already exists');
    }
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async invalidateUserAuthCache(userId?: string) {
    if (!userId) {
      return;
    }

    await this.redisCache.delete(`auth:user:${userId}`);
  }
}
