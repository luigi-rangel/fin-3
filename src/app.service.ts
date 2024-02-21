import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Moto';
  }

  getUsers(): User[] {
    
  }
}
