// src/csv/csv.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CsvService } from './csv.service';
import { StudentsService } from 'src/students/students.service';

@Controller('csv')
export class CsvController {
  constructor(
    private readonly csvService: CsvService,
    private readonly studentsService: StudentsService,
  ) {}

  @Get('download')
  downloadCSV(@Res() res: Response): void {
    // Sample data (you can replace this with dynamic data from your DB)
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];

    // Generate the CSV content using the service
    const csvContent = this.csvService.generateCSV(data);

    // Set headers for the CSV file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');

    // Send the CSV content as a file
    res.send(csvContent);
  }

  @Get('total-books')
  async getTotalBooksCSV(
    @Query('_institute_uuid') institute_uuid: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.studentsService.adminDashboardCsvDownload(
        institute_uuid,
        'totalBooks',
      );

      // Send as downloadable CSV files (you can adjust this to zip if needed)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="total-books.csv"',
      );
      const csvContent = this.csvService.generateCSV(data);

      res.send(csvContent);
    } catch (error) {
      console.log(error)
      res.status(500).send('Failed to generate CSV');
    }
  }

  @Get('borrowed-books')
  async getBorrowedBooksCSV(
    @Query('_institute_uuid') institute_uuid: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.studentsService.adminDashboardCsvDownload(
        institute_uuid,
        'borrowedBooks',
      );

      // Send as downloadable CSV files (you can adjust this to zip if needed)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="total-books.csv"',
      );
      const csvContent = this.csvService.generateCSV(data);

      res.send(csvContent);
    } catch (error) {
      console.log(error)
      res.status(500).send('Failed to generate CSV');
    }
  }

  @Get('total-members')
  async getTotalMembersCSV(
    @Query('_institute_uuid') institute_uuid: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.studentsService.adminDashboardCsvDownload(
        institute_uuid,
        'totalmembers',
      );

      // Send as downloadable CSV files (you can adjust this to zip if needed)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="total-books.csv"',
      );
      const csvContent = this.csvService.generateCSV(data);

      res.send(csvContent);
    } catch (error) {
      console.log(error)
      res.status(500).send('Failed to generate CSV');
    }
  }

  @Get('new-bookss')
  async getNewBooksCSV(
    @Query('_institute_uuid') institute_uuid: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.studentsService.adminDashboardCsvDownload(
        institute_uuid,
        'newBooks',
      );

      // Send as downloadable CSV files (you can adjust this to zip if needed)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="total-books.csv"',
      );
      const csvContent = this.csvService.generateCSV(data);

      res.send(csvContent);
    } catch (error) {
      console.log(error)
      res.status(500).send('Failed to generate CSV');
    }
  }
}
