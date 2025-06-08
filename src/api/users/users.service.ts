import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async findAll(): Promise<any[]> {
    const user = await this.userRepository.find();
    return user.map((user) => {
      const { password, ...result } = user;
      return result;
    });
  }

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async findOne(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findWithRoles(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(user: CreateUserDto): Promise<CreateUserDto> {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const userRoleRegistered = await this.roleRepository.find({
      where: {
        name: user.role,
      },
    });

    const newUser = {
      ...user,
      password: hashedPassword,
      roles: userRoleRegistered,
    };

    return this.userRepository.save(newUser);
  }

  async update(id: number, user: UpdateUserDto): Promise<UpdateUserDto | null> {
    await this.userRepository.update(id, user);
    return this.userRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async updateResetToken(
    id: number,
    resetToken: string,
  ): Promise<UpdateUserDto | null> {
    await this.userRepository.update(id, { resetToken });
    return this.userRepository.findOne({ where: { id } });
  }

  async updatePassword(
    id: number,
    hashedPassword: string,
  ): Promise<UpdateUserDto | null> {
    await this.userRepository.update(id, { password: hashedPassword });
    return this.userRepository.findOne({ where: { id } });
  }

  async updateRefreshToken(
    id: number,
    refreshToken: string | undefined,
  ): Promise<UpdateUserDto | null> {
    await this.userRepository.update(id, { refresh_token: refreshToken });
    return this.userRepository.findOne({ where: { id } });
  }

  async findAllUsers(): Promise<UserEntity[]> {
    const allUsers = await this.userRepository.find({
      relations: ['roles'],
    });

    // Filter to only include regular users (not owners/restaurants)
    return allUsers.filter((user) =>
      user.roles.every((role) => role.name !== 'owner'),
    );
  }

  async findAllRestaurants(): Promise<UserEntity[]> {
    const allUsers = await this.userRepository.find({
      relations: ['roles'],
    });

    // Filter to only include restaurants (users with owner role)
    return allUsers.filter((user) =>
      user.roles.some((role) => role.name === 'owner'),
    );
  }
}
