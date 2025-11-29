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
import { 
  ApiTags, 
  ApiOperation, 
  ApiBody, 
  ApiBearerAuth, 
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
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

  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieve the profile information of the currently authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe@gmail.com',
        name: 'John Doe',
        phone_number: '0949394939',
        role: 'user',
        avatar: 'https://example.com/avatar.jpg',
        gender: 'male',
        isFullyRegistered: true,
        created_at: '2025-01-15T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiBearerAuth('access-token')
  @Get('profile')
  async profile(@Request() req) {
    return this.authService.profile(req.user);
  }

  @ApiOperation({ 
    summary: 'Admin login',
    description: 'Authenticate an admin user and receive access and refresh tokens'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'admin@gmail.com',
          name: 'Admin User',
          role: 'admin',
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials'
  })
  @Public()
  @Post('login/admin')
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.adminLogin(loginDto);
  }

  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate a regular user and receive access and refresh tokens'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@gmail.com',
          name: 'John Doe',
          role: 'user',
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials'
  })
  @Public()
  @Post('login/user')
  async userLogin(@Body() loginDto: LoginDto) {
    return this.authService.userLogin(loginDto);
  }

  @ApiOperation({ 
    summary: 'Driver login',
    description: 'Authenticate a driver and receive access and refresh tokens'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'driver@gmail.com',
          name: 'Driver Name',
          role: 'driver',
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials'
  })
  @Public()
  @Post('login/driver')
  async driverLogin(@Body() loginDto: LoginDto) {
    return this.authService.driverLogin(loginDto);
  }

  @ApiOperation({ 
    summary: 'Restaurant owner login',
    description: 'Authenticate a restaurant owner and receive access and refresh tokens'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'owner@gmail.com',
          name: 'Restaurant Owner',
          role: 'owner',
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials'
  })
  @Public()
  @Post('login/owner')
  async ownerLogin(@Body() loginDto: LoginDto) {
    return this.authService.ownerLogin(loginDto);
  }

  @ApiOperation({ 
    summary: 'Send email verification code',
    description: 'Send a 6-digit verification code to the provided email address for account verification'
  })
  @ApiBody({ type: SendVerificationCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
    schema: {
      example: {
        message: 'Verification code sent to email successfully',
        email: 'john.doe@gmail.com'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email or email already exists'
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - Rate limit exceeded'
  })
  @Public()
  @Post('send-verification-code')
  async sendVerificationCode(@Body() sendVerificationCodeDto: SendVerificationCodeDto) {
    return this.authService.sendVerificationCode(sendVerificationCodeDto);
  }

  @ApiOperation({ 
    summary: 'Verify email with code',
    description: 'Verify an email address using the 6-digit code sent to the email'
  })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: {
      example: {
        message: 'Email verified successfully',
        verified: true
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification code'
  })
  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @ApiOperation({ 
    summary: 'Register user account',
    description: 'Create a new user account with verified email. Email must be verified before registration.'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User account created successfully',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'john.doe@gmail.com',
          name: 'John',
          phone_number: '0949394939',
          role: 'user',
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Email not verified or already exists'
  })
  @Public()
  @Post('registerUser')
  async registerUser(@Body() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @ApiOperation({ 
    summary: 'Register driver account',
    description: 'Create a new driver account with verified email. Email must be verified before registration.'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Driver account created successfully',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'driver@gmail.com',
          name: 'Driver Name',
          phone_number: '0949394939',
          role: 'driver',
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Email not verified or already exists'
  })
  @Public()
  @Post('registerDriver')
  async registerDriver(@Body() registerDto: RegisterDto) {
    return this.authService.registerDriver(registerDto);
  }

  @ApiOperation({ 
    summary: 'Register restaurant owner account',
    description: 'Create a new restaurant owner account with verified email. Email must be verified before registration.'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Owner account created successfully',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'owner@gmail.com',
          name: 'Restaurant Owner',
          phone_number: '0949394939',
          role: 'owner',
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Email not verified or already exists'
  })
  @Public()
  @Post('registerOwner')
  async registerOwner(@Body() registerDto: RegisterDto) {
    return this.authService.registerOwner(registerDto);
  }

  @ApiOperation({ 
    summary: 'Logout current user',
    description: 'Invalidate the current user session and tokens'
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: {
        message: 'Logout successful'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiBearerAuth('access-token')
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user);
  }

  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Generate a new access token using a valid refresh token'
  })
  @ApiBody({ type: RefreshTokenDto, description: 'Refresh token' })
  @ApiResponse({
    status: 200,
    description: 'New access token generated successfully',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token'
  })
  @Public()
  @ApiBearerAuth('access-token')
  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Send a password reset link to the provided email address'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@gmail.com',
          description: 'Email address to send reset link'
        }
      },
      required: ['email']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
    schema: {
      example: {
        message: 'Password reset link sent to email'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Email not found'
  })
  @Public()
  @Post('forgotPassword')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @ApiOperation({ 
    summary: 'Reset password',
    description: 'Reset user password using the token received via email'
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      example: {
        message: 'Password reset successfully'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token'
  })
  @Public()
  @Post('resetPassword')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiOperation({ 
    summary: 'Change password',
    description: 'Change password for the currently authenticated user'
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      example: {
        message: 'Password changed successfully'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid old password'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiBearerAuth('access-token')
  @Post('changePassword')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user, changePasswordDto);
  }

  @ApiOperation({ 
    summary: 'Update current user profile',
    description: 'Update profile information for the currently authenticated user'
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe@gmail.com',
        name: 'John Doe',
        phone_number: '+84938123456',
        gender: 'male',
        avatar: 'https://example.com/avatar.jpg',
        isFullyRegistered: true,
        updated_at: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiBearerAuth('access-token')
  @Post('updateProfile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user, updateProfileDto);
  }

  @ApiOperation({ 
    summary: 'Google OAuth authentication',
    description: 'Initiate Google OAuth authentication flow. Redirects to Google login page.'
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google OAuth page'
  })
  @Public()
  @Get('googleAuth')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @ApiOperation({ 
    summary: 'Google OAuth callback',
    description: 'Handle Google OAuth callback and authenticate user'
  })
  @ApiResponse({
    status: 200,
    description: 'Google authentication successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@gmail.com',
          name: 'Google User',
          avatar: 'https://lh3.googleusercontent.com/...',
          role: 'user',
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Google authentication failed'
  })
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }

  @ApiOperation({ 
    summary: 'Update FCM token for push notifications',
    description: 'Register or update the Firebase Cloud Messaging (FCM) token for the current user to receive push notifications'
  })
  @ApiBody({ type: UpdateFcmTokenDto })
  @ApiResponse({
    status: 200,
    description: 'FCM token updated successfully',
    schema: {
      example: {
        message: 'FCM token updated successfully',
        fcm_token: 'fYdD...'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid FCM token'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiBearerAuth('access-token')
  @Post('fcm-token')
  async updateFcmToken(@Request() req, @Body() updateFcmTokenDto: UpdateFcmTokenDto) {
    return this.authService.updateFcmToken(req.user, updateFcmTokenDto.fcm_token);
  }

  @ApiOperation({ 
    summary: 'Remove FCM token',
    description: 'Remove the Firebase Cloud Messaging (FCM) token for the current user. User will stop receiving push notifications.'
  })
  @ApiResponse({
    status: 200,
    description: 'FCM token removed successfully',
    schema: {
      example: {
        message: 'FCM token removed successfully'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiBearerAuth('access-token')
  @Post('fcm-token/remove')
  async removeFcmToken(@Request() req) {
    return this.authService.removeFcmToken(req.user);
  }
}
