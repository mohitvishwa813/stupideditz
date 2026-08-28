import { createClient, Client } from '@libsql/client/web';

const rawUrl = import.meta.env.TURSO_DATABASE_URL || 'libsql://stupideditz-stupideditz-business.aws-ap-south-1.turso.io';
const authToken = import.meta.env.TURSO_AUTH_TOKEN || '';

// Convert libsql:// to https:// for web/browser HTTP transport if necessary
const url = rawUrl.startsWith('libsql://') 
  ? rawUrl.replace('libsql://', 'https://') 
  : rawUrl;

export const turso: Client = createClient({
  url,
  authToken,
});
