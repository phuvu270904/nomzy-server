import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { RoleEntity } from './entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserRoleEntity, RoleEntity])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
