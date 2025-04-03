import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TCreateNotesDTO } from './dto/create-notes.dto';
import {
  insertQueryHelper,
  updateQueryHelper,
} from 'src/misc/custom-query-helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notes } from './entities/notes.entity';
import { TUpdateNotesDTO } from './dto/update-notes.dto';

interface Data<T> {
  data: T;
  pagination: null;
}

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Notes)
    private notesRepository: Repository<Notes>,
  ) {}

  async create(
    user: any,
    createNotesDto: TCreateNotesDTO,
  ): Promise<Data<Notes>> {
    try {
      console.log(user)
      let queryData = insertQueryHelper(
        { ...createNotesDto, student_uuid: user.student_uuid },
        [],
      );
      const result: Notes[] = await this.notesRepository.query(
        `
      INSERT INTO notes (${queryData.queryCol}) values (${queryData.queryArg}) RETURNING *`,
        queryData.values,
      );
      return { data: result[0], pagination: null };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllNotesForStudent(user: any): Promise<Data<Notes[]>> {
    try {
      const data: Notes[] = await this.notesRepository.query(
        `SELECT * FROM notes WHERE is_archived = false AND (is_approved = true OR student_uuid = $1)`,
        [user.student_uuid],
      );
      return {
        data,
        pagination: null,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllAdmin(): Promise<Data<Notes[]>> {
    try {
      const result: Notes[] = await this.notesRepository.query(
        `SELECT * FROM notes WHERE is_archived = false`,
      );
      return {
        data: result,
        pagination: null,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async approveByAdmin(notes_uuid: string): Promise<Data<Notes>> {
    try {
      const result: Notes[] = await this.notesRepository.query(
        `UPDATE notes SET is_approved = true WHERE notes_uuid = $1 RETURNING *`,
        [notes_uuid],
      );
      return {
        data: result[0],
        pagination: null,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async rejectByAdmin(notes_uuid: string): Promise<Data<Notes>> {
    try {
      const result: Notes[] = await this.notesRepository.query(
        `UPDATE notes SET is_archived = true WHERE notes_uuid = $1 RETURNING *`,
        [notes_uuid],
      );
      return {
        data: result[0],
        pagination: null,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    notes_uuid: string,
    updateNotesDto: TUpdateNotesDTO,
  ): Promise<Data<Notes>> {
    try {
      let queryData = updateQueryHelper<TUpdateNotesDTO>(updateNotesDto, []);
      console.log(queryData);
      const result: Notes[] = await this.notesRepository.query(
        `UPDATE notes SET ${queryData.queryCol} WHERE notes_uuid = $${queryData.values.length + 1} AND is_archived = false RETURNING *`,
        [...queryData.values, notes_uuid],
      );
      if (!result.length) {
        throw new HttpException(
          'Student not found after update',
          HttpStatus.NOT_FOUND,
        );
      }
      return { data: result[0], pagination: null };
    } catch (error) {
      throw error;
    }
  }
}
