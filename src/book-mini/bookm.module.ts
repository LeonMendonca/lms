import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookMiniCopies } from "./entity/bookm-copies.entity";
import { BookMiniController } from "./bookm.controller";
import { BookMiniService } from "./bookm.service";
import { BookMiniTitle } from "./entity/bookm-title.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BookMiniCopies, BookMiniTitle])],
  controllers: [BookMiniController],
  providers: [BookMiniService]
})
export class BookMiniModule {
}
