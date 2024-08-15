import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { DomainStatus } from '../../domain/@enums/domain-status.enum';
import { DomainRepository } from '../database/domain.repository';
import { checkDNSServer } from '../helpers/check-dns-servers';

@Injectable()
export class DomainCronJob {
  constructor(
    private domainRepository: DomainRepository,
    private readonly configService: ConfigService,
  ) {}
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
        if (
          await checkDNSServer(
            pd.name,
            this.configService.getOrThrow('NAMESERVERS'),
          )
        ) {
          pd.status = DomainStatus.ACTIVE;
          await pd.save();
        }
      }),
    );
  }
}
