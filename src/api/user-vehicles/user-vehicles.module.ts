import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserVehiclesService } from './user-vehicles.service';
import { UserVehiclesController } from './user-vehicles.controller';
import { UserVehicleEntity } from './entities/user-vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserVehicleEntity])],
  controllers: [UserVehiclesController],
  providers: [UserVehiclesService],
  exports: [UserVehiclesService],
})
export class UserVehiclesModule {}
