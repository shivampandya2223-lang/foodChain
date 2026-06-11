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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PermissionType } from '../common/enums/role.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Products')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Permissions(PermissionType.PRODUCT_CREATE)
  @ApiOperation({ summary: 'Create an inventory product' })
  @ApiBody({ type: CreateProductDto })
  @ApiOkResponse({ description: 'Product created with an inventory item.' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Permissions(PermissionType.PRODUCT_READ)
  @ApiOperation({ summary: 'List products' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @Permissions(PermissionType.PRODUCT_READ)
  @ApiOperation({ summary: 'Get product by id' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(PermissionType.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiBody({ type: UpdateProductDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Permissions(PermissionType.PRODUCT_DELETE)
  @ApiOperation({ summary: 'Deactivate product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.deactivate(id);
  }
}
