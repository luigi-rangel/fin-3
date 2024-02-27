import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { OperationCreateDto } from './dto/operationCreate.dto';
import { Operation, OperationType, Prisma } from '@prisma/client';

@Injectable()
export class OperationsService {
  constructor(private readonly db: DatabaseService) {}

  async createOperation(operation: OperationCreateDto): Promise<Operation> {
    try {
      return await this.db.operation.create({
        data: {
          count: operation.count,
          frequency: operation.frequency,
          start: new Date(operation.start),
          finish: operation.finish ? new Date(operation.finish) : undefined,
          type: operation.type,
          walletFrom: operation.walletFromId
            ? {
                connect: {
                  id: operation.walletFromId,
                },
              }
            : undefined,
          walletTo: operation.walletToId
            ? {
                connect: {
                  id: operation.walletToId,
                },
              }
            : undefined,
          operationTags: {
            create: operation.tags.map((e) => {
              return {
                tag: {
                  connectOrCreate: {
                    where: {
                      name: this.parseTag(e),
                    },
                    create: {
                      name: this.parseTag(e),
                    },
                  },
                },
              };
            }),
          },
          transactions: {
            createMany: {
              data: this.calculateTransactions(operation),
            },
          },
        },
      });
    } catch (e) {
      switch (true) {
        case e instanceof Prisma.PrismaClientKnownRequestError:
          if (e.code === 'P2025') {
            throw new HttpException(
              'Carteira(s) não encontrada',
              HttpStatus.NOT_FOUND,
            );
          }
        default:
          throw e;
      }
    }
  }

  async removeOperation(id: number): Promise<undefined> {
    try {
      await this.db.operation.delete({
        where: {
          id: id,
        },
      });
    } catch (e) {
      switch (true) {
        case e instanceof Prisma.PrismaClientKnownRequestError:
          if (e.code === 'P2025') {
            throw new HttpException(
              'Operação não encontrada',
              HttpStatus.NOT_FOUND,
            );
          }
        default:
          throw e;
      }
    }
  }

  private calculateTransactions(
    operation: OperationCreateDto,
  ): Prisma.TransactionCreateWithoutOperationInput[] {
    const date = new Date(operation.start);

    if (operation.type == OperationType.Single) {
      return [{ value: operation.value, date: date }];
    }

    if (operation.count) {
      const transactions = [];

      for (let i = 0; i < operation.count; i++) {
        transactions.push({ value: operation.value, date: new Date(date) });

        this.increaseDateIteration(operation, date);
      }

      return transactions;
    } else if (operation.finish) {
      const transactions = [];

      while (date <= new Date(operation.finish)) {
        transactions.push({ value: operation.value, date: new Date(date) });

        this.increaseDateIteration(operation, date);
      }

      return transactions;
    }
  }

  private increaseDateIteration(operation: OperationCreateDto, date: Date) {
    switch (operation.type) {
      case OperationType.Daily:
        date.setDate(date.getDate() + 1 * operation.frequency);
        break;
      case OperationType.Weekly:
        date.setDate(date.getDate() + 7 * operation.frequency);
        break;
      case OperationType.Monthly:
        date.setMonth(date.getMonth() + 1 * operation.frequency);
        break;
      case OperationType.Yearly:
        date.setFullYear(date.getFullYear() + 1 * operation.frequency);
        break;
      default:
        throw new Error();
    }
  }

  private parseTag(tag: string): string {
    const trimmed = tag.trim();
    return trimmed
      .split(' ')
      .map((e) => {
        if (e.length < 4) return e;
        return e[0].toUpperCase() + e.slice(1);
      })
      .join(' ');
  }
}
