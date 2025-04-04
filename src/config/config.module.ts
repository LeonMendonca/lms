import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import typeormConfig from 'src/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryConfig } from './entity/library_config.entity';
import { InstituteConfig } from './entity/institute_config.entity';
import { BooksV2Service } from 'src/books_v2/books_v2.service';
import { BooksV2Module } from 'src/books_v2/books_v2.module';

@Module({
  imports: [TypeOrmModule.forFeature([LibraryConfig, InstituteConfig])],
  providers: [ConfigService],
  controllers: [ConfigController]
})
export class ConfigModule { }
