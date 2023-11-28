import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

@Table({ paranoid: false, modelName: 'record' })
export class RecordSchema extends Model {
  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  domain_id?: number;

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

  @Column({
    type: DataType.INTEGER,
  })
  prio?: number;

  @Column({
    type: DataType.INTEGER,
  })
  change_date?: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  disabled?: boolean;
}
