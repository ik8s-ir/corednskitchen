import { ConfigModule } from '@nestjs/config';
import { DomainRepository } from '../../infrastructure/database/domain.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { DomainSchema } from '../../infrastructure/database/schema/domain.schema';
import { DomainUseCases } from './domain.usecases';
import { Logger } from '@nestjs/common';
import { RecordTypeEnum } from '../../domain/@enums/record.enum';
import { DomainDTO } from '../../domain/dtos/rcord.dto';

describe('Domain Usecases', () => {
  let domainRepository: DomainRepository;
  let domainUseCases: DomainUseCases;

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
        SequelizeModule.forFeature([DomainSchema]),
      ],
      providers: [DomainUseCases, DomainRepository],
    })
      .setLogger(new Logger())
      .compile();

    domainRepository = module.get<DomainRepository>(DomainRepository);
    domainUseCases = module.get<DomainUseCases>(DomainUseCases);

    // create sample domain.
    await domainRepository.create({
      name: 'example.com',
      type: RecordTypeEnum.A,
      account: '27414758788',
    });
  });

  it('should create a new domain', async () => {
    // arrange
    const namespace = '17414758787';
    const payload: DomainDTO & { account: string } = {
      name: 'example.org',
      type: RecordTypeEnum.A,
      account: namespace,
    };

    // act
    const domain = await domainUseCases.create(payload);
    // assert
    expect(domain).toHaveProperty('id');
    expect(domain.name).toBe(payload.name);
    expect(domain.type).toBe(payload.type);
    expect(domain.account).toBe(payload.account);
  });

  it('should read a domain by account and name', async () => {
    // arrange
    const namespace = '27414758788';
    const search: Partial<DomainDTO> & { account?: string } = {
      name: 'example.com',
      account: namespace,
    };
    // act
    const domain = await domainUseCases.read(search);
    // assert
    expect(domain).toHaveProperty('id');
    expect(domain.name).toBe(search.name);
    expect(domain.account).toBe(search.account);
  });

  it('should update a domain by id', async () => {
    // arrange
    const namespace = '38414758787';
    // create sample domain
    const cd = await domainRepository.create({
      name: 'example.org',
      type: RecordTypeEnum.A,
      account: namespace,
    });
    // act
    const domain = await domainUseCases.update(cd.id, { name: 'example.it' });
    // assert
    expect(domain.name).toBe('example.it');
  });

  it('should delete a domain by id', async () => {
    // arrange
    const cd = await domainRepository.create({
      name: 'example.org',
      type: RecordTypeEnum.A,
      account: '18414758787',
    });
    // act
    const deleted = await domainUseCases.delete(cd.id);
    // assert
    expect(deleted.id).toBe(cd.id);
    const domain = await domainRepository.findById(cd.id);
    expect(domain).toBeNull();
  });

  it.only('should list domains with pagination in a namespace', async () => {
    // arrange
    const namespace = 'n';
    // act
    const domains = await domainUseCases.paginate({
      where: { account: namespace },
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
