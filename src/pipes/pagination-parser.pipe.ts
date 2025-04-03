import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

export interface PaginationParserType {
  asc: [];
  dec: [];
  filter: { field: string; value: (string | number)[]; operator: string }[];
  search: { field: string; value: string }[];
  page: number;
  limit: number;
}

@Injectable()
export class ParsePaginationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return {
        asc: Array.isArray(value.asc)
          ? value.asc
          : value.asc
            ? [value.asc]
            : [],
        dec: Array.isArray(value.dec)
          ? value.dec
          : value.dec
            ? [value.dec]
            : [],
        filter: value.filter ? JSON.parse(value.filter) : [],
        search: value.search ? JSON.parse(value.search) : [],
        page: value._page ? parseInt(value._page, 10) : 1,
        limit: value._limit ? parseInt(value._limit, 10) : 10,
      };
    } catch (error) {
      throw new BadRequestException('Invalid query parameters');
    }
  }
}
