import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ModelCtor } from 'sequelize-typescript';

import { BaseRepository } from './base.repository';
import { RecordSchema } from './schema/record.schema';

@Injectable()
export class DNSRecordRepository extends BaseRepository<RecordSchema> {
  constructor(
    @InjectModel(RecordSchema)
    RecordSchema: ModelCtor<RecordSchema>,
  ) {
    super(RecordSchema);
  }
}
