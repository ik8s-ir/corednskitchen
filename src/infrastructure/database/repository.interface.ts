import { Attributes, FindOptions } from 'sequelize';
import { Model } from 'sequelize-typescript';

export interface IRepository<TSchema extends Model> {
  create(data: Partial<TSchema>): Promise<TSchema>;
  findById(
    id: number | string,
    options?: FindOptions<Attributes<TSchema>>,
  ): Promise<TSchema>;
  findOne(options?: FindOptions<Attributes<TSchema>>): Promise<TSchema>;
  updateOneById(
    id: Attributes<TSchema>,
    values: Partial<TSchema>,
  ): Promise<TSchema>;
  count(options?: FindOptions<Attributes<TSchema>>): Promise<number>;
}
