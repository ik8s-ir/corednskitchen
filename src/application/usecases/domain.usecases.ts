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

  public update(
    id: number | string,
    data: Partial<DomainDTO>,
  ): Promise<DomainSchema> {
    return this.domainRepository.updateOneById(id, data);
  }

  public delete(id: number | string): Promise<DomainSchema> {
    return this.domainRepository.deleteOneById(id);
  }

  public paginate(options?: {
    where?: Partial<DomainDTO> & {
      id?: number | string;
      account?: string;
    };
    offset?: number;
    page?: number;
    limit?: number;
  }) {
    return this.domainRepository.paginate(options);
  }
}
