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

@Entity('restaurant_coupons')
export class RestaurantCouponEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  restaurantId: number;

  @Column()
  couponId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: UserEntity;

  @ManyToOne(() => CouponEntity, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'couponId' })
  coupon: CouponEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
