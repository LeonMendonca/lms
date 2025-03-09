import { Controller, Post, Get, UsePipes, Body } from "@nestjs/common";
import { bodyValidationPipe } from "src/pipes/body-validation.pipe";
import { bookmZodSchema, TbookmZodSchema } from "./zod/createbookmzod";
import { BookMiniService } from "./bookm.service";
import { isbnZod, TisbnZod } from "./zod/createbookisbnzod";

@Controller('bookm')
export class BookMiniController {

  constructor(private readonly bookService: BookMiniService) {}

  @Get('all')
  async getAllBooks() {
    return "Getting books..." 
  }

  @Post('create')
  @UsePipes(new bodyValidationPipe(bookmZodSchema))
  async createBook(@Body() bookPayload: TbookmZodSchema) {
    return this.bookService.createBook(bookPayload);
  }

  @Post('isbn')
  @UsePipes(new bodyValidationPipe(isbnZod))
  async createBookIsbn(@Body() isbn: TisbnZod) {
    return this.bookService.createBook(isbn)
  }
}
