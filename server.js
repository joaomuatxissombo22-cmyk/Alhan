import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.join(__dirname, 'dist');
const approvalsStorePath = path.join(__dirname, '.alhan-approvals-store.json');

app.use(express.json({ limit: '15mb' }));

const RECOVERED_PENDING_STUDENTS = [
  {
    user: {
      uid: 'usr-mohamed-caculo-95',
      fullName: 'Mohamed Caculo',
      username: 'mohamedcaculo95',
      email: 'mohamedcaculo95@gmail.com',
      phone: '+244 923 000 095',
      password: 'Alhan@Aluno2026',
      role: 'ALUNO',
      companyId: 'alhan-aluno',
      desiredCourseId: 'curso-hse-novembro',
      desiredCourseTitle: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
      approvalStatus: 'pendente',
      firestoreStatus: 'PENDENTE',
      createdAt: '2026-11-09T14:30:00Z',
    },
    enrollment: {
      id: 'enr-mohamed-caculo-95',
      studentId: 'usr-mohamed-caculo-95',
      studentName: 'Mohamed Caculo',
      studentPhone: '+244 923 000 095',
      studentEmail: 'mohamedcaculo95@gmail.com',
      courseId: 'curso-hse-novembro',
      courseTitle: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
      modality: 'Híbrida',
      originalAmountKz: 125000,
      amountKz: 106250,
      discountPercent: 15,
      blackFridayApplied: true,
      paymentMethod: 'Express Angola',
      paymentReference: 'CAD-MCAC95',
      receiptNote:
        'Inscrição realizada ontem (mohamedcaculo95@gmail.com) — Aguarda aprovação do estado (PENDENTE -> APROVADO) no Painel Administrativo Central ALHAN – SGI.',
      paymentStatus: 'PENDENTE',
      enrollmentApprovalStatus: 'pendente',
      firestoreStatus: 'PENDENTE',
      courseStartDate: '2026-11-12',
      firstInstallmentAmountKz: 53125,
      firstInstallmentDueDate: '2026-11-09',
      firstInstallmentStatus: 'Pendente',
      firstInstallmentReference: 'CAD-MCAC95-P1',
      secondInstallmentAmountKz: 53125,
      secondInstallmentDueDate: '2026-11-19',
      secondInstallmentStatus: 'Pendente',
      secondInstallmentReference: 'CAD-MCAC95-P2',
      progressPercent: 0,
      completedLessons: [],
      completed: false,
      certificateRequested: true,
      certificateRequestedAt: '2026-11-09T14:30:00Z',
      certificateRequestName: 'Mohamed Caculo',
      certificateRequestEmail: 'mohamedcaculo95@gmail.com',
      certificateRequestPhone: '+244 923 000 095',
      enrolledAt: '2026-11-09T14:30:00Z',
      createdAt: '2026-11-09T14:30:00Z',
    },
  },
  {
    user: {
      uid: 'usr-carvalho-manuel-angola',
      fullName: 'Manuel Carvalho',
      username: 'carvalhomanuelangola',
      email: 'carvalhomanuelangola@gmail.com',
      phone: '+244 923 000 102',
      password: 'Alhan@Aluno2026',
      role: 'ALUNO',
      companyId: 'alhan-aluno',
      desiredCourseId: 'curso-hse-novembro',
      desiredCourseTitle: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
      approvalStatus: 'pendente',
      firestoreStatus: 'PENDENTE',
      createdAt: '2026-11-09T16:15:00Z',
    },
    enrollment: {
      id: 'enr-carvalho-manuel-angola',
      studentId: 'usr-carvalho-manuel-angola',
      studentName: 'Manuel Carvalho',
      studentPhone: '+244 923 000 102',
      studentEmail: 'carvalhomanuelangola@gmail.com',
      courseId: 'curso-hse-novembro',
      courseTitle: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
      modality: 'Híbrida',
      originalAmountKz: 125000,
      amountKz: 106250,
      discountPercent: 15,
      blackFridayApplied: true,
      paymentMethod: 'Express Angola',
      paymentReference: 'CAD-MCARV1',
      receiptNote:
        'Inscrição realizada ontem (carvalhomanuelangola@gmail.com) — Aguarda aprovação do estado (PENDENTE -> APROVADO) no Painel Administrativo Central ALHAN – SGI.',
      paymentStatus: 'PENDENTE',
      enrollmentApprovalStatus: 'pendente',
      firestoreStatus: 'PENDENTE',
      courseStartDate: '2026-11-12',
      firstInstallmentAmountKz: 53125,
      firstInstallmentDueDate: '2026-11-09',
      firstInstallmentStatus: 'Pendente',
      firstInstallmentReference: 'CAD-MCARV1-P1',
      secondInstallmentAmountKz: 53125,
      secondInstallmentDueDate: '2026-11-19',
      secondInstallmentStatus: 'Pendente',
      secondInstallmentReference: 'CAD-MCARV1-P2',
      progressPercent: 0,
      completedLessons: [],
      completed: false,
      certificateRequested: true,
      certificateRequestedAt: '2026-11-09T16:15:00Z',
      certificateRequestName: 'Manuel Carvalho',
      certificateRequestEmail: 'carvalhomanuelangola@gmail.com',
      certificateRequestPhone: '+244 923 000 102',
      enrolledAt: '2026-11-09T16:15:00Z',
      createdAt: '2026-11-09T16:15:00Z',
    },
  },
];

function loadApprovalsStore() {
  let store = { users: [], enrollments: [], decisions: [] };
  try {
    if (fs.existsSync(approvalsStorePath)) {
      const parsed = JSON.parse(fs.readFileSync(approvalsStorePath, 'utf-8'));
      store = {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        enrollments: Array.isArray(parsed.enrollments) ? parsed.enrollments : [],
        decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
      };
    }
  } catch {
    // Fallback to empty store
  }

  for (const item of RECOVERED_PENDING_STUDENTS) {
    const hasUser = store.users.some(
      (u) =>
        u.uid === item.user.uid ||
        String(u.email || '').toLowerCase() === item.user.email.toLowerCase()
    );
    if (!hasUser) {
      store.users.unshift(item.user);
    }
    const hasEnr = store.enrollments.some(
      (e) =>
        e.id === item.enrollment.id ||
        String(e.studentEmail || '').toLowerCase() === item.enrollment.studentEmail.toLowerCase()
    );
    if (!hasEnr) {
      store.enrollments.unshift(item.enrollment);
    }
  }

  return store;
}

function saveApprovalsStore(store) {
  try {
    fs.writeFileSync(approvalsStorePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // Non-blocking in read-only containers
  }
}

const approvalsStore = loadApprovalsStore();
saveApprovalsStore(approvalsStore);

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

// 1. Consulta administrativa de inscrições e solicitações pendentes (Restrito a ADMIN e SUPER_ADMIN)
app.get('/api/approvals', (req, res) => {
  const callerRole = String(req.headers['x-alhan-role'] || req.query.role || '').toUpperCase();
  if (callerRole !== 'ADMIN' && callerRole !== 'SUPER_ADMIN') {
    return res.status(403).json({
      ok: false,
      error: 'Acesso negado. Apenas utilizadores com perfil ADMIN ou SUPER_ADMIN podem consultar os dados pessoais e aprovações.',
    });
  }
  return res.json({
    ok: true,
    users: approvalsStore.users,
    enrollments: approvalsStore.enrollments,
    decisions: approvalsStore.decisions,
    timestamp: new Date().toISOString(),
  });
});

// 2. Registo / sincronização de nova inscrição de formando ou solicitação de professor com estado PENDENTE
app.post('/api/approvals/register', (req, res) => {
  const { userRecord, enrollmentRecord } = req.body || {};
  const nowIso = new Date().toISOString();

  if (userRecord && userRecord.uid) {
    const cleanEmail = String(userRecord.email || '').trim().toLowerCase();
    const existingIdx = approvalsStore.users.findIndex(
      (u) => u.uid === userRecord.uid || (cleanEmail && String(u.email || '').toLowerCase() === cleanEmail)
    );
    const existing = existingIdx >= 0 ? approvalsStore.users[existingIdx] : null;
    const normalizedUser = {
      ...(existing || {}),
      ...userRecord,
      email: cleanEmail || userRecord.email || '',
      firestoreStatus: existing?.decidedAt
        ? existing.firestoreStatus
        : userRecord.firestoreStatus || existing?.firestoreStatus || 'PENDENTE',
      approvalStatus: existing?.decidedAt
        ? existing.approvalStatus
        : userRecord.approvalStatus || existing?.approvalStatus || 'pendente',
      decidedBy: existing?.decidedBy || userRecord.decidedBy,
      decidedByEmail: existing?.decidedByEmail || userRecord.decidedByEmail,
      decidedAt: existing?.decidedAt || userRecord.decidedAt,
      createdAt: existing?.createdAt || userRecord.createdAt || nowIso,
    };
    if (existingIdx >= 0) {
      approvalsStore.users[existingIdx] = normalizedUser;
    } else {
      approvalsStore.users.unshift(normalizedUser);
    }
  }

  if (enrollmentRecord && enrollmentRecord.id) {
    const cleanStudentEmail = String(enrollmentRecord.studentEmail || '').trim().toLowerCase();
    const existingEnrIdx = approvalsStore.enrollments.findIndex(
      (e) =>
        e.id === enrollmentRecord.id ||
        (cleanStudentEmail &&
          String(e.studentEmail || '').toLowerCase() === cleanStudentEmail &&
          e.courseId === enrollmentRecord.courseId)
    );
    const existingEnr = existingEnrIdx >= 0 ? approvalsStore.enrollments[existingEnrIdx] : null;
    const normalizedEnr = {
      ...(existingEnr || {}),
      ...enrollmentRecord,
      firestoreStatus: existingEnr?.decidedAt
        ? existingEnr.firestoreStatus
        : enrollmentRecord.firestoreStatus || existingEnr?.firestoreStatus || 'PENDENTE',
      enrollmentApprovalStatus: existingEnr?.decidedAt
        ? existingEnr.enrollmentApprovalStatus
        : enrollmentRecord.enrollmentApprovalStatus || existingEnr?.enrollmentApprovalStatus || 'pendente',
      paymentStatus: existingEnr?.decidedAt
        ? existingEnr.paymentStatus
        : enrollmentRecord.paymentStatus || existingEnr?.paymentStatus || 'PENDENTE',
      decidedBy: existingEnr?.decidedBy || enrollmentRecord.decidedBy,
      decidedByEmail: existingEnr?.decidedByEmail || enrollmentRecord.decidedByEmail,
      decidedAt: existingEnr?.decidedAt || enrollmentRecord.decidedAt,
      createdAt: existingEnr?.createdAt || enrollmentRecord.createdAt || nowIso,
    };
    if (existingEnrIdx >= 0) {
      approvalsStore.enrollments[existingEnrIdx] = normalizedEnr;
    } else {
      approvalsStore.enrollments.unshift(normalizedEnr);
    }
  }

  saveApprovalsStore(approvalsStore);
  return res.json({
    ok: true,
    status: 'PENDENTE',
    timestamp: nowIso,
  });
});

// 3. Decisão administrativa (APROVAR / REJEITAR) — Restrito a ADMIN ou SUPER_ADMIN com registo de auditoria
app.post('/api/approvals/decide', (req, res) => {
  const {
    uid,
    enrollmentId,
    email,
    status,
    actorRole,
    actorName,
    actorEmail,
    notes,
  } = req.body || {};

  const normalizedRole = String(actorRole || req.headers['x-alhan-role'] || '').toUpperCase();
  if (normalizedRole !== 'ADMIN' && normalizedRole !== 'SUPER_ADMIN') {
    return res.status(403).json({
      ok: false,
      error: 'Operação bloqueada no backend: Apenas utilizadores com perfil ADMIN ou SUPER_ADMIN podem aprovar ou rejeitar registos.',
    });
  }

  const fsStatus =
    String(status || '').toUpperCase() === 'APROVADO'
      ? 'APROVADO'
      : String(status || '').toUpperCase() === 'REJEITADO'
      ? 'REJEITADO'
      : 'PENDENTE';
  const appStatus =
    fsStatus === 'APROVADO' ? 'aprovado' : fsStatus === 'REJEITADO' ? 'rejeitado' : 'pendente';
  const decidedAt = new Date().toISOString();
  const decidedBy = actorName || 'Administrador Principal ALHAN – SGI';
  const decidedByEmail = actorEmail || 'admin@alhan.pro';
  const cleanEmail = String(email || '').trim().toLowerCase();

  approvalsStore.users = approvalsStore.users.map((u) => {
    const matches =
      (uid && u.uid === uid) ||
      (cleanEmail && String(u.email || '').toLowerCase() === cleanEmail);
    if (!matches) return u;
    return {
      ...u,
      firestoreStatus: fsStatus,
      approvalStatus: appStatus,
      decidedBy,
      decidedByEmail,
      decidedAt,
      decisionNotes: notes || u.decisionNotes,
    };
  });

  approvalsStore.enrollments = approvalsStore.enrollments.map((e) => {
    const matches =
      (enrollmentId && e.id === enrollmentId) ||
      (uid && e.studentId === uid) ||
      (cleanEmail && String(e.studentEmail || '').toLowerCase() === cleanEmail);
    if (!matches) return e;
    return {
      ...e,
      firestoreStatus: fsStatus,
      enrollmentApprovalStatus: appStatus,
      paymentStatus: fsStatus,
      decidedBy,
      decidedByEmail,
      decidedAt,
      decisionNotes: notes || e.decisionNotes,
    };
  });

  const decisionRecord = {
    id: `dec-${Date.now()}`,
    uid: uid || null,
    enrollmentId: enrollmentId || null,
    email: cleanEmail || null,
    status: fsStatus,
    decidedBy,
    decidedByEmail,
    actorRole: normalizedRole,
    decidedAt,
    notes: notes || `Estado alterado para ${fsStatus} por ${decidedBy}.`,
  };
  approvalsStore.decisions.unshift(decisionRecord);
  saveApprovalsStore(approvalsStore);

  return res.json({
    ok: true,
    status: fsStatus,
    decidedBy,
    decidedByEmail,
    decidedAt,
    decisionRecord,
  });
});

// 4. Verificação no Backend de Autorização de Acesso aos Painéis (/aluno e /professor)
app.post('/api/portal-access/verify', (req, res) => {
  const { uid, email, role, clientFirestoreStatus } = req.body || {};
  const normalizedRole = String(role || '').toUpperCase();

  if (normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN') {
    return res.json({
      ok: true,
      allowed: true,
      status: 'APROVADO',
      panel: '/gestao-alhan-sgi',
    });
  }

  if (normalizedRole === 'CLIENTE_EMPRESARIAL') {
    return res.json({
      ok: true,
      allowed: true,
      status: 'APROVADO',
      panel: '/empresa',
    });
  }

  const cleanEmail = String(email || '').trim().toLowerCase();
  const matchedUser = approvalsStore.users.find(
    (u) =>
      (uid && u.uid === uid) ||
      (cleanEmail && String(u.email || '').toLowerCase() === cleanEmail && u.role === normalizedRole)
  );
  const matchedEnrollment =
    normalizedRole === 'ALUNO'
      ? approvalsStore.enrollments.find(
          (e) =>
            (uid && e.studentId === uid) ||
            (cleanEmail && String(e.studentEmail || '').toLowerCase() === cleanEmail)
        )
      : null;

  const backendStatus =
    matchedUser?.firestoreStatus ||
    matchedEnrollment?.firestoreStatus ||
    (String(clientFirestoreStatus || '').toUpperCase() === 'APROVADO'
      ? 'APROVADO'
      : String(clientFirestoreStatus || '').toUpperCase() === 'REJEITADO'
      ? 'REJEITADO'
      : 'PENDENTE');

  const allowed = backendStatus === 'APROVADO';

  return res.json({
    ok: true,
    allowed,
    status: backendStatus,
    panel: normalizedRole === 'PROFESSOR' ? '/professor' : '/aluno',
    decidedBy: matchedUser?.decidedBy || matchedEnrollment?.decidedBy || null,
    decidedAt: matchedUser?.decidedAt || matchedEnrollment?.decidedAt || null,
    userRecord: matchedUser || null,
    enrollmentRecord: matchedEnrollment || null,
    reason: allowed
      ? `Acesso autorizado ao painel ${normalizedRole === 'PROFESSOR' ? '/professor' : '/aluno'} (Estado: APROVADO).`
      : `Acesso bloqueado pelo backend: o registo encontra-se com o estado ${backendStatus} no sistema. Apenas registos com estado APROVADO pelo Administrador têm acesso ao painel.`,
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
