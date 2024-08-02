import { Injectable, NotFoundException } from '@nestjs/common';
import { DNSRecordDTO } from '../../domain/dtos/record.dto';
import { DNSRecordRepository } from '../../infrastructure/database/dnsrecord.repository';
import { DomainRepository } from '../../infrastructure/database/domain.repository';

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
    where?: Partial<DNSRecordDTO> & {
      id?: number | string;
      domainId?: number | string;
    };
    offset?: number;
    page?: number;
    limit?: number;
  }) {
    return this.dnsRecordRepository.paginate(options);
  }

  public deleteById(id: number | string) {
    return this.dnsRecordRepository.deleteOneById(id);
  }
}
