import { DomainRepository } from '../../infrastructure/database/domain.repository';
import { Injectable } from '@nestjs/common';
import { DomainDTO } from '../../domain/dtos/rcord.dto';
import { DomainSchema } from 'src/infrastructure/database/schema/domain.schema';

@Injectable()
export class DomainUseCases {
  constructor(private readonly domainRepository: DomainRepository) {}

  public create(
    payload: DomainDTO & { account: string },
  ): Promise<DomainSchema> {
    return this.domainRepository.create(payload);
  }

  public read(
    search: Partial<DomainDTO> & { account?: string },
  ): Promise<DomainSchema> {
    return this.domainRepository.findOne({ where: search });
  }
}
