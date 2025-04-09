import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreference } from './entity/user-preference.entity';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { LibraryConfig } from 'src/config/entity/library_config.entity';
import { HttpModule } from '@nestjs/axios';
import { UserAccessToken } from './entity/user-access.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreference, LibraryConfig, UserAccessToken]), HttpModule],
  controllers: [UserController],
  providers: [UserService, QueryBuilderService],
  exports: [UserService],
})
export class UserModule {}
