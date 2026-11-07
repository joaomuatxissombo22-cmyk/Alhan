import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.join(__dirname, 'dist');

app.use(express.json({ limit: '15mb' }));

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

app.post('/api/certificates/validate-upload', (req, res) => {
  const { fileName, mimeType, fileSizeBytes, userId, courseId, requestId } = req.body || {};
  if (!userId || !courseId || !requestId) {
    return res.status(400).json({
      ok: false,
      error: 'A solicitação de certificado deve estar associada a um formando (userId) e curso (courseId) válidos.',
    });
  }
  const isPdfMime = mimeType === 'application/pdf' || (typeof fileName === 'string' && fileName.toLowerCase().endsWith('.pdf'));
  if (!isPdfMime) {
    return res.status(400).json({
      ok: false,
      error: 'Formato inválido. Apenas ficheiros PDF (application/pdf) são permitidos.',
    });
  }
  const maxBytes = 10 * 1024 * 1024;
  if (typeof fileSizeBytes === 'number' && (fileSizeBytes <= 0 || fileSizeBytes > maxBytes)) {
    return res.status(400).json({
      ok: false,
      error: 'O ficheiro PDF excede o limite máximo permitido de 10 MB.',
    });
  }
  const storagePath = `certificates/${String(userId).replace(/[^a-zA-Z0-9_-]/g, '-')}/${String(courseId).replace(/[^a-zA-Z0-9_-]/g, '-')}/certificate.pdf`;
  return res.json({
    ok: true,
    storagePath,
    validatedAt: new Date().toISOString(),
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
