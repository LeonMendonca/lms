import { Controller, Get, Post, Body, Param, Put, Delete, Query, UsePipes, HttpException, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { BooksService } from 'src/books/books.service';
import { CreateBookDTO } from './dto/create-book.dto';
import { UpdateBookDTO } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import { CreateBookValidationPipe } from './pipes/create-book-validation.pipe';
import { UpdateBookValidationPipe } from './pipes/update-book-validation.pipe';

@Controller('books-v2')
export class BooksV2Controller {
  constructor(private readonly booksService: BooksService,) {}

  // Get all books
  @Get()
  async findAll(): Promise<Book[]> {
    return await this.booksService.findAll();
  }

  // Get book by ID
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Book> {
    const book = await this.booksService.findOne(id);
    if (!book) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
    return book;
  }

  // Create new book
  @Post()
  @UsePipes(CreateBookValidationPipe)
  async create(@Body() createBookDTO: CreateBookDTO): Promise<Book> {
    try {
      return await this.booksService.create(createBookDTO);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Update book by ID
  @Put(':id')
  @UsePipes(UpdateBookValidationPipe)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDTO: UpdateBookDTO,
  ): Promise<Book> {
    try {
      const updatedBook = await this.booksService.update(id, updateBookDTO);
      if (!updatedBook) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }
      return updatedBook;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Delete book by ID
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    try {
      const deletedBook = await this
