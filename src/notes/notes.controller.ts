import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { TCreateNotesDTO } from './dto/create-notes.dto';
import { TUpdateNotesDTO } from './dto/update-notes.dto';
import { TokenAuthGuard } from 'src/guards/token.guard';
import { StudentsService } from 'src/students/students.service';
import { Notes, TNotes } from './entities/notes.entity';
import { StudentNotifyService } from 'src/student-notify/student-notify.service';
import { NotificationType } from 'src/student-notify/entities/student-notify.entity';

interface AuthenticatedRequest extends Request {
  user?: any; // Ideally, replace `any` with your `User` type
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination: {} | null;
  error?: string;
}

@Controller('notes')
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly studentService: StudentsService,
    private readonly notifyService: StudentNotifyService,
  ) {}

  @Post()
  @UseGuards(TokenAuthGuard)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createNotesDto: TCreateNotesDTO,
  ): Promise<ApiResponse<Notes>> {
    try {
      console.log(req.user);
      const student = await this.studentService.findStudentBy({
        student_id: req.user.student_id,
      });
      if (!student) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }
      if (!createNotesDto.author.includes(student.student_name))
        createNotesDto.author.push(student.student_name);
      const { data } = await this.notesService.create(student, createNotesDto);
      const notification = await this.notifyService.createNotification(
        student.student_uuid,
        NotificationType.NOTES_REQUESTED,
        {
          courseName: data.noteTitle,
        },
      );
      return {
        success: true,
        data,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw error;
      }
    }
  }

  @Get('student')
  @UseGuards(TokenAuthGuard)
  async findAllStudent(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<Notes[]>> {
    try {
      const student = await this.studentService.findStudentBy({
        student_id: req.user.student_id,
      });
      const { data } = await this.notesService.findAllNotesForStudent(student);
      return {
        success: true,
        data,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw error;
      }
    }
  }

  @Get('admin')
  async findAllAdmin(): Promise<ApiResponse<Notes[]>> {
    try {
      const { data } = await this.notesService.findAllAdmin();
      return {
        success: true,
        data,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw error;
      }
    }
  }

  @Patch()
  async approveNotes(
    @Query('_notes_uuid') notes_uuid: string,
  ): Promise<ApiResponse<TNotes>> {
    try {
      const { data } = await this.notesService.approveByAdmin(notes_uuid);
      const student = await this.studentService.findStudentBy({
        student_uuid: data[0].student_uuid,
      });
      if (!student) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }
      await this.notifyService.createNotification(
        student.student_uuid,
        NotificationType.NOTES_APPROVED,
        {
          courseName: data.note_title,
        },
      )
      return {
        success: true,
        data,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw error;
      }
    }
  }

  @Delete()
  async deleteNotes(
    @Query('_notes_uuid') notes_uuid: string,
  ): Promise<ApiResponse<TNotes>> {
    try {
      const { data } = await this.notesService.rejectByAdmin(notes_uuid);
      const student = await this.studentService.findStudentBy({
        student_uuid: data.student_uuid,
      });
      await this.notifyService.createNotification(
        student!.student_uuid,
        NotificationType.NOTES_APPROVED,
        {
          courseName: data.note_title,
        },
      )
      return {
        success: true,
        data,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw error;
      }
    }
  }

  @Patch(':notes_uuid')
  async update(
    @Param('notes_uuid') notes_uuid: string,
    @Body() updateNotesDto: TUpdateNotesDTO,
  ): Promise<ApiResponse<Notes>> {
    try {
      console.log({notes_uuid, updateNotesDto})
      const review = await this.notesService.update(notes_uuid, updateNotesDto);
      return {
        success: true,
        data: review.data,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw error;
      }
    }
  }
}
