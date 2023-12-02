import { Attributes, FindOptions, WhereOptions } from 'sequelize';
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
  deleteOneById(id: number | string): Promise<TSchema>;
  paginate(options?: {
    where?: WhereOptions<Attributes<TSchema>>;
    page?: number;
    offset?: number;
    limit?: number;
  }): Promise<{
    rows: TSchema[];
    totalRows: number;
    offset: number;
    limit: number;
    page: number;
    totalPages: number;
  }>;
  count(options?: FindOptions<Attributes<TSchema>>): Promise<number>;
}
