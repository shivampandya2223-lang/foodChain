import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionType, RoleType } from '../common/enums/role.enum';
import { AssignShopUsersDto } from './dto/assign-shop-users.dto';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopsService } from './shops.service';

@Controller('shops')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @Permissions(
    PermissionType.MANAGE_ALL_SHOPS,
    PermissionType.MANAGE_MULTIPLE_SHOPS,
  )
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopsService.create(createShopDto);
  }

  @Get()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.OWNER)
  findAll() {
    return this.shopsService.findAll();
  }

  @Get(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.OWNER)
  findOne(@Param('id') id: string) {
    return this.shopsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(
    PermissionType.MANAGE_ALL_SHOPS,
    PermissionType.MANAGE_MULTIPLE_SHOPS,
  )
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopsService.update(id, updateShopDto);
  }

  @Patch(':id/users')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.OWNER)
  assignUsers(
    @Param('id') id: string,
    @Body() assignShopUsersDto: AssignShopUsersDto,
  ) {
    return this.shopsService.assignUsers(id, assignShopUsersDto);
  }

  @Delete(':id')
  @Permissions(PermissionType.MANAGE_ALL_SHOPS)
  deactivate(@Param('id') id: string) {
    return this.shopsService.deactivate(id);
  }
}
