import { Controller, Get } from '@nestjs/common';
import { AppService } from '../../app.service';
import { ApiTags } from '@nestjs/swagger';

@Controller({
  version: '1alpha1',
})
@ApiTags('v1alpha1')
export class AppControllerV1Alpha1 {
  constructor(private readonly appService: AppService) {}

  @Get()
  health(): boolean {
    return true;
  }
}
