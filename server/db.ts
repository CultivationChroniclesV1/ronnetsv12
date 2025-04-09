import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

// Configure neon for server environment
neonConfig.fetchConnectionCache = true;

// Initialize neon client
const sql = neon(process.env.DATABASE_URL!);

// Create drizzle database instance with the correct typing
export const db = drizzle(sql, { schema });