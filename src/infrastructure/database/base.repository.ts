import { IRepository } from './repository.interface';
import { Model, ModelCtor } from 'sequelize-typescript';

import { Attributes, FindOptions } from 'sequelize/types';
import { MakeNullishOptional } from 'sequelize/types/utils';

export abstract class BaseRepository<TSchema extends Model>
  implements IRepository<TSchema>
{
  constructor(protected readonly entityModel: ModelCtor<TSchema>) {}

  public create(data: MakeNullishOptional<TSchema>): Promise<TSchema> {
    return this.entityModel.create(data);
  }

  public async findById(
    id: number | string,
    options?: FindOptions<Attributes<TSchema>>,
  ): Promise<TSchema> {
    return this.entityModel.findByPk(id, options);
  }

  public findOne(options?: FindOptions<Attributes<TSchema>>): Promise<TSchema> {
    return this.entityModel.findOne(options);
  }

  public async updateOneById(
    id: Attributes<TSchema>,
    values: Partial<TSchema>,
  ): Promise<TSchema> {
    const upd = await this.entityModel.update(values, {
      where: {
        id,
      },
      returning: true,
    });
    if (this.entityModel.sequelize.getDialect() !== 'postgres')
      return await this.findById(values.id || id);
    return upd[1][0];
  }

  public count(options?: FindOptions<Attributes<TSchema>>): Promise<number> {
    return this.entityModel.count(options);
  }
}
