import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FaqType {
  USER = 'user',
  DRIVER = 'driver',
}

export enum FaqStatus {
  PENDING = 'pending',
  REPLIED = 'replied',
}

@Entity('faqs')
export class FaqEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  question: string;

  @Column({ type: 'text', nullable: true })
  answer: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: FaqType })
  type: FaqType;

  @Column({ type: 'enum', enum: FaqStatus, default: FaqStatus.PENDING })
  status: FaqStatus;

  @Column({ type: 'timestamp', nullable: true })
  repliedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
