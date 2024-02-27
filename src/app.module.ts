import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { OperationsModule } from './operations/operations.module';

@Module({
  imports: [DatabaseModule, UsersModule, TransactionsModule, OperationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
