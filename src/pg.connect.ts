import { Pool } from "pg";
import { config } from 'dotenv';

config({ path: '.env' })

export const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: true,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 0
});

pool.on('connect', (client) => {
    console.log("A client connected to Pool", "\n Total Count", pool.totalCount);
});

pool.on('release', (err, client) => {
    if(!err) {
        console.log("A client has been released from the Pool", "\n Total Count", pool.totalCount);
    } else {
        console.error(err.message);
    }
});

pool.on('remove', (client) => {
    console.log("A client has been removed from the Pool", "\n Total Count", pool.totalCount);
})

pool.on('error', (err, client) => {
    if(!err) {
        console.log('pool error listener');
    } else {
        console.error(err.message);
    }
})