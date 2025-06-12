import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('user_notification_settings')
export class UserNotificationSettingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ default: true })
  generalNotification: boolean;

  @Column({ default: true })
  vibrate: boolean;

  @Column({ default: true })
  specialOffers: boolean;

  @Column({ default: true })
  promoAndDiscount: boolean;

  @Column({ default: true })
  appUpdates: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
