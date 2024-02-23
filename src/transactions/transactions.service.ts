import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TransactionsService {
    constructor(private readonly db: DatabaseService) {}

    async getTransactions(): Promise<Transaction[]> {
        return await this.db.transaction.findMany({
            include: {
                operation: {
                    include: {
                        walletFrom: true,
                        walletTo: true,
                        operationTags: {
                            include: {
                                tag: true
                            }
                        }
                    }
                }
            }
        });
    }
}
