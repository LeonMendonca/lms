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
import { TokenAuthGuard } from '../../utils/guards/token.guard';
import { Notes } from './entities/notes.entity';
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
    private readonly notifyService: StudentNotifyService,
  ) {}

  @Post()
  @UseGuards(TokenAuthGuard)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createNotesDto: TCreateNotesDTO,
  ): Promise<ApiResponse<Notes>> {
    try {
      const { data } = await this.notesService.create(
        req.user.studentUuid,
        createNotesDto,
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
  async findAllNotesForStudent(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<Notes[]>> {
    try {
      const { data } = await this.notesService.findAllNotesForStudent(
        req.user.studentUuid,
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
    @Query('_notes_uuid') notesUuid: string,
  ): Promise<ApiResponse<Notes>> {
    try {
      const { data } = await this.notesService.approveByAdmin(notesUuid);
      await this.notifyService.createNotification(
        data.studentUuid,
        NotificationType.NOTES_APPROVED,
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

  @Delete()
  async deleteNotes(
    @Query('_notes_uuid') notesUuid: string,
  ): Promise<ApiResponse<Notes>> {
    try {
      const { data } = await this.notesService.rejectByAdmin(notesUuid);
      await this.notifyService.createNotification(
        data.studentUuid,
        NotificationType.NOTES_APPROVED,
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

  @Patch(':notes_uuid')
  async update(
    @Param('notes_uuid') notes_uuid: string,
    @Body() updateNotesDto: TUpdateNotesDTO,
  ): Promise<ApiResponse<Notes>> {
    try {
      const { data } = await this.notesService.update(
        notes_uuid,
        updateNotesDto,
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
}
