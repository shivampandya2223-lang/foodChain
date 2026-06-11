import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { InventoryTransactionSource } from '../common/enums/inventory-transaction-source.enum';
import { InventoryTransactionType } from '../common/enums/inventory-transaction-type.enum';
import { KafkaTopic } from '../common/enums/kafka-topic.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { OutboxService } from '../events/outbox.service';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { Shop } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

type IngredientRequirement = {
  inventoryItem: InventoryItem;
  quantity: number;
};

@Injectable()
export class OrdersService {
  private readonly allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING],
    [OrderStatus.PREPARING]: [OrderStatus.READY],
    [OrderStatus.READY]: [OrderStatus.COMPLETED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
    @InjectRepository(MenuItem)
    private readonly menuItemsRepository: Repository<MenuItem>,
    private readonly outboxService: OutboxService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    currentUser?: AuthenticatedUser,
  ) {
    const createdOrder = await this.dataSource.transaction(async (manager) => {
      const shop = await this.findShop(createOrderDto.shopId);
      const menuItems = await this.menuItemsRepository.find({
        where: { id: In(createOrderDto.items.map((item) => item.menuItemId)) },
        relations: {
          shop: true,
          recipeItems: { product: { inventoryItem: true } },
        },
      });

      if (menuItems.length !== createOrderDto.items.length) {
        throw new BadRequestException('One or more menu items do not exist');
      }

      const menuItemsById = new Map(
        menuItems.map((menuItem) => [menuItem.id, menuItem]),
      );
      const requirements = new Map<string, IngredientRequirement>();
      let totalAmount = 0;

      const orderItems = createOrderDto.items.map((itemDto) => {
        const menuItem = menuItemsById.get(itemDto.menuItemId);

        if (!menuItem || menuItem.shop.id !== shop.id) {
          throw new BadRequestException(
            'Menu items must belong to the selected shop',
          );
        }

        if (!menuItem.isAvailable) {
          throw new BadRequestException(`${menuItem.name} is not available`);
        }

        const inactiveRecipeItem = menuItem.recipeItems?.find(
          (recipeItem) => !recipeItem.product.isActive,
        );

        if (inactiveRecipeItem) {
          throw new BadRequestException(
            `${inactiveRecipeItem.product.name} is inactive`,
          );
        }

        const unitPrice = Number(menuItem.price);
        const lineTotal = unitPrice * itemDto.quantity;
        totalAmount += lineTotal;

        for (const recipeItem of menuItem.recipeItems ?? []) {
          const inventoryItem = recipeItem.product.inventoryItem;

          if (!inventoryItem) {
            throw new BadRequestException(
              `${recipeItem.product.name} is missing inventory`,
            );
          }

          const requiredQuantity =
            Number(recipeItem.quantity) * itemDto.quantity;
          const existingRequirement = requirements.get(inventoryItem.id);

          requirements.set(inventoryItem.id, {
            inventoryItem,
            quantity: (existingRequirement?.quantity ?? 0) + requiredQuantity,
          });
        }

        return manager.create(OrderItem, {
          menuItem,
          quantity: itemDto.quantity,
          unitPrice: unitPrice.toFixed(2),
          lineTotal: lineTotal.toFixed(2),
        });
      });

      const employee = currentUser
        ? await manager.findOne(User, { where: { id: currentUser.id } })
        : undefined;

      const order = await manager.save(
        manager.create(Order, {
          orderNumber: this.createOrderNumber(),
          status: OrderStatus.PENDING,
          customerName: createOrderDto.customerName,
          customerPhone: createOrderDto.customerPhone,
          totalAmount: totalAmount.toFixed(2),
          shop,
          employee: employee ?? undefined,
          items: orderItems,
        }),
      );

      for (const requirement of requirements.values()) {
        const inventoryItem = await manager.findOne(InventoryItem, {
          where: { id: requirement.inventoryItem.id },
          relations: { product: true, shop: true },
          lock: { mode: 'pessimistic_write' },
        });

        if (!inventoryItem) {
          throw new NotFoundException('Inventory item not found');
        }

        const quantityBefore = Number(inventoryItem.quantity);
        const quantityAfter = quantityBefore - requirement.quantity;

        if (quantityAfter < 0) {
          throw new BadRequestException(
            `Insufficient stock for ${inventoryItem.product.name}`,
          );
        }

        inventoryItem.quantity = quantityAfter.toFixed(3);
        await manager.save(inventoryItem);

        await manager.save(
          manager.create(InventoryTransaction, {
            type: InventoryTransactionType.STOCK_OUT,
            source: InventoryTransactionSource.ORDER,
            referenceId: order.id,
            quantity: requirement.quantity.toFixed(3),
            quantityBefore: quantityBefore.toFixed(3),
            quantityAfter: quantityAfter.toFixed(3),
            reason: `Order ${order.orderNumber}`,
            shop,
            inventoryItem,
            createdBy: employee ?? undefined,
          }),
        );
      }

      const savedOrder = await manager.findOne(Order, {
        where: { id: order.id },
        relations: { shop: true, employee: true, items: { menuItem: true } },
      });

      if (savedOrder) {
        await this.outboxService.enqueue(
          KafkaTopic.ORDER_CREATED,
          {
            orderId: savedOrder.id,
            orderNumber: savedOrder.orderNumber,
            shopId: savedOrder.shop.id,
            status: savedOrder.status,
            totalAmount: savedOrder.totalAmount,
            itemCount: savedOrder.items?.length ?? 0,
          },
          {
            aggregateId: savedOrder.id,
            aggregateType: 'Order',
            partitionKey: savedOrder.shop.id,
            manager,
          },
        );
      }

      return savedOrder;
    });

    return createdOrder;
  }

  findAll() {
    return this.ordersRepository.find({
      relations: { shop: true, employee: true, items: { menuItem: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: { shop: true, employee: true, items: { menuItem: true } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    const previousStatus = order.status;

    if (
      !this.allowedTransitions[order.status].includes(
        updateOrderStatusDto.status,
      )
    ) {
      throw new BadRequestException(
        `Cannot move order from ${order.status} to ${updateOrderStatusDto.status}`,
      );
    }

    order.status = updateOrderStatusDto.status;
    const updatedOrder = await this.ordersRepository.save(order);

    await this.outboxService.enqueue(
      KafkaTopic.ORDER_UPDATED,
      {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        shopId: updatedOrder.shop.id,
        previousStatus,
        status: updatedOrder.status,
      },
      {
        aggregateId: updatedOrder.id,
        aggregateType: 'Order',
        partitionKey: updatedOrder.shop.id,
      },
    );

    return updatedOrder;
  }

  async cancel(id: string) {
    const { cancelledOrder, previousStatus } = await this.dataSource.transaction(
      async (manager) => {
        const order = await manager.findOne(Order, {
          where: { id },
          relations: { shop: true, employee: true, items: { menuItem: true } },
          lock: { mode: 'pessimistic_write' },
        });

        if (!order) {
          throw new NotFoundException('Order not found');
        }

        const previousStatus = order.status;

        if (order.status !== OrderStatus.PENDING) {
          throw new BadRequestException('Only pending orders can be cancelled');
        }

        const orderTransactions = await manager.find(InventoryTransaction, {
          where: {
            source: InventoryTransactionSource.ORDER,
            referenceId: order.id,
            type: InventoryTransactionType.STOCK_OUT,
          },
          relations: { inventoryItem: { product: true }, shop: true },
        });

        for (const orderTransaction of orderTransactions) {
          const inventoryItem = await manager.findOne(InventoryItem, {
            where: { id: orderTransaction.inventoryItem.id },
            relations: { product: true, shop: true },
            lock: { mode: 'pessimistic_write' },
          });

          if (!inventoryItem) {
            throw new NotFoundException('Inventory item not found');
          }

          const restoredQuantity = Number(orderTransaction.quantity);
          const quantityBefore = Number(inventoryItem.quantity);
          const quantityAfter = quantityBefore + restoredQuantity;

          inventoryItem.quantity = quantityAfter.toFixed(3);
          await manager.save(inventoryItem);

          await manager.save(
            manager.create(InventoryTransaction, {
              type: InventoryTransactionType.STOCK_IN,
              source: InventoryTransactionSource.ORDER,
              referenceId: order.id,
              quantity: restoredQuantity.toFixed(3),
              quantityBefore: quantityBefore.toFixed(3),
              quantityAfter: quantityAfter.toFixed(3),
              reason: `Cancelled order ${order.orderNumber}`,
              shop: orderTransaction.shop,
              inventoryItem,
              createdBy: order.employee,
            }),
          );
        }

        order.status = OrderStatus.CANCELLED;
        const cancelledOrder = await manager.save(order);

        await this.outboxService.enqueue(
          KafkaTopic.ORDER_CANCELLED,
          {
            orderId: cancelledOrder.id,
            orderNumber: cancelledOrder.orderNumber,
            shopId: cancelledOrder.shop.id,
            previousStatus,
            status: OrderStatus.CANCELLED,
          },
          {
            aggregateId: cancelledOrder.id,
            aggregateType: 'Order',
            partitionKey: cancelledOrder.shop.id,
            manager,
          },
        );

        return { cancelledOrder, previousStatus };
      },
    );

    return cancelledOrder;
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

  private createOrderNumber() {
    return `ORD-${randomUUID()}`;
  }
}
