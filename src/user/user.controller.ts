import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { createUserSchemaZod, TCreateUserDTO } from './dto/create-user.dto';
import { loginUserSchemaZod, TLoginUserDTO } from './dto/login-user.dto';
import { UserAccessToken } from './entity/user-access.entity';
import { EmployeeInput } from './types/user-response.types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination: {} | null;
  error?: string;
  meta?: any;
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
    @Headers('authorization') authorization: string,
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const { data } = await this.userService.createUser(userPayload, authorization);
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
  ): Promise<ApiResponse<UserAccessToken>> {
    try {
      const { data, meta } =
        await this.userService.userLogin(studentCredPayload);
      return {
        meta,
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

  @Get('getAllEmployees')
  @UsePipes(new bodyValidationPipe(loginUserSchemaZod))
  async getAllEmployees(
    @Query("instituteUuid") instituteUuid: string ,
    @Query("module") module: string 
  ): Promise<ApiResponse<UserAccessToken>> {
    try {
      const { data, meta } =
        await this.userService.getAllUsersFromInstitute(instituteUuid, module);
      return {
        meta,
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

  @Get('employeeDetails')
  @UsePipes(new bodyValidationPipe(loginUserSchemaZod))
  async employeeDetails(
    @Query("employeeUuid") employeeUuid: string ,
    @Query("module") module: string 
  ): Promise<ApiResponse<UserAccessToken>> {
    try {
      const { data } =
        await this.userService.getEmployeeDetails(employeeUuid, module);
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

  @Patch(':employeeUuid')
  async patchUser(
    @Param("employeeUuid") employeeUuid: string,
    @Body() patchData: EmployeeInput,
    @Headers('authorization') authorization: string,
  ): Promise<ApiResponse<UserAccessToken>> {
    try {
      const { data } =
        await this.userService.patchUsersDetails(employeeUuid, patchData, authorization);
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

  
  // @Get(':user_id')
  // async getUserById(
  //   @Param('user_id') userId: string,
  // ): Promise<ApiResponse<any>> {
  //   try {
  //     const { data } = await this.userService.findUserById(userId);
  //     return {
  //       data,
  //       pagination: null,
  //       success: true,
  //     };
  //   } catch (error) {
  //     if (!(error instanceof HttpException)) {
  //       throw new HttpException(
  //         error.message,
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     } else {
  //       throw error;
  //     }
  //   }
  // }

  // TODO: This needs to be connected to HR
  // @Get()
  // async getAllUsers(
  //   @Query(new ParsePaginationPipe()) query: PaginationParserType,
  // ): Promise<ApiResponse<User[]>> {
  //   try {
  //     // const { data, pagination } = await this.userService.findAllUsers(query);
  //     return {
  //       success: true,
  //       data: [],
  //       pagination: null,
  //       meta: { message: 'Needs to be fetched from HR' },
  //     };
  //   } catch (error) {
  //     if (!(error instanceof HttpException)) {
  //       throw new HttpException(
  //         error.message,
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     } else {
  //       throw error;
  //     }
  //   }
  // }

  // TODO: This needs to be connected to HR
  // @Delete(':user_id')
  // async deleteUser(
  //   @Param('user_id') userId: string,
  // ): Promise<ApiResponse<{}>> {
  //   try {
  //     // await this.userService.findUserById(userId);
  //     // return {
  //     //   pagination: null,
  //     //   success: true,
  //     // };
  //     // TODO: Make an API call to HR to delete the user
  //     return {
  //       success: true,
  //       data: {},
  //       pagination: null,
  //       meta: { message: 'Not connected to HR yet' },
  //     };
  //   } catch (error) {
  //     if (!(error instanceof HttpException)) {
  //       throw new HttpException(
  //         error.message,
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     } else {
  //       throw error;
  //     }
  //   }
  // }

  // @Put(':user_id')
  // @UsePipes(new putBodyValidationPipe(editUserSchemaZod))
  // async editUser(
  //   @Param('user_id') userId: string,
  //   @Body() userPayload: TEditUserDTO,
  // ): Promise<ApiResponse<User>> {
  //   try {
  //     const { data } = await this.userService.editUser(userId, userPayload);
  //     return {
  //       success: true,
  //       data,
  //       pagination: null,
  //     };
  //   } catch (error) {
  //     if (!(error instanceof HttpException)) {
  //       throw new HttpException(
  //         error.message,
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     } else {
  //       throw error;
  //     }
  //   }
  // }
}
