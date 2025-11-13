import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum VehicleType {
  MOTORCYCLE = 'Motorcycle',
  CAR = 'Car',
}

@Entity('user_vehicles')
export class UserVehicleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'enum', enum: VehicleType })
  @IsEnum(VehicleType)
  @IsNotEmpty()
  type: VehicleType;

  @Column({ type: 'varchar', length: 50 })
  @IsString()
  @IsNotEmpty()
  regNumber: string;

  @Column({ type: 'varchar', length: 50 })
  @IsString()
  @IsNotEmpty()
  license: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
