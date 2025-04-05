import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { TokenAuthGuard } from 'src/guards/token.guard';
import { UserService } from './user.service';
import {
  PaginationParserType,
  ParsePaginationPipe,
} from 'src/pipes/pagination-parser.pipe';
import { ApiResponse } from 'src/students/students.controller';
import { TUser, User } from './user.entity';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import {
  TCreateUserDTO,
  createUserSchemaZod,
} from './zod-validation/create-user-zod';
import {
  TUserCredZodType,
  userCredZodSchema,
} from './zod-validation/user-cred-zod';
import { putBodyValidationPipe } from 'src/pipes/put-body-validation.pipe';
import {
  editUserSchemaZod,
  TEditUserDTO,
} from './zod-validation/edit-user-zod';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('all')
  // @UseGuards(TokenAuthGuard)
  async getAllUsers(
    @Query(new ParsePaginationPipe()) query: PaginationParserType,
  ): Promise<ApiResponse<TUser[]>> {
    try {
      const { data, pagination } = await this.userService.findAllUsers(query);
      return {
        success: true,
        data,
        pagination,
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

  @Get('details/:_user_id')
  // @UseGuards(TokenAuthGuard)
  async getUserById(@Param('_user_id') userId: string): Promise<TUser> {
    try {
      const data = await this.userService.findUserById(userId);
      return data;
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

  @Post('create')
  // @UseGuards(TokenAuthGuard)
  @UsePipes(new bodyValidationPipe(createUserSchemaZod))
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

  @Put('edit/:_user_id')
  // @UseGuards(TokenAuthGuard)
  @UsePipes(new putBodyValidationPipe(editUserSchemaZod))
  async editStudent(
    @Param('_user_id') userId: string,
    @Body() userPayload: TEditUserDTO,
  ): Promise<ApiResponse<TUser>> {
    try {
      const data = await this.userService.editUser(userId, userPayload);
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

  @Delete('delete/:_user_id')
  // @UseGuards(TokenAuthGuard)
  async deleteStudent(@Param('_user_id') userId: string) {
    try {
      return await this.userService.deleteUser(userId);
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
