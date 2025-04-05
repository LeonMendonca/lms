import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TUser, user, User } from './user.entity';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { DataWithPagination } from 'src/students/students.service';
import { TCreateUserDTO } from './zod-validation/create-user-zod';
import {
  insertQueryHelper,
  updateQueryHelper,
} from 'src/misc/custom-query-helper';
import { TUserCredZodType } from './zod-validation/user-cred-zod';
import { setTokenFromPayload } from 'src/jwt/jwt-main';
import { TokenAuthGuard } from 'src/guards/token.guard';
import { TEditUserDTO } from './zod-validation/edit-user-zod';
import { unknown } from 'zod';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly queryBuilderService: QueryBuilderService,
  ) {}

  async userLogin(userCredPayload: TUserCredZodType) {
    try {
      const jwtPayload: TUser[] = await this.userRepository.query(
        `SELECT * FROM users_table WHERE email = $1 AND password = $2`,
        [userCredPayload.email, userCredPayload.password],
      );

      if (!jwtPayload.length) {
        throw new HttpException('Invalid Credential', HttpStatus.FORBIDDEN);
      }

      const jwtPayloadSelective = {
        name: jwtPayload[0].name,
        email: jwtPayload[0].email,
        designation: jwtPayload[0].designation,
      };

      delete jwtPayload[0].password;

      return {
        token: { accessToken: setTokenFromPayload(jwtPayloadSelective) },
        user: jwtPayload[0],
      };
    } catch (error) {
      throw error;
    }
  }
  async findAllUsers({
    page,
    limit,
    search,
    asc,
    dec,
    filter,
  }: {
    page: number;
    limit: number;
    asc: string[];
    dec: string[];
    filter: { field: string; value: (string | number)[]; operator: string }[];
    search: { field: string; value: string }[];
  }): Promise<DataWithPagination<TUser>> {
    const offset = (page - 1) * limit;

    const params: (string | number)[] = [];

    const whereClauses = this.queryBuilderService.buildWhereClauses(
      filter,
      search,
      params,
    );
    const orderByQuery = this.queryBuilderService.buildOrderByClauses(asc, dec);

    console.log({ params });

    const user = await this.userRepository.query(
      `SELECT * FROM users_table WHERE is_archived = FALSE ${orderByQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    const total = await this.userRepository.query(
      `SELECT COUNT(*) FROM users_table`,
      params,
    );

    return {
      data: user,
      pagination: {
        total: parseInt(total[0].count, 10),
        page,
        limit,
        totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
      },
    };
  }

  async findUserById(userId: string): Promise<TUser> {
    try {
      const user: TUser[] = await this.userRepository.query(
        `SELECT name, email, designation, address, phone_no, institute_details FROM users_table WHERE user_id = $1 AND is_archived = FALSE`,
        [userId],
      );

      if (!user.length) {
        throw new HttpException(
          'User not found or archived',
          HttpStatus.NOT_FOUND,
        );
      }

      delete user[0].password;

      return user[0];
    } catch (error) {
      throw error;
    }
  }

  async createUser(userPayload: TCreateUserDTO): Promise<TUser> {
    try {
      let userInstituteDetailsAsString: string = '';
      userInstituteDetailsAsString = JSON.stringify(
        userPayload.institute_details,
      );
      const { name, email, phone_no, designation, address, password } =
        userPayload;
      const modifiedUserPayload = {
        name,
        email,
        phone_no,
        designation,
        address,
        password,
        institute_details: userInstituteDetailsAsString,
      };
      let queryData = insertQueryHelper(modifiedUserPayload, []);
      const result: TUser[] = await this.userRepository.query(
        `INSERT INTO users_table (${queryData.queryCol}) values (${queryData.queryArg}) RETURNING *`,
        queryData.values,
      );

      const userUUID = result[0];
      if (!userUUID) {
        throw new HttpException(
          'Failed to create user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let insertedUser: TUser = result[0];
      delete insertedUser.password;

      return insertedUser;
    } catch (error) {
      throw error;
    }
  }

  async editUser(
    userId: string,
    editUserPayload: TEditUserDTO,
  ): Promise<TUser> {
    try {
      const userExists: TUser[] = await this.userRepository.query(
        `SELECT * FROM users_table WHERE user_id = $1 AND is_archived = FALSE`,
        [userId],
      );

      if (!userExists.length) {
        throw new HttpException(
          'User not found or archived',
          HttpStatus.NOT_FOUND,
        );
      }

      let newUpdateUserPayload = editUserPayload as {
        [P in keyof TEditUserDTO]: TEditUserDTO[P] extends object | undefined
          ? string
          : TEditUserDTO[P];
      };

      if (editUserPayload.institute_details) {
        editUserPayload['institute_details'] =
          editUserPayload.institute_details.concat(
            userExists[0].institute_details,
          );
        newUpdateUserPayload['institute_details'] = JSON.stringify(
          newUpdateUserPayload['institute_details'],
        );
      }

      let queryData = updateQueryHelper(newUpdateUserPayload, []);
      const result: [TUser[], 0 | 1] = await this.userRepository.query(
        `UPDATE users_table SET ${queryData.queryCol} WHERE user_id = '${userId}' AND is_archived = false RETURNING *`,
        queryData.values,
      );

      const updateStatus = result[1];
      if (!updateStatus) {
        throw new HttpException(
          'Failed to update user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const updatedUser: TUser = result[0][0];
      delete updatedUser.password;

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const result: [[], 0 | 1] = await this.userRepository.query(
        `UPDATE users_table SET is_archived = TRUE WHERE user_id = '${userId}' AND is_archived = FALSE`,
      );

      const updateStatus = result[1];
      if (!updateStatus) {
        throw new HttpException(
          `User with id ${userId} not found or archived`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: `User id ${userId} archived successfully!`,
      };
    } catch (error) {
      throw error;
    }
  }
}
