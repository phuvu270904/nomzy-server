import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserVehicleEntity } from './entities/user-vehicle.entity';
import { CreateUserVehicleDto } from './dto/create-user-vehicle.dto';
import { UpdateUserVehicleDto } from './dto/update-user-vehicle.dto';

@Injectable()
export class UserVehiclesService {
  constructor(
    @InjectRepository(UserVehicleEntity)
    private readonly userVehicleRepository: Repository<UserVehicleEntity>,
  ) {}

  async create(
    userId: number,
    createUserVehicleDto: CreateUserVehicleDto,
  ): Promise<UserVehicleEntity> {
    const newVehicle = this.userVehicleRepository.create({
      ...createUserVehicleDto,
      userId,
    });

    return this.userVehicleRepository.save(newVehicle);
  }

  async findAll(userId: number): Promise<UserVehicleEntity[]> {
    return this.userVehicleRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, id: number): Promise<UserVehicleEntity> {
    const vehicle = await this.userVehicleRepository.findOne({
      where: { id, userId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  async update(
    userId: number,
    id: number,
    updateUserVehicleDto: UpdateUserVehicleDto,
  ): Promise<UserVehicleEntity> {
    const vehicle = await this.findOne(userId, id);

    Object.assign(vehicle, updateUserVehicleDto);
    return this.userVehicleRepository.save(vehicle);
  }

  async remove(userId: number, id: number): Promise<void> {
    const vehicle = await this.findOne(userId, id);
    await this.userVehicleRepository.remove(vehicle);
  }
}
