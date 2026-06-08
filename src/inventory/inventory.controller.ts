import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PermissionType } from '../common/enums/role.enum';
import { StockMovementDto } from './dto/stock-movement.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('stock-in')
  @Permissions(PermissionType.INVENTORY_STOCK_IN)
  @ApiOperation({ summary: 'Add stock to an inventory item' })
  @ApiBody({ type: StockMovementDto })
  stockIn(
    @Body() stockMovementDto: StockMovementDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.inventoryService.stockIn(stockMovementDto, currentUser);
  }

  @Post('stock-out')
  @Permissions(PermissionType.INVENTORY_STOCK_OUT)
  @ApiOperation({ summary: 'Remove stock from an inventory item' })
  @ApiBody({ type: StockMovementDto })
  stockOut(
    @Body() stockMovementDto: StockMovementDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.inventoryService.stockOut(stockMovementDto, currentUser);
  }

  @Get()
  @Permissions(PermissionType.INVENTORY_READ)
  @ApiOperation({ summary: 'List inventory items' })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('transactions')
  @Permissions(PermissionType.INVENTORY_TRANSACTION_READ)
  @ApiOperation({ summary: 'List inventory transaction history' })
  findTransactions() {
    return this.inventoryService.findTransactions();
  }
}
