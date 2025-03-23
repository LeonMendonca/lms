import { Books } from "src/books/books.entity";
import { Students } from "src/students/students.entity";
import { DataSource } from "typeorm";

import { config } from "dotenv";
import { bootstrap } from "src/main";

config({ path: '.env' })

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DB_URL!,
  ssl: true,
  entities: [Students, Books]
});