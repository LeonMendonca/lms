import { Client, Pool } from "pg";
import { config } from 'dotenv';

config({ path: '.env' })

export const pool = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    max: 5,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    ssl: true
});

export async function pgConnect() {
    try {
        return await pool.connect();
    } catch (error) {
        console.error(error.message);
    }
}