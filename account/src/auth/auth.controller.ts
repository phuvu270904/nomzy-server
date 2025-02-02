import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  async profile(@Headers('authorization') auth: string) {
    const split = auth.split(' ');
    const token = split[1];
    return this.authService.profile(token);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  async register(@Body() CreateUserDto: CreateUserDto) {
    return this.authService.register(CreateUserDto);
  }

  @Post('logout')
  async logout() {
    return 'logout';
  }

  @Post('refresh')
  async refreshToken(
    @Headers('authorization') auth: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    const split = auth.split(' ');
    const token = split[1];
    return this.authService.refresh(token, refreshToken);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword() {
    return 'forgot-password';
  }

  @Public()
  @Post('verify-email')
  async verifyEmail() {
    return 'verify-email';
  }

  @Post('change-password')
  async changePassword() {
    return 'change-password';
  }
}
