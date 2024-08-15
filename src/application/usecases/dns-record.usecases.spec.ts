import { ConflictException, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { DomainStatus } from '../../domain/@enums/domain-status.enum';
import { DNSRecordRepository } from '../../infrastructure/database/dnsrecord.repository';
import { DomainRepository } from '../../infrastructure/database/domain.repository';
import { DomainSchema } from '../../infrastructure/database/schema/domain.schema';
import { RecordSchema } from '../../infrastructure/database/schema/record.schema';
import { DNSRecordUseCases } from './dns-record.usecases';
import { FilterOperator } from '../../infrastructure/database/repository.interface';
import { EnumDnsRecordType } from '../../infrastructure/database/@enums';

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
      type: EnumDnsRecordType.A,
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
      type: EnumDnsRecordType.A,
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
      type: EnumDnsRecordType.A,
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
        type: EnumDnsRecordType.A,
        ttl: 60,
      })),
    );
    // act
    const records = await useCases.paginate({
      where: {
        and: [
          {
            field: 'domainId',
            operator: FilterOperator.EQ,
            value: d.id,
          },
        ],
      },
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
      type: EnumDnsRecordType.A,
      ttl: 60,
    });
    // act
    const deletedRecord = await useCases.deleteById(record.id);
    // assert
    expect(deletedRecord.id).toEqual(record.id);
  });

  it('should separate root domain and other records.', async () => {
    const rootRecord = await useCases.create({
      domainId: domain.id,
      name: 'example.com',
      type: EnumDnsRecordType.CNAME,
      content: 'example.ir',
    });
    const regularRecord = await useCases.create({
      domainId: domain.id,
      name: 'xp',
      type: EnumDnsRecordType.CNAME,
      content: 'example.ir',
    });
    expect(rootRecord.name).toBe('example.com');
    expect(regularRecord.name).toBe('xp.example.com');
  });

  it('Should not create a CNAME record when there is an A record with the same name.', async () => {
    // arrange

    // create a sample A record.
    await useCases.create({
      domainId: domain.id,
      name: 'roya',
      content: '172.172.172.172',
      type: EnumDnsRecordType.A,
      ttl: 60,
    });

    // Act & Assert: expect the create call to throw a ConflictException
    await expect(
      useCases.create({
        domainId: domain.id,
        name: 'roya',
        content: '172.172.172.172',
        type: EnumDnsRecordType.CNAME,
        ttl: 60,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('Should not create a CNAME record when there is an AAAA record with the same name.', async () => {
    // arrange

    // create a sample A record.
    await useCases.create({
      domainId: domain.id,
      name: 'roya2',
      content: '2001:0000:130F:0000:0000:09C0:876A:130B',
      type: EnumDnsRecordType.AAAA,
      ttl: 60,
    });

    // Act & Assert: expect the create call to throw a ConflictException
    await expect(
      useCases.create({
        domainId: domain.id,
        name: 'roya2',
        content: 'ayor',
        type: EnumDnsRecordType.CNAME,
        ttl: 60,
      }),
    ).rejects.toThrow(ConflictException);
  });
  it('Should not create a CNAME record when there is a CNAME record with the same name.', async () => {
    // arrange
    await useCases.create({
      domainId: domain.id,
      name: 'roya3',
      content: '2001:0000:130F:0000:0000:09C0:876A:130B',
      type: EnumDnsRecordType.CNAME,
      ttl: 60,
    });

    // Act & Assert: expect the create call to throw a ConflictException
    await expect(
      useCases.create({
        domainId: domain.id,
        name: 'roya3',
        content: 'ayor',
        type: EnumDnsRecordType.CNAME,
        ttl: 60,
      }),
    ).rejects.toThrow(ConflictException);
  });
  it('Should not create an A record when there is a CNAME record with the same name.', async () => {
    // arrange
    await useCases.create({
      domainId: domain.id,
      name: 'roya4',
      content: 'example.org',
      type: EnumDnsRecordType.CNAME,
      ttl: 60,
    });

    // Act & Assert: expect the create call to throw a ConflictException
    await expect(
      useCases.create({
        domainId: domain.id,
        name: 'roya4',
        content: '172.1.1.1',
        type: EnumDnsRecordType.A,
        ttl: 60,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('Should not create an AAAA record when there is a CNAME record with the same name.', async () => {
    // arrange
    await useCases.create({
      domainId: domain.id,
      name: 'roya5',
      content: 'example.org',
      type: EnumDnsRecordType.CNAME,
      ttl: 60,
    });

    // Act & Assert: expect the create call to throw a ConflictException
    await expect(
      useCases.create({
        domainId: domain.id,
        name: 'roya5',
        content: '2001:0000:130F:0000:0000:09C0:876A:130B',
        type: EnumDnsRecordType.AAAA,
        ttl: 60,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should create multiple A record with same name (load balancing).', async () => {
    // arrange
    const record1 = await useCases.create({
      domainId: domain.id,
      name: 'roya6',
      content: '172.1.1.1',
      type: EnumDnsRecordType.A,
      ttl: 60,
    });
    // act
    const record2 = await useCases.create({
      domainId: domain.id,
      name: 'roya6',
      content: '172.1.1.2',
      type: EnumDnsRecordType.A,
      ttl: 60,
    });
    expect(record1.name).toEqual(record2.name);
    expect(record1.content).not.toEqual(record2.content);
  });

  it('should create multiple AAAA record with same name (load balancing).', async () => {
    // arrange
    const record1 = await useCases.create({
      domainId: domain.id,
      name: 'roya7',
      content: '2001:0000:130F:0000:0000:09C0:876A:130B',
      type: EnumDnsRecordType.AAAA,
      ttl: 60,
    });
    // act
    const record2 = await useCases.create({
      domainId: domain.id,
      name: 'roya7',
      content: '2001:0000:130F:0000:0000:09C0:876A:100A',
      type: EnumDnsRecordType.AAAA,
      ttl: 60,
    });
    expect(record1.name).toEqual(record2.name);
    expect(record1.content).not.toEqual(record2.content);
  });

  it('should create multiple A and AAAA record with same name. (load balancing)', async () => {
    // arrange
    const record1 = await useCases.create({
      domainId: domain.id,
      name: 'roya8',
      content: '172.1.1.19',
      type: EnumDnsRecordType.A,
      ttl: 60,
    });
    // act
    const record2 = await useCases.create({
      domainId: domain.id,
      name: 'roya8',
      content: '2001:0000:130F:0000:0000:09C0:876A:100A',
      type: EnumDnsRecordType.AAAA,
      ttl: 60,
    });
    expect(record1.name).toEqual(record2.name);
    expect(record1.type).toBe(EnumDnsRecordType.A);
    expect(record2.type).toBe(EnumDnsRecordType.AAAA);
    expect(record1.content).not.toEqual(record2.content);
    expect(record1.type).not.toEqual(record2.type);
  });
});
