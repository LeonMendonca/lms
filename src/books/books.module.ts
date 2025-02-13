import { Module } from '@nestjs/common';
import { BookController } from './books.controller';
import { BookService } from './books.service';

export @Module({
    controllers: [BookController],
    providers: [BookService]
})
class BooksModule { }
