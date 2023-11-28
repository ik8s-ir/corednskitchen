import { Module } from '@nestjs/common';
import { DomainControllerV1Alpha1 } from './presentation/controllers/v1alpha1/domain.controller';
import { DomainUseCases } from './application/usecases/domain.usecases';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { DomainSchema } from './infrastructure/database/schema/domain.schema';

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !!ENV ? `.env.${ENV}` : '.env',
    }),
    DatabaseModule,
    SequelizeModule.forFeature([DomainSchema]),
  ],
  controllers: [DomainControllerV1Alpha1],
  providers: [DomainUseCases],
})
export class AppModule {}
