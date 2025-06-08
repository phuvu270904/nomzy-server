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

export enum UserCouponStatus {
  CLAIMED = 'claimed',
  USED = 'used',
  EXPIRED = 'expired',
}

@Entity('user_coupons')
export class UserCouponEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  couponId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => CouponEntity, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'couponId' })
  coupon: CouponEntity;

  @Column({
    type: 'enum',
    enum: UserCouponStatus,
    default: UserCouponStatus.CLAIMED,
  })
  status: UserCouponStatus;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
