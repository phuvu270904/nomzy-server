import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { UpdateUserDto } from '../users/dto/updateUser.dto';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async profile(user: any) {
    const userMatched = await this.usersService.findWithRoles(user.id);
    if (!userMatched) {
      throw new NotFoundException({ status: 404, message: 'User not found' });
    }
    const { password, ...result } = userMatched;

    return {
      jwt: user,
      user: result,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException({ status: 404, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException({
        status: 401,
        message: 'Incorrect email or password',
      });
    }

    const roleName = user.roles.map((role) => role.name);

    const payload = { id: user.id, email: user.email, roles: roleName };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      status: 200,
      message: 'Login successful',
      jwt: accessToken,
      refresh: refreshToken,
    };
  }

  async registerUser(registerDto: RegisterDto) {
    const newUserRole = {
      ...registerDto,
      role: 'user',
    };
    return this.usersService.create(newUserRole);
  }

  async registerDriver(registerDto: RegisterDto) {
    const newUserRole = {
      ...registerDto,
      role: 'driver',
    };
    return this.usersService.create(newUserRole);
  }

  async registerOwner(registerDto: RegisterDto) {
    const newUserRole = {
      ...registerDto,
      role: 'owner',
    };
    return this.usersService.create(newUserRole);
  }

  async logout(user: any) {
    try {
      const userMatched = await this.usersService.findOne(user.id);
      if (!userMatched) {
        throw new NotFoundException('User not found');
      }

      await this.usersService.updateRefreshToken(userMatched.id, undefined);
      return {
        status: 200,
        message: 'Logout successful',
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Logout failed');
    }
  }

  async refresh(user: any, refreshToken: string) {
    try {
      const userMatched = await this.usersService.findOne(user.id);
      if (!refreshToken) {
        throw new UnauthorizedException('Cannot find refresh token.');
      }

      const decodedRefreshToken = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
        },
      );

      if (!decodedRefreshToken) {
        throw new UnauthorizedException('Refresh token is invalid.');
      }

      if (refreshToken !== userMatched?.refresh_token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const dataForAccessToken = {
        id: userMatched.id,
        email: userMatched.email,
      };

      const newAccessToken = this.jwtService.sign(dataForAccessToken, {
        secret: process.env.JWT_SECRET,
        expiresIn: '30s',
      });

      if (!newAccessToken) {
        throw new UnauthorizedException('Error creating access token');
      }

      return {
        jwt: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Token refresh failed');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new NotFoundException('User not found');

    const payload = { id: user.id, email: user.email };

    // Generate a token with expiry
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    await this.usersService.updateResetToken(user.id, token);

    // Send email
    await this.sendResetEmail(user.email, token);

    return { message: 'Password reset link sent to email' };
  }

  private async sendResetEmail(email: string, token: string) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.MAILER_CLIENT_ID,
      process.env.MAILER_CLIENT_SECRET,
      process.env.MAILER_REDIRECT_URI,
    );
    oAuth2Client.setCredentials({
      refresh_token: process.env.MAILER_REFRESH_TOKEN,
    });
    const accessToken = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.MAILER_USER,
        clientId: process.env.MAILER_CLIENT_ID,
        clientSecret: process.env.MAILER_CLIENT_SECRET,
        refreshToken: process.env.MAILER_REFRESH_TOKEN,
        accessToken: accessToken.token as string,
      },
    });

    const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Support" ${process.env.MAILER_USER}`,
      to: email,
      subject: 'Password Reset Request',
      text: `Click the following link to reset your password: ${resetUrl}`,
    });
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const payload = await this.jwtService.verifyAsync(
        resetPasswordDto.token,
        { secret: process.env.JWT_SECRET },
      );
      const user = await this.usersService.findOne(payload.id);

      if (!user) throw new NotFoundException('User not found');

      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
      await this.usersService.updatePassword(user.id, hashedPassword);

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async changePassword(user: any, changePasswordDto: ChangePasswordDto) {
    try {
      const userMatched = await this.usersService.findOne(user.id);

      const isMatch = await bcrypt.compare(
        changePasswordDto.oldPassword,
        userMatched?.password,
      );
      if (!isMatch) {
        throw new UnauthorizedException('Incorrect old password');
      }

      const newPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

      await this.usersService.updatePassword(user.id, newPassword);

      return {
        status: 200,
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw new UnauthorizedException(
        error.message || 'Password change failed',
      );
    }
  }

  async updateProfile(user: any, updateUserDto: UpdateUserDto) {
    try {
      const userMatched = await this.usersService.findOne(user.id);

      if (!userMatched) {
        throw new NotFoundException('User not found');
      }

      await this.usersService.update(user.id, updateUserDto);

      return {
        status: 200,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Profile update failed');
    }
  }

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }
    return {
      message: 'User information from google',
      user: req.user,
    };
  }
}
