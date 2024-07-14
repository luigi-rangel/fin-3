import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { OperationCreateDto } from './dto/operationCreate.dto';
import { OperationUpdateDto } from './dto/operationUpdate.dto';
import { OperationPatchDto } from './dto/operationPatch.dto';

@Controller('operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post()
  async createOperation(@Body() operation: OperationCreateDto) {
    return await this.operationsService.createOperation(operation);
  }

  @Delete(':id')
  async deleteOperation(@Param('id', ParseIntPipe) id: number) {
    return await this.operationsService.removeOperation(id);
  }

  @Patch(':id')
  async updateOperationIds( @Param('id', ParseIntPipe) id: number, @Body() operationPatchDto: OperationPatchDto) {
    return await this.operationsService.updateOperationIds(id, operationPatchDto);
  }

  @Put(':id')
  async updateOperation(@Param('id', ParseIntPipe) id: number, @Body() operationUpdateDto: OperationUpdateDto) {
    return await this.operationsService.updateOperation(id, operationUpdateDto);
  }
}
