import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { LibraryConfig } from 'src/config/entity/library_config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, LibraryConfig])],
  controllers: [UserController],
  providers: [UserService, QueryBuilderService],
  exports: [UserService],
})
export class UserModule {}
