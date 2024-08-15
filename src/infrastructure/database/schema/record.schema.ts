import {
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { DomainSchema } from './domain.schema';
import { NonAttribute } from 'sequelize';
import { EnumDnsRecordType } from '../@enums';
import { ConflictException } from '@nestjs/common';

@Table({
  paranoid: false,
  modelName: 'record',
})
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
    type: DataType.ENUM(...Object.values(EnumDnsRecordType)),
    allowNull: false,
  })
  type: EnumDnsRecordType;

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

  @BeforeCreate
  @BeforeUpdate
  static async validateUniqueRecord(instance: RecordSchema) {
    const { name, type, domainId } = instance;

    // Check if there's a CNAME record for the same name
    if (
      type !== EnumDnsRecordType.CNAME &&
      (type === EnumDnsRecordType.A || type === EnumDnsRecordType.AAAA)
    ) {
      const cnameCount = await RecordSchema.count({
        where: {
          name,
          domainId,
          type: 'CNAME',
        },
      });
      if (cnameCount > 0) {
        throw new ConflictException(
          `Cannot add ${type} record for ${name} because a CNAME record already exists.`,
        );
      }
    }

    // Check if there's an A or AAAA record for the same name
    if (type === EnumDnsRecordType.CNAME) {
      const cnameOraOrAaaaCount = await RecordSchema.count({
        where: {
          name,
          domainId,
          type: [
            EnumDnsRecordType.A,
            EnumDnsRecordType.AAAA,
            EnumDnsRecordType.CNAME,
          ],
        },
      });
      if (cnameOraOrAaaaCount > 0) {
        throw new ConflictException(
          `Cannot add CNAME record for ${name} because a CNAME or A or AAAA record already exists.`,
        );
      }
    }
  }
}
