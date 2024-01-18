import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { DomainStatus } from '../../../domain/@enums/domain-status.enum';

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
}
