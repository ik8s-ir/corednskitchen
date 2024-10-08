import { ConfigModule, ConfigService } from '@nestjs/config';
import { DomainRepository } from '../../infrastructure/database/domain.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { DomainSchema } from '../../infrastructure/database/schema/domain.schema';
import { DomainUseCases } from './domain.usecases';
import { Logger } from '@nestjs/common';
import { DomainDTO } from '../../domain/dtos/domain.dto';
import { RecordSchema } from '../../infrastructure/database/schema/record.schema';
import { FilterOperator } from '../../infrastructure/database/repository.interface';
import { EnumDnsRecordType } from '../../infrastructure/database/@enums';

describe('Domain Usecases', () => {
  let domainRepository: DomainRepository;
  let domainUseCases: DomainUseCases;
  let configService: ConfigService;
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
      providers: [DomainUseCases, DomainRepository],
    })
      .setLogger(new Logger())
      .compile();

    domainRepository = module.get<DomainRepository>(DomainRepository);
    domainUseCases = module.get<DomainUseCases>(DomainUseCases);
    configService = module.get<ConfigService>(ConfigService);

    // create sample domain.
    await domainRepository.create({
      name: 'example.com',
      namespace: '27414758788',
    });
  });

  it('should create a new domain and default records.', async () => {
    // arrange
    const namespace = '17414758787';
    const payload: DomainDTO & { namespace: string } = {
      name: 'example.org',
      namespace,
    };

    // act
    const domain = await domainUseCases.create(payload);
    // assert
    expect(domain).toHaveProperty('id');
    expect(domain.name).toBe(payload.name);
    expect(domain.namespace).toBe(payload.namespace);
    expect(domain.records.length).toBeGreaterThan(0);
    expect(domain.records[0].name).toBe('@');
    expect(domain.records[0].type).toBe(EnumDnsRecordType.NS);
    expect(domain.records[0].content).toBe(
      configService.getOrThrow('NAMESERVERS') + '.',
    );
  });

  it('should read a domain by namespace and name', async () => {
    // arrange
    const namespace = '27414758788';
    const search: Partial<DomainDTO> & { namespace: string } = {
      name: 'example.com',
      namespace: namespace,
    };
    // act
    const domain = await domainUseCases.read(search);
    // assert
    expect(domain).toHaveProperty('id');
    expect(domain.name).toBe(search.name);
    expect(domain.namespace).toBe(search.namespace);
  });

  it('should update a domain by id', async () => {
    // arrange
    const namespace = '38414758787';
    // create sample domain
    const cd = await domainRepository.create({
      name: 'example.org',
      namespace: namespace,
    });
    // act
    const domain = await domainUseCases.updateOneById(cd.id, {
      name: 'example.it',
    });
    // assert
    expect(domain.name).toBe('example.it');
  });

  it('should update a domain by data', async () => {
    // arrange
    const namespace = '38414758787';
    // create sample domain
    const createdDomain = await domainRepository.create({
      name: 'example.log',
      namespace: namespace,
    });
    // act
    const domain = await domainUseCases.updateOne(
      {
        id: createdDomain.id,
        name: 'example.log',
        namespace,
      },
      {
        name: 'example.it',
      },
    );
    // assert
    expect(domain.namespace).toBe(namespace);
    expect(domain.name).toBe('example.it');
  });

  it('should delete a domain by id', async () => {
    // arrange
    const cd = await domainRepository.create({
      name: 'example.org',
      namespace: '18414758787',
    });
    // act
    const deleted = await domainUseCases.deleteById(cd.id);
    // assert
    expect(deleted.id).toBe(cd.id);
    const domain = await domainRepository.findById(cd.id);
    expect(domain).toBeNull();
  });

  it('should delete a domain by id', async () => {
    // arrange
    const cd = await domainRepository.create({
      name: 'example.cloud',
      namespace: '18414758787',
    });
    // act
    const deleted = await domainUseCases.deleteOne({
      namespace: '18414758787',
      id: cd.id,
    });
    // assert
    expect(deleted.id).toBe(cd.id);
    const domain = await domainRepository.findById(cd.id);
    expect(domain).toBeNull();
  });

  it('should list domains with pagination in a namespace', async () => {
    // arrange
    const namespace = 'n';
    // act
    const domains = await domainUseCases.paginate({
      where: {
        and: [
          {
            field: 'namespace',
            operator: FilterOperator.EQ,
            value: namespace,
          },
        ],
      },
    });
    // assert
    expect(domains).toHaveProperty('rows');
    expect(domains).toHaveProperty('totalRows');
    expect(domains).toHaveProperty('limit');
    expect(domains).toHaveProperty('offset');
    expect(domains).toHaveProperty('page');
    expect(domains).toHaveProperty('totalPages');
  });
});
