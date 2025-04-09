import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryConfig } from './entity/library_config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LibraryConfig])],
  providers: [ConfigService],
  controllers: [ConfigController]
})
export class ConfigModule { }
