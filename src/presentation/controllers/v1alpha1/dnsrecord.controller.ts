import { DNSRecordUseCases } from './../../../application/usecases/dns-record.usecases';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DNSRecordDTO } from '../../../domain/dtos/record.dto';
import { PaginationDTO } from '../../../domain/dtos/pagination.dto';
import { FilterOperator } from '../../../infrastructure/database/repository.interface';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../guards/roles.decorator';

@Controller({
  version: '1alpha1',
  path: '/namespaces/:namespace/domains/:domainId/records',
})
@ApiTags('v1alpha1', 'dnsrecord')
@UseGuards(RolesGuard)
export class DNSRecordControllerV1Alpha1 {
  constructor(private readonly dnsRecordUseCases: DNSRecordUseCases) {}

  @Post('/')
  @ApiOperation({ summary: 'create a DNS record' })
  @Roles(['owner', 'admin'])
  async create(
    @Body() payload: DNSRecordDTO,
    @Param() { domainId }: { domainId: number },
  ) {
    return await this.dnsRecordUseCases.create({ ...payload, domainId });
  }

  @Get('/:id')
  @ApiOperation({ summary: 'read a DNS record data' })
  @Roles(['owner', 'admin'])
  async read(@Param() { id }: { id: number }) {
    return this.dnsRecordUseCases.read(id);
  }

  @Get('/')
  @ApiOperation({ summary: 'paginated dns record list' })
  @Roles(['owner', 'admin'])
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
  @Roles(['owner', 'admin'])
  deleteRecord(@Param() { id }: { id: number }) {
    return this.dnsRecordUseCases.deleteById(id);
  }
}
