import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto) {
    const shop = await this.findShop(createDeviceDto.shopId);
    await this.assertDeviceKeyIsAvailable(createDeviceDto.deviceKey);

    return this.devicesRepository.save(
      this.devicesRepository.create({
        name: createDeviceDto.name,
        type: createDeviceDto.type,
        deviceKey: createDeviceDto.deviceKey,
        shop,
      }),
    );
  }

  findAll() {
    return this.devicesRepository.find({
      relations: { shop: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.findOne(id);
    await this.assertDeviceKeyIsAvailable(updateDeviceDto.deviceKey, id);

    Object.assign(device, updateDeviceDto);
    return this.devicesRepository.save(device);
  }

  private async findOne(id: string) {
    const device = await this.devicesRepository.findOne({
      where: { id },
      relations: { shop: true },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
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

  private async assertDeviceKeyIsAvailable(deviceKey?: string, id?: string) {
    if (!deviceKey) {
      return;
    }

    const existingDevice = await this.devicesRepository.findOne({
      where: {
        deviceKey,
        ...(id ? { id: Not(id) } : {}),
      },
    });

    if (existingDevice) {
      throw new BadRequestException('A device with this key already exists');
    }
  }
}
