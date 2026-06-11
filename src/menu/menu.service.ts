import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { MenuRecipeItemDto } from './dto/menu-recipe-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItem } from './entities/menu-item.entity';
import { MenuRecipeItem } from './entities/menu-recipe-item.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemsRepository: Repository<MenuItem>,
    @InjectRepository(MenuRecipeItem)
    private readonly recipeItemsRepository: Repository<MenuRecipeItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
  ) {}

  async create(createMenuItemDto: CreateMenuItemDto) {
    const shop = await this.findShop(createMenuItemDto.shopId);
    const recipeItems = await this.buildRecipeItems(
      createMenuItemDto.recipeItems,
      shop.id,
    );

    const menuItem = this.menuItemsRepository.create({
      name: createMenuItemDto.name,
      description: createMenuItemDto.description,
      price: createMenuItemDto.price,
      shop,
      recipeItems,
    });

    return this.menuItemsRepository.save(menuItem);
  }

  findAll() {
    return this.menuItemsRepository.find({
      relations: { shop: true, recipeItems: { product: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const menuItem = await this.menuItemsRepository.findOne({
      where: { id },
      relations: { shop: true, recipeItems: { product: true } },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    return menuItem;
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    const menuItem = await this.findOne(id);

    Object.assign(menuItem, {
      name: updateMenuItemDto.name ?? menuItem.name,
      description: updateMenuItemDto.description ?? menuItem.description,
      price: updateMenuItemDto.price ?? menuItem.price,
      isAvailable: updateMenuItemDto.isAvailable ?? menuItem.isAvailable,
    });

    if (updateMenuItemDto.recipeItems) {
      await this.recipeItemsRepository.delete({
        menuItem: { id: menuItem.id },
      });
      menuItem.recipeItems = await this.buildRecipeItems(
        updateMenuItemDto.recipeItems,
        menuItem.shop.id,
      );
    }

    return this.menuItemsRepository.save(menuItem);
  }

  async deactivate(id: string) {
    const menuItem = await this.findOne(id);
    menuItem.isAvailable = false;
    return this.menuItemsRepository.save(menuItem);
  }

  private async findShop(id: string) {
    const shop = await this.shopsRepository.findOne({
      where: { id, isActive: true },
    });

    if (!shop) {
      throw new NotFoundException('Active shop not found');
    }

    return shop;
  }

  private async buildRecipeItems(
    recipeItemsDto: MenuRecipeItemDto[],
    shopId: string,
  ) {
    const productIds = recipeItemsDto.map((recipeItem) => recipeItem.productId);
    const products = await this.productsRepository.find({
      where: { id: In(productIds) },
      relations: { shop: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more recipe products do not exist');
    }

    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );

    return recipeItemsDto.map((recipeItemDto) => {
      const product = productsById.get(recipeItemDto.productId);

      if (!product || product.shop.id !== shopId) {
        throw new BadRequestException(
          'Recipe products must belong to the same shop as the menu item',
        );
      }

      if (!product.isActive) {
        throw new BadRequestException(`${product.name} is inactive`);
      }

      return this.recipeItemsRepository.create({
        product,
        quantity: Number(recipeItemDto.quantity).toFixed(3),
        unit: recipeItemDto.unit ?? 'unit',
      });
    });
  }
}
