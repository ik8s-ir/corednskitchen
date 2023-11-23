import { Module } from '@nestjs/common';
import { AppControllerV1Alpha1 } from './controllers/v1alpha1/app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { DomainSchema } from './database/schema/domain.schema';

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
  controllers: [AppControllerV1Alpha1],
  providers: [AppService],
})
export class AppModule {}
