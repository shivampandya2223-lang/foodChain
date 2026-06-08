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
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PermissionType } from '../common/enums/role.enum';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesService } from './devices.service';

@Controller('devices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Devices')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @Permissions(PermissionType.DEVICE_CREATE)
  @ApiOperation({ summary: 'Register a shop device' })
  @ApiBody({ type: CreateDeviceDto })
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  @Permissions(PermissionType.DEVICE_READ)
  @ApiOperation({ summary: 'List devices' })
  findAll() {
    return this.devicesService.findAll();
  }

  @Patch(':id')
  @Permissions(PermissionType.DEVICE_UPDATE)
  @ApiOperation({ summary: 'Update a device' })
  @ApiParam({ name: 'id', description: 'Device UUID' })
  @ApiBody({ type: UpdateDeviceDto })
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(id, updateDeviceDto);
  }
}
