import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LibraryConfig } from './entity/library_config.entity';
import axios, { AxiosResponse } from 'axios';
import { TUpdateLibraryDTO } from './dto/update-library.dto';

interface Data<T> {
  data: T;
  pagination: null;
  meta?: { accessToken?: string };
}

// TODO: GLOBAL VARIABLES
const HR_URL =
  process.env.HR_URL || 'https://hr-backend-navy.vercel.app/api/auth/';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(LibraryConfig)
    private libraryConfigRepository: Repository<LibraryConfig>,
  ) {}

  async getAlllibraries(accessToken: string): Promise<Data<LibraryConfig[]>> {
    const response: AxiosResponse<{ organisationId: string }> = await axios.get(
      `${HR_URL}/addUser`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken,
        },
      },
    );

    if (!response?.data || response.status !== 200) {
      throw new HttpException('Invalid Credential', HttpStatus.FORBIDDEN);
    }

    const libraries = await this.libraryConfigRepository.find({
      where: { organisation: response.data.organisationId },
    });

    return {
      data: libraries,
      pagination: null,
    };
  }

  async getLibraryByUuid(libraryUuid: string): Promise<Data<LibraryConfig>> {
    const libraries = await this.libraryConfigRepository.findOne({
      where: { libraryRuleId: libraryUuid },
    });

    if (!libraries) {
      throw new HttpException('Library not found', HttpStatus.NOT_FOUND);
    }

    return {
      data: libraries,
      pagination: null,
    };
  }

  async updateLibrary(
    libraryUuid: string,
    updateLibraryPayload: TUpdateLibraryDTO,
  ): Promise<Data<LibraryConfig>> {
    try {
      const existingLibrary = await this.libraryConfigRepository.findOne({
        where: {
          libraryRuleId: libraryUuid,
          isArchived: false,
        },
      });
      if (!existingLibrary) {
        throw new HttpException(
          'Library not found or is archived',
          HttpStatus.NOT_FOUND,
        );
      }
      const queryBuilder = this.libraryConfigRepository.createQueryBuilder();
      const setFields: any = {};
      for (const key in updateLibraryPayload) {
        if (
          updateLibraryPayload[key] !== undefined &&
          key !== 'libraryRuleId'
        ) {
          setFields[key] = updateLibraryPayload[key];
        }
      }

      if ((Object.keys(setFields).length = 0)) {
        throw new HttpException(
          'No valid fields to update',
          HttpStatus.BAD_REQUEST,
        );
      }
      const data = await queryBuilder
        .update()
        .set(setFields) // Dynamically set fields
        .where('libraryRuleId = :libraryId', { libraryUuid })
        .andWhere('isArchived = :isArchived', { isArchived: false })
        .execute();

      return {
        data: data.raw,
        pagination: null,
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while updating institute.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
