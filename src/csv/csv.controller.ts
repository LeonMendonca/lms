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
        'attachment; filename="borrowed-books.csv"',
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
        'attachment; filename="total-members.csv"',
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
        'attachment; filename="new-books.csv"',
      );
      const csvContent = this.csvService.generateCSV(data);

      res.send(csvContent);
    } catch (error) {
      console.log(error)
      res.status(500).send('Failed to generate CSV');
    }
  }

  @Get('today-issues')
  async todayIssuesCSV(
    @Query('_institute_uuid') institute_uuid: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.studentsService.adminDashboardCsvDownload(
        institute_uuid,
        'todayIssues',
      );

      // Send as downloadable CSV files (you can adjust this to zip if needed)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="today-issues.csv"',
      );
      const csvContent = this.csvService.generateCSV(data);

      res.send(csvContent);
    } catch (error) {
      console.log(error)
      res.status(500).send('Failed to generate CSV');
    }
  }

  @Get('ntoday-returned')
  async todayReturnedCSV(
    @Query('_institute_uuid') institute_uuid: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.studentsService.adminDashboardCsvDownload(
        institute_uuid,
        'todayReturned',
      );

      // Send as downloadable CSV files (you can adjust this to zip if needed)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="today-returned.csv"',
      );
      const csvContent = this.csvService.generateCSV(data);

      res.send(csvContent);
    } catch (error) {
      console.log(error)
      res.status(500).send('Failed to generate CSV');
    }
  }

  @Get('overdue')
  async overduesCSV(
    @Query('_institute_uuid') institute_uuid: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.studentsService.adminDashboardCsvDownload(
        institute_uuid,
        'overdue',
      );

      // Send as downloadable CSV files (you can adjust this to zip if needed)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="overdue.csv"',
      );
      const csvContent = this.csvService.generateCSV(data);

      res.send(csvContent);
    } catch (error) {
      console.log(error)
      res.status(500).send('Failed to generate CSV');
    }
  }
}
