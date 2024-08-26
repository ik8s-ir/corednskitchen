import {
  HttpStatus,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DNSRecordUseCases } from '../../src/application/usecases/dns-record.usecases';
import { DNSRecordRepository } from '../../src/infrastructure/database/dnsrecord.repository';
import { RecordSchema } from '../../src/infrastructure/database/schema/record.schema';
import { DNSRecordControllerV1Alpha1 } from '../../src/presentation/controllers/v1alpha1/dnsrecord.controller';
import { HealthControllerV1Alpha1 } from '../../src/presentation/controllers/v1alpha1/health.controller';
import { RolesGuard } from '../../src/presentation/guards/roles.guard';
import { DomainSchema } from '../../src/infrastructure/database/schema/domain.schema';
import { DomainUseCases } from '../../src/application/usecases/domain.usecases';
import { DomainRepository } from '../../src/infrastructure/database/domain.repository';
import { EnumDnsRecordType } from '../../src/infrastructure/database/@enums';

class MockRolesGuard {
  canActivate = jest.fn().mockReturnValue(true);
}

describe('DNSRecord controller v1alpha1 (e2e)', () => {
  let app: NestFastifyApplication;
  let domainUseCases: DomainUseCases;
  let dnsRecordUseCases: DNSRecordUseCases;

  beforeAll(async () => {
    const ENV = process.env.NODE_ENV;
    const moduleFixture: TestingModule = await Test.createTestingModule({
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
      controllers: [HealthControllerV1Alpha1, DNSRecordControllerV1Alpha1],
      providers: [
        DomainUseCases,
        DNSRecordUseCases,
        DomainRepository,
        DNSRecordRepository,
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue(new MockRolesGuard())
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.enableVersioning({
      type: VersioningType.URI,
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    domainUseCases = moduleFixture.get<DomainUseCases>(DomainUseCases);
    dnsRecordUseCases = moduleFixture.get<DNSRecordUseCases>(DNSRecordUseCases);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/namespaces/:namespace/domains/:domainId/records/:id (PATCH)', async () => {
    // arrange
    const domain = await domainUseCases.create({
      name: 'example.com',
      namespace: 'roya',
    });
    const record = await dnsRecordUseCases.create({
      domainId: domain.id,
      type: EnumDnsRecordType.A,
      content: '10.10.10.1',
      name: 'test1',
      ttl: 3600,
    });
    // act
    return request(app.getHttpServer())
      .patch(
        `/v1alpha1/namespaces/roya/domains/${domain.id}/records/${record.id}`,
      )
      .set('Content-Type', 'application/json')
      .send({ content: '10.10.10.2' })
      .expect(HttpStatus.OK)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect((res) => {
        expect(res.body.content).toBe('10.10.10.2');
        expect(res.body.id).toBe(record.id);
      });
  });

  it('/namespaces/:namespace/domains/:domainId/records/:id (PATCH) - should not allow id change.', async () => {
    // arrange
    const domain = await domainUseCases.create({
      name: 'example.com',
      namespace: 'roya',
    });
    const record = await dnsRecordUseCases.create({
      domainId: domain.id,
      type: EnumDnsRecordType.A,
      content: '10.10.10.1',
      name: 'test1',
      ttl: 3600,
    });
    // act
    return request(app.getHttpServer())
      .patch(
        `/v1alpha1/namespaces/roya/domains/${domain.id}/records/${record.id}`,
      )
      .set('Content-Type', 'application/json')
      .send({ content: '10.10.10.2', id: 12000 })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/namespaces/:namespace/domains/:domainId/records/:id (PATCH) - should not allow domainId change.', async () => {
    // arrange
    const domain = await domainUseCases.create({
      name: 'example.com',
      namespace: 'roya',
    });
    const record = await dnsRecordUseCases.create({
      domainId: domain.id,
      type: EnumDnsRecordType.A,
      content: '10.10.10.1',
      name: 'test1',
      ttl: 3600,
    });
    // act
    return request(app.getHttpServer())
      .patch(
        `/v1alpha1/namespaces/roya/domains/${domain.id}/records/${record.id}`,
      )
      .set('Content-Type', 'application/json')
      .send({ content: '10.10.10.2', domainId: 12000 })
      .expect(HttpStatus.BAD_REQUEST);
  });
});
