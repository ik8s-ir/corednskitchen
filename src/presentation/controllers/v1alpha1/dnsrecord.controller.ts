import { DNSRecordUseCases } from './../../../application/usecases/dns-record.usecases';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DNSRecordDTO } from '../../../domain/dtos/record.dto';
import { PaginationDTO } from '../../../domain/dtos/pagination.dto';
import { FilterOperator } from 'src/infrastructure/database/repository.interface';

@Controller({
  version: '1alpha1',
  path: '/namespaces/:namespace/domains/:domainId/records',
})
@ApiTags('v1alpha1', 'dnsrecord')
export class DNSRecordControllerV1Alpha1 {
  constructor(private readonly dnsRecordUseCases: DNSRecordUseCases) {}

  @Post('/')
  @ApiOperation({ summary: 'create a DNS record' })
  async create(
    @Body() payload: DNSRecordDTO,
    @Param() { domainId }: { domainId: number },
  ) {
    return await this.dnsRecordUseCases.create({ ...payload, domainId });
  }

  @Get('/:id')
  @ApiOperation({ summary: 'read a DNS record data' })
  async read(@Param() { id }: { id: number }) {
    return this.dnsRecordUseCases.read(id);
  }

  @Get('/')
  @ApiOperation({ summary: 'paginated dns record list' })
  async paginate(
    @Query() query: PaginationDTO,
    @Param() { domainId }: { domainId: number },
  ) {
    return this.dnsRecordUseCases.paginate({
      ...query,
      where: {
        and: [
          {
            field: 'domainId',
            operator: FilterOperator.EQ,
            value: domainId,
          },
        ],
      },
    });
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'delete a dns record' })
  deleteRecord(@Param() { id }: { id: number }) {
    return this.dnsRecordUseCases.deleteById(id);
  }
}
