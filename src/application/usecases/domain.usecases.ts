import { EnumDnsRecordType } from '../../infrastructure/database/@enums';
import { DomainRepository } from '../../infrastructure/database/domain.repository';
import { Injectable } from '@nestjs/common';
import { DomainDTO } from '../../domain/dtos/domain.dto';
import { DomainSchema } from '../../infrastructure/database/schema/domain.schema';
import { DomainStatus } from '../../domain/@enums/domain-status.enum';
import { checkDNSServer } from '../../infrastructure/helpers/check-dns-servers';
import {
  FilterOperator,
  IFilter,
  ISort,
} from '../../infrastructure/database/repository.interface';
import { SortDirection } from '../../infrastructure/database/sort-direction.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DomainUseCases {
  constructor(
    private readonly domainRepository: DomainRepository,
    private readonly configService: ConfigService,
  ) {}

  public async create(
    payload: DomainDTO & { namespace: string; status?: DomainStatus },
  ): Promise<DomainSchema> {
    payload.status = (await checkDNSServer(
      payload.name,
      this.configService.getOrThrow('NAMESERVERS'),
    ))
      ? DomainStatus.ACTIVE
      : DomainStatus.PENDING;
    const nameservers = this.configService
      .getOrThrow('NAMESERVERS')
      .replace(/\s+/g, '')
      .split(',');
    const domain = await this.domainRepository.create(
      {
        ...payload,
        records: nameservers.map((ns: string) => ({
          name: '@',
          type: EnumDnsRecordType.NS,
          content: ns + '.',
          ttl: 3600,
        })),
      },
      {
        include: ['records'],
      },
    );
    return domain;
  }

  public read(
    search: Partial<DomainDTO> & { id?: number | string; namespace: string },
  ): Promise<DomainSchema> {
    const where: IFilter = {
      and: Object.entries(search).map(([field, value]) => ({
        field,
        operator: FilterOperator.EQ,
        value,
      })),
    };
    return this.domainRepository.findOne({ where });
  }

  public readByName(name: string) {
    return this.domainRepository.findOne({
      where: {
        and: [
          {
            field: 'name',
            operator: FilterOperator.EQ,
            value: name,
          },
          {
            field: 'status',
            operator: FilterOperator.EQ,
            value: DomainStatus.ACTIVE,
          },
        ],
      },
    });
  }
  public updateOneById(
    id: number | string,
    data: Partial<DomainDTO>,
  ): Promise<DomainSchema> {
    return this.domainRepository.updateOneById(id, data);
  }
  public updateOne(
    where: Partial<DomainDTO> & { id: number | string; namespace: string },
    data: Partial<DomainDTO>,
  ): Promise<DomainSchema> {
    const whereClause: IFilter = {
      and: Object.entries(where).map(([field, value]) => ({
        field,
        operator: FilterOperator.EQ,
        value,
      })),
    };
    return this.domainRepository.updateOne(whereClause, data);
  }

  public deleteById(id: number | string): Promise<DomainSchema> {
    return this.domainRepository.deleteOneById(id);
  }

  public deleteOne(
    data: Partial<DomainDTO> & { id: number | string; namespace: string },
  ) {
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
