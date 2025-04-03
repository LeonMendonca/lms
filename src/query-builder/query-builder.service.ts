import { Injectable } from '@nestjs/common';

@Injectable()
export class QueryBuilderService {
  buildWhereClauses(
    filter: { field: string; value: (string | number)[]; operator: string }[],
    search: { field: string; value: string }[],
    params: (string | number)[]
  ): string {
    const clauses = ['is_archived = false'];

    search.forEach((s) => {
      clauses.push(`${s.field} ILIKE $${params.length + 1}`);
      params.push(`%${s.value}%`);
    });

    filter.forEach((f) => {
      const operator = f.operator || '=';
      if (operator === 'IN' && Array.isArray(f.value) && f.value.length > 0) {
        const placeholders = f.value.map(() => `$${params.length + 1}`).join(', ');
        clauses.push(`${f.field} IN (${placeholders})`);
        params.push(...f.value);
      } 
    //   else {
    //     clauses.push(`${f.field} ${operator} $${params.length + 1}`);
    //     params.push(f.value);
    //   }
    });

    return clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  }
  
  buildOrderByClauses(asc: string[], dec: string[]): string {
    if (asc.length === 0 && dec.length === 0) return 'ORDER BY updated_at DESC';

    const sortByFields = [
      ...asc.map((field) => `${field} ASC`),
      ...dec.map((field) => `${field} DESC`),
    ];

    return `ORDER BY ${sortByFields.join(', ')}`;
  }
}
