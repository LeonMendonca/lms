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
import { TokenAuthGuard } from '../../utils/guards/token.guard';
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
  ) {}

  @Get()
  @UseGuards(TokenAuthGuard)
  async findStudentNotifications(
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiResponse<StudentNotification[]>> {
    const { data, pagination } =
      await this.studentNotifyService.getStudentNotifications(
        request.user.studentUuid,
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
