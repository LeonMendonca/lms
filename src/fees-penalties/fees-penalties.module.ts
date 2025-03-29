import { Module } from '@nestjs/common';
import { FeesPenaltiesController } from './fees-penalties.controller';
import { FeesPenaltiesService } from './fees-penalties.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeesPenalties } from './fees-penalties.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeesPenalties])],
  controllers: [FeesPenaltiesController],
  providers: [FeesPenaltiesService]
})
export class FeesPenaltiesModule {}
