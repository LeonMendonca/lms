import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Books } from './books.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Books)
    private booksRepository: Repository<Books>,
  ) {}
  async getBooks() {
    return await this.booksRepository.find();
  }
  createBook(bookPayload: { name: string; id: string }) {
    return bookPayload;
  }
}
