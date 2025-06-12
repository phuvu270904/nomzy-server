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
import { NotificationEntity } from '../../notifications/entities/notification.entity';

export enum NotificationSentType {
  ALL_USERS = 'all_users',
  ALL_RESTAURANTS = 'all_restaurants',
  INDIVIDUAL_USER = 'individual_user',
  INDIVIDUAL_RESTAURANT = 'individual_restaurant',
}

@Entity('notification_sent')
export class NotificationSentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  notificationId: number;

  @ManyToOne(() => NotificationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notificationId' })
  notification: NotificationEntity;

  @Column({ nullable: true })
  sentToUserId: number;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'sentToUserId' })
  sentToUser: UserEntity;

  @Column({
    type: 'enum',
    enum: NotificationSentType,
  })
  sentType: NotificationSentType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
