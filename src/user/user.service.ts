import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LibraryConfig } from 'src/config/entity/library_config.entity';
import { TCreateUserDTO } from './dto/create-user.dto';
import { TLoginUserDTO } from './dto/login-user.dto';
import { UserAccessToken } from './entity/user-access.entity';
import { UserPreference } from './entity/user-preference.entity';
import { CreateUserResponse, UserResponse } from './types/user-response.types';
import axios, { AxiosResponse } from 'axios';

interface Data<T> {
  data: T;
  pagination: null;
  meta?: { accessToken?: string };
}

// TODO: GLOBAL VARIABLES
const HR_URL =
  process.env.HR_URL || 'https://hr-backend-navy.vercel.app/api/auth/';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserAccessToken)
    private userAccessRepository: Repository<UserAccessToken>,

    @InjectRepository(UserPreference)
    private userPreferenceRepository: Repository<UserPreference>,

    @InjectRepository(LibraryConfig)
    private libraryRepository: Repository<LibraryConfig>,
  ) {}

  async createUser(
    userPayload: TCreateUserDTO,
    accessToken: string,
  ): Promise<Data<{ message: string }>> {
    try {
      const response: AxiosResponse<CreateUserResponse> = await axios.post(
        `${HR_URL}/addUser`,
        {
          ...userPayload,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization' : accessToken
          },
        }
      );


      if (!response?.data) {
        throw new HttpException(
          'HR Module failed to create user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }      

      return {
        data: { message: 'User created successfully!' },
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async userLogin(userCredPayload: TLoginUserDTO): Promise<Data<any>> {
    try {
      const response: AxiosResponse<UserResponse> = await axios.post(
        `${HR_URL}/login`,
        {
          ...userCredPayload,
        },
      );

      if (!response?.data || response.status !== 200) {
        throw new HttpException('Invalid Credential', HttpStatus.FORBIDDEN);
      }

      // // TODO: ADD LIBRARY CONFIG TO USER DETAILS
      const doesUserExist = await this.userAccessRepository.findOne({
        where: { employeeId: response.data.user.employeeId },
      });

      if (!doesUserExist) {
        const userPreference = this.userPreferenceRepository.create({
          employeeId: response.data.user.employeeId,
        });
        const savedUserPreference =
          await this.userPreferenceRepository.save(userPreference);
        const user = this.userAccessRepository.create({
          employeeId: response.data.user.employeeId,
          userId: response.data.user.employeeId,
          username: response.data.user.workEmail,
          accessToken: response.data.token,
          userPreference: savedUserPreference.userPreferenceUuid,
          organization: response.data.user.organizationUuid,
        });

        await this.userAccessRepository.save(user);
      } else {
        doesUserExist.accessToken = response.data.token;
        await this.userAccessRepository.save(doesUserExist);
      }

      const existingInstitutes = await this.libraryRepository.find({
        where: response.data.user.institutes.map(({ uuid }) => ({
          instituteUuid: uuid,
        })),
      });

      const existingUuids = existingInstitutes.map(
        (institute) => institute.instituteUuid,
      );

      const missingInstitutesUuids = response.data.user.institutes.filter(
        ({ uuid }) => !existingUuids.includes(uuid),
      );

      const newInstitutes = missingInstitutesUuids.map((uuid) => {
        const newInstitute = this.libraryRepository.create({
          organisation: response.data.user.organizationUuid,
          instituteUuid: uuid.uuid,
          createdByUUID: response.data.user.employeeId,
        });
        return newInstitute;
      });

      const savedInstitutes = newInstitutes.length > 0 ? await this.libraryRepository.save(newInstitutes) : [];

      const libraryDetails = [...existingInstitutes, ...savedInstitutes];

      const completeUser = await this.userAccessRepository.findOne({
        where: { employeeId: response.data.user.employeeId },
      });
      const userPreference = await this.userPreferenceRepository.findOne({
        where: { employeeId: response.data.user.employeeId },
      });

      const completeLibraryDetails = libraryDetails.map((library) => ({
        ...library,
        instituteName: response.data.user.institutes.find(
          (institute) => institute.uuid === library.instituteUuid,
        )?.name,
        instituteAbbr:response.data.user.institutes.find(
          (institute) => institute.uuid === library.instituteUuid,
        )?.abbreviation,
        instituteHeader: "",
        instituteLogo: ""
      }))

      return {
        data: { ...completeUser, ...userPreference, libraryDetails: completeLibraryDetails },
        pagination: null,
        meta: { accessToken: response.data.token },
      };
    } catch (error) {
      throw error;
    }
  }

  // TODO: ADD TYPE DATA
  // TODO: ADD HR MODULE URL
  // async findUserById(userId: string): Promise<Data<any>> {
  //   try {
  //     const response = await this.httpService
  //       .get(`${HR_URL}/finduser/${userId}`)
  //       .toPromise();

  //     if (!response?.data) {
  //       throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  //     }

  //     return {
  //       data: response.data,
  //       pagination: null,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // TODO: COMPLETE THIS FUNCTION
  // async findAllUsers({
  //   page,
  //   limit,
  //   search,
  //   asc,
  //   dec,
  //   filter,
  // }: {
  //   page: number;
  //   limit: number;
  //   asc: string[];
  //   dec: string[];
  //   filter: { field: string; value: (string | number)[]; operator: string }[];
  //   search: { field: string; value: string }[];
  // }): Promise<DataWithPagination<User>> {
  //   const offset = (page - 1) * limit;

  //   const queryBuilder = this.userRepository.createQueryBuilder('user');

  //   if (search && search.length > 0) {
  //     search.forEach((searchCriteria) => {
  //       const { field, value } = searchCriteria;
  //       queryBuilder.andWhere(`user.${field} ILIKE :searchValue`, {
  //         searchValue: `%${value}%`,
  //       });
  //     });
  //   }

  //   if (filter && filter.length > 0) {
  //     filter.forEach((filterCriteria) => {
  //       const { field, value, operator } = filterCriteria;

  //       if (operator === 'in') {
  //         queryBuilder.andWhere(`user.${field} IN (:...values)`, {
  //           values: value,
  //         });
  //       } else if (operator === 'equals' || operator === '=') {
  //         queryBuilder.andWhere(`user.${field} = :value`, { value: value[0] });
  //       }
  //     });
  //   }

  //   if (asc && asc.length > 0) {
  //     asc.forEach((field) => {
  //       queryBuilder.addOrderBy(`user.${field}`, 'ASC');
  //     });
  //   }

  //   if (dec && dec.length > 0) {
  //     dec.forEach((field) => {
  //       queryBuilder.addOrderBy(`user.${field}`, 'DESC');
  //     });
  //   }

  //   queryBuilder.where('user.isArchived = :isArchived', { isArchived: false });

  //   const total = await queryBuilder.getCount();

  //   const users = await queryBuilder.skip(offset).take(limit).getMany();

  //   return {
  //     data: users,
  //     pagination: {
  //       total: total,
  //       page,
  //       limit,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //   };
  // }

  // async deleteUser(userId: string): Promise<Data<{ message: string }>> {
  //   try {
  //     const result = await this.userRepository.update(
  //       { userId, isArchived: false },
  //       { isArchived: true },
  //     );

  //     if (result.affected === 0) {
  //       throw new HttpException(
  //         `User with id ${userId} not found or already archived`,
  //         HttpStatus.NOT_FOUND,
  //       );
  //     }

  //     return {
  //       data: { message: `User with id ${userId} archived successfully!` },
  //       pagination: null,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async editUser(
  //   userId: string,
  //   editUserPayload: TEditUserDTO,
  // ): Promise<Data<User>> {
  //   try {
  //     const userExists = await this.userRepository.findOne({
  //       where: { userId, isArchived: false },
  //     });

  //     if (!userExists) {
  //       throw new HttpException(
  //         'User not found or archived',
  //         HttpStatus.NOT_FOUND,
  //       );
  //     }

  //     let newUpdateUserPayload = { ...editUserPayload } as Partial<User>;

  //     if (editUserPayload.instituteDetails) {
  //       newUpdateUserPayload.instituteDetails = [
  //         ...editUserPayload.instituteDetails,
  //         ...userExists.instituteDetails,
  //       ];
  //     }

  //     await this.userRepository.update(userId, newUpdateUserPayload);

  //     const updatedUser = await this.userRepository.findOne({
  //       where: { userId },
  //     });

  //     if (!updatedUser) {
  //       throw new HttpException(
  //         'Failed to update user',
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     }

  //     return {
  //       data: updatedUser,
  //       pagination: null,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
