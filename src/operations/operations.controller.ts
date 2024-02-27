import { Body, Controller, Delete, Param, ParseIntPipe, Post } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { OperationCreateDto } from './dto/operationCreate.dto';

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
}
