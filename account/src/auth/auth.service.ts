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

  async refresh() {
    return 'refresh';
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
