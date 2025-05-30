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
} from 'typeorm';
import { RoleEntity } from './role.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  @IsString()
  first_name: string;

  @Column({ length: 50 })
  @IsString()
  last_name: string;

  @Column()
  @IsOptional()
  gender?: Gender;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  @MinLength(8)
  password: string;

  @Column()
  @IsPhoneNumber()
  phone_number: string;

  @Column()
  @IsOptional()
  address?: string;

  @Column()
  @IsOptional()
  city?: string;

  @Column()
  @IsOptional()
  country?: string;

  @Column()
  @IsOptional()
  avatar?: string;

  @ManyToMany(() => RoleEntity)
  @JoinTable()
  roles: RoleEntity[];

  @Column()
  @IsOptional()
  @IsString()
  refresh_token?: string;

  @Column()
  @IsOptional()
  @IsString()
  resetToken?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
