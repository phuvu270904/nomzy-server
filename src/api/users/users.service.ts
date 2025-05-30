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
    return this.userRepository.findOne({ where: { email } });
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

    const roles = await this.roleRepository.find({
      where: { name: In(user.roles) },
    });

    if (!roles) {
      throw new Error('Default user role not found');
    }

    const newUser = {
      ...user,
      password: hashedPassword,
      roles,
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
}
