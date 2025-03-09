import { Injectable } from "@nestjs/common";
import { TbookmZodSchema } from "./zod/createbookmzod";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BookMiniCopies } from "./entity/bookm-copies.entity";
import { BookMiniTitle } from "./entity/bookm-title.entity";
import { TisbnZod } from "./zod/createbookisbnzod";
import { insertQueryHelper } from "src/custom-query-helper";

@Injectable()
export class BookMiniService {

  constructor(
    @InjectRepository(BookMiniTitle)
    private readonly bookmTitleRepo: Repository<BookMiniTitle>,
    @InjectRepository(BookMiniCopies)
    private readonly bookmCopiesRepo: Repository<BookMiniCopies>
  ) {}

  async createBook(dataPayload: TbookmZodSchema | TisbnZod) {
    let result = [];
    if(dataPayload.type === 'type-isbn') {
      //Add books through ISBN
      result = await this.bookmTitleRepo.query(`SELECT * FROM book_mini_title WHERE isbn = $1`, [dataPayload.isbn]);
      if(result.length === 0) {
        return "ISBN with this book can't be found";
      } else {
        console.log(insertQueryHelper(result, []));
        return "got it!";
      }
    } else {
      //Add books through BookPayload
      result = await this.bookmTitleRepo.query(`SELECT book_title_uuid FROM book_mini_title WHERE isbn = $1`, [dataPayload.isbn]);
      if(result.length === 0) {
        const queryData = insertQueryHelper(dataPayload, ['type']);
        await this.bookmTitleRepo.query(`INSERT INTO book_mini_title (${queryData.queryCol}) values (${queryData.queryArg})`, queryData.values);
      } else {
        return result;
      }
    }
  }
}
