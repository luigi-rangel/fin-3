import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Wallet } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { WalletCreateDto } from './dto/walletCreate.dto';
import { UpdateWalletDto } from './dto/walletUpdate.dto';

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
            switch (true) {
                case (e instanceof Prisma.PrismaClientKnownRequestError): {
                    if( e.code === "P2025") {
                        throw new HttpException("Carteira ou usuário não encontrado", HttpStatus.NOT_FOUND);
                    }
                }
                default: {
                    throw e;
                }
            } 
        }
    }

    async getWalletsByUserId(userId: number): Promise<any[]> {
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
            switch(true){
                case (e instanceof Prisma.PrismaClientKnownRequestError): {
                    if (e.code === "P2025") {
                        throw new HttpException("Carteira não encontrada", HttpStatus.NOT_FOUND);
                    }                
                }
                default: {
                    throw e;
                }
            }
        }
    }

    async createWallet(wallet: WalletCreateDto): Promise<Wallet> {
        try {
            return await this.db.wallet.create({
                data: {
                    name: wallet.name,
                    userId: wallet.userId
                }
            })
        } catch(e) {
            switch(true) {
                case(e instanceof Prisma.PrismaClientKnownRequestError): {
                    if(e.code ==="P2003") {
                        throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND);
                    }
                }
                default: {
                    throw e;
                }
            }
        }

    }

    async updateWallet(wallet: UpdateWalletDto, id: number): Promise<Wallet> {
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
            switch(true) {
                case(e instanceof Prisma.PrismaClientKnownRequestError): {
                    if (e.code === "P2025") {
                        throw new HttpException("Carteira não encontrada", HttpStatus.NOT_FOUND);
                    }                    
                }
                default: {
                    throw e
                }
            }
        }
    }
}


