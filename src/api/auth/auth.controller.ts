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
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { SendVerificationCodeDto } from './dto/sendVerificationCode.dto';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { UpdateFcmTokenDto } from './dto/updateFcmToken.dto';

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

  @ApiOperation({ summary: 'Login Admin' })
  @ApiBody({ type: LoginDto })
  @Public()
  @Post('login/admin')
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.adminLogin(loginDto);
  }

  @ApiOperation({ summary: 'Login User' })
  @ApiBody({ type: LoginDto })
  @Public()
  @Post('login/user')
  async userLogin(@Body() loginDto: LoginDto) {
    return this.authService.userLogin(loginDto);
  }

  @ApiOperation({ summary: 'Login Driver' })
  @ApiBody({ type: LoginDto })
  @Public()
  @Post('login/driver')
  async driverLogin(@Body() loginDto: LoginDto) {
    return this.authService.driverLogin(loginDto);
  }

  @ApiOperation({ summary: 'Login Owner' })
  @ApiBody({ type: LoginDto })
  @Public()
  @Post('login/owner')
  async ownerLogin(@Body() loginDto: LoginDto) {
    return this.authService.ownerLogin(loginDto);
  }

  @ApiOperation({ summary: 'Send email verification code' })
  @ApiBody({ type: SendVerificationCodeDto })
  @Public()
  @Post('send-verification-code')
  async sendVerificationCode(@Body() sendVerificationCodeDto: SendVerificationCodeDto) {
    return this.authService.sendVerificationCode(sendVerificationCodeDto);
  }

  @ApiOperation({ summary: 'Verify email with code' })
  @ApiBody({ type: VerifyEmailDto })
  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @ApiOperation({ summary: 'Register user account' })
  @Public()
  @Post('registerUser')
  async registerUser(@Body() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @ApiOperation({ summary: 'Register driver account' })
  @Public()
  @Post('registerDriver')
  async registerDriver(@Body() registerDto: RegisterDto) {
    return this.authService.registerDriver(registerDto);
  }

  @ApiOperation({ summary: 'Register owner account' })
  @Public()
  @Post('registerOwner')
  async registerOwner(@Body() registerDto: RegisterDto) {
    return this.authService.registerOwner(registerDto);
  }

  @ApiBearerAuth('access-token')
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user);
  }

  @Public()
  @ApiBearerAuth('access-token')
  @Post('refresh')
  @ApiBody({ type: RefreshTokenDto, description: 'Refresh token' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
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

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiBearerAuth('access-token')
  @Post('updateProfile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user, updateProfileDto);
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

  @ApiOperation({ summary: 'Update FCM token for current user' })
  @ApiBody({ type: UpdateFcmTokenDto })
  @ApiBearerAuth('access-token')
  @Post('fcm-token')
  async updateFcmToken(@Request() req, @Body() updateFcmTokenDto: UpdateFcmTokenDto) {
    return this.authService.updateFcmToken(req.user, updateFcmTokenDto.fcm_token);
  }

  @ApiOperation({ summary: 'Remove FCM token for current user' })
  @ApiBearerAuth('access-token')
  @Post('fcm-token/remove')
  async removeFcmToken(@Request() req) {
    return this.authService.removeFcmToken(req.user);
  }
}
