import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { resolveNs } from 'dns/promises';
import { DomainStatus } from '../../domain/@enums/domain-status.enum';
import { DomainRepository } from '../database/domain.repository';

@Injectable()
export class DomainCronJob {
  nameservers: [];
  constructor(
    private domainRepository: DomainRepository,
    private readonly configService: ConfigService,
  ) {
    this.nameservers = this.configService.getOrThrow('NAMESERVERS').split(',');
  }
  @Cron('*/5 * * * *')
  async handleDomainActivationCheck() {
    Logger.debug('Domain Activation CRON started');
    const pendingDomains = await this.domainRepository.findAll({
      where: {
        status: DomainStatus.PENDING,
      },
    });

    Promise.all(
      pendingDomains.map(async (pd) => {
        if (await this.checkDNSServer(pd.name)) {
          pd.status = DomainStatus.ACTIVE;
          await pd.save();
        }
      }),
    );
  }

  private async checkDNSServer(domain: string): Promise<boolean> {
    try {
      const ns = await resolveNs(domain);
      return this.nameservers.some((n) => ns.indexOf(n) !== -1);
    } catch (e) {
      return false;
    }
  }
}
