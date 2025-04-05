import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentNotifyDto } from './create-student-notify.dto';

export class UpdateStudentNotifyDto extends PartialType(CreateStudentNotifyDto) {}
