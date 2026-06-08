import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Shop } from '../shops/entities/shop.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
    @InjectRepository(InventoryItem)
    private readonly inventoryItemsRepository: Repository<InventoryItem>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const shop = await this.findShop(createProductDto.shopId);
    await this.assertSkuIsAvailable(createProductDto.sku, shop.id);

    const product = await this.productsRepository.save(
      this.productsRepository.create({
        name: createProductDto.name,
        sku: createProductDto.sku,
        description: createProductDto.description,
        price: createProductDto.price,
        shop,
      }),
    );

    const inventoryItem = this.inventoryItemsRepository.create({
      product,
      shop,
      quantity: '0',
      reorderLevel: '0',
    });
    await this.inventoryItemsRepository.save(inventoryItem);

    return this.findOne(product.id);
  }

  findAll() {
    return this.productsRepository.find({
      relations: { shop: true, inventoryItem: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { shop: true, inventoryItem: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      await this.assertSkuIsAvailable(updateProductDto.sku, product.shop.id);
    }

    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async deactivate(id: string) {
    const product = await this.findOne(id);
    product.isActive = false;
    return this.productsRepository.save(product);
  }

  private async findShop(id: string) {
    const shop = await this.shopsRepository.findOne({ where: { id } });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  private async assertSkuIsAvailable(sku: string, shopId: string) {
    const existingProduct = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.shop', 'shop')
      .where('product.sku = :sku', { sku })
      .andWhere('shop.id = :shopId', { shopId })
      .getOne();

    if (existingProduct) {
      throw new BadRequestException('A product with this SKU already exists');
    }
  }
}
