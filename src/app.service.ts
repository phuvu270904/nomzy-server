import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getNomzyApi(): string {
    return 'Welcome to Nomzy - A food delivery service!';
  }
}
