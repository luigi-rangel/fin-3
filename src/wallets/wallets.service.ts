import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Wallet } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class WalletsService {
    constructor(private readonly db: DatabaseService) { }

    async getWallet(id: number, userId: number): Promise<Wallet> {
        try {
            return await this.db.wallet.findUniqueOrThrow({
                where: {
                    id: id,
                    userId: userId,
                },
                include: {
                    operationsFrom: {
                        include: {
                            transactions: true,
                            operationTags: {
                                include: {
                                    tag: true
                                }
                            }
                        }
                    },
                    operationsTo: {
                        include: {
                            transactions: true,
                            operationTags: {
                                include: {
                                    tag: true
                                }
                            }
                        }
                    }
                }
            })
        } catch (e) {
            throw new HttpException("Carteira ou usuário não encontrado", HttpStatus.NOT_FOUND);
        }
    }

    async getWalletsId(userId: number): Promise<any[]> {
        try {
            return await this.db.wallet.findMany({
                where: {
                    userId: userId
                },
                select: {
                    id: true,
                    createdAt: true,
                    name: true
                }
            })
        } catch (e) {
            throw e;
        }

    }

    async deleteWallet(id: number): Promise<undefined> {
        try {
            await this.db.wallet.delete({
                where: {
                    id: id
                }
            })
        } catch (e) {
            throw new HttpException("Carteira não encontrada", HttpStatus.NOT_FOUND);
        }

    }

    async createWallet(wallet: any): Promise<Wallet> {
        return await this.db.wallet.create({
            data: {
                createdAt: new Date(),
                name: wallet.name,
                userId: wallet.userId
            }
        })
    }

    async updateWallet(wallet: any, id: number): Promise<Wallet> {
        try {
            return await this.db.wallet.update({
                where: {
                    id: id
                },
                data: {
                    name: wallet.name
                }
            })
        } catch (e) {
            throw new HttpException("Carteira não encontrada", HttpStatus.NOT_FOUND);
        }

    }


}


