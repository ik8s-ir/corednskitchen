import { DomainRepository } from '../../infrastructure/database/domain.repository';
import { Injectable } from '@nestjs/common';
import { DomainDTO } from '../../domain/dtos/domain.dto';
import { DomainSchema } from '../../infrastructure/database/schema/domain.schema';
import { DomainStatus } from '../../domain/@enums/domain-status.enum';
import { checkDNSServer } from '../helpers/check-dns-servers';
import {
  FilterOperator,
  IFilter,
  ISort,
} from '../../infrastructure/database/repository.interface';
import { SortDirection } from '../../infrastructure/database/sort-direction.enum';

@Injectable()
export class DomainUseCases {
  constructor(private readonly domainRepository: DomainRepository) {}

  public async create(
    payload: DomainDTO & { namespace: string; status?: DomainStatus },
  ): Promise<DomainSchema> {
    payload.status = (await checkDNSServer(payload.name))
      ? DomainStatus.ACTIVE
      : DomainStatus.PENDING;
    return this.domainRepository.create(payload);
  }

  public read(
    search: Partial<DomainDTO> & { id?: number | string; namespace: string },
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
    where?: IFilter;
    offset?: number;
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    sort_direction?: SortDirection;
  }) {
    options = options || {};
    const { offset, page, limit, sort, sort_direction, search } = options;
    const where: IFilter = options.where || {};

    if (search) {
      where.or = [
        { field: 'name', operator: FilterOperator.LIKE, value: `%${search}%` },
      ];
    }
    const sortOptions: ISort[] = sort
      ? [{ field: sort, direction: sort_direction || SortDirection.DESC }]
      : [];
    return this.domainRepository.paginate({
      where,
      offset,
      page,
      limit,
      sort: sortOptions,
    });
  }
}
