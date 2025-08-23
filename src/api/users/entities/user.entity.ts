import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductEntity } from 'src/api/products/entities/product.entity';
import { AddressEntity } from 'src/api/addresses/entities/address.entity';
import { FeedbackEntity } from 'src/api/feedbacks/entities/feedback.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  DRIVER = 'driver',
  USER = 'user',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  @IsString()
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  gender?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @MinLength(8)
  password: string;

  @Column({ type: 'varchar', length: 20 })
  @IsPhoneNumber()
  phone_number: string;

  @OneToMany(() => AddressEntity, (address) => address.user, { cascade: true })
  addresses: AddressEntity[];

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  avatar?: string;

  @Column({ type: 'enum', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  refresh_token?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  resetToken?: string;

  @OneToMany('ProductEntity', 'restaurant', { cascade: true })
  products?: ProductEntity[];

  @OneToMany('FeedbackEntity', 'restaurant', { cascade: true })
  feedbacks?: FeedbackEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
