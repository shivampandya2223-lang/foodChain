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
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
@ApiTags('Shops')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @Permissions(PermissionType.SHOP_CREATE)
  @ApiOperation({ summary: 'Create a shop' })
  @ApiBody({ type: CreateShopDto })
  @ApiOkResponse({ description: 'Shop created.' })
  @ApiForbiddenResponse({ description: 'Missing shop management permission.' })
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopsService.create(createShopDto);
  }

  @Get()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.OWNER)
  @ApiOperation({ summary: 'List shops' })
  @ApiOkResponse({
    description: 'Returns shops with owner/users/subscription.',
  })
  findAll() {
    return this.shopsService.findAll();
  }

  @Get(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.OWNER)
  @ApiOperation({ summary: 'Get shop details' })
  @ApiParam({ name: 'id', description: 'Shop UUID' })
  @ApiOkResponse({ description: 'Returns one shop with relations.' })
  findOne(@Param('id') id: string) {
    return this.shopsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(PermissionType.SHOP_UPDATE)
  @ApiOperation({ summary: 'Update a shop' })
  @ApiParam({ name: 'id', description: 'Shop UUID' })
  @ApiBody({ type: UpdateShopDto })
  @ApiOkResponse({ description: 'Shop updated.' })
  @ApiForbiddenResponse({ description: 'Missing shop management permission.' })
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopsService.update(id, updateShopDto);
  }

  @Patch(':id/users')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.OWNER)
  @ApiOperation({ summary: 'Assign users to a shop' })
  @ApiParam({ name: 'id', description: 'Shop UUID' })
  @ApiBody({ type: AssignShopUsersDto })
  @ApiOkResponse({ description: 'Users assigned to shop.' })
  assignUsers(
    @Param('id') id: string,
    @Body() assignShopUsersDto: AssignShopUsersDto,
  ) {
    return this.shopsService.assignUsers(id, assignShopUsersDto);
  }

  @Delete(':id')
  @Permissions(PermissionType.SHOP_DELETE)
  @ApiOperation({ summary: 'Deactivate a shop' })
  @ApiParam({ name: 'id', description: 'Shop UUID' })
  @ApiOkResponse({ description: 'Shop marked inactive.' })
  @ApiForbiddenResponse({
    description: 'Only shop.delete can deactivate.',
  })
  deactivate(@Param('id') id: string) {
    return this.shopsService.deactivate(id);
  }
}
