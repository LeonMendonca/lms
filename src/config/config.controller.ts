import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  UsePipes,
} from '@nestjs/common';
import { ConfigService } from './config.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { LibraryConfig } from './entity/library_config.entity';
import { TUpdateLibraryDTO, updateLibrarySchema } from './dto/update-library.dto';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination: {} | null;
  error?: string;
  meta?: any;
}

@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @Get()
  async getAlllibraries(
    @Headers('authorization') authorization: string,
  ): Promise<ApiResponse<LibraryConfig[]>> {
    try {
      const { data } = await this.configService.getAlllibraries(authorization);
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

  @Get(':libraryId')
  async getLibraryByUUID(@Param('libraryId') libraryUuid: string) {
    try {
      const { data } = await this.configService.getLibraryByUuid(libraryUuid);
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

  @Patch(':libraryId')
  // @UsePipes(new bodyValidationPipe(updateLibrarySchema))
  async updateLibrary(
    @Param('libraryId') libraryUuid: string,
    @Body() updateLibraryPayload: TUpdateLibraryDTO,
  ): Promise<ApiResponse<LibraryConfig>> {
    try {
      const { data } = await this.configService.updateLibrary(
        libraryUuid,
        updateLibraryPayload,
      );
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
