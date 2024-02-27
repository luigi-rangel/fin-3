import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { Wallet } from '@prisma/client';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) { }

  @Get(':userId/:id')
  async getWallet(@Param('id', ParseIntPipe) id: number, @Param('userId', ParseIntPipe) userId: number): Promise<Wallet> {
    return await this.walletsService.getWallet(id, userId);
  }

  @Get(':userId')
  async getWalletsByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<any[]> {
    return await this.walletsService.getWalletsByUserId(userId);
  }

  @Delete(':id')
  async deleteWallet(@Param('id', ParseIntPipe) id: number): Promise<undefined> {
    return await this.walletsService.deleteWallet(id);
  }

  @Post()
  async createWallet(@Body() wallet: any): Promise<Wallet> {
    return await this.walletsService.createWallet(wallet)
  }

  @Put(':id')
  async updateWallet(@Body() wallet: any, @Param('id', ParseIntPipe) id: number): Promise<Wallet> {
    return await this.walletsService.updateWallet(wallet, id)
  }
}
