import { HealthControllerV1Alpha1 } from './presentation/controllers/v1alpha1/health.controller';
import { Module } from '@nestjs/common';
import { DomainControllerV1Alpha1 } from './presentation/controllers/v1alpha1/domain.controller';
import { DomainUseCases } from './application/usecases/domain.usecases';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { DomainSchema } from './infrastructure/database/schema/domain.schema';
import { DomainRepository } from './infrastructure/database/domain.repository';
import { RolesGuard } from './presentation/guards/roles.guard';
import { DNSRecordControllerV1Alpha1 } from './presentation/controllers/v1alpha1/dnsrecord.controller';
import { DNSRecordUseCases } from './application/usecases/dns-record.usecases';
import { DNSRecordRepository } from './infrastructure/database/dnsrecord.repository';
import { RecordSchema } from './infrastructure/database/schema/record.schema';

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !!ENV ? `.env.${ENV}` : '.env',
    }),
    DatabaseModule,
    SequelizeModule.forFeature([DomainSchema, RecordSchema]),
  ],
  controllers: [
    HealthControllerV1Alpha1,
    DomainControllerV1Alpha1,
    DNSRecordControllerV1Alpha1,
  ],
  providers: [
    DomainUseCases,
    DNSRecordUseCases,
    DomainRepository,
    DNSRecordRepository,
    RolesGuard,
  ],
})
export class AppModule {}
