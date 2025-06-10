import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('driver_reviews')
export class DriverReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column('int')
  driverId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driverId' })
  driver: UserEntity;

  @Column('int')
  rating: number;

  @Column('text')
  review: string;

  @Column({ default: false })
  isAnonymous: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
