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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
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

  async logout() {
    return 'logout';
  }

  async refresh(token: string, refreshToken: string) {
    try {
      if (!token) {
        throw new UnauthorizedException('Cannot find access token.');
      }

      if (!refreshToken) {
        throw new UnauthorizedException('Cannot find refresh token.');
      }

      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: true,
      });

      const decodedRefreshToken = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
        },
      );

      if (!decoded) {
        throw new UnauthorizedException('Access token is invalid.');
      }

      if (!decodedRefreshToken) {
        throw new UnauthorizedException('Refresh token is invalid.');
      }

      const user = await this.usersService.findOne(decoded.id);
      if (!user) {
        throw new NotFoundException('User not found');
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

  async changePassword() {
    return 'change-password';
  }
}
