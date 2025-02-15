<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

Master branch contains the backend of the Books Management Interface. The backend contains three routes:
 - 'view-books' : This route hits the GET Request. This route is responsible for returning all the books in the database.
 - 'view-books?book_borrowed=true' : This route hits the GET Request. This route is responsible for returning only the issued books from the database.
 - 'edit-books' : This route hits the POST Request. This route is responsible for adding a new book in the database.

<p>The src/books directory contains the books.module, books.controller, books.service </br>It also contains books/data.json which is our current static database </br> It contains books/dtos which will hold all our DTO files</p>

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# watch mode
$ npm run start:dev
```

## Hit APIs

```bash
- GET Request : http://localhost:3000/books/view-books
- GET Request : http://localhost:3000/books/view-books?book_borrowed=true
- POST Request : http://localhost:3000/books/edit-books
 In Body select raw JSON and paste this in the Body
  {
    "bid": 2,
    "bname": "Clean Code",
    "bauthor": "Robert C. Martin",
    "bpublisher": "Prentice Hall",
    "bpyear": "2008-08-13"
  }
```

## Resources Used

The following are the resources used to build the backend:
 - NestJs : The framework in which backend is built (https://docs.nestjs.com/)
 - fs-extra : Nodejs based library to handle the file system related operations in the POST method (https://www.npmjs.com/package/fs-extra)
