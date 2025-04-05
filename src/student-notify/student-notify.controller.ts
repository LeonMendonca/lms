import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StudentNotifyService } from './student-notify.service';
import { TokenAuthGuard } from 'src/guards/token.guard';
import { StudentsService } from 'src/students/students.service';
import { StudentNotification } from './entities/student-notify.entity';

interface AuthenticatedRequest extends Request {
  user?: any; // Ideally, replace `any` with your `User` type
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination: {} | null;
  error?: string;
}

@Controller('student-notify')
export class StudentNotifyController {
  constructor(
    private readonly studentNotifyService: StudentNotifyService,
    private readonly studentService: StudentsService,
  ) {}

  @Get()
  @UseGuards(TokenAuthGuard)
  async findStudentNotifications(
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiResponse<StudentNotification[]>> {
    const user = request.user;
    const student = await this.studentService.findStudentBy({
      student_id: user.student_id,
    });
    if (!student) {
      throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
    }
    const { data, pagination } =
      await this.studentNotifyService.getStudentNotifications(
        student.student_uuid,
      );
    return {
      pagination,
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string) {
    return await this.studentNotifyService.markAsRead(id);
  }
}
