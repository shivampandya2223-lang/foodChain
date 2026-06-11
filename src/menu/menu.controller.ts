import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PermissionType } from '../common/enums/role.enum';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuService } from './menu.service';

@Controller('menu')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Menu')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @Permissions(PermissionType.MENU_CREATE)
  @ApiOperation({ summary: 'Create menu item with recipe' })
  @ApiBody({ type: CreateMenuItemDto })
  create(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuService.create(createMenuItemDto);
  }

  @Get()
  @Permissions(PermissionType.MENU_READ)
  @ApiOperation({ summary: 'List menu items' })
  findAll() {
    return this.menuService.findAll();
  }

  @Patch(':id')
  @Permissions(PermissionType.MENU_UPDATE)
  @ApiOperation({ summary: 'Update menu item and optional recipe' })
  @ApiParam({ name: 'id', description: 'Menu item UUID' })
  @ApiBody({ type: UpdateMenuItemDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuService.update(id, updateMenuItemDto);
  }

  @Delete(':id')
  @Permissions(PermissionType.MENU_DELETE)
  @ApiOperation({ summary: 'Deactivate menu item' })
  @ApiParam({ name: 'id', description: 'Menu item UUID' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.deactivate(id);
  }
}
