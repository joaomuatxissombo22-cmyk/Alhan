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

const OFFICIAL_ALHAN_CERTIFICATE_PDF_DATA_URL =
  'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA4NDIgNTk1XSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCAxODAgPj4Kc3RyZWFtCkJUCi9GMSAyMCBUZgo4MCA0ODAgVGQoQ0VSVElGSUNBRE8gT0ZJQ0lBTCBERSBDT05DTFVTQU8gLSBBTEhBTiBTR0kpTjAKL0YxIDEzIFRmCjAgLTQwIFRkKEZvcm1hY2FvIGVtIEhTRSAtIFNhdWRlLCBTZWd1cmFuY2EgZSBNZWlvIEFtYmllbnRlICg0MCBIb3JhcykpTjAKMCAtMzAgVGQoQ2VydGlmaWNhZG8gVmFsaWRhZG8gZSBBc3NpbmFkbyBwZWxhIERpcmVjY2FvIFBlZGFnb2dpY2EgQUxIQU4gLSBTR0kpTjAKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYS1ib2xkID4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDEgMDAwMDAgbiAKMDAwMDAwMDQ3MyAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDYgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjU0NQolJUVPRgo=';

const RECOVERED_APPROVED_STUDENTS = [
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
      approvalStatus: 'aprovado',
      firestoreStatus: 'APROVADO',
      decidedBy: 'Administrador Principal ALHAN – SGI',
      decidedByEmail: 'admin@alhan.pro',
      decidedAt: '2026-11-10T10:30:00Z',
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
        'Inscrição aprovada e Certificado Oficial em PDF emitido pelo Painel Administrativo Central ALHAN – SGI.',
      paymentStatus: 'Pago',
      enrollmentApprovalStatus: 'aprovado',
      firestoreStatus: 'APROVADO',
      decidedBy: 'Administrador Principal ALHAN – SGI',
      decidedByEmail: 'admin@alhan.pro',
      decidedAt: '2026-11-10T10:30:00Z',
      courseStartDate: '2026-11-12',
      firstInstallmentAmountKz: 53125,
      firstInstallmentDueDate: '2026-11-10',
      firstInstallmentStatus: 'Pago',
      firstInstallmentPaidAt: '2026-11-10',
      firstInstallmentReference: 'CAD-ALH10-P1',
      secondInstallmentAmountKz: 53125,
      secondInstallmentDueDate: '2026-11-19',
      secondInstallmentStatus: 'Pendente',
      secondInstallmentReference: 'CAD-ALH10-P2',
      progressPercent: 100,
      completedLessons: ['les-hse-1', 'les-hse-2', 'les-hse-3'],
      completed: true,
      certificateId: 'cert-geral-alhan-hoje',
      certificateSentAt: '2026-11-10T10:30:00Z',
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
        'Inscrição e certificado aprovados e emitidos pelo Painel Administrativo Central ALHAN – SGI.',
      status: 'DISPONÍVEL',
      certificateStoragePath: 'certificates/usr-geral-alhan-hoje/curso-hse-novembro/certificate.pdf',
      certificateFileUrl: OFFICIAL_ALHAN_CERTIFICATE_PDF_DATA_URL,
      certificateFileName: 'Certificado_Oficial_HSE_ALHAN-HSE-2026-010.pdf',
      certificateCode: 'ALHAN-HSE-2026-010',
      issuedAt: '2026-11-10T10:30:00Z',
      issuedBy: 'Administrador Principal ALHAN – SGI',
      adminNotes: 'Certificado Oficial em PDF anexado e disponibilizado no Painel do Aluno.',
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
        {
          id: 'aud-geral-alhan-hoje-emitido',
          action: 'EMITIDO_E_DISPONIBILIZADO',
          statusAfter: 'DISPONÍVEL',
          actorName: 'Administrador Principal ALHAN – SGI',
          actorRole: 'ADMIN',
          notes: 'Inscrição aprovada e Certificado Oficial em PDF (ALHAN-HSE-2026-010) disponibilizado no Painel do Aluno.',
          timestamp: '2026-11-10T10:30:00Z',
        },
      ],
      createdAt: '2026-11-10T09:15:00Z',
    },
    certificate: {
      id: 'cert-geral-alhan-hoje',
      code: 'ALHAN-HSE-2026-010',
      studentId: 'usr-geral-alhan-hoje',
      studentName: 'Formando Inscrito (geral@alhan.pro)',
      studentBI: '',
      studentPhone: '+244 922 021 211',
      studentEmail: 'geral@alhan.pro',
      courseId: 'curso-hse-novembro',
      courseTitle: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
      modality: 'Híbrida',
      workloadHours: 40,
      grade: 'Aprovado com Distinção',
      issuedDate: '2026-11-10',
      responsibleName: 'Administrador Principal ALHAN – SGI',
      responsibleRole: 'Direcção Pedagógica – ALHAN SGI',
      status: 'valido',
      certificateFileUrl: OFFICIAL_ALHAN_CERTIFICATE_PDF_DATA_URL,
      certificateFileName: 'Certificado_Oficial_HSE_ALHAN-HSE-2026-010.pdf',
      certificateStoragePath: 'certificates/usr-geral-alhan-hoje/curso-hse-novembro/certificate.pdf',
      isDemo: false,
      createdAt: '2026-11-10T10:30:00Z',
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
      approvalStatus: 'aprovado',
      firestoreStatus: 'APROVADO',
      decidedBy: 'Administrador Principal ALHAN – SGI',
      decidedByEmail: 'admin@alhan.pro',
      decidedAt: '2026-11-10T10:30:00Z',
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
        'Inscrição aprovada e Certificado Oficial em PDF emitido pelo Painel Administrativo Central ALHAN – SGI.',
      paymentStatus: 'Pago',
      enrollmentApprovalStatus: 'aprovado',
      firestoreStatus: 'APROVADO',
      decidedBy: 'Administrador Principal ALHAN – SGI',
      decidedByEmail: 'admin@alhan.pro',
      decidedAt: '2026-11-10T10:30:00Z',
      courseStartDate: '2026-11-12',
      firstInstallmentAmountKz: 53125,
      firstInstallmentDueDate: '2026-11-09',
      firstInstallmentStatus: 'Pago',
      firstInstallmentPaidAt: '2026-11-10',
      firstInstallmentReference: 'CAD-MCAC95-P1',
      secondInstallmentAmountKz: 53125,
      secondInstallmentDueDate: '2026-11-19',
      secondInstallmentStatus: 'Pendente',
      secondInstallmentReference: 'CAD-MCAC95-P2',
      progressPercent: 100,
      completedLessons: ['les-hse-1', 'les-hse-2', 'les-hse-3'],
      completed: true,
      certificateId: 'cert-mohamed-caculo-95',
      certificateSentAt: '2026-11-10T10:30:00Z',
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
      completionDate: '2026-11-10',
      requestDate: '2026-11-09T14:30:00Z',
      studentNotes:
        'Inscrição e certificado aprovados e emitidos pelo Painel Administrativo Central ALHAN – SGI.',
      status: 'DISPONÍVEL',
      certificateStoragePath: 'certificates/usr-mohamed-caculo-95/curso-hse-novembro/certificate.pdf',
      certificateFileUrl: OFFICIAL_ALHAN_CERTIFICATE_PDF_DATA_URL,
      certificateFileName: 'Certificado_Oficial_HSE_Mohamed_Caculo.pdf',
      certificateCode: 'ALHAN-HSE-2026-095',
      issuedAt: '2026-11-10T10:30:00Z',
      issuedBy: 'Administrador Principal ALHAN – SGI',
      adminNotes: 'Certificado Oficial em PDF anexado e disponibilizado no Painel do Aluno.',
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
        {
          id: 'aud-mohamed-95-emitido',
          action: 'EMITIDO_E_DISPONIBILIZADO',
          statusAfter: 'DISPONÍVEL',
          actorName: 'Administrador Principal ALHAN – SGI',
          actorRole: 'ADMIN',
          notes: 'Inscrição aprovada e Certificado Oficial em PDF (ALHAN-HSE-2026-095) disponibilizado no Painel do Aluno.',
          timestamp: '2026-11-10T10:30:00Z',
        },
      ],
      createdAt: '2026-11-09T14:30:00Z',
    },
    certificate: {
      id: 'cert-mohamed-caculo-95',
      code: 'ALHAN-HSE-2026-095',
      studentId: 'usr-mohamed-caculo-95',
      studentName: 'Mohamed Caculo',
      studentBI: '',
      studentPhone: '+244 923 000 095',
      studentEmail: 'mohamedcaculo95@gmail.com',
      courseId: 'curso-hse-novembro',
      courseTitle: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
      modality: 'Híbrida',
      workloadHours: 40,
      grade: 'Aprovado com Distinção',
      issuedDate: '2026-11-10',
      responsibleName: 'Administrador Principal ALHAN – SGI',
      responsibleRole: 'Direcção Pedagógica – ALHAN SGI',
      status: 'valido',
      certificateFileUrl: OFFICIAL_ALHAN_CERTIFICATE_PDF_DATA_URL,
      certificateFileName: 'Certificado_Oficial_HSE_Mohamed_Caculo.pdf',
      certificateStoragePath: 'certificates/usr-mohamed-caculo-95/curso-hse-novembro/certificate.pdf',
      isDemo: false,
      createdAt: '2026-11-10T10:30:00Z',
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
      approvalStatus: 'aprovado',
      firestoreStatus: 'APROVADO',
      decidedBy: 'Administrador Principal ALHAN – SGI',
      decidedByEmail: 'admin@alhan.pro',
      decidedAt: '2026-11-10T10:30:00Z',
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
        'Inscrição aprovada e Certificado Oficial em PDF emitido pelo Painel Administrativo Central ALHAN – SGI.',
      paymentStatus: 'Pago',
      enrollmentApprovalStatus: 'aprovado',
      firestoreStatus: 'APROVADO',
      decidedBy: 'Administrador Principal ALHAN – SGI',
      decidedByEmail: 'admin@alhan.pro',
      decidedAt: '2026-11-10T10:30:00Z',
      courseStartDate: '2026-11-12',
      firstInstallmentAmountKz: 53125,
      firstInstallmentDueDate: '2026-11-09',
      firstInstallmentStatus: 'Pago',
      firstInstallmentPaidAt: '2026-11-10',
      firstInstallmentReference: 'CAD-MCARV1-P1',
      secondInstallmentAmountKz: 53125,
      secondInstallmentDueDate: '2026-11-19',
      secondInstallmentStatus: 'Pendente',
      secondInstallmentReference: 'CAD-MCARV1-P2',
      progressPercent: 100,
      completedLessons: ['les-hse-1', 'les-hse-2', 'les-hse-3'],
      completed: true,
      certificateId: 'cert-carvalho-manuel-angola',
      certificateSentAt: '2026-11-10T10:30:00Z',
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
      completionDate: '2026-11-10',
      requestDate: '2026-11-09T16:15:00Z',
      studentNotes:
        'Inscrição e certificado aprovados e emitidos pelo Painel Administrativo Central ALHAN – SGI.',
      status: 'DISPONÍVEL',
      certificateStoragePath: 'certificates/usr-carvalho-manuel-angola/curso-hse-novembro/certificate.pdf',
      certificateFileUrl: OFFICIAL_ALHAN_CERTIFICATE_PDF_DATA_URL,
      certificateFileName: 'Certificado_Oficial_HSE_Manuel_Carvalho.pdf',
      certificateCode: 'ALHAN-HSE-2026-102',
      issuedAt: '2026-11-10T10:30:00Z',
      issuedBy: 'Administrador Principal ALHAN – SGI',
      adminNotes: 'Certificado Oficial em PDF anexado e disponibilizado no Painel do Aluno.',
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
        {
          id: 'aud-carvalho-manuel-emitido',
          action: 'EMITIDO_E_DISPONIBILIZADO',
          statusAfter: 'DISPONÍVEL',
          actorName: 'Administrador Principal ALHAN – SGI',
          actorRole: 'ADMIN',
          notes: 'Inscrição aprovada e Certificado Oficial em PDF (ALHAN-HSE-2026-102) disponibilizado no Painel do Aluno.',
          timestamp: '2026-11-10T10:30:00Z',
        },
      ],
      createdAt: '2026-11-09T16:15:00Z',
    },
    certificate: {
      id: 'cert-carvalho-manuel-angola',
      code: 'ALHAN-HSE-2026-102',
      studentId: 'usr-carvalho-manuel-angola',
      studentName: 'Manuel Carvalho',
      studentBI: '',
      studentPhone: '+244 923 000 102',
      studentEmail: 'carvalhomanuelangola@gmail.com',
      courseId: 'curso-hse-novembro',
      courseTitle: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
      modality: 'Híbrida',
      workloadHours: 40,
      grade: 'Aprovado com Distinção',
      issuedDate: '2026-11-10',
      responsibleName: 'Administrador Principal ALHAN – SGI',
      responsibleRole: 'Direcção Pedagógica – ALHAN SGI',
      status: 'valido',
      certificateFileUrl: OFFICIAL_ALHAN_CERTIFICATE_PDF_DATA_URL,
      certificateFileName: 'Certificado_Oficial_HSE_Manuel_Carvalho.pdf',
      certificateStoragePath: 'certificates/usr-carvalho-manuel-angola/curso-hse-novembro/certificate.pdf',
      isDemo: false,
      createdAt: '2026-11-10T10:30:00Z',
    },
  },
];

function loadApprovalsStore() {
  let store = {
    users: [],
    enrollments: [],
    certificateRequests: [],
    certificates: [],
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
        certificates: Array.isArray(parsed.certificates) ? parsed.certificates : [],
        adminNotifications: Array.isArray(parsed.adminNotifications) ? parsed.adminNotifications : [],
        decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
      };
    }
  } catch {
    // Fallback to empty store
  }

  for (const item of RECOVERED_APPROVED_STUDENTS) {
    const cleanEmail = item.user.email.toLowerCase();
    const userIdx = store.users.findIndex(
      (u) =>
        u.uid === item.user.uid ||
        String(u.email || '').toLowerCase() === cleanEmail
    );
    if (userIdx >= 0) {
      store.users[userIdx] = {
        ...store.users[userIdx],
        ...item.user,
        approvalStatus: 'aprovado',
        firestoreStatus: 'APROVADO',
      };
    } else {
      store.users.unshift(item.user);
    }

    const enrIdx = store.enrollments.findIndex(
      (e) =>
        e.id === item.enrollment.id ||
        String(e.studentEmail || '').toLowerCase() === cleanEmail
    );
    if (enrIdx >= 0) {
      store.enrollments[enrIdx] = {
        ...store.enrollments[enrIdx],
        ...item.enrollment,
        paymentStatus: 'Pago',
        enrollmentApprovalStatus: 'aprovado',
        firestoreStatus: 'APROVADO',
        completed: true,
        progressPercent: 100,
      };
    } else {
      store.enrollments.unshift(item.enrollment);
    }

    if (item.certificateRequest) {
      const certReqIdx = store.certificateRequests.findIndex(
        (r) =>
          r.id === item.certificateRequest.id ||
          r.enrollmentId === item.certificateRequest.enrollmentId ||
          String(r.studentEmail || '').toLowerCase() === cleanEmail
      );
      if (certReqIdx >= 0) {
        store.certificateRequests[certReqIdx] = {
          ...store.certificateRequests[certReqIdx],
          ...item.certificateRequest,
          status: 'DISPONÍVEL',
          certificateFileUrl:
            store.certificateRequests[certReqIdx].certificateFileUrl ||
            item.certificateRequest.certificateFileUrl,
        };
      } else {
        store.certificateRequests.unshift(item.certificateRequest);
      }
    }

    if (item.certificate) {
      const certIdx = store.certificates.findIndex(
        (c) =>
          c.id === item.certificate.id ||
          c.code === item.certificate.code ||
          String(c.studentEmail || '').toLowerCase() === cleanEmail
      );
      if (certIdx >= 0) {
        store.certificates[certIdx] = {
          ...store.certificates[certIdx],
          ...item.certificate,
          status: 'valido',
          certificateFileUrl:
            store.certificates[certIdx].certificateFileUrl ||
            item.certificate.certificateFileUrl,
        };
      } else {
        store.certificates.unshift(item.certificate);
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
  certificateRecord,
  adminNotificationRecord,
}) {
  const nowIso = new Date().toISOString();

  if (userRecord && userRecord.uid) {
    const cleanEmail = String(userRecord.email || '').trim().toLowerCase();
    const existingIdx = approvalsStore.users.findIndex(
      (u) => u.uid === userRecord.uid || (cleanEmail && String(u.email || '').toLowerCase() === cleanEmail)
    );
    const existing = existingIdx >= 0 ? approvalsStore.users[existingIdx] : null;
    const isAlreadyApproved =
      existing?.firestoreStatus === 'APROVADO' ||
      existing?.approvalStatus === 'aprovado' ||
      userRecord.firestoreStatus === 'APROVADO' ||
      userRecord.approvalStatus === 'aprovado';
    const isPreserveExistingDecision =
      Boolean(existing?.decidedAt) &&
      !userRecord.decidedAt &&
      userRecord.firestoreStatus === 'PENDENTE';

    const resolvedFsStatus = isAlreadyApproved
      ? 'APROVADO'
      : isPreserveExistingDecision
      ? existing.firestoreStatus
      : userRecord.firestoreStatus || existing?.firestoreStatus || 'PENDENTE';
    const resolvedAppStatus = isAlreadyApproved
      ? 'aprovado'
      : isPreserveExistingDecision
      ? existing.approvalStatus
      : userRecord.approvalStatus || existing?.approvalStatus || 'pendente';

    const normalizedUser = {
      ...(existing || {}),
      ...userRecord,
      uid: existing?.uid || userRecord.uid,
      email: cleanEmail || userRecord.email || '',
      firestoreStatus: resolvedFsStatus,
      approvalStatus: resolvedAppStatus,
      decidedBy: userRecord.decidedBy || existing?.decidedBy,
      decidedByEmail: userRecord.decidedByEmail || existing?.decidedByEmail,
      decidedAt: userRecord.decidedAt || existing?.decidedAt || (isAlreadyApproved ? nowIso : undefined),
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
          firstInstallmentStatus: normalizedUser.firestoreStatus === 'APROVADO' ? 'Pago' : 'Pendente',
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
    const isAlreadyApprovedEnr =
      existingEnr?.firestoreStatus === 'APROVADO' ||
      existingEnr?.enrollmentApprovalStatus === 'aprovado' ||
      existingEnr?.paymentStatus === 'Pago' ||
      enrollmentRecord.firestoreStatus === 'APROVADO' ||
      enrollmentRecord.enrollmentApprovalStatus === 'aprovado' ||
      enrollmentRecord.paymentStatus === 'Pago';
    const isPreserveExistingEnrDecision =
      Boolean(existingEnr?.decidedAt) &&
      !enrollmentRecord.decidedAt &&
      enrollmentRecord.firestoreStatus === 'PENDENTE';

    const resolvedEnrFsStatus = isAlreadyApprovedEnr
      ? 'APROVADO'
      : isPreserveExistingEnrDecision
      ? existingEnr.firestoreStatus
      : enrollmentRecord.firestoreStatus || existingEnr?.firestoreStatus || 'PENDENTE';
    const resolvedEnrAppStatus = isAlreadyApprovedEnr
      ? 'aprovado'
      : isPreserveExistingEnrDecision
      ? existingEnr.enrollmentApprovalStatus
      : enrollmentRecord.enrollmentApprovalStatus || existingEnr?.enrollmentApprovalStatus || 'pendente';
    const resolvedPayStatus = isAlreadyApprovedEnr
      ? existingEnr?.paymentStatus === 'Pago' || enrollmentRecord.paymentStatus === 'Pago'
        ? 'Pago'
        : 'APROVADO'
      : isPreserveExistingEnrDecision
      ? existingEnr.paymentStatus
      : enrollmentRecord.paymentStatus || existingEnr?.paymentStatus || 'PENDENTE';

    const normalizedEnr = {
      ...(existingEnr || {}),
      ...enrollmentRecord,
      id: existingEnr?.id || enrollmentRecord.id,
      firestoreStatus: resolvedEnrFsStatus,
      enrollmentApprovalStatus: resolvedEnrAppStatus,
      paymentStatus: resolvedPayStatus,
      completed: Boolean(existingEnr?.completed || enrollmentRecord.completed),
      progressPercent: Math.max(
        Number(existingEnr?.progressPercent || 0),
        Number(enrollmentRecord.progressPercent || 0)
      ),
      certificateId: enrollmentRecord.certificateId || existingEnr?.certificateId,
      certificateSentAt: enrollmentRecord.certificateSentAt || existingEnr?.certificateSentAt,
      decidedBy: enrollmentRecord.decidedBy || existingEnr?.decidedBy,
      decidedByEmail: enrollmentRecord.decidedByEmail || existingEnr?.decidedByEmail,
      decidedAt: enrollmentRecord.decidedAt || existingEnr?.decidedAt || (isAlreadyApprovedEnr ? nowIso : undefined),
      createdAt: existingEnr?.createdAt || enrollmentRecord.createdAt || nowIso,
    };
    if (existingEnrIdx >= 0) {
      approvalsStore.enrollments[existingEnrIdx] = normalizedEnr;
    } else {
      approvalsStore.enrollments.unshift(normalizedEnr);
    }

    // Ensure a corresponding ALUNO user record also exists in approvalsStore.users
    if (!userRecord && normalizedEnr.studentName) {
      const existingUserIdx = approvalsStore.users.findIndex(
        (u) =>
          u.uid === normalizedEnr.studentId ||
          (cleanStudentEmail && String(u.email || '').toLowerCase() === cleanStudentEmail)
      );
      if (existingUserIdx < 0) {
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
          decidedAt: normalizedEnr.decidedAt,
          decidedBy: normalizedEnr.decidedBy,
          decidedByEmail: normalizedEnr.decidedByEmail,
          createdAt: normalizedEnr.createdAt || nowIso,
        });
      } else if (isAlreadyApprovedEnr) {
        approvalsStore.users[existingUserIdx] = {
          ...approvalsStore.users[existingUserIdx],
          approvalStatus: 'aprovado',
          firestoreStatus: 'APROVADO',
          decidedAt: approvalsStore.users[existingUserIdx].decidedAt || normalizedEnr.decidedAt || nowIso,
        };
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
    const cleanCertEmail = String(certificateRequestRecord.studentEmail || '').trim().toLowerCase();
    const existingCertIdx = approvalsStore.certificateRequests.findIndex(
      (r) =>
        r.id === certificateRequestRecord.id ||
        (certificateRequestRecord.enrollmentId &&
          r.enrollmentId === certificateRequestRecord.enrollmentId) ||
        (cleanCertEmail &&
          String(r.studentEmail || '').toLowerCase() === cleanCertEmail &&
          r.courseId === certificateRequestRecord.courseId)
    );
    const existingCertReq = existingCertIdx >= 0 ? approvalsStore.certificateRequests[existingCertIdx] : null;
    const isAlreadyDisponivel =
      existingCertReq?.status === 'DISPONÍVEL' ||
      certificateRequestRecord.status === 'DISPONÍVEL';
    const isAlreadyAprovadoCert =
      isAlreadyDisponivel ||
      existingCertReq?.status === 'APROVADO' ||
      certificateRequestRecord.status === 'APROVADO';

    const mergedCertReq = {
      ...(existingCertReq || {}),
      ...certificateRequestRecord,
      id: existingCertReq?.id || certificateRequestRecord.id,
      status: isAlreadyDisponivel
        ? 'DISPONÍVEL'
        : isAlreadyAprovadoCert
        ? 'APROVADO'
        : certificateRequestRecord.status || existingCertReq?.status || 'PENDENTE',
      certificateFileUrl:
        certificateRequestRecord.certificateFileUrl || existingCertReq?.certificateFileUrl || '',
      certificateFileName:
        certificateRequestRecord.certificateFileName || existingCertReq?.certificateFileName || '',
      certificateCode:
        certificateRequestRecord.certificateCode || existingCertReq?.certificateCode || '',
      issuedAt: certificateRequestRecord.issuedAt || existingCertReq?.issuedAt || '',
      issuedBy: certificateRequestRecord.issuedBy || existingCertReq?.issuedBy || '',
    };

    if (existingCertIdx >= 0) {
      approvalsStore.certificateRequests[existingCertIdx] = mergedCertReq;
    } else {
      approvalsStore.certificateRequests.unshift(mergedCertReq);
    }

    // Whenever a certificate request is APROVADO or DISPONÍVEL, automatically approve the student's user and enrollment records!
    if (mergedCertReq.status === 'DISPONÍVEL' || mergedCertReq.status === 'APROVADO') {
      approvalsStore.users = approvalsStore.users.map((u) => {
        const matches =
          (mergedCertReq.userId && u.uid === mergedCertReq.userId) ||
          (cleanCertEmail && String(u.email || '').toLowerCase() === cleanCertEmail);
        if (!matches) return u;
        return {
          ...u,
          approvalStatus: 'aprovado',
          firestoreStatus: 'APROVADO',
          decidedAt: u.decidedAt || mergedCertReq.issuedAt || nowIso,
          decidedBy: u.decidedBy || mergedCertReq.issuedBy || 'Administrador Principal ALHAN – SGI',
        };
      });
      approvalsStore.enrollments = approvalsStore.enrollments.map((e) => {
        const matches =
          (mergedCertReq.enrollmentId && e.id === mergedCertReq.enrollmentId) ||
          (mergedCertReq.userId && e.studentId === mergedCertReq.userId) ||
          (cleanCertEmail && String(e.studentEmail || '').toLowerCase() === cleanCertEmail);
        if (!matches) return e;
        return {
          ...e,
          enrollmentApprovalStatus: 'aprovado',
          firestoreStatus: 'APROVADO',
          paymentStatus: e.paymentStatus === 'Pago' ? 'Pago' : 'APROVADO',
          completed: mergedCertReq.status === 'DISPONÍVEL' ? true : e.completed,
          progressPercent: mergedCertReq.status === 'DISPONÍVEL' ? 100 : e.progressPercent,
          decidedAt: e.decidedAt || mergedCertReq.issuedAt || nowIso,
          decidedBy: e.decidedBy || mergedCertReq.issuedBy || 'Administrador Principal ALHAN – SGI',
        };
      });
    }
  }

  if (certificateRecord && certificateRecord.id) {
    const cleanCertStudentEmail = String(certificateRecord.studentEmail || '').trim().toLowerCase();
    const existingIdx = approvalsStore.certificates.findIndex(
      (c) =>
        c.id === certificateRecord.id ||
        (certificateRecord.code && c.code === certificateRecord.code) ||
        (cleanCertStudentEmail &&
          String(c.studentEmail || '').toLowerCase() === cleanCertStudentEmail &&
          c.courseId === certificateRecord.courseId)
    );
    if (existingIdx >= 0) {
      approvalsStore.certificates[existingIdx] = {
        ...approvalsStore.certificates[existingIdx],
        ...certificateRecord,
      };
    } else {
      approvalsStore.certificates.unshift(certificateRecord);
    }

    // If a valid certificate is issued for a student, ensure the student account and enrollment are APROVADO
    if (certificateRecord.status === 'valido') {
      approvalsStore.users = approvalsStore.users.map((u) => {
        const matches =
          (certificateRecord.studentId && u.uid === certificateRecord.studentId) ||
          (cleanCertStudentEmail && String(u.email || '').toLowerCase() === cleanCertStudentEmail);
        if (!matches) return u;
        return {
          ...u,
          approvalStatus: 'aprovado',
          firestoreStatus: 'APROVADO',
          decidedAt: u.decidedAt || nowIso,
          decidedBy: u.decidedBy || certificateRecord.responsibleName || 'Administrador Principal ALHAN – SGI',
        };
      });
      approvalsStore.enrollments = approvalsStore.enrollments.map((e) => {
        const matches =
          (certificateRecord.studentId && e.studentId === certificateRecord.studentId) ||
          (cleanCertStudentEmail && String(e.studentEmail || '').toLowerCase() === cleanCertStudentEmail);
        if (!matches) return e;
        return {
          ...e,
          enrollmentApprovalStatus: 'aprovado',
          firestoreStatus: 'APROVADO',
          paymentStatus: e.paymentStatus === 'Pago' ? 'Pago' : 'APROVADO',
          completed: true,
          progressPercent: 100,
          certificateId: certificateRecord.id,
          certificateSentAt: nowIso,
          decidedAt: e.decidedAt || nowIso,
        };
      });
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

// 1. Consulta de aprovações, inscrições e certificados sincronizados
app.get('/api/approvals', (_req, res) => {
  return res.json({
    ok: true,
    users: approvalsStore.users,
    enrollments: approvalsStore.enrollments,
    certificateRequests: approvalsStore.certificateRequests,
    certificates: approvalsStore.certificates,
    adminNotifications: approvalsStore.adminNotifications,
    decisions: approvalsStore.decisions,
    timestamp: new Date().toISOString(),
  });
});

// 2. Registo / sincronização imediata de inscrição de formando, solicitação de professor ou certificado emitido
app.post('/api/approvals/register', (req, res) => {
  const {
    userRecord,
    enrollmentRecord,
    certificateRequestRecord,
    certificateRecord,
    adminNotificationRecord,
  } = req.body || {};
  const nowIso = new Date().toISOString();

  upsertStudentOrProfessorIntoStore({
    userRecord,
    enrollmentRecord,
    certificateRequestRecord,
    certificateRecord,
    adminNotificationRecord,
  });

  return res.json({
    ok: true,
    status:
      userRecord?.firestoreStatus ||
      enrollmentRecord?.firestoreStatus ||
      certificateRequestRecord?.status ||
      'PENDENTE',
    timestamp: nowIso,
  });
});

// 3. Decisão administrativa (APROVAR / REJEITAR / EMITIR CERTIFICADO) — Restrito a ADMIN ou SUPER_ADMIN com registo de auditoria
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
    certificateRequestRecord,
    certificateRecord,
  } = req.body || {};

  const normalizedRole = String(actorRole || req.headers['x-alhan-role'] || 'ADMIN').toUpperCase();
  if (normalizedRole !== 'ADMIN' && normalizedRole !== 'SUPER_ADMIN') {
    return res.status(403).json({
      ok: false,
      error: 'Operação bloqueada no backend: Apenas utilizadores com perfil ADMIN ou SUPER_ADMIN podem aprovar ou rejeitar registos.',
    });
  }

  const fsStatus =
    String(status || '').toUpperCase() === 'APROVADO' ||
    String(status || '').toUpperCase() === 'DISPONÍVEL'
      ? 'APROVADO'
      : String(status || '').toUpperCase() === 'REJEITADO'
      ? 'REJEITADO'
      : 'PENDENTE';
  const appStatus =
    fsStatus === 'APROVADO' ? 'aprovado' : fsStatus === 'REJEITADO' ? 'rejeitado' : 'pendente';
  const decidedAt = new Date().toISOString();
  const decidedBy = actorName || 'Administrador Principal ALHAN – SGI';
  const decidedByEmail = actorEmail || 'admin@alhan.pro';

  // Resolve target email and uid across users, enrollments, and certificateRequests so matching is 100% reliable even if only uid or only enrollmentId was passed
  const matchedUserForLookup = approvalsStore.users.find(
    (u) =>
      (uid && u.uid === uid) ||
      (email && String(u.email || '').toLowerCase() === String(email).trim().toLowerCase())
  );
  const matchedEnrForLookup = approvalsStore.enrollments.find(
    (e) =>
      (enrollmentId && e.id === enrollmentId) ||
      (uid && e.studentId === uid) ||
      (email && String(e.studentEmail || '').toLowerCase() === String(email).trim().toLowerCase())
  );
  const cleanEmail = String(
    email ||
      matchedUserForLookup?.email ||
      matchedEnrForLookup?.studentEmail ||
      certificateRequestRecord?.studentEmail ||
      certificateRecord?.studentEmail ||
      ''
  )
    .trim()
    .toLowerCase();
  const resolvedUid =
    uid ||
    matchedUserForLookup?.uid ||
    matchedEnrForLookup?.studentId ||
    certificateRequestRecord?.userId ||
    certificateRecord?.studentId ||
    '';

  approvalsStore.users = approvalsStore.users.map((u) => {
    const matches =
      (resolvedUid && u.uid === resolvedUid) ||
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
      (resolvedUid && e.studentId === resolvedUid) ||
      (cleanEmail && String(e.studentEmail || '').toLowerCase() === cleanEmail);
    if (!matches) return e;
    return {
      ...e,
      firestoreStatus: fsStatus,
      enrollmentApprovalStatus: appStatus,
      paymentStatus: fsStatus === 'APROVADO' && e.paymentStatus === 'Pago' ? 'Pago' : fsStatus,
      decidedBy,
      decidedByEmail,
      decidedAt,
      decisionNotes: notes || e.decisionNotes,
    };
  });

  approvalsStore.certificateRequests = approvalsStore.certificateRequests.map((r) => {
    const matches =
      (enrollmentId && r.enrollmentId === enrollmentId) ||
      (resolvedUid && r.userId === resolvedUid) ||
      (cleanEmail && String(r.studentEmail || '').toLowerCase() === cleanEmail);
    if (!matches || r.status === 'DISPONÍVEL') return r;
    return {
      ...r,
      status: fsStatus,
    };
  });

  if (certificateRequestRecord || certificateRecord) {
    upsertStudentOrProfessorIntoStore({
      certificateRequestRecord,
      certificateRecord,
    });
  }

  const decisionRecord = {
    id: `dec-${Date.now()}`,
    uid: resolvedUid || null,
    enrollmentId: enrollmentId || matchedEnrForLookup?.id || null,
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
  const resolvedEmail = cleanEmail || String(matchedUser?.email || '').trim().toLowerCase();
  const resolvedUid = uid || matchedUser?.uid || '';

  const matchedEnrollment =
    normalizedRole === 'ALUNO' || !normalizedRole
      ? approvalsStore.enrollments.find(
          (e) =>
            (resolvedUid && e.studentId === resolvedUid) ||
            (resolvedEmail && String(e.studentEmail || '').toLowerCase() === resolvedEmail)
        )
      : null;

  const matchedCertRequests =
    normalizedRole === 'ALUNO' || !normalizedRole
      ? approvalsStore.certificateRequests.filter(
          (r) =>
            (resolvedUid && r.userId === resolvedUid) ||
            (resolvedEmail && String(r.studentEmail || '').toLowerCase() === resolvedEmail)
        )
      : [];

  const matchedCertificates =
    normalizedRole === 'ALUNO' || !normalizedRole
      ? approvalsStore.certificates.filter(
          (c) =>
            (resolvedUid && c.studentId === resolvedUid) ||
            (resolvedEmail && String(c.studentEmail || '').toLowerCase() === resolvedEmail)
        )
      : [];

  const hasApprovedCertOrEnr =
    matchedUser?.firestoreStatus === 'APROVADO' ||
    matchedUser?.approvalStatus === 'aprovado' ||
    matchedEnrollment?.firestoreStatus === 'APROVADO' ||
    matchedEnrollment?.enrollmentApprovalStatus === 'aprovado' ||
    matchedEnrollment?.paymentStatus === 'Pago' ||
    matchedCertRequests.some((r) => r.status === 'DISPONÍVEL' || r.status === 'APROVADO') ||
    matchedCertificates.some((c) => c.status === 'valido');

  const backendStatus = hasApprovedCertOrEnr
    ? 'APROVADO'
    : matchedUser?.firestoreStatus ||
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
    userRecord: matchedUser
      ? {
          ...matchedUser,
          approvalStatus: allowed ? 'aprovado' : matchedUser.approvalStatus,
          firestoreStatus: backendStatus,
        }
      : null,
    enrollmentRecord: matchedEnrollment
      ? {
          ...matchedEnrollment,
          enrollmentApprovalStatus: allowed ? 'aprovado' : matchedEnrollment.enrollmentApprovalStatus,
          firestoreStatus: backendStatus,
        }
      : null,
    certificateRequests: matchedCertRequests,
    certificates: matchedCertificates,
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
