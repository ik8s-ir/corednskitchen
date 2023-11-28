import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

@Table({ paranoid: false, modelName: 'domain' })
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
  master?: string;

  @Column({
    type: DataType.DOUBLE,
    unique: false,
  })
  last_check?: number;

  @Column({
    type: DataType.STRING,
    unique: false,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.DOUBLE,
    unique: false,
  })
  notified_serial?: number;

  @Column({
    type: DataType.STRING,
    unique: false,
  })
  account?: string;
}
