import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { MakeNullishOptional } from 'sequelize/types/utils';
import { DomainSchema } from '../../infrastructure/database/schema/domain.schema';
import { DNSRecordRepository } from './dnsrecord.repository';
import { RecordSchema } from './schema/record.schema';
import { EnumDnsRecordType } from './@enums';

describe('DNSRecordRepository', () => {
  let repository: DNSRecordRepository;
  let createdRecord: RecordSchema;

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
      providers: [DNSRecordRepository],
    })
      .setLogger(new Logger())
      .compile();

    repository = module.get<DNSRecordRepository>(DNSRecordRepository);
    await DomainSchema.create({ name: 'example.org', namespace: 'test' });
  });

  describe('create', () => {
    it('should create a DNS record', async () => {
      const data: MakeNullishOptional<RecordSchema> = {
        domainId: 1,
        name: 'samplesub.example.org',
        type: EnumDnsRecordType.A,
        content: '172.16.16.7',
        ttl: 60,
      };
      createdRecord = await repository.create(data);

      expect(createdRecord).toBeDefined();
      // Add more assertions as needed
    });
  });

  describe('findById', () => {
    it('should find a DNS record by ID', async () => {
      const foundRecord = await repository.findById(createdRecord.id);

      expect(foundRecord).toBeDefined();
      expect(foundRecord.id).toEqual(createdRecord.id);
      // Add more assertions as needed
    });

    // it('should throw NotFoundException if record is not found', async () => {
    //   await expect(repository.findById(999)).rejects.toThrowError(
    //     NotFoundException,
    //   );
    // });
  });

  describe('updateOneById', () => {
    it('should update a DNS record by ID', async () => {
      const updatedData = {
        // Provide data for updating the record
      };

      const updatedRecord = await repository.updateOneById(
        createdRecord.id,
        updatedData,
      );

      expect(updatedRecord).toBeDefined();
      expect(updatedRecord.id).toEqual(createdRecord.id);
      // Add more assertions as needed
    });

    // it('should throw NotFoundException if record is not found', async () => {
    //   await expect(repository.updateOneById(999, {})).rejects.toThrowError(
    //     NotFoundException,
    //   );
    // });
  });

  describe('deleteOneById', () => {
    it('should delete a DNS record by ID', async () => {
      const deletedRecord = await repository.deleteOneById(createdRecord.id);

      expect(deletedRecord).toBeDefined();
      expect(deletedRecord.id).toEqual(createdRecord.id);
      // Add more assertions as needed
    });

    // it('should throw NotFoundException if record is not found', async () => {
    //   await expect(repository.deleteOneById(999)).rejects.toThrowError(
    //     NotFoundException,
    //   );
    // });
  });

  describe('paginate', () => {
    it('should paginate DNS records', async () => {
      // Create additional records for pagination
      await repository.create({
        domainId: 1,
        name: 'samplesub.example.org',
        type: EnumDnsRecordType.A,
        content: '172.16.16.8',
        ttl: 60,
      });
      await repository.create({
        domainId: 1,
        name: 'samplesub.example.org',
        type: EnumDnsRecordType.A,
        content: '172.16.16.8',
        ttl: 60,
      });

      const paginationResult = await repository.paginate({ page: 1, limit: 2 });

      expect(paginationResult).toBeDefined();
      expect(paginationResult.rows.length).toBeGreaterThan(0);
      expect(paginationResult.totalRows).toBeGreaterThan(0); // Total records including the initial one
      // Add more assertions as needed
    });
  });

  describe('count', () => {
    it('should count DNS records', async () => {
      const count = await repository.count();

      expect(count).toBeGreaterThan(0); // Initial record
      // Add more assertions as needed
    });
  });
});
