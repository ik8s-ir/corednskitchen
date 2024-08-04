import { Model, ModelCtor } from 'sequelize-typescript';
import {
  FilterOperator,
  IFilter,
  IFilterCondition,
  IPaginateOptions,
  IRepository,
} from './repository.interface';

import { Op } from 'sequelize';
import { Attributes, FindOptions, WhereOptions } from 'sequelize/types';
import { MakeNullishOptional } from 'sequelize/types/utils';

export abstract class BaseRepository<TSchema extends Model>
  implements IRepository<TSchema>
{
  constructor(protected readonly entityModel: ModelCtor<TSchema>) {}

  public create(data: MakeNullishOptional<TSchema>): Promise<TSchema> {
    return this.entityModel.create(data);
  }

  public async findById(id: number | string): Promise<TSchema> {
    return this.entityModel.findByPk(id, { plain: true, raw: true });
  }

  public findOne(options?: { where: IFilter }): Promise<TSchema> {
    const where = options.where ? this.buildWhereClause(options.where) : {};
    return this.entityModel.findOne({ where });
  }

  findAll(options?: FindOptions<Attributes<TSchema>>) {
    return this.entityModel.findAll(options);
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
    where: IFilter,
    values: Partial<TSchema>,
  ): Promise<TSchema> {
    const dialect = this.entityModel.sequelize.getDialect();
    if (dialect === 'postgres') {
      const upd = await this.entityModel.update(values, {
        where: where ? this.buildWhereClause(where) : {},
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

  public async delete(options?: { where: IFilter }): Promise<number> {
    const where = options.where ? this.buildWhereClause(options.where) : {};
    return this.entityModel.destroy({ where });
  }

  public async deleteOne(
    where: WhereOptions<Attributes<TSchema>>,
  ): Promise<TSchema> {
    const entity = await this.entityModel.findOne({ where });
    await entity.destroy();
    return entity;
  }

  private buildWhereClause(filter?: IFilter): any {
    if (!filter) return {};
    const where = {};
    if (filter.or) {
      where[Op.or] = filter.or.map((cond) => this.buildConditionOrClause(cond));
    }
    if (filter.and) {
      where[Op.and] = filter.and.map((cond) =>
        this.buildConditionOrClause(cond),
      );
    }
    return where;
  }

  private buildConditionOrClause(cond: IFilterCondition | IFilter): any {
    if ('field' in cond && 'operator' in cond) {
      return this.buildCondition(cond);
    } else {
      return this.buildWhereClause(cond);
    }
  }

  private buildCondition(condition: IFilterCondition): any {
    switch (condition.operator) {
      case FilterOperator.EQ:
        return { [condition.field]: { [Op.eq]: condition.value } };
      case FilterOperator.NE:
        return { [condition.field]: { [Op.ne]: condition.value } };
      case FilterOperator.LIKE:
        return { [condition.field]: { [Op.like]: condition.value } };
      case FilterOperator.GT:
        return { [condition.field]: { [Op.gt]: condition.value } };
      case FilterOperator.LT:
        return { [condition.field]: { [Op.lt]: condition.value } };
      case FilterOperator.GTE:
        return { [condition.field]: { [Op.gte]: condition.value } };
      case FilterOperator.LTE:
        return { [condition.field]: { [Op.lte]: condition.value } };
      case FilterOperator.IN:
        return { [condition.field]: { [Op.in]: condition.value } };
      default:
        return {};
    }
  }

  public async paginate(options?: IPaginateOptions) {
    const { sort } = options;
    const limit = options?.limit || 50;
    const page = Math.max(options?.page - 1, 0) || 0;
    const offset = options?.offset || page * limit || 0;
    const where = options.where ? this.buildWhereClause(options.where) : {};

    const finalOptions: FindOptions<Attributes<TSchema>> = {
      where,
      offset,
      limit,
      include: { all: true },
    };
    sort && (finalOptions.order = sort.map((s) => [s.field, s.direction]));
    const result = await this.entityModel.findAndCountAll(finalOptions);

    return {
      rows: result.rows,
      totalRows: result.count,
      offset,
      limit,
      page: page + 1 || 1,
      totalPages: Math.ceil(result.count / limit),
    };
  }
  public count(options?: FindOptions<Attributes<TSchema>>): Promise<number> {
    return this.entityModel.count(options);
  }
}
