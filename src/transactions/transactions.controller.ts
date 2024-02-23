import { Controller, Get } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from '@prisma/client';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(): Promise<Transaction[]> {
    return await this.transactionsService.getTransactions();
  }
}
