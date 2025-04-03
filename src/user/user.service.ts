import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TUser, User } from './user.entity';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { DataWithPagination } from 'src/students/students.service';
import { TCreateUserDTO } from './zod-validation/create-user-zod';
import { insertQueryHelper } from 'src/misc/custom-query-helper';
import { TUserCredZodType } from './zod-validation/user-cred-zod';
import { setTokenFromPayload } from 'src/jwt/jwt-main';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly queryBuilderService: QueryBuilderService,
  ) { }

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
        designation: jwtPayload[0].designation
      };

      delete jwtPayload[0].password;

      return {
        token: { accessToken: setTokenFromPayload(jwtPayloadSelective) },
        user: {
          ...jwtPayload[0],
          institute_image:
            'https://admissionuploads.s3.amazonaws.com/3302d8ef-0a5d-489d-81f9-7b1f689427be_Tia_logo.png',
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllUsers(
    {
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
    }
  ): Promise<DataWithPagination<TUser>> {
        const offset = (page - 1) * limit;

    const params: (string | number)[] = [];

    //const whereClauses = this.queryBuilderService.buildWhereClauses(
    //  filter,
    //  search,
    //  params,
    //);
    const orderByQuery = this.queryBuilderService.buildOrderByClauses(asc, dec);

    console.log({ params });

    const user = await this.userRepository.query(
      `SELECT * FROM users_table ${orderByQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
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

  async createUser(studentPayload: TCreateUserDTO): Promise<TUser> {
    try {
      let queryData = insertQueryHelper(studentPayload, []);
      const result: TUser[] = await this.userRepository.query(
        `INSERT INTO users_table (${queryData.queryCol}) values (${queryData.queryArg}) RETURNING *`,
        queryData.values,
      );

      const studentUuid = result[0];
      if (!studentUuid) {
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
}
