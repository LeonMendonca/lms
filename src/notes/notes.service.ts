import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TCreateNotesDTO } from './dto/create-notes.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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
    studentUuid: string,
    createNotesDto: TCreateNotesDTO,
  ): Promise<Data<Notes>> {
    try {
      const note = this.notesRepository.create({
        ...createNotesDto,
        studentUuid,
      });
      const savedNote = await this.notesRepository.save(note);
      return { data: savedNote, pagination: null };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllNotesForStudent(studentUuid: string): Promise<Data<Notes[]>> {
    try {
      const data = await this.notesRepository
        .createQueryBuilder('notes')
        .where('notes.isArchived = false')
        .andWhere(
          new Brackets((qb) => {
            qb.where('notes.isApproved = true').orWhere(
              'notes.studentUuid = :studentUuid',
            );
          }),
        )
        .setParameter('studentUuid', studentUuid)
        .getMany();

      return {
        data,
        pagination: null,
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllAdmin(): Promise<Data<Notes[]>> {
    try {
      const result = await this.notesRepository
        .createQueryBuilder('notes')
        .where('notes.isArchived = false')
        .getMany();
      return {
        data: result,
        pagination: null,
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async approveByAdmin(notesUuid: string): Promise<Data<Notes>> {
    try {
      const result = await this.notesRepository
        .createQueryBuilder('notes')
        .update(Notes)
        .set({ isApproved: true })
        .where('notesUuid = :uuid', { uuid: notesUuid })
        .returning('*')
        .execute();

      return {
        data: result.raw[0],
        pagination: null,
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async rejectByAdmin(notesUuid: string): Promise<Data<Notes>> {
    try {
      const result = await this.notesRepository
        .createQueryBuilder('notes')
        .update()
        .set({ isArchived: true })
        .where('notesUuid = :uuid', { uuid: notesUuid })
        .returning('*')
        .execute();

      return {
        data: result.raw[0],
        pagination: null,
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    notesUuid: string,
    updateNotesDto: TUpdateNotesDTO,
  ): Promise<Data<Notes>> {
    try {
      const result = await this.notesRepository
        .createQueryBuilder('notes')
        .update()
        .set(updateNotesDto)
        .where('notesUuid = :notesUuid', { notesUuid })
        .andWhere('isArchived = false')
        .returning('*')
        .execute();

      if (!result.raw.length) {
        throw new HttpException(
          'Student not found after update',
          HttpStatus.NOT_FOUND,
        );
      }

      return { data: result.raw[0], pagination: null };
    } catch (error) {
      throw error;
    }
  }
}
