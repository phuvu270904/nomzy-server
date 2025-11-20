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
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  image: string;

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
