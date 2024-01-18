import { DomainRepository } from '../../infrastructure/database/domain.repository';
import { Injectable } from '@nestjs/common';
import { DomainDTO } from '../../domain/dtos/domain.dto';
import { DomainSchema } from '../../infrastructure/database/schema/domain.schema';

@Injectable()
export class DomainUseCases {
  constructor(private readonly domainRepository: DomainRepository) {}

  public create(
    payload: DomainDTO & { namespace: string },
  ): Promise<DomainSchema> {
    return this.domainRepository.create(payload);
  }

  public read(
    search: Partial<DomainDTO> & { id: number | string; namespace: string },
  ): Promise<DomainSchema> {
    return this.domainRepository.findOne({ where: search });
  }

  public updateOneById(
    id: number | string,
    data: Partial<DomainDTO>,
  ): Promise<DomainSchema> {
    return this.domainRepository.updateOneById(id, data);
  }
  public updateOne(
    where: Partial<DomainDTO> & { namespace: string },
    data: Partial<DomainDTO>,
  ): Promise<DomainSchema> {
    return this.domainRepository.updateOne(where, data);
  }

  public deleteById(id: number | string): Promise<DomainSchema> {
    return this.domainRepository.deleteOneById(id);
  }

  public deleteOne(data: Partial<DomainDTO> & { namespace: string }) {
    return this.domainRepository.deleteOne(data);
  }

  public paginate(options?: {
    where?: Partial<DomainDTO> & {
      id?: number | string;
      namespace?: string;
    };
    offset?: number;
    page?: number;
    limit?: number;
  }) {
    return this.domainRepository.paginate(options);
  }
}
