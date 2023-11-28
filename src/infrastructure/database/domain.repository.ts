import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ModelCtor } from 'sequelize-typescript';

import { BaseRepository } from './base.repository';
import { DomainSchema } from './schema/domain.schema';

@Injectable()
export class DomainRepository extends BaseRepository<DomainSchema> {
  constructor(
    @InjectModel(DomainSchema)
    domainSchema: ModelCtor<DomainSchema>,
  ) {
    super(domainSchema);
  }
}
