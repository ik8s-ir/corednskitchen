import { Injectable, NotFoundException } from '@nestjs/common';
import { DNSRecordDTO } from '../../domain/dtos/record.dto';
import { DNSRecordRepository } from '../../infrastructure/database/dnsrecord.repository';
import { DomainRepository } from '../../infrastructure/database/domain.repository';
import {
  FilterOperator,
  IFilter,
  ISort,
} from '../../infrastructure/database/repository.interface';
import { SortDirection } from '../../infrastructure/database/sort-direction.enum';

@Injectable()
export class DNSRecordUseCases {
  constructor(
    private readonly domainRepository: DomainRepository,
    private readonly dnsRecordRepository: DNSRecordRepository,
  ) {}
  public async create(record: DNSRecordDTO) {
    if (record.name === '@') {
      return this.dnsRecordRepository.create(record);
    }
    const domain = await this.domainRepository.findById(record.domainId);
    if (!domain) throw new NotFoundException();
    return this.dnsRecordRepository.create({
      ...record,
      name:
        record.name === domain.name
          ? record.name
          : `${record.name}.${domain.name}`,
    });
  }

  public read(id: number | string) {
    return this.dnsRecordRepository.findById(id);
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
        {
          field: 'content',
          operator: FilterOperator.LIKE,
          value: `%${search}%`,
        },
      ];
    }
    const sortOptions: ISort[] = sort
      ? [{ field: sort, direction: sort_direction || SortDirection.DESC }]
      : [];
    return this.dnsRecordRepository.paginate({
      where,
      offset,
      page,
      limit,
      sort: sortOptions,
    });
  }

  public deleteById(id: number | string) {
    return this.dnsRecordRepository.deleteOneById(id);
  }

  public deleteByName(name: string) {
    return this.dnsRecordRepository.delete({
      where: {
        and: [
          {
            field: 'name',
            operator: FilterOperator.EQ,
            value: name,
          },
        ],
      },
    });
  }
}
