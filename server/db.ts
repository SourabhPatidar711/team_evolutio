import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

// Initialize postgres connection
const connectionString = process.env.DATABASE_URL!;

// Configure postgres with SSL in production
const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize drizzle with the postgres connection and schema
export const db = drizzle(client, { schema });