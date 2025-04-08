//Type returned by the worker
export type TInsertResult = {
  duplicate_data_pl: number;
  duplicate_date_db: number;
  unique_data: number;
  inserted_data: number;
};
