import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  async profile() {
    return 'profile';
  }

  @Post('login')
  async login() {
    return 'login';
  }

  @Post('register')
  async register(@Body() CreateUserDto: CreateUserDto) {
    return this.authService.register(CreateUserDto);
  }

  @Post('logout')
  async logout() {
    return 'logout';
  }

  @Post('refresh')
  async refresh() {
    return 'refresh';
  }

  @Post('forgot-password')
  async forgotPassword() {
    return 'forgot-password';
  }

  @Post('verify-email')
  async verifyEmail() {
    return 'verify-email';
  }

  @Post('change-password')
  async changePassword() {
    return 'change-password';
  }
}
