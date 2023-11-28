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
        const DB_SLAVE_01_HOST = configService.getOrThrow('DB_SLAVE_01_HOST');
        const DB_SLAVE_01_PORT = configService.getOrThrow('DB_SLAVE_01_PORT');
        const DB_SLAVE_01_USERNAME = configService.getOrThrow(
          'DB_SLAVE_01_USERNAME',
        );
        const DB_SLAVE_01_PASSWORD = configService.getOrThrow(
          'DB_SLAVE_01_PASSWORD',
        );
        const DB_MASTER_01_HOST = configService.getOrThrow('DB_MASTER_01_HOST');
        const DB_MASTER_01_PORT = configService.getOrThrow('DB_MASTER_01_PORT');
        const DB_MASTER_01_USERNAME = configService.getOrThrow(
          'DB_MASTER_01_USERNAME',
        );
        const DB_MASTER_01_PASSWORD = configService.getOrThrow(
          'DB_MASTER_01_PASSWORD',
        );

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
          replication: {
            read: [
              {
                host: DB_SLAVE_01_HOST,
                port: DB_SLAVE_01_PORT,
                database: DB_NAME,
                username: DB_SLAVE_01_USERNAME,
                password: DB_SLAVE_01_PASSWORD,
              },
            ],
            write: {
              host: DB_MASTER_01_HOST,
              port: DB_MASTER_01_PORT,
              username: DB_MASTER_01_USERNAME,
              password: DB_MASTER_01_PASSWORD,
              database: DB_NAME,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
