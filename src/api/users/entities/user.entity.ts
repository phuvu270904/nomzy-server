import {
  IsEmail,
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
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { ProductEntity } from 'src/api/products/entities/product.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
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

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  address?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  city?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  country?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  avatar?: string;

  @ManyToMany(() => RoleEntity)
  @JoinTable()
  roles: RoleEntity[];

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

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
