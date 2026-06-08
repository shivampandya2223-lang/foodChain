import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PermissionType } from '../common/enums/role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Orders')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Permissions(PermissionType.ORDER_CREATE)
  @ApiOperation({ summary: 'Create an order and deduct recipe inventory' })
  @ApiBody({ type: CreateOrderDto })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.ordersService.create(createOrderDto, currentUser);
  }

  @Get()
  @Permissions(PermissionType.ORDER_READ)
  @ApiOperation({ summary: 'List orders' })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @Permissions(PermissionType.ORDER_READ)
  @ApiOperation({ summary: 'Get order by id' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @Permissions(PermissionType.ORDER_UPDATE_STATUS)
  @ApiOperation({ summary: 'Move order through kitchen status flow' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiBody({ type: UpdateOrderStatusDto })
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }

  @Patch(':id/cancel')
  @Permissions(PermissionType.ORDER_CANCEL)
  @ApiOperation({ summary: 'Cancel a pending order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }
}
