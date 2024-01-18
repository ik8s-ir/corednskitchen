import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { DomainSchema } from './domain.schema';
import { NonAttribute } from 'sequelize';

@Table({ paranoid: false, modelName: 'record' })
export class RecordSchema extends Model {
  @ForeignKey(() => DomainSchema)
  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
  })
  domainId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  content?: string;

  @Column({
    type: DataType.DOUBLE,
  })
  ttl?: number;

  @BelongsTo(() => DomainSchema, 'domainId')
  domain: NonAttribute<DomainSchema>;
}
