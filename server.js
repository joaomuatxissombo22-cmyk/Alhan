import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.join(__dirname, 'dist');

app.use(express.json({ limit: '4mb' }));

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

app.post('/api/notify-email', async (req, res) => {
  const { subject, panelOrigin, applicantName, applicantEmail, applicantPhone, details } = req.body || {};
  const targetEmail = 'geral@alhan.pro';
  try {
    await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: subject || `Nova Inscrição na Plataforma ALHAN (${panelOrigin || 'Painel'})`,
        Painel_Origem: panelOrigin || 'Plataforma ALHAN SGI',
        Nome_Inscrito: applicantName || 'N/A',
        Email_Inscrito: applicantEmail || 'N/A',
        Telefone_WhatsApp: applicantPhone || 'N/A',
        Detalhes: details || '',
        Destinatario_Oficial: targetEmail,
      }),
    }).catch(() => null);
  } catch {
    // Non-blocking external relay
  }
  res.json({
    ok: true,
    notifiedEmail: targetEmail,
    timestamp: new Date().toISOString(),
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
