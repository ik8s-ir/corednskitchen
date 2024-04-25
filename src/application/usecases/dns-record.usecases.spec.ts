import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { DnsRecordType } from '../../domain/@enums/dns-record-type.enum';
import { DomainStatus } from '../../domain/@enums/domain-status.enum';
import { DNSRecordRepository } from '../../infrastructure/database/dnsrecord.repository';
import { DomainRepository } from '../../infrastructure/database/domain.repository';
import { DomainSchema } from '../../infrastructure/database/schema/domain.schema';
import { RecordSchema } from '../../infrastructure/database/schema/record.schema';
import { DNSRecordUseCases } from './dns-record.usecases';

describe('DNS Record Usecases', () => {
  let useCases: DNSRecordUseCases;
  let domain;
  beforeAll(async () => {
    const ENV = process.env.NODE_ENV;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: !!ENV ? `.env.${ENV}` : '.env',
        }),

        SequelizeModule.forRoot({
          dialect: 'sqlite',
          database: 'test',
          logging:
            process.env.DEBUG.toLowerCase() === 'true'
              ? (m) => Logger.debug(m)
              : false,
          logQueryParameters: true,
          synchronize: true,
          sync: {
            force: true,
          },
          autoLoadModels: true,
        }),
        SequelizeModule.forFeature([DomainSchema, RecordSchema]),
      ],
      providers: [DNSRecordUseCases, DNSRecordRepository, DomainRepository],
    })
      .setLogger(new Logger())
      .compile();

    useCases = module.get<DNSRecordUseCases>(DNSRecordUseCases);

    // create sample domain.
    domain = await DomainSchema.create({
      name: 'example.com',
      namespace: '27414758788',
    });
  });

  it('create a regular or * DNS record', async () => {
    // arrange
    const data = {
      domainId: domain.id,
      name: 'record1',
      content: '172.16.16.5',
      type: DnsRecordType.A,
      ttl: 60,
    };
    // act
    const record = await useCases.create(data);
    // assert
    expect(record).toBeDefined();
    expect(record).toHaveProperty('content');
    expect(typeof record.id).toBe('number');
    expect(record.domainId).toBeDefined();
    expect(record.content).toBe('172.16.16.5');
    expect(record.name).toBe(data.name + '.' + domain.name);
  });

  it('create an @ DNS record', async () => {
    const record = await useCases.create({
      domainId: domain.id,
      name: '@',
      content: '172.16.16.5',
      type: DnsRecordType.A,
      ttl: 60,
    });
    // assert
    expect(record).toBeDefined();
    expect(record).toHaveProperty('content');
    expect(typeof record.id).toBe('number');
    expect(record.domainId).toBeDefined();
    expect(record.content).toBe('172.16.16.5');
    expect(record.name).toBe(record.name);
  });

  it('should read a dns record by id', async () => {
    // arrange
    const d = await DomainSchema.create({
      name: 'example.org',
      status: DomainStatus.ACTIVE,
    });
    const data = {
      domainId: d.id,
      name: 'record1',
      content: '172.16.16.5',
      type: DnsRecordType.A,
      ttl: 60,
    };
    const record = await RecordSchema.create(data);
    // act
    const findRecord = await useCases.read(record.id);
    // assert
    expect(findRecord).toHaveProperty('id');
    expect(findRecord.name).toBe(data.name);
  });

  it('should list dns records of a domain with pagination in a namespace', async () => {
    // arrange
    const namespace = 'n';
    const d = await DomainSchema.create({
      name: 'example.org',
      namespace,
      status: DomainStatus.ACTIVE,
    });
    await RecordSchema.bulkCreate(
      Array.from({ length: 20 }).map((_, index: number) => ({
        name: 'record' + index,
        domainId: d.id,
        content: '172.16.16.5',
        type: DnsRecordType.A,
        ttl: 60,
      })),
    );
    // act
    const records = await useCases.paginate({
      where: { domainId: d.id },
    });
    // assert
    expect(records).toHaveProperty('rows');
    expect(records).toHaveProperty('totalRows');
    expect(records).toHaveProperty('limit');
    expect(records).toHaveProperty('offset');
    expect(records).toHaveProperty('page');
    expect(records).toHaveProperty('totalPages');
    expect(records.totalPages).toBe(1);
    expect(records.totalRows).toBe(20);
  });

  it('should delete a dns record by id', async () => {
    // arrange
    const record = await RecordSchema.create({
      name: 'recordx',
      domainId: domain.id,
      content: '172.16.16.5',
      type: DnsRecordType.A,
      ttl: 60,
    });
    // act
    const deletedRecord = await useCases.deleteById(record.id);
    // assert
    expect(deletedRecord.id).toEqual(record.id);
  });
});
