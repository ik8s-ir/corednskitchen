import { IRepository } from './repository.interface';
import { Model, ModelCtor } from 'sequelize-typescript';

import { Attributes, FindOptions, WhereOptions } from 'sequelize/types';
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

  public async updateOne(
    where: WhereOptions<Attributes<TSchema>>,
    values: Partial<TSchema>,
  ): Promise<TSchema> {
    const dialect = this.entityModel.sequelize.getDialect();
    if (dialect === 'postgres') {
      const upd = await this.entityModel.update(values, {
        where,
        returning: true,
      });
      return upd[1][0];
    }
    const entity = await this.findOne({ where });
    await entity.update(values);
    return entity;
  }

  public async deleteOneById(id: Attributes<TSchema>): Promise<TSchema> {
    const entity = await this.entityModel.findByPk(id);
    await entity.destroy();
    return entity;
  }

  public async deleteOne(
    where: WhereOptions<Attributes<TSchema>>,
  ): Promise<TSchema> {
    const entity = await this.entityModel.findOne({ where });
    await entity.destroy();
    console.log(entity);
    return entity;
  }

  public async paginate(options?: {
    where?: WhereOptions<Attributes<TSchema>>;
    page?: number;
    offset?: number;
    limit?: number;
  }) {
    const limit = options?.limit || 50;
    const page = Math.max(options?.page - 1, 0) || 0;
    const offset = options?.offset || page * limit || 0;
    const result = await this.entityModel.findAndCountAll({
      where: options?.where || {},
      offset,
      limit,
      include: { all: true },
    });

    return {
      rows: result.rows,
      totalRows: result.count,
      offset,
      limit,
      page: page || 1,
      totalPages: Math.ceil(result.count / limit),
    };
  }
  public count(options?: FindOptions<Attributes<TSchema>>): Promise<number> {
    return this.entityModel.count(options);
  }
}
