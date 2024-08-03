import { DNSRecordUseCases } from './../../../application/usecases/dns-record.usecases';
import {
  Body,
  Controller,
  Logger,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { DomainUseCases } from '../../../application/usecases/domain.usecases';
import { DnsRecordType } from 'src/domain/@enums/dns-record-type.enum';

@Controller({
  version: '1alpha1',
  path: '/acme',
})
export class ACMEControllerV1Alpha1 {
  constructor(
    private readonly domainUseCases: DomainUseCases,
    private readonly dnsRecordUseCases: DNSRecordUseCases,
  ) {}

  @Post('present')
  async present(@Body() payload: any) {
    const { apiKey, dnsName, key } = payload;
    Logger.debug('apikey:', apiKey);
    Logger.debug('dnsName:', dnsName);
    Logger.debug('key:', key);
    let domain: any;
    try {
      domain = await this.domainUseCases.readByName(dnsName);
    } catch (e) {
      Logger.debug(e);
      return { status: 'error', message: e.message };
    }
    if (!domain) throw new NotFoundException();
    try {
      await this.dnsRecordUseCases.create({
        name: `_acme-challenge.${dnsName}`,
        type: DnsRecordType.TXT,
        content: key,
        domainId: domain.id,
      });
      return { status: 'success' };
    } catch (e) {
      Logger.debug(e);
      return { status: 'error', message: e.message };
    }
  }

  @Post('cleanup')
  async cleanup(@Body() payload: any) {
    const { apiKey, dnsName, key } = payload;
    Logger.debug('apikey:', apiKey);
    Logger.debug('dnsName:', dnsName);
    Logger.debug('key:', key);
    try {
      await this.dnsRecordUseCases.deleteByName(`_acme-challenge.${dnsName}`);
      return { status: 'success' };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }
}
