import { Body, Controller, Delete, Get, Headers, Post } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('getCart')
  getCart(@Headers('authorization') auth: string) {
    const split = auth.split(' ');
    const token = split[1];
    return this.cartService.getCart(token);
  }

  @Post('clear')
  clearCart(@Headers('authorization') auth: string) {
    const split = auth.split(' ');
    const token = split[1];
    return this.cartService.clearCart(token);
  }

  @Post('add')
  addToCart(@Body() body: any) {
    return this.cartService.addToCart(body);
  }

  @Delete('delete')
  removeFromCart(@Body('productId') productId: string) {
    return this.cartService.removeFromCart(productId);
  }

  @Delete('deleteMany')
  removeManyFromCart(@Body() body: any) {
    return this.cartService.removeManyFromCart(body);
  }
}
