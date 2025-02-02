import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  async profile(@Headers('authorization') auth: string) {
    const split = auth.split(' ');
    const token = split[1];
    return this.authService.profile(token);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() CreateUserDto: CreateUserDto) {
    return this.authService.register(CreateUserDto);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout() {
    return 'logout';
  }

  @UseGuards(AuthGuard)
  @Post('refresh')
  async refreshToken(
    @Headers('authorization') auth: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    const split = auth.split(' ');
    const token = split[1];
    return this.authService.refresh(token, refreshToken);
  }

  @Post('forgot-password')
  async forgotPassword() {
    return 'forgot-password';
  }

  @Post('verify-email')
  async verifyEmail() {
    return 'verify-email';
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword() {
    return 'change-password';
  }
}
