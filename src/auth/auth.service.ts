import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { UpdateUserDto } from 'src/users/dto/updateUser.dto';
import { Helper } from 'src/helper/helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly helper: Helper,
  ) {}

  async profile(auth: string) {
    const payload = this.jwtService.verify(auth, {
      secret: process.env.JWT_SECRET,
    });

    const user = await this.usersService.findOne(payload.id);
    if (!user) {
      throw new NotFoundException({ status: 404, message: 'User not found' });
    }
    const { password, ...result } = user;

    return {
      jwt: auth,
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

    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });

    await this.usersService.update(user.id, { refresh_token: refreshToken });

    return {
      status: 200,
      message: 'Login successful',
      jwt: accessToken,
      refresh: refreshToken,
    };
  }

  async register(user: CreateUserDto) {
    return this.usersService.create(user);
  }

  async logout(token: string) {
    try {
      if (!token) {
        throw new UnauthorizedException('Cannot find access token.');
      }

      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: true,
      });

      if (!decoded) {
        throw new UnauthorizedException('Access token is invalid.');
      }

      const user = await this.usersService.findOne(decoded.id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.usersService.update(user.id, { refresh_token: undefined });

      return {
        status: 200,
        message: 'Logout successful',
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Logout failed');
    }
  }

  async refresh(token: string, refreshToken: string) {
    try {
      const user = await this.helper.validateUserFromToken(token);
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

      if (refreshToken !== user.refresh_token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const dataForAccessToken = {
        id: user.id,
        email: user.email,
        role: user.role,
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

  async forgotPassword() {
    return 'forgot-password';
  }

  async verifyEmail() {
    return 'verify-email';
  }

  async changePassword(token: string, changePasswordDto: ChangePasswordDto) {
    try {
      const user = await this.helper.validateUserFromToken(token);

      const isMatch = await bcrypt.compare(
        changePasswordDto.oldPassword,
        user.password,
      );
      if (!isMatch) {
        throw new UnauthorizedException('Incorrect old password');
      }

      const newPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

      await this.usersService.update(user.id, { password: newPassword });

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

  async updateProfile(token: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.helper.validateUserFromToken(token);

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
