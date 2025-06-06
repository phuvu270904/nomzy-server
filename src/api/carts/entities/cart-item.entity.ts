import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartEntity } from './cart.entity';
import { ProductEntity } from '../../products/entities/product.entity';

@Entity('cart_items')
export class CartItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cartId: number;

  @Column()
  productId: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => CartEntity, (cart) => cart.cartItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cartId' })
  cart: CartEntity;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
