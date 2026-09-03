import { createClient, Client } from '@libsql/client/web';

const rawUrl = import.meta.env.VITE_TURSO_DATABASE_URL || import.meta.env.TURSO_DATABASE_URL || 'libsql://stupideditz-stupideditz-business.aws-ap-south-1.turso.io';
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODc4MDQzNTksImlkIjoiMDFhMDNmNmItM2UwMS03ZTZiLWI4NDgtZTY5OWFkODc0N2QyIiwia2lkIjoiWW5iM2JZTUpTMzFwUjFoWnlNYjVvU3dnNHpBV3lHaHNkZlR1YmFzUDZqUSIsInJpZCI6IjQwMjE5OTM4LWY5YWItNGI4Ny1hMDEwLWU4OTExM2ExM2RjNyJ9.ZZ8MUvX6GkhAxVN3wIOf7XTAQz6Sh2jpvQ6jlmpi-6UbGSOR7mzBtPoXUgfm8uVwQsPZf7Beed0SyriLPiJDBA';


// Convert libsql:// to https:// for web/browser HTTP transport if necessary
const url = rawUrl.startsWith('libsql://') 
  ? rawUrl.replace('libsql://', 'https://') 
  : rawUrl;

export const turso: Client = createClient({
  url,
  authToken,
});
