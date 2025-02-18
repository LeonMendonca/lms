import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { EditBookDTO } from './dtos/editBook.dto';
import { writeFile, readFile } from 'node:fs/promises';
import { AddBookDTO } from './dtos/addBook.dto';

@Injectable({})
export class BookService {
  private filePath = path.join(
    process.cwd(),
    'src',
    'books',
    'data',
    'books.json',
  );

  async allBooks(query?: boolean): Promise<AddBookDTO[]> {
    if (query != null) {
      const fileData = await readFile(this.filePath, 'utf8');
      const allBooks = JSON.parse(fileData) as AddBookDTO[];
      return allBooks.filter((b) => b.book_borrowed === query);
    } else {
      const fileData = await readFile(this.filePath, 'utf8');
      return JSON.parse(fileData) as AddBookDTO[];
    }
  }

  async addBook(newBook: AddBookDTO) {
    const books = await this.allBooks();

    const maxId = books.length > 0 ? books.length : 0;
    newBook.book_id = String(maxId + 1);

    books.push(newBook);
    await writeFile(this.filePath, JSON.stringify(books, null, 2), 'utf8');
    return { msg: 'Book Added Successfully!' };
  }

  updateBook(bookId: string, bookPayload: typeof EditBookDTO) {
    const editField: string[] = [];
    for (const key in EditBookDTO) {
      if (key in bookPayload) {
        editField.push(bookPayload[key as keyof typeof EditBookDTO]);
      }
    }
    let fields = '';
    for (const element of editField) {
      fields += ` ${element}`;
    }
    return `Book id ${bookId} Book Payloads ${fields}`;
  }
}
