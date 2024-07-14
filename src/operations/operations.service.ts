import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { OperationCreateDto } from './dto/operationCreate.dto';
import { Operation, OperationType, Prisma } from '@prisma/client';
import { OperationUpdateDto } from './dto/operationUpdate.dto';
import { OperationPatchDto } from './dto/operationPatch.dto';

@Injectable()
export class OperationsService {
  constructor(private readonly db: DatabaseService) {}

  async createOperation(operation: OperationCreateDto): Promise<Operation> {
    try {
      return await this.db.operation.create({
        data: {
          count: operation.count,
          frequency: operation.frequency,
          start: operation.start,
          finish: operation.finish ? operation.finish : undefined,
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
            create: this.insertTags(operation.tags),
          },
          transactions: {
            createMany: {
              data: this.calculateTransactions(operation, operation.start, operation.count),
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

  async updateOperationIds(
    id: number,
    operationPatchDto: OperationPatchDto
  ): Promise<Operation> {
    const userId = 1
    try {
      await this.validateWallets(userId, id, operationPatchDto);
      return await this.db.operation.update({
        where: {
          id: id,
        },
        data: {
          walletFromId: operationPatchDto.walletFromId,
          walletToId: operationPatchDto.walletToId,
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
          } else if (e.code === 'P2003'){
            throw new HttpException(
              'Carteira(s) não encontrada(s)',
              HttpStatus.NOT_FOUND,
            )
          }
        default:
          throw e;
      }
    }
  }

  private async validateWallets(userId: number, id: number, operationPatchDto?: OperationPatchDto) {
    const userWalletIds = (await this.db.wallet.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true
      }
    })).map(w => w.id);

    userWalletIds.push(null);

    const operationWallets = await this.db.operation.findUniqueOrThrow({
      where: {
        id: id
      },
      select: {
        walletFromId: true,
        walletToId: true,
      }
    });

    if (operationPatchDto && !(userWalletIds.includes(operationPatchDto.walletFromId ?? null) &&
      userWalletIds.includes(operationPatchDto.walletToId ?? null))) {
      throw new HttpException(
        'Usuário não pode alterar operação para uma carteira que não é sua.',
        HttpStatus.FORBIDDEN
      );
    }

    if (!(userWalletIds.includes(operationWallets.walletFromId ?? null) &&
      userWalletIds.includes(operationWallets.walletToId ?? null))) {
      throw new HttpException(
        'Usuário não pode alterar operação que não é sua.',
        HttpStatus.FORBIDDEN
      );
    }
  }

  async updateOperation(id: number, operation: OperationUpdateDto): Promise<Operation> {
    const userId = 1
    try {
      await this.validateWallets(userId, id);
      const countBeforeUpdate = await this.db.transaction.count({
        where: {
          operationId: id,
          date: {
            lt: operation.updateStart,
          }
        }
      });


      if(operation.count && countBeforeUpdate > operation.count){
        throw new HttpException(
          'Não é possível alterar transações anteriores a updateStart.',
          HttpStatus.BAD_REQUEST
        )
      };

      const count = operation.count ? operation.count - countBeforeUpdate : undefined;

      const {start} = await this.db.operation.findUnique({
        where:{
          id: id,
        },
        select: {
          start: true,
        }
      });

      const newStart = operation.updateStart < start? operation.updateStart : undefined;

      return await this.db.operation.update({
        where: {
          id: id,
        },
        data: {
          start: newStart,
          frequency: operation.frequency,
          count: operation.count,
          finish: operation.finish,
          type: operation.type,
          transactions: {
            deleteMany: {
              date: {
                gte: operation.updateStart,
              },
            },
            createMany: {
              data: this.calculateTransactions(
                operation,
                operation.updateStart,
                count
              ),
            },
          },
          operationTags: this.updateOperationTags(operation),
        },
      });
    } catch (e) {
      switch(true) {
        case e instanceof Prisma.PrismaClientKnownRequestError:
          if(e.code === 'P2025'){
            throw new HttpException(
              'Operação não encontrada',
              HttpStatus.NOT_FOUND,
            );            
          }
        default:
          throw e
      }
    }
  }

  private updateOperationTags(operation: OperationUpdateDto): Prisma.OperationTagUpdateManyWithoutOperationNestedInput {
    if(!operation.tags) return;
    return {
      deleteMany: {},
      create: this.insertTags(operation.tags)
    };
  }

  private calculateTransactions(
    operation: OperationCreateDto | OperationUpdateDto,
    start: Date,
    count?: number
  ): Prisma.TransactionCreateWithoutOperationInput[] {
    const date = start;

    if (operation.type == OperationType.Single) {
      return [{ value: operation.value, date: date }];
    }

    if (count) {
      const transactions = [];

      for (let i = 0; i < count; i++) {
        transactions.push({ value: operation.value, date: date });

        this.increaseDateIteration(operation, date);
      }

      return transactions;
    } else if (operation.finish) {
      const transactions = [];

      while (date <= operation.finish) {
        transactions.push({ value: operation.value, date: new Date(date) });

        this.increaseDateIteration(operation, date);
      }

      return transactions;
    }
  }

  private increaseDateIteration(
    operation: OperationCreateDto | OperationUpdateDto,
    date: Date,
  ) {
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

  private insertTags(
    tags: string[],
  ): Prisma.OperationTagCreateWithoutOperationInput[] {
    return tags.map((tag) => {
      return {
        tag: {
          connectOrCreate: {
            where: {
              name: this.parseTag(tag),
            },
            create: {
              name: this.parseTag(tag),
            },
          },
        },
      };
    });
  }
}
