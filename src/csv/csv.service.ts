import { Injectable } from '@nestjs/common';

@Injectable()
export class CsvService {
  generateCSV(data: any[]): string {
    if (data.length === 0) {
      return '';
    }
    const headers = Object.keys(data[0]);
    let csvContent = headers.join(',') + '\n';
    data.forEach((row) => {
      const values = headers.map((header) => {
        let value = row[header] !== null ? row[header].toString() : '';
        value = value.replace(/,/g, '\uFF0C'); 
        if (value.includes(',') || value.includes('"')) {
          value = `"${value.replace(/"/g, '""')}"`; 
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });
    return csvContent;
  }
}
