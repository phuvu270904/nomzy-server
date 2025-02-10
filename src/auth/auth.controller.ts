import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { UpdateUserDto } from 'src/users/dto/updateUser.dto';

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
  async logout(@Headers('authorization') auth: string) {
    const split = auth.split(' ');
    const token = split[1];
    return this.authService.logout(token);
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
  @Post('forgotPassword')
  async forgotPassword() {
    return 'forgot-password';
  }

  @Public()
  @Post('verifyEmail')
  async verifyEmail() {
    return 'verify-email';
  }

  @Post('changePassword')
  async changePassword(
    @Headers('authorization') auth: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const split = auth.split(' ');
    const token = split[1];
    return this.authService.changePassword(token, changePasswordDto);
  }

  @Post('updateProfile')
  async updateProfile(
    @Headers('authorization') auth: string,
    @Body() UpdateUserDto: UpdateUserDto,
  ) {
    const split = auth.split(' ');
    const token = split[1];
    return this.authService.updateProfile(token, UpdateUserDto);
  }
}
