import { Attributes, FindOptions } from 'sequelize';
import { Model } from 'sequelize-typescript';
import { SortDirection } from './sort-direction.enum';

export enum FilterOperator {
  EQ = 'eq',
  NE = 'ne',
  LIKE = 'like',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  IN = 'in',
}

export interface IFilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface IFilter {
  or?: (IFilterCondition | IFilter)[];
  and?: (IFilterCondition | IFilter)[];
}
export interface IPaginateOptions {
  where?: IFilter;
  offset?: number;
  page?: number;
  limit?: number;
  sort?: ISort[];
}

export interface ISort {
  field: string;
  direction: SortDirection;
}
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
  paginate(options?: IPaginateOptions): Promise<{
    rows: TSchema[];
    totalRows: number;
    offset: number;
    limit: number;
    page: number;
    totalPages: number;
  }>;
  count(options?: FindOptions<Attributes<TSchema>>): Promise<number>;
}
