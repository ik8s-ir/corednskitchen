import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const DB_TYPE = configService.getOrThrow('DB_TYPE');
        const DB_NAME = configService.getOrThrow('DB_NAME');
        const DB_TIMEZONE = configService.getOrThrow('DB_TIMEZONE');
        const DB_HOST = configService.getOrThrow('DB_HOST');
        const DB_PORT = configService.getOrThrow('DB_PORT');
        const DB_USERNAME = configService.getOrThrow('DB_USERNAME');
        const DB_PASSWORD = configService.getOrThrow('DB_PASSWORD');

        return {
          dialect: DB_TYPE,
          timezone: DB_TIMEZONE,
          synchronize: process.env.NODE_ENV !== 'production',
          logging: process.env.DEBUG ? console.log : false,
          logQueryParameters: true,
          autoLoadModels: true,
          sync: {
            force: false,
          },
          host: DB_HOST,
          port: DB_PORT,
          username: DB_USERNAME,
          password: DB_PASSWORD,
          database: DB_NAME,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
