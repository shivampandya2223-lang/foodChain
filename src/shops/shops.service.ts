import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { KafkaTopic } from '../common/enums/kafka-topic.enum';
import { OutboxService } from '../events/outbox.service';
import { User } from '../users/entities/user.entity';
import { AssignShopUsersDto } from './dto/assign-shop-users.dto';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly outboxService: OutboxService,
  ) {}

  async create(createShopDto: CreateShopDto) {
    const slug = createShopDto.slug ?? this.slugify(createShopDto.name);
    await this.assertSlugIsAvailable(slug);

    const owner = createShopDto.ownerId
      ? await this.findUser(createShopDto.ownerId)
      : undefined;

    const shop = this.shopsRepository.create({
      name: createShopDto.name,
      slug,
      address: createShopDto.address,
      phone: createShopDto.phone,
      owner,
      users: owner ? [owner] : [],
    });

    const savedShop = await this.shopsRepository.save(shop);

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
      },
    );

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

    return this.shopsRepository.save(shop);
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

    return this.shopsRepository.save(shop);
  }

  async deactivate(id: string) {
    const shop = await this.findOne(id);
    shop.isActive = false;
    return this.shopsRepository.save(shop);
  }

  private async findUser(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async assertSlugIsAvailable(slug: string) {
    const existingShop = await this.shopsRepository.findOne({
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
}
