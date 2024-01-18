import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';
import { SwaggerTheme } from 'swagger-themes';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const { DEBUG } = process.env;

  const loggerTransports: winston.transport[] = [
    new winston.transports.Console({
      level:
        DEBUG.toLowerCase() == 'true' || parseInt(DEBUG) === 1
          ? 'debug'
          : 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('restcoredns', {
          prettyPrint: true,
          colors: true,
        }),
      ),
    }),
  ];

  const logger = WinstonModule.createLogger({ transports: loggerTransports });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      https: process.env.TLS
        ? {
            ca: process.env.TLSCA,
            cert: process.env.TLSCERT,
            key: process.env.TLSKEY,
          }
        : undefined,
    }),
    {
      logger,
    },
  );

  app.setGlobalPrefix('/apis/dns.ik8s.ir');
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

  const theme = new SwaggerTheme('v3');
  const apiEndpoints = process.env.API_URI.split(',');
  const config = new DocumentBuilder()
    .setTitle('RESTCOREDNS')
    .setDescription('Project iK8s, COREDNS REST API.')
    .addServer(apiEndpoints[0])
    .addServer(apiEndpoints[1])
    .addServer(apiEndpoints[2])
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apidoc', app, document, {
    explorer: true,
    customCss: `${theme.getBuffer('material')}
    .topbar-wrapper img {content:url(\'https://cdn-icons-png.flaticon.com/512/2913/2913133.png\'); width:auto; height:80px;}
    `,
    customSiteTitle: 'ik8s app documentation',
  });

  app.enableCors({ origin: '*' });

  await app.listen(+process.env.HTTP_PORT, '0.0.0.0', (err) => {
    err
      ? Logger.error(err)
      : Logger.debug(`REST API LISTENING ON: ${process.env.HTTP_PORT}`);
  });
}

bootstrap();
