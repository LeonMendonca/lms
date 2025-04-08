import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  PaginationParserType,
  ParsePaginationPipe,
} from 'src/pipes/pagination-parser.pipe';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { putBodyValidationPipe } from 'src/pipes/put-body-validation.pipe';
import { createUserSchemaZod, TCreateUserDTO } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { editUserSchemaZod, TEditUserDTO } from './dto/update-user.dto';
import { loginUserSchemaZod, TLoginUserDTO } from './dto/login-user.dto';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination: {} | null;
  error?: string;
}

interface AuthenticatedRequest extends Request {
  user?: any; // Ideally, replace `any` with your `User` type
}

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @UsePipes(new bodyValidationPipe(createUserSchemaZod))
  async createUser(
    @Body() userPayload: TCreateUserDTO,
  ): Promise<ApiResponse<User>> {
    try {
      const { data } = await this.userService.createUser(userPayload);
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

  @Get(':user_id')
  async getUserById(
    @Param('user_id') userId: string,
  ): Promise<ApiResponse<User>> {
    try {
      const { data } = await this.userService.findUserById(userId);
      return {
        data,
        pagination: null,
        success: true,
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

  @Get()
  async getAllUsers(
    @Query(new ParsePaginationPipe()) query: PaginationParserType,
  ): Promise<ApiResponse<User[]>> {
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

  @Delete(':user_id')
  async deleteUser(
    @Param('_user_id') userId: string,
  ): Promise<ApiResponse<{}>> {
    try {
      await this.userService.findUserById(userId);
      return {
        pagination: null,
        success: true,
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

  @Put(':user_id')
  @UsePipes(new putBodyValidationPipe(editUserSchemaZod))
  async editUser(
    @Param('user_id') userId: string,
    @Body() userPayload: TEditUserDTO,
  ): Promise<ApiResponse<User>> {
    try {
      const { data } = await this.userService.editUser(userId, userPayload);
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
  @UsePipes(new bodyValidationPipe(loginUserSchemaZod))
  async userLogin(
    @Body() studentCredPayload: TLoginUserDTO,
  ): Promise<ApiResponse<User>> {
    try {
      const { data } = await this.userService.userLogin(studentCredPayload);
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
      }
      throw error;
    }
  }
}
