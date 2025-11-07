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

@Entity('feedbacks')
export class FeedbackEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column('int')
  restaurantId: number;

  @ManyToOne('UserEntity', 'feedbacks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: UserEntity;

  @Column('int')
  rating: number;

  @Column({ type: 'text', nullable: true })
  review: string;

  @Column({ default: false })
  isAnonymous: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
