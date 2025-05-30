import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/api/users/users.service';

@Injectable()
export class Helper {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUserFromToken(token: string) {
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

    return user;
  }
}
