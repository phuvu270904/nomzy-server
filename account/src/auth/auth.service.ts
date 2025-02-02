import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login() {
    return 'login';
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
