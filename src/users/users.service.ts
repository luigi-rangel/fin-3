import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
    constructor(private readonly db: DatabaseService) {}

    async getAll(): Promise<User[]> {
        return await this.db.user.findMany();
    }
}
