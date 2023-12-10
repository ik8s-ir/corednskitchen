import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller({
  version: '1alpha1',
})
@ApiTags('v1alpha1', 'health')
export class HealthControllerV1Alpha1 {
  @Get('/')
  health(): boolean {
    return true;
  }
}
