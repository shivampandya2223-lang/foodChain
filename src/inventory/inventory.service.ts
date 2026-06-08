import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { InventoryTransactionType } from '../common/enums/inventory-transaction-type.enum';
import { InventoryTransactionSource } from '../common/enums/inventory-transaction-source.enum';
import { User } from '../users/entities/user.entity';
import { StockMovementDto } from './dto/stock-movement.dto';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryTransaction } from './entities/inventory-transaction.entity';

@Injectable()
export class InventoryService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(InventoryItem)
    private readonly inventoryItemsRepository: Repository<InventoryItem>,
    @InjectRepository(InventoryTransaction)
    private readonly transactionsRepository: Repository<InventoryTransaction>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll() {
    return this.inventoryItemsRepository.find({
      relations: { product: true, shop: true },
      order: { createdAt: 'DESC' },
    });
  }

  findTransactions() {
    return this.transactionsRepository.find({
      relations: {
        inventoryItem: { product: true },
        shop: true,
        createdBy: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  stockIn(stockMovementDto: StockMovementDto, currentUser?: AuthenticatedUser) {
    return this.applyMovement(
      stockMovementDto,
      InventoryTransactionType.STOCK_IN,
      currentUser,
    );
  }

  stockOut(
    stockMovementDto: StockMovementDto,
    currentUser?: AuthenticatedUser,
  ) {
    return this.applyMovement(
      stockMovementDto,
      InventoryTransactionType.STOCK_OUT,
      currentUser,
    );
  }

  private async applyMovement(
    stockMovementDto: StockMovementDto,
    type:
      | InventoryTransactionType.STOCK_IN
      | InventoryTransactionType.STOCK_OUT,
    currentUser?: AuthenticatedUser,
  ) {
    const movementQuantity = Number(stockMovementDto.quantity);

    if (!Number.isFinite(movementQuantity) || movementQuantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    return this.dataSource.transaction(async (manager) => {
      const inventoryItem = await manager.findOne(InventoryItem, {
        where: { id: stockMovementDto.inventoryItemId },
        relations: { shop: true },
      });

      if (!inventoryItem) {
        throw new NotFoundException('Inventory item not found');
      }

      const quantityBefore = Number(inventoryItem.quantity);
      const quantityAfter =
        type === InventoryTransactionType.STOCK_IN
          ? quantityBefore + movementQuantity
          : quantityBefore - movementQuantity;

      if (quantityAfter < 0) {
        throw new BadRequestException('Insufficient stock');
      }

      inventoryItem.quantity = quantityAfter.toFixed(3);
      await manager.save(inventoryItem);

      const createdBy = currentUser
        ? await this.usersRepository.findOne({ where: { id: currentUser.id } })
        : undefined;

      const transaction = manager.create(InventoryTransaction, {
        type,
        quantity: movementQuantity.toFixed(3),
        quantityBefore: quantityBefore.toFixed(3),
        quantityAfter: quantityAfter.toFixed(3),
        reason: stockMovementDto.reason,
        source:
          type === InventoryTransactionType.STOCK_IN
            ? InventoryTransactionSource.PURCHASE
            : InventoryTransactionSource.MANUAL,
        shop: inventoryItem.shop,
        inventoryItem,
        createdBy: createdBy ?? undefined,
      });

      await manager.save(transaction);

      return {
        inventoryItem,
        transaction,
      };
    });
  }
}
