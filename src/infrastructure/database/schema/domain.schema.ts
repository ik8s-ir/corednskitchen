import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { DomainStatus } from '../../../domain/@enums/domain-status.enum';
import { RecordSchema } from './record.schema';
import { MakeNullishOptional } from 'sequelize/types/utils';

@Table({ paranoid: false, modelName: 'domain', timestamps: false })
export class DomainSchema extends Model {
  @Column({
    type: DataType.STRING,
    unique: false,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    unique: false,
  })
  namespace?: string;

  @Column({
    type: DataType.ENUM(...Object.values(DomainStatus)),
    defaultValue: DomainStatus.PENDING,
  })
  status: DomainStatus;

  @HasMany(() => RecordSchema, 'domainId')
  records?: MakeNullishOptional<RecordSchema>[];
}
