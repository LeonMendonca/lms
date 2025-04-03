import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Query, UseGuards, UsePipes } from '@nestjs/common';
import { StudentAuthGuard } from 'src/students/student.guard';
import { UserService } from './user.service';
import { PaginationParserType, ParsePaginationPipe } from 'src/pipes/pagination-parser.pipe';
import { ApiResponse } from 'src/students/students.controller';
import { TUser, User } from './user.entity';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { TCreateUserDTO, UserSchemaZod } from './zod-validation/create-user-zod';
import { TUserCredZodType, userCredZodSchema } from './zod-validation/user-cred-zod';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('all')
    //@UseGuards(StudentAuthGuard)
    async getAllUsers(
      @Query(new ParsePaginationPipe()) query: PaginationParserType,
    ): Promise<ApiResponse<TUser[]>> {
      const { data, pagination } = await this.userService.findAllUsers(query);
      return {
        success: true,
        data,
        pagination,
      };
    }

  @Post('create')
  @UsePipes(new bodyValidationPipe(UserSchemaZod))
  async createStudent(
    @Body() userPayload: TCreateUserDTO,
  ): Promise<ApiResponse<TUser>> {
    try {
      const data: TUser = await this.userService.createUser(userPayload);
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

  @Post('login')
  @UsePipes(new bodyValidationPipe(userCredZodSchema))
  async studentLogin(@Body() studentCredPayload: TUserCredZodType) {
    try {
      return await this.userService.userLogin(studentCredPayload);
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }
}
