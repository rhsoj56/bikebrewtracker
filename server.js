// server.js
// Express server that serves index.html with API keys injected at request time.
// Keys live in .env — they are NEVER committed to git or visible in source files.

import express    from 'express';
import fs         from 'fs';
import path       from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3000;

// Read the HTML template once at startup
const templatePath = path.join(__dirname, 'public', 'index.html');
let template = fs.readFileSync(templatePath, 'utf8');

// Build the Firebase config object from env vars
function getFirebaseConfig() {
  return JSON.stringify({
    apiKey:            process.env.FIREBASE_API_KEY,
    authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.FIREBASE_PROJECT_ID,
    storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.FIREBASE_APP_ID,
  });
}

// Serve index.html with keys injected — for every request to /
app.get('/', (req, res) => {
  const html = template
    .replace('%%MAPS_API_KEY%%',    process.env.MAPS_API_KEY   || '')
    .replace('%%FIREBASE_CONFIG%%', getFirebaseConfig());

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-store'); // Don't cache — contains injected keys
  res.send(html);
});

// Serve everything else in /public as static files (JS, CSS, etc.)
// Note: index.html is excluded from static so the route above handles it
app.use(express.static(path.join(__dirname, 'public'), {
  index: false, // Don't serve index.html automatically
}));

// Health check endpoint — useful for DigitalOcean monitoring
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.listen(PORT, () => {
  console.log(`🏍️  Bike+Brew running on http://localhost:${PORT}`);
  console.log(`   Firebase project: ${process.env.FIREBASE_PROJECT_ID || '(not set)'}`);
  console.log(`   Maps API key:     ${process.env.MAPS_API_KEY ? '✓ set' : '✗ missing'}`);
});
