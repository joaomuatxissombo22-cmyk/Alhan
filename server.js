import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.join(__dirname, 'dist');

app.use(
  express.static(distPath, {
    maxAge: '1y',
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html') || filePath.endsWith('.json') || filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'ALHAN – SISTEMA DE GESTÃO INTEGRADO',
    nif: '5003128261',
  });
});

// SPA fallback for React Router on Hostinger Node.js / Express environment
app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ALHAN – SGI server running on port ${PORT}`);
});

export default app;
