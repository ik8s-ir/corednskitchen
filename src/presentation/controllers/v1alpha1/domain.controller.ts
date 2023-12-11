import { RolesGuard } from '../../guards/roles.guard';
import { PaginationDTO } from './../../../domain/dtos/pagination.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DomainUseCases } from '../../../application/usecases/domain.usecases';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DomainDTO } from '../../../domain/dtos/domain.dto';
import { Roles } from '../../guards/roles.decorator';

@Controller({
  version: '1alpha1',
  path: '/:namespace/domains',
})
@UseGuards(RolesGuard)
@ApiTags('v1alpha1', 'domain')
export class DomainControllerV1Alpha1 {
  constructor(private readonly domainUseCases: DomainUseCases) {}

  @Post('/')
  @ApiOperation({ summary: 'Add a domain' })
  @Roles(['owner', 'admin'])
  async createDomain(
    @Param() { namespace }: { namespace: string },
    @Body() data: DomainDTO,
  ) {
    return await this.domainUseCases.create({ account: namespace, ...data });
  }

  @Get('/')
  @ApiOperation({ summary: 'get paginated domains list' })
  @Roles(['owner', 'admin'])
  async getDomains(
    @Param() { namespace }: { namespace: string },
    @Query() query: PaginationDTO,
  ) {
    return await this.domainUseCases.paginate({
      where: {
        account: namespace,
        ...query,
      },
    });
  }

  @Get('/:name')
  @ApiOperation({ summary: 'get a domains' })
  @Roles(['owner', 'admin'])
  async getDomain(
    @Param() { namespace, name }: { namespace: string; name: string },
  ) {
    return await this.domainUseCases.read({ account: namespace, name });
  }

  @Patch('/:name')
  @ApiOperation({ summary: 'update a domains' })
  @Roles(['owner', 'admin'])
  async updteDomain(
    @Param() { namespace, name }: { namespace: string; name: string },
    @Body() data: DomainDTO,
  ) {
    return await this.domainUseCases.updateOne(
      { account: namespace, name },
      data,
    );
  }

  @Delete('/:name')
  @ApiOperation({ summary: 'delete a domains' })
  @Roles(['owner', 'admin'])
  async deleteDomain(
    @Param() { namespace, name }: { namespace: string; name: string },
  ) {
    return await this.domainUseCases.deleteOne({ account: namespace, name });
  }
}
