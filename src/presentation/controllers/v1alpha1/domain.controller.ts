import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DomainService } from '../../../application/usecases/domain.usecases';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DomainDTO } from '../../../domain/dtos/rcord.dto';

@Controller({
  version: '1alpha1',
  path: '/:namespace/domains',
})
@ApiTags('v1alpha1', 'domain')
export class DomainControllerV1Alpha1 {
  constructor(private readonly domainService: DomainService) {}

  @Get()
  health(): boolean {
    return true;
  }

  @Post('/')
  @ApiOperation({ summary: 'Add a domain' })
  createDomain(
    @Param() { namespace }: { namespace: string },
    @Body() data: DomainDTO,
  ) {
    return { namespace, ...data };
  }
}
