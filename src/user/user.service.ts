import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { DataWithPagination } from 'src/students/students.service';
import { setTokenFromPayload } from 'src/jwt/jwt-main';
import { LibraryConfig } from 'src/config/entity/library_config.entity';
import { TCreateUserDTO } from './dto/create-user.dto';
import { compare, hash } from 'bcryptjs';
import { TEditUserDTO } from './dto/update-user.dto';
import { TLoginUserDTO } from './dto/login-user.dto';

interface Data<T> {
  data: T;
  pagination: null;
  meta?: { accessToken?: string };
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly queryBuilderService: QueryBuilderService,

    @InjectRepository(LibraryConfig)
    private libraryRepository: Repository<LibraryConfig>,
  ) {}

  async createUser(userPayload: TCreateUserDTO): Promise<Data<User>> {
    try {
      const { password } = userPayload;

      const hashedPassword = (await hash(password, 10)) as string;

      const result = this.userRepository.create({
        ...userPayload,
        password: hashedPassword,
      });

      const insertedUser: User = await this.userRepository.save(result);

      result.password = '';

      return {
        data: insertedUser,
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async findUserById(userId: string): Promise<Data<User>> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.name',
          'user.email',
          'user.designation',
          'user.address',
          'user.phoneNo',
          'user.instituteDetails',
        ])
        .where('user.userId = :userId', { userId })
        .andWhere('user.isArchived = :isArchived', { isArchived: false })
        .getOne();

      if (!user) {
        throw new HttpException(
          'User not found or archived',
          HttpStatus.NOT_FOUND,
        );
      }

      user.password = '';

      return {
        data: user,
        pagination: null,
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
  }): Promise<DataWithPagination<User>> {
    const offset = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search && search.length > 0) {
      search.forEach((searchCriteria) => {
        const { field, value } = searchCriteria;
        queryBuilder.andWhere(`user.${field} ILIKE :searchValue`, {
          searchValue: `%${value}%`,
        });
      });
    }

    if (filter && filter.length > 0) {
      filter.forEach((filterCriteria) => {
        const { field, value, operator } = filterCriteria;

        if (operator === 'in') {
          queryBuilder.andWhere(`user.${field} IN (:...values)`, {
            values: value,
          });
        } else if (operator === 'equals' || operator === '=') {
          queryBuilder.andWhere(`user.${field} = :value`, { value: value[0] });
        }
      });
    }

    if (asc && asc.length > 0) {
      asc.forEach((field) => {
        queryBuilder.addOrderBy(`user.${field}`, 'ASC');
      });
    }

    if (dec && dec.length > 0) {
      dec.forEach((field) => {
        queryBuilder.addOrderBy(`user.${field}`, 'DESC');
      });
    }

    queryBuilder.where('user.isArchived = :isArchived', { isArchived: false });

    const total = await queryBuilder.getCount();

    const users = await queryBuilder.skip(offset).take(limit).getMany();

    return {
      data: users,
      pagination: {
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteUser(userId: string): Promise<Data<{ message: string }>> {
    try {
      const result = await this.userRepository.update(
        { userId, isArchived: false },
        { isArchived: true },
      );

      if (result.affected === 0) {
        throw new HttpException(
          `User with id ${userId} not found or already archived`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data: { message: `User with id ${userId} archived successfully!` },
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async editUser(
    userId: string,
    editUserPayload: TEditUserDTO,
  ): Promise<Data<User>> {
    try {
      const userExists = await this.userRepository.findOne({
        where: { userId, isArchived: false },
      });

      if (!userExists) {
        throw new HttpException(
          'User not found or archived',
          HttpStatus.NOT_FOUND,
        );
      }

      let newUpdateUserPayload = { ...editUserPayload } as Partial<User>;

      if (editUserPayload.instituteDetails) {
        newUpdateUserPayload.instituteDetails = [
          ...editUserPayload.instituteDetails,
          ...userExists.instituteDetails,
        ];
      }

      await this.userRepository.update(userId, newUpdateUserPayload);

      const updatedUser = await this.userRepository.findOne({
        where: { userId },
      });

      if (!updatedUser) {
        throw new HttpException(
          'Failed to update user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        data: updatedUser,
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async userLogin(userCredPayload: TLoginUserDTO): Promise<Data<User>> {
    try {
      const user = await this.userRepository.findOne({
        where: [
          { email: userCredPayload.email },
          { username: userCredPayload.email }, // This assumes email and username can be the same
          { userId: userCredPayload.email },
        ],
      });
      if (!user) {
        throw new HttpException('Invalid Credential', HttpStatus.FORBIDDEN);
      }

      const isPasswordValid = await compare(
        userCredPayload.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new HttpException('Invalid Credential', HttpStatus.FORBIDDEN);
      }

      const jwtPayloadSelective = {
        name: user.userUuid,
      };

      // MICROSERVICE ERROR
      const instituteDetails = await this.userRepository.query(`
        SELECT * FROM institute_config WHERE institute_uuid IN (${user.instituteDetails.join(',')})
      `);

      user.password = instituteDetails;

      return {
        data: user,
        pagination: null,
        meta: { accessToken: setTokenFromPayload(jwtPayloadSelective) },
      };
    } catch (error) {
      throw error;
    }
  }

}
