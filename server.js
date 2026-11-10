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
      uid: 'usr-geral-alhan-hoje',
      fullName: 'Formando Inscrito (geral@alhan.pro)',
      username: 'geral.formando',
      email: 'geral@alhan.pro',
      phone: '+244 922 021 211',
      password: 'Alhan@Aluno2026',
      role: 'ALUNO',
      companyId: 'alhan-aluno',
      desiredCourseId: 'curso-hse-novembro',
      desiredCourseTitle: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
      approvalStatus: 'pendente',
      firestoreStatus: 'PENDENTE',
      createdAt: '2026-11-10T09:15:00Z',
    },
    enrollment: {
      id: 'enr-geral-alhan-hoje',
      studentId: 'usr-geral-alhan-hoje',
      studentName: 'Formando Inscrito (geral@alhan.pro)',
      studentPhone: '+244 922 021 211',
      studentEmail: 'geral@alhan.pro',
      courseId: 'curso-hse-novembro',
      courseTitle: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
      modality: 'Híbrida',
      originalAmountKz: 125000,
      amountKz: 106250,
      discountPercent: 15,
      blackFridayApplied: true,
      paymentMethod: 'Express Angola',
      paymentReference: 'CAD-ALH10',
      receiptNote:
        'Inscrição realizada hoje (geral@alhan.pro) — Aguarda aprovação do estado (PENDENTE -> APROVADO) no Painel Administrativo Central ALHAN – SGI.',
      paymentStatus: 'PENDENTE',
      enrollmentApprovalStatus: 'pendente',
      firestoreStatus: 'PENDENTE',
      courseStartDate: '2026-11-12',
      firstInstallmentAmountKz: 53125,
      firstInstallmentDueDate: '2026-11-10',
      firstInstallmentStatus: 'Pendente',
      firstInstallmentReference: 'CAD-ALH10-P1',
      secondInstallmentAmountKz: 53125,
      secondInstallmentDueDate: '2026-11-19',
      secondInstallmentStatus: 'Pendente',
      secondInstallmentReference: 'CAD-ALH10-P2',
      progressPercent: 0,
      completedLessons: [],
      completed: false,
      certificateRequested: true,
      certificateRequestedAt: '2026-11-10T09:15:00Z',
      certificateRequestName: 'Formando Inscrito (geral@alhan.pro)',
      certificateRequestEmail: 'geral@alhan.pro',
      certificateRequestPhone: '+244 922 021 211',
      enrolledAt: '2026-11-10T09:15:00Z',
      createdAt: '2026-11-10T09:15:00Z',
    },
    certificateRequest: {
      id: 'cert-req-geral-alhan-hoje',
      enrollmentId: 'enr-geral-alhan-hoje',
      userId: 'usr-geral-alhan-hoje',
      studentName: 'Formando Inscrito (geral@alhan.pro)',
      studentEmail: 'geral@alhan.pro',
      studentPhone: '+244 922 021 211',
      studentBI: '',
      courseId: 'curso-hse-novembro',
      courseName: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
      modality: 'Híbrida',
      workloadHours: 40,
      enrollmentDate: '2026-11-10',
      completionDate: '2026-11-10',
      requestDate: '2026-11-10T09:15:00Z',
      studentNotes:
        'Inscrição e solicitação de certificado realizadas hoje (geral@alhan.pro) — aguarda aprovação do estado no Painel Administrativo Central ALHAN – SGI.',
      status: 'PENDENTE',
      certificateStoragePath: '',
      certificateFileUrl: '',
      certificateFileName: '',
      certificateCode: '',
      issuedAt: '',
      issuedBy: '',
      adminNotes: '',
      auditHistory: [
        {
          id: 'aud-geral-alhan-hoje',
          action: 'SOLICITADO',
          statusAfter: 'PENDENTE',
          actorName: 'Formando Inscrito (geral@alhan.pro)',
          actorRole: 'ALUNO',
          notes: 'Inscrição realizada hoje e submetida para aprovação administrativa.',
          timestamp: '2026-11-10T09:15:00Z',
        },
      ],
      createdAt: '2026-11-10T09:15:00Z',
    },
  },
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
    certificateRequest: {
      id: 'cert-req-mohamed-caculo-95',
      enrollmentId: 'enr-mohamed-caculo-95',
      userId: 'usr-mohamed-caculo-95',
      studentName: 'Mohamed Caculo',
      studentEmail: 'mohamedcaculo95@gmail.com',
      studentPhone: '+244 923 000 095',
      studentBI: '',
      courseId: 'curso-hse-novembro',
      courseName: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
      modality: 'Híbrida',
      workloadHours: 40,
      enrollmentDate: '2026-11-09',
      completionDate: '2026-11-09',
      requestDate: '2026-11-09T14:30:00Z',
      studentNotes:
        'Inscrição e solicitação de certificado submetidas pelo formando mohamedcaculo95@gmail.com — aguarda aprovação do estado no Painel Administrativo Central ALHAN – SGI.',
      status: 'PENDENTE',
      certificateStoragePath: '',
      certificateFileUrl: '',
      certificateFileName: '',
      certificateCode: '',
      issuedAt: '',
      issuedBy: '',
      adminNotes: '',
      auditHistory: [
        {
          id: 'aud-mohamed-95',
          action: 'SOLICITADO',
          statusAfter: 'PENDENTE',
          actorName: 'Mohamed Caculo',
          actorRole: 'ALUNO',
          notes: 'Inscrição e registo de certificado submetidos para aprovação administrativa.',
          timestamp: '2026-11-09T14:30:00Z',
        },
      ],
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
    certificateRequest: {
      id: 'cert-req-carvalho-manuel-angola',
      enrollmentId: 'enr-carvalho-manuel-angola',
      userId: 'usr-carvalho-manuel-angola',
      studentName: 'Manuel Carvalho',
      studentEmail: 'carvalhomanuelangola@gmail.com',
      studentPhone: '+244 923 000 102',
      studentBI: '',
      courseId: 'curso-hse-novembro',
      courseName: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
      modality: 'Híbrida',
      workloadHours: 40,
      enrollmentDate: '2026-11-09',
      completionDate: '2026-11-09',
      requestDate: '2026-11-09T16:15:00Z',
      studentNotes:
        'Inscrição e solicitação de certificado submetidas pelo formando carvalhomanuelangola@gmail.com — aguarda aprovação do estado no Painel Administrativo Central ALHAN – SGI.',
      status: 'PENDENTE',
      certificateStoragePath: '',
      certificateFileUrl: '',
      certificateFileName: '',
      certificateCode: '',
      issuedAt: '',
      issuedBy: '',
      adminNotes: '',
      auditHistory: [
        {
          id: 'aud-carvalho-manuel',
          action: 'SOLICITADO',
          statusAfter: 'PENDENTE',
          actorName: 'Manuel Carvalho',
          actorRole: 'ALUNO',
          notes: 'Inscrição e registo de certificado submetidos para aprovação administrativa.',
          timestamp: '2026-11-09T16:15:00Z',
        },
      ],
      createdAt: '2026-11-09T16:15:00Z',
    },
  },
];

function loadApprovalsStore() {
  let store = {
    users: [],
    enrollments: [],
    certificateRequests: [],
    adminNotifications: [],
    decisions: [],
  };
  try {
    if (fs.existsSync(approvalsStorePath)) {
      const parsed = JSON.parse(fs.readFileSync(approvalsStorePath, 'utf-8'));
      store = {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        enrollments: Array.isArray(parsed.enrollments) ? parsed.enrollments : [],
        certificateRequests: Array.isArray(parsed.certificateRequests) ? parsed.certificateRequests : [],
        adminNotifications: Array.isArray(parsed.adminNotifications) ? parsed.adminNotifications : [],
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
    if (item.certificateRequest) {
      const hasCertReq = store.certificateRequests.some(
        (r) =>
          r.id === item.certificateRequest.id ||
          r.enrollmentId === item.certificateRequest.enrollmentId ||
          String(r.studentEmail || '').toLowerCase() ===
            item.certificateRequest.studentEmail.toLowerCase()
      );
      if (!hasCertReq) {
        store.certificateRequests.unshift(item.certificateRequest);
      }
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

function upsertStudentOrProfessorIntoStore({
  userRecord,
  enrollmentRecord,
  certificateRequestRecord,
  adminNotificationRecord,
}) {
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

    // Ensure every registered ALUNO also has an enrollmentRecord and certificateRequestRecord in approvalsStore
    if (normalizedUser.role === 'ALUNO' && !enrollmentRecord) {
      const hasEnr = approvalsStore.enrollments.some(
        (e) =>
          e.studentId === normalizedUser.uid ||
          (cleanEmail && String(e.studentEmail || '').toLowerCase() === cleanEmail)
      );
      if (!hasEnr) {
        const autoEnrId = `enr-${normalizedUser.uid}`;
        const courseId = normalizedUser.desiredCourseId || 'curso-hse-novembro';
        const courseTitle =
          normalizedUser.desiredCourseTitle ||
          'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)';
        const autoEnr = {
          id: autoEnrId,
          studentId: normalizedUser.uid,
          studentName: normalizedUser.fullName || 'Formando ALHAN',
          studentPhone: normalizedUser.phone || '+244 922 021 211',
          studentEmail: normalizedUser.email,
          studentBI: normalizedUser.studentBI || '',
          courseId,
          courseTitle,
          modality: 'Híbrida',
          originalAmountKz: 125000,
          amountKz: 106250,
          discountPercent: 15,
          blackFridayApplied: true,
          paymentMethod: 'Express Angola',
          paymentReference: `CAD-${String(normalizedUser.uid).slice(-6).toUpperCase()}`,
          receiptNote:
            'Inscrição submetida no Painel do Aluno — Aguarda aprovação do estado (PENDENTE -> APROVADO) no Painel Administrativo Central ALHAN – SGI.',
          paymentStatus: normalizedUser.firestoreStatus || 'PENDENTE',
          enrollmentApprovalStatus: normalizedUser.approvalStatus || 'pendente',
          firestoreStatus: normalizedUser.firestoreStatus || 'PENDENTE',
          courseStartDate: '2026-11-12',
          firstInstallmentAmountKz: 53125,
          firstInstallmentDueDate: (normalizedUser.createdAt || nowIso).slice(0, 10),
          firstInstallmentStatus: 'Pendente',
          firstInstallmentReference: `CAD-${String(normalizedUser.uid).slice(-6).toUpperCase()}-P1`,
          secondInstallmentAmountKz: 53125,
          secondInstallmentDueDate: '2026-11-19',
          secondInstallmentStatus: 'Pendente',
          secondInstallmentReference: `CAD-${String(normalizedUser.uid).slice(-6).toUpperCase()}-P2`,
          progressPercent: 0,
          completedLessons: [],
          completed: false,
          certificateRequested: true,
          certificateRequestedAt: normalizedUser.createdAt || nowIso,
          certificateRequestName: normalizedUser.fullName || 'Formando ALHAN',
          certificateRequestEmail: normalizedUser.email,
          certificateRequestPhone: normalizedUser.phone || '+244 922 021 211',
          enrolledAt: normalizedUser.createdAt || nowIso,
          createdAt: normalizedUser.createdAt || nowIso,
        };
        approvalsStore.enrollments.unshift(autoEnr);
      }
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

    // Ensure a corresponding ALUNO user record also exists in approvalsStore.users
    if (!userRecord && normalizedEnr.studentName) {
      const hasUser = approvalsStore.users.some(
        (u) =>
          u.uid === normalizedEnr.studentId ||
          (cleanStudentEmail && String(u.email || '').toLowerCase() === cleanStudentEmail)
      );
      if (!hasUser) {
        approvalsStore.users.unshift({
          uid: normalizedEnr.studentId || `usr-${normalizedEnr.id}`,
          fullName: normalizedEnr.studentName,
          username: cleanStudentEmail ? cleanStudentEmail.split('@')[0] : `aluno.${normalizedEnr.id}`,
          email: cleanStudentEmail || 'aluno@alhan.pro',
          phone: normalizedEnr.studentPhone || '+244 922 021 211',
          studentBI: normalizedEnr.studentBI || '',
          password: 'Alhan@Aluno2026',
          role: 'ALUNO',
          companyId: 'alhan-aluno',
          desiredCourseId: normalizedEnr.courseId,
          desiredCourseTitle: normalizedEnr.courseTitle,
          approvalStatus: normalizedEnr.enrollmentApprovalStatus || 'pendente',
          firestoreStatus: normalizedEnr.firestoreStatus || 'PENDENTE',
          createdAt: normalizedEnr.createdAt || nowIso,
        });
      }
    }

    // Ensure a corresponding certificateRequest record also exists in approvalsStore.certificateRequests
    if (!certificateRequestRecord) {
      const hasCert = approvalsStore.certificateRequests.some(
        (r) =>
          r.enrollmentId === normalizedEnr.id ||
          (cleanStudentEmail &&
            String(r.studentEmail || '').toLowerCase() === cleanStudentEmail &&
            r.courseId === normalizedEnr.courseId)
      );
      if (!hasCert) {
        approvalsStore.certificateRequests.unshift({
          id: `cert-req-${normalizedEnr.id}`,
          enrollmentId: normalizedEnr.id,
          userId: normalizedEnr.studentId || `usr-${normalizedEnr.id}`,
          studentName: normalizedEnr.studentName,
          studentEmail: cleanStudentEmail || 'aluno@alhan.pro',
          studentPhone: normalizedEnr.studentPhone || '+244 922 021 211',
          studentBI: normalizedEnr.studentBI || '',
          courseId: normalizedEnr.courseId,
          courseName: normalizedEnr.courseTitle,
          modality: normalizedEnr.modality || 'Híbrida',
          workloadHours: 40,
          enrollmentDate: (normalizedEnr.createdAt || nowIso).slice(0, 10),
          completionDate: (normalizedEnr.createdAt || nowIso).slice(0, 10),
          requestDate: normalizedEnr.createdAt || nowIso,
          studentNotes:
            'Inscrição e solicitação de certificado submetidas pelo formando — aguarda aprovação do estado no Painel Administrativo Central ALHAN – SGI.',
          status:
            normalizedEnr.firestoreStatus === 'APROVADO'
              ? 'APROVADO'
              : normalizedEnr.firestoreStatus === 'REJEITADO'
              ? 'REJEITADO'
              : 'PENDENTE',
          certificateStoragePath: '',
          certificateFileUrl: '',
          certificateFileName: '',
          certificateCode: '',
          issuedAt: '',
          issuedBy: '',
          adminNotes: '',
          auditHistory: [
            {
              id: `aud-${normalizedEnr.id}`,
              action: 'SOLICITADO',
              statusAfter: 'PENDENTE',
              actorName: normalizedEnr.studentName,
              actorRole: 'ALUNO',
              notes: 'Inscrição e registo de certificado submetidos para aprovação administrativa.',
              timestamp: normalizedEnr.createdAt || nowIso,
            },
          ],
          createdAt: normalizedEnr.createdAt || nowIso,
        });
      }
    }
  }

  if (certificateRequestRecord && certificateRequestRecord.id) {
    const existingCertIdx = approvalsStore.certificateRequests.findIndex(
      (r) =>
        r.id === certificateRequestRecord.id ||
        (certificateRequestRecord.enrollmentId &&
          r.enrollmentId === certificateRequestRecord.enrollmentId)
    );
    if (existingCertIdx >= 0) {
      approvalsStore.certificateRequests[existingCertIdx] = {
        ...approvalsStore.certificateRequests[existingCertIdx],
        ...certificateRequestRecord,
      };
    } else {
      approvalsStore.certificateRequests.unshift(certificateRequestRecord);
    }
  }

  if (adminNotificationRecord && adminNotificationRecord.id) {
    const existsNotif = approvalsStore.adminNotifications.some(
      (n) => n.id === adminNotificationRecord.id
    );
    if (!existsNotif) {
      approvalsStore.adminNotifications.unshift(adminNotificationRecord);
    }
  }

  saveApprovalsStore(approvalsStore);
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'ALHAN – SISTEMA DE GESTÃO INTEGRADO',
    nif: '5003128261',
  });
});

// 1. Consulta administrativa de inscrições e solicitações pendentes (Restrito a ADMIN e SUPER_ADMIN)
app.get('/api/approvals', (req, res) => {
  const callerRole = String(req.headers['x-alhan-role'] || req.query.role || 'ADMIN').toUpperCase();
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
    certificateRequests: approvalsStore.certificateRequests,
    adminNotifications: approvalsStore.adminNotifications,
    decisions: approvalsStore.decisions,
    timestamp: new Date().toISOString(),
  });
});

// 2. Registo / sincronização imediata de nova inscrição de formando ou solicitação de professor com estado PENDENTE
app.post('/api/approvals/register', (req, res) => {
  const {
    userRecord,
    enrollmentRecord,
    certificateRequestRecord,
    adminNotificationRecord,
  } = req.body || {};
  const nowIso = new Date().toISOString();

  upsertStudentOrProfessorIntoStore({
    userRecord,
    enrollmentRecord,
    certificateRequestRecord,
    adminNotificationRecord,
  });

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

  approvalsStore.certificateRequests = approvalsStore.certificateRequests.map((r) => {
    const matches =
      (enrollmentId && r.enrollmentId === enrollmentId) ||
      (uid && r.userId === uid) ||
      (cleanEmail && String(r.studentEmail || '').toLowerCase() === cleanEmail);
    if (!matches || r.status === 'DISPONÍVEL') return r;
    return {
      ...r,
      status: fsStatus,
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
      (cleanEmail && String(u.email || '').toLowerCase() === cleanEmail && (!normalizedRole || u.role === normalizedRole))
  );
  const matchedEnrollment =
    normalizedRole === 'ALUNO' || !normalizedRole
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
  const nowIso = new Date().toISOString();

  // Guarantees that ANY student or professor notification sent to geral@alhan.pro also registers immediately in the Central Admin Panel
  if (
    applicantName &&
    applicantEmail &&
    (panelOrigin === 'PAINEL_ALUNO' ||
      panelOrigin === 'INSCRICAO_CURSO' ||
      panelOrigin === 'PAINEL_PROFESSOR' ||
      panelOrigin === 'SOLICITACAO_CERTIFICADO')
  ) {
    const cleanEmail = String(applicantEmail).trim().toLowerCase();
    const isProfessor = panelOrigin === 'PAINEL_PROFESSOR';
    const uid = `usr-${cleanEmail.replace(/[^a-z0-9]/g, '-').slice(0, 32)}`;
    upsertStudentOrProfessorIntoStore({
      userRecord: {
        uid,
        fullName: String(applicantName).trim(),
        username: cleanEmail.split('@')[0] || 'utilizador',
        email: cleanEmail,
        phone: String(applicantPhone || '+244 922 021 211').trim(),
        password: isProfessor ? 'Alhan@Prof2026' : 'Alhan@Aluno2026',
        role: isProfessor ? 'PROFESSOR' : 'ALUNO',
        companyId: isProfessor ? 'alhan-docente' : 'alhan-aluno',
        specialty: isProfessor ? 'Consultoria e Formação SGI / Normas ISO & HSE' : undefined,
        experience: isProfessor ? '5+ anos em Consultoria e Formação Técnica SGI / ISO & HSE' : undefined,
        desiredCourseId: isProfessor ? undefined : 'curso-hse-novembro',
        desiredCourseTitle: isProfessor
          ? undefined
          : 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
        approvalStatus: 'pendente',
        firestoreStatus: 'PENDENTE',
        createdAt: nowIso,
      },
      adminNotificationRecord: {
        id: `adm-notif-${Date.now()}`,
        type: isProfessor ? 'NOVO_FORMANDO' : 'NOVA_INSCRICAO',
        title: subject || `Nova Inscrição (${panelOrigin}): ${applicantName}`,
        message: `${applicantName} (${cleanEmail}) — ${details || subject || 'Aguarda aprovação no Painel Administrativo Central.'}`,
        studentName: String(applicantName).trim(),
        courseName: isProfessor
          ? 'Painel do Professor'
          : 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
        requestId: uid,
        read: false,
        createdAt: nowIso,
      },
    });
  }

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
    timestamp: nowIso,
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(
      express.static(distPath, {
        maxAge: '1y',
        etag: true,
        setHeaders: (res, filePath) => {
          if (
            filePath.endsWith('.html') ||
            filePath.endsWith('.json') ||
            filePath.endsWith('sw.js')
          ) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          }
        },
      })
    );

    // SPA fallback for React Router on Hostinger Node.js / Express environment
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ALHAN – SGI server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();

export default app;
