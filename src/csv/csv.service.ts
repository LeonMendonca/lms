// src/csv/csv.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class CsvService {
  generateCSV(data: any[]): string {
    // If the data array is empty, return an empty CSV.
    if (data.length === 0) {
      return '';
    }

    // Get headers (keys of the first object in the array)
    const headers = Object.keys(data[0]);

    // Create CSV rows starting with the headers
    let csvContent = headers.join(',') + '\n';

    // Loop through data and convert each item to CSV row
    data.forEach((row) => {
      const values = headers.map((header) => {
        let value = row[header] !== null ? row[header].toString() : '';

        // Replace any commas in the data with a symbol that looks like a comma (e.g., full-width comma)
        value = value.replace(/,/g, '\uFF0C'); // Using full-width comma (You can change it to any symbol)

        // Enclose values in quotes if they contain a comma or quotes
        if (value.includes(',') || value.includes('"')) {
          value = `"${value.replace(/"/g, '""')}"`; // Escape internal quotes by replacing with two double quotes
        }

        return value;
      });

      csvContent += values.join(',') + '\n';
    });

    return csvContent;
  }
}
