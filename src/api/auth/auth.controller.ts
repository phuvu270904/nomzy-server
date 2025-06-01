import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { UpdateUserDto } from '../users/dto/updateUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Get profile' })
  @ApiBearerAuth('access-token')
  @Get('profile')
  async profile(@Request() req) {
    return this.authService.profile(req.user);
  }

  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Register user account' })
  @Public()
  @Post('register')
  async register(@Body() CreateUserDto: CreateUserDto) {
    return this.authService.register(CreateUserDto);
  }

  @ApiBearerAuth('access-token')
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user);
  }

  @ApiBearerAuth('access-token')
  @Post('refresh')
  async refreshToken(
    @Request() req,
    @Body('refreshToken') refreshToken: string,
  ) {
    return this.authService.refresh(req.user, refreshToken);
  }

  @Public()
  @Post('forgotPassword')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('resetPassword')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiBearerAuth('access-token')
  @Post('changePassword')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user, changePasswordDto);
  }

  @ApiBearerAuth('access-token')
  @Post('updateProfile')
  async updateProfile(@Request() req, @Body() UpdateUserDto: UpdateUserDto) {
    return this.authService.updateProfile(req.user, UpdateUserDto);
  }

  @Public()
  @Get('googleAuth')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }
}
