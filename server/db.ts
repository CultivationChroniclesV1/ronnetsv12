import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Initialize postgres client for normal operation
const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 10 });

// Create drizzle database instance with the correct typing
export const db = drizzle(sql, { schema });