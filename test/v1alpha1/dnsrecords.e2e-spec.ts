import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
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

class MockRolesGuard {
  canActivate = jest.fn().mockReturnValue(true);
}

describe('DNSRecord controller v1alpha1 (e2e)', () => {
  let app: NestFastifyApplication;
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

        SequelizeModule.forFeature([RecordSchema]),
      ],
      controllers: [HealthControllerV1Alpha1, DNSRecordControllerV1Alpha1],
      providers: [DNSRecordUseCases, DNSRecordRepository],
    })
      .overrideGuard(RolesGuard)
      .useValue(new MockRolesGuard())
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.enableVersioning({
      type: VersioningType.URI,
    });
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/v1alpha1').expect(200);
  });

  it('/:namespace/domains (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1alpha1/roya/domains/1/records')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect((res) => {
        expect(res.body).toHaveProperty('totalRows');
        expect(res.body).toHaveProperty('offset');
        expect(res.body).toHaveProperty('page');
        expect(res.body).toHaveProperty('totalPages');
        expect(res.body).toHaveProperty('rows');
      });
  });
});
