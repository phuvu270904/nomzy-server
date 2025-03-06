import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('clear')
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user);
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
