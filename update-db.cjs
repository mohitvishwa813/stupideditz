const { createClient } = require('@libsql/client'); 
require('dotenv').config({path: './backend/.env'}); 

const turso = createClient({ 
  url: process.env.TURSO_DATABASE_URL, 
  authToken: process.env.TURSO_AUTH_TOKEN 
}); 

async function run() { 
  try { 
    await turso.execute("UPDATE courses SET what_you_will_learn_link = 'https://docs.google.com/document/d/1dummy' WHERE title LIKE '%DaVinci%'"); 
    console.log('Updated DB row'); 
  } catch(e) { 
    console.error(e.message); 
  } 
} 
run();
