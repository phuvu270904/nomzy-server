import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CouponEntity } from '../../coupons/entities/coupon.entity';

export enum CouponSentType {
  ALL_USERS = 'all_users',
  ALL_RESTAURANTS = 'all_restaurants',
  INDIVIDUAL_USER = 'individual_user',
  INDIVIDUAL_RESTAURANT = 'individual_restaurant',
}

@Entity('coupon_sent')
export class CouponSentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  couponId: number;

  @ManyToOne(() => CouponEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'couponId' })
  coupon: CouponEntity;

  @Column({ nullable: true })
  sentToUserId: number;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'sentToUserId' })
  sentToUser: UserEntity;

  @Column({
    type: 'enum',
    enum: CouponSentType,
  })
  sentType: CouponSentType;

  @Column({ default: 0 })
  claimedCount: number;

  @Column({ default: 0 })
  usedCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
