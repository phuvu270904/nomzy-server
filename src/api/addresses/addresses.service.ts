import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressEntity } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
  ) {}

  async create(
    userId: number,
    createAddressDto: CreateAddressDto,
  ): Promise<AddressEntity> {
    const newAddress = this.addressRepository.create({
      ...createAddressDto,
      userId,
    });

    // If this is the default address, unset any other default addresses
    if (createAddressDto.isDefault) {
      await this.unsetDefaultAddresses(userId);
    }

    // If this is the first address for the user, make it default
    const addressCount = await this.addressRepository.count({
      where: { userId },
    });

    if (addressCount === 0) {
      newAddress.isDefault = true;
    }

    return this.addressRepository.save(newAddress);
  }

  async findAll(userId: number): Promise<AddressEntity[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, id: number): Promise<AddressEntity> {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return address;
  }

  async update(
    userId: number,
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressEntity> {
    const address = await this.findOne(userId, id);

    // If setting as default, unset other defaults
    if (updateAddressDto.isDefault) {
      await this.unsetDefaultAddresses(userId);
    }

    Object.assign(address, updateAddressDto);
    return this.addressRepository.save(address);
  }

  async remove(userId: number, id: number): Promise<void> {
    const address = await this.findOne(userId, id);

    // Check if this is the only address
    const addressCount = await this.addressRepository.count({
      where: { userId },
    });

    if (addressCount === 1) {
      throw new BadRequestException(
        'Cannot delete the only address. Add another address first.',
      );
    }

    await this.addressRepository.remove(address);

    // If this was the default address, set another one as default
    if (address.isDefault) {
      const newDefault = await this.addressRepository.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      if (newDefault) {
        newDefault.isDefault = true;
        await this.addressRepository.save(newDefault);
      }
    }
  }

  private async unsetDefaultAddresses(userId: number): Promise<void> {
    await this.addressRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );
  }

  async getDefaultAddress(userId: number): Promise<AddressEntity | null> {
    const defaultAddress = await this.addressRepository.findOne({
      where: { userId, isDefault: true },
    });

    if (!defaultAddress) {
      // Get the most recently created address instead
      const latestAddress = await this.addressRepository.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      if (!latestAddress) {
        return null;
      }

      return latestAddress;
    }

    return defaultAddress;
  }
}
