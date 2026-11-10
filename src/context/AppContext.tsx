import React, { createContext, useContext, useEffect, useState } from 'react';
import {
   onAuthStateChanged,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  saveEnrollmentToFirestore,
  updateEnrollmentPaymentInFirestore,
  updateEnrollmentStatusInFirestore,
  updateEnrollmentProgressInFirestore,
  uploadCertificatePdfToStorage,
  saveCertificateRequestToFirestore,
  updateCertificateRequestInFirestore,
  saveAdminNotificationToFirestore,
  saveUserRegistrationToFirestore,
  updateUserApprovalInFirestore,
  deleteUserRegistrationFromFirestore,
  deleteEnrollmentFromFirestore,
} from '../firebase';
import {
  CourseItem,
  IsoStandardItem,
  EnrollmentItem,
  InstallmentStatus,
  PaymentHistoryEntry,
  DataAuditCandidateItem,
  CertificateItem,
  CertificateRequestItem,
  CertificateRequestStatus,
  CertificateAuditEntry,
  AdminNotificationRecord,
  IsoProjectItem,
  IsoDocumentItem,
  IsoAuditItem,
  NonConformityItem,
  DiagnosticRequestItem,
  NotificationItem,
  TestimonialItem,
  UserRole,
  INITIAL_COURSES,
  INITIAL_ISO_STANDARDS,
  INITIAL_ENROLLMENTS,
  INITIAL_CERTIFICATES,
  INITIAL_CERTIFICATE_REQUESTS,
  INITIAL_ADMIN_NOTIFICATIONS,
  INITIAL_ISO_PROJECTS,
  INITIAL_ISO_DOCUMENTS,
  INITIAL_ISO_AUDITS,
  INITIAL_NON_CONFORMITIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_TESTIMONIALS,
  PanelCredentialItem,
  INITIAL_PANEL_CREDENTIALS,
  AdminEmailNotificationItem,
  DynamicCountersConfig,
  EmployabilityIndicatorItem,
  AlumniTrackingRecord,
  ImpactEvidenceDocument,
  PublicImpactReportItem,
  ImpactGovernanceAuditEntry,
  TrainingPortfolioHistoryItem,
  InstitutionalPartnershipItem,
  INITIAL_DYNAMIC_COUNTERS,
  INITIAL_EMPLOYABILITY_INDICATORS,
  INITIAL_ALUMNI_TRACKING,
  INITIAL_IMPACT_EVIDENCES,
  INITIAL_PUBLIC_IMPACT_REPORTS,
  INITIAL_IMPACT_AUDIT_LOGS,
  INITIAL_TRAINING_PORTFOLIO_HISTORY,
  INITIAL_INSTITUTIONAL_PARTNERSHIPS,
  calculateCourseDiscountedPricing,
  ALHAN_COUPON_CODE,
} from '../data/initialData';

export type AccountApprovalState = 'pendente' | 'aprovado' | 'rejeitado' | 'suspenso' | 'bloqueado';
export type FirestoreApprovalState = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

export function toFirestoreApprovalState(status?: AccountApprovalState | string): FirestoreApprovalState {
  const s = (status || '').toLowerCase();
  if (s === 'aprovado' || s === 'ativo' || s === 'pago') return 'APROVADO';
  if (s === 'rejeitado' || s === 'bloqueado' || s === 'suspenso' || s === 'cancelado') return 'REJEITADO';
  return 'PENDENTE';
}

export function fromFirestoreApprovalState(status?: string): AccountApprovalState {
  const s = (status || '').toUpperCase();
  if (s === 'APROVADO' || s === 'ATIVO' || s === 'PAGO') return 'aprovado';
  if (s === 'REJEITADO' || s === 'INATIVO' || s === 'CANCELADO') return 'rejeitado';
  return 'pendente';
}

export interface ActiveUser {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  studentBI?: string;
  role: UserRole;
  companyId: string;
  companyName?: string;
  specialty?: string;
  experience?: string;
  desiredCourseId?: string;
  desiredCourseTitle?: string;
  approvalStatus?: AccountApprovalState;
  firestoreStatus?: FirestoreApprovalState;
  decidedBy?: string;
  decidedByEmail?: string;
  decidedAt?: string;
}

export interface RegisteredUserAccount {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  studentBI?: string;
  password: string;
  role: 'ALUNO' | 'CLIENTE_EMPRESARIAL' | 'PROFESSOR';
  companyId: string;
  companyName?: string;
  specialty?: string;
  experience?: string;
  desiredCourseId?: string;
  desiredCourseTitle?: string;
  approvalStatus?: AccountApprovalState;
  firestoreStatus?: FirestoreApprovalState;
  decidedBy?: string;
  decidedByEmail?: string;
  decidedAt?: string;
  decisionNotes?: string;
  createdAt: string;
}

export interface SystemBackupSnapshot {
  backupId: string;
  createdAt: string;
  createdBy: string;
  registeredUsers: RegisteredUserAccount[];
  enrollments: EnrollmentItem[];
  certificates: CertificateItem[];
  certificateRequests: CertificateRequestItem[];
}

export function computeCourseInstallments(
  course?: Partial<CourseItem>,
  enrollmentDateIso?: string,
  options?: { couponCode?: string; applyBlackFriday?: boolean }
) {
  const basePriceKz = Number(course?.priceKz) || 0;
  const hasDiscountOptions = options !== undefined;
  const discountInfo = calculateCourseDiscountedPricing(
    basePriceKz,
    options?.couponCode,
    options?.applyBlackFriday ?? false
  );
  const totalKz = hasDiscountOptions ? discountInfo.finalPriceKz : basePriceKz;

  const firstKz = hasDiscountOptions
    ? discountInfo.firstInstallmentKz
    : course?.firstInstallmentKz !== undefined && course.firstInstallmentKz > 0
    ? Number(course.firstInstallmentKz)
    : Math.round(totalKz * 0.5);
  const secondKz = hasDiscountOptions
    ? discountInfo.secondInstallmentKz
    : course?.secondInstallmentKz !== undefined && course.secondInstallmentKz >= 0
    ? Number(course.secondInstallmentKz)
    : Math.max(0, totalKz - firstKz);
  const enrollDate = (enrollmentDateIso || new Date().toISOString()).slice(0, 10);
  const startDate =
    course?.courseStartDate ||
    new Date(new Date(enrollDate).getTime() + 3 * 86400000).toISOString().slice(0, 10);
  const secondDueDate = new Date(new Date(startDate).getTime() + 7 * 86400000)
    .toISOString()
    .slice(0, 10);

  return {
    originalPriceKz: basePriceKz,
    totalKz,
    firstKz,
    secondKz,
    discountPercent: hasDiscountOptions ? discountInfo.effectiveDiscountPercent : 0,
    appliedCoupon: discountInfo.couponValid ? ALHAN_COUPON_CODE : undefined,
    blackFridayApplied: hasDiscountOptions ? discountInfo.blackFridayApplied : false,
    firstDueDate: enrollDate,
    courseStartDate: startDate,
    startDate,
    secondDueDate,
  };
}

interface AppContextValue {
  user: ActiveUser | null;
  authReady: boolean;
  registeredUsers: RegisteredUserAccount[];
  courses: CourseItem[];
  isoStandards: IsoStandardItem[];
  enrollments: EnrollmentItem[];
  certificates: CertificateItem[];
  certificateRequests: CertificateRequestItem[];
  adminNotifications: AdminNotificationRecord[];
  selectedAdminCertificateRequestId: string | null;
  setSelectedAdminCertificateRequestId: (id: string | null) => void;
  isoProjects: IsoProjectItem[];
  isoDocuments: IsoDocumentItem[];
  isoAudits: IsoAuditItem[];
  nonConformities: NonConformityItem[];
  diagnosticRequests: DiagnosticRequestItem[];
  notifications: NotificationItem[];
  emailNotifications: AdminEmailNotificationItem[];
  testimonials: TestimonialItem[];
  panelCredentials: PanelCredentialItem[];
  updatePanelCredential: (role: UserRole, username: string, email: string, password: string) => void;
  updateUserApprovalStatus: (uid: string, status: AccountApprovalState) => void;
  purgeStudentAccountByEmail: (email: string) => Promise<number>;
  applyDiscountToEnrollment: (
    enrollmentId: string,
    couponCode?: string,
    applyBlackFriday?: boolean
  ) => Promise<void>;
  updateStudentAccountDetails: (
    uidOrPayload:
      | string
      | {
          uid?: string;
          enrollmentId?: string;
          fullName?: string;
          email?: string;
          phone?: string;
          studentBI?: string;
          companyName?: string;
          approvalStatus?: AccountApprovalState;
          courseTitle?: string;
          modality?: 'Online' | 'Presencial' | 'Híbrida';
          amountKz?: number;
          firstInstallmentAmountKz?: number;
          secondInstallmentAmountKz?: number;
        },
    updates?: {
      fullName?: string;
      email?: string;
      phone?: string;
      studentBI?: string;
      companyName?: string;
      approvalStatus?: AccountApprovalState;
    }
  ) => void;
  requestSecurePasswordResetLink: (
    emailOrUser: string,
    phoneHint?: string
  ) => Promise<{
    fullName: string;
    email: string;
    phone: string;
    resetToken: string;
    resetLink: string;
    resetTokenUrl: string;
    dispatchedViaFirebase: boolean;
  }>;
  resetPasswordByEmail: (emailOrUser: string, newPassword: string) => Promise<RegisteredUserAccount>;
  deleteRegisteredUser: (uid: string) => void;
  deleteEnrollment: (enrollmentId: string) => Promise<void>;
  updateInstallmentPaymentStatus: (
    enrollmentId: string,
    target: 'FIRST' | 'SECOND' | 'BOTH' | '1ª Parcela' | '2ª Parcela' | 'Ambas',
    status: InstallmentStatus,
    adminNote?: string
  ) => Promise<void>;
  updateEnrollmentApprovalStatus: (
    enrollmentId: string,
    approvalStatus: 'pendente' | 'aprovado' | 'rejeitado'
  ) => Promise<void>;
  notifySecondInstallmentDue: (enrollmentId: string) => void;
  auditCandidates: DataAuditCandidateItem[];
  lastSystemBackup: SystemBackupSnapshot | null;
  createDataSafetyBackup: () => SystemBackupSnapshot;
  executeAdminConfirmedDataCleanup: (selectedIds: string[]) => {
    removedCount: number;
    deletedCount: number;
    backupId: string;
    backup: SystemBackupSnapshot;
  };
  restoreDataSafetyBackup: () => boolean;
  requestCertificate: (
    enrollmentId: string,
    requestDetails?: {
      courseId?: string;
      studentName?: string;
      studentBI?: string;
      studentEmail?: string;
      studentPhone?: string;
      notes?: string;
    }
  ) => Promise<void>;
  submitCertificateRequest: (payload: {
    enrollmentId: string;
    courseId: string;
    studentName: string;
    studentEmail: string;
    studentPhone?: string;
    studentBI?: string;
    studentNotes?: string;
  }) => Promise<CertificateRequestItem>;
  updateCertificateRequestStatus: (
    requestId: string,
    nextStatus: Exclude<CertificateRequestStatus, 'NÃO SOLICITADO' | 'DISPONÍVEL'>,
    options?: {
      adminNotes?: string;
      rejectionReason?: string;
    }
  ) => Promise<void>;
  emitAndDeliverCertificateRequest: (
    requestId: string,
    payload: {
      pdfFile?: File;
      certificateFileUrl?: string;
      certificateFileName?: string;
      certificateCode?: string;
      issuedDate?: string;
      adminNotes?: string;
      studentBI?: string;
      grade?: string;
    }
  ) => Promise<CertificateRequestItem>;
  replaceOrRevokeCertificateRequest: (
    requestId: string,
    action: 'SUBSTITUIR' | 'REVOGAR',
    reason: string,
    replacementFile?: File
  ) => Promise<void>;
  markAdminNotificationRead: (id: string) => void;
  markAllAdminNotificationsRead: () => void;
  activityLogs: { id: string; action: string; actor: string; timestamp: string }[];
  pushPermission: NotificationPermission | 'unsupported';
  requestPushPermission: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithCredentials: (identifier: string, password: string, selectedRole?: UserRole) => Promise<UserRole>;
  registerAccount: (payload: {
    fullName: string;
    email: string;
    phone: string;
    studentBI?: string;
    username: string;
    password: string;
    role: UserRole;
    companyName?: string;
    specialty?: string;
    experience?: string;
    courseId?: string;
    modality?: 'Online' | 'Presencial' | 'Híbrida';
    couponCode?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  saveCourse: (course: CourseItem) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  addIsoStandard: (standard: IsoStandardItem) => void;
  addTestimonial: (item: {
    clientName: string;
    role: string;
    companyName: string;
    companySector?: string;
    serviceType?: string;
    rating: number;
    feedback: string;
    projectOutcome?: string;
    testimonialType?: 'FORMANDO' | 'CLIENTE_EMPRESARIAL';
    authorizedForPublication?: boolean;
  }) => Promise<TestimonialItem>;
  updateTestimonialApprovalStatus: (
    id: string,
    approvalStatus: 'pendente' | 'aprovado' | 'rejeitado'
  ) => void;
  deleteTestimonial: (id: string) => void;
  dynamicCounters: DynamicCountersConfig;
  updateDynamicCounters: (updates: Partial<DynamicCountersConfig>) => void;
  employabilityIndicators: EmployabilityIndicatorItem[];
  saveEmployabilityIndicator: (item: EmployabilityIndicatorItem) => void;
  alumniTrackingRecords: AlumniTrackingRecord[];
  saveAlumniTrackingRecord: (item: AlumniTrackingRecord) => void;
  deleteAlumniTrackingRecord: (id: string) => void;
  impactEvidences: ImpactEvidenceDocument[];
  saveImpactEvidence: (item: ImpactEvidenceDocument) => void;
  deleteImpactEvidence: (id: string) => void;
  trainingPortfolioHistory: TrainingPortfolioHistoryItem[];
  saveTrainingPortfolioHistoryItem: (item: TrainingPortfolioHistoryItem) => void;
  deleteTrainingPortfolioHistoryItem: (id: string) => void;
  institutionalPartnerships: InstitutionalPartnershipItem[];
  saveInstitutionalPartnership: (item: InstitutionalPartnershipItem) => void;
  deleteInstitutionalPartnership: (id: string) => void;
  impactReports: PublicImpactReportItem[];
  saveImpactReport: (report: PublicImpactReportItem) => void;
  deleteImpactReport: (id: string) => void;
  impactAuditLogs: ImpactGovernanceAuditEntry[];
  createEnrollment: (payload: {
    course: CourseItem;
    modality: 'Online' | 'Presencial' | 'Híbrida';
    paymentMethod: EnrollmentItem['paymentMethod'];
    paymentReference: string;
    receiptNote: string;
    receiptFileUrl?: string;
    receiptFileName?: string;
    studentName?: string;
    studentPhone?: string;
    studentEmail?: string;
    studentBI?: string;
    installmentOption?: '1ª Parcela' | '2ª Parcela' | 'Pagamento Integral';
    installmentTarget?: '1ª Parcela' | '2ª Parcela' | 'Pagamento Integral';
    couponCode?: string;
    applyBlackFriday?: boolean;
  }) => Promise<EnrollmentItem>;
  submitStudentPaymentProof: (payload: {
    enrollmentId?: string;
    course: CourseItem;
    modality: 'Online' | 'Presencial' | 'Híbrida';
    paymentMethod: EnrollmentItem['paymentMethod'];
    paymentReference: string;
    receiptNote: string;
    receiptFileUrl?: string;
    receiptFileName?: string;
    studentPhone?: string;
    studentEmail?: string;
    installmentOption?: '1ª Parcela' | '2ª Parcela' | 'Pagamento Integral';
    installmentTarget?: '1ª Parcela' | '2ª Parcela' | 'Pagamento Integral';
  }) => Promise<EnrollmentItem>;
  updateEnrollmentStatus: (enrollmentId: string, status: EnrollmentItem['paymentStatus']) => Promise<void>;
  completeLesson: (enrollmentId: string, lessonId: string, totalLessons: number, quizScore?: number) => Promise<void>;
  issueCertificate: (
    enrollment: EnrollmentItem,
    pdfOptions?: {
      certificateFileUrl?: string;
      certificateFileName?: string;
      studentBI?: string;
      grade?: string;
    }
  ) => Promise<CertificateItem>;
  addPresencialCertificate: (item: {
    studentName: string;
    studentBI?: string;
    studentPhone?: string;
    studentEmail?: string;
    courseTitle: string;
    workloadHours: number;
    issuedDate: string;
    grade?: string;
    certificateFileUrl?: string;
    certificateFileName?: string;
    responsibleName?: string;
    responsibleRole?: string;
    customCode?: string;
  }) => Promise<CertificateItem>;
  updateCertificateStatus: (certId: string, status: CertificateItem['status']) => Promise<void>;
  deleteCertificate: (certId: string) => Promise<void>;
  clearAllCertificates: () => Promise<void>;
  cancelCertificateRequest: (enrollmentId: string) => Promise<void>;
  submitDiagnosticOrContact: (item: Omit<DiagnosticRequestItem, 'id' | 'userId' | 'status' | 'createdAt'>) => Promise<void>;
  updateDiagnosticStatus: (id: string, status: DiagnosticRequestItem['status']) => Promise<void>;
  saveIsoProject: (project: IsoProjectItem) => Promise<void>;
  saveIsoDocument: (docItem: IsoDocumentItem) => Promise<void>;
  saveIsoAudit: (audit: IsoAuditItem) => Promise<void>;
  saveNonConformity: (nc: NonConformityItem) => Promise<void>;
  markNotificationRead: (id: string) => void;
  triggerNotification: (category: NotificationItem['category'], title: string, message: string, targetRole?: UserRole | 'ALL') => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const PURGED_STUDENT_EMAIL = 'joaomuatxissombo22@gmail.com';
const PURGE_FLAG_KEY = 'alhan_purged_joao_student_v3';

function runInitialPurgeForJoaoStudentIfNeeded() {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(PURGE_FLAG_KEY) === 'done') return;

    const rawUsers = localStorage.getItem('alhan_registered_users');
    if (rawUsers) {
      const parsedUsers = JSON.parse(rawUsers) as RegisteredUserAccount[];
      const filteredUsers = parsedUsers.filter(
        (u) =>
          u.email?.toLowerCase() !== PURGED_STUDENT_EMAIL &&
          u.username?.toLowerCase() !== 'joaomuatxissombo22'
      );
      localStorage.setItem('alhan_registered_users', JSON.stringify(filteredUsers));
    }

    const rawEnr = localStorage.getItem('alhan_enrollments');
    if (rawEnr) {
      const parsedEnr = JSON.parse(rawEnr) as EnrollmentItem[];
      const filteredEnr = parsedEnr.filter(
        (e) => e.studentEmail?.toLowerCase() !== PURGED_STUDENT_EMAIL
      );
      localStorage.setItem('alhan_enrollments', JSON.stringify(filteredEnr));
    }

    const rawCertReqs = localStorage.getItem('alhan_certificate_requests');
    if (rawCertReqs) {
      const parsedReqs = JSON.parse(rawCertReqs) as CertificateRequestItem[];
      const filteredReqs = parsedReqs.filter(
        (r) => r.studentEmail?.toLowerCase() !== PURGED_STUDENT_EMAIL
      );
      localStorage.setItem('alhan_certificate_requests', JSON.stringify(filteredReqs));
    }

    const rawActive = localStorage.getItem('alhan_active_user');
    if (rawActive) {
      const parsedActive = JSON.parse(rawActive) as ActiveUser | null;
      if (parsedActive?.email?.toLowerCase() === PURGED_STUDENT_EMAIL) {
        localStorage.removeItem('alhan_active_user');
      }
    }

    sessionStorage.removeItem('alhan_panel_unlocked_ALUNO');
    localStorage.setItem(PURGE_FLAG_KEY, 'done');
  } catch {
    // Ignore storage access errors
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  runInitialPurgeForJoaoStudentIfNeeded();

  const [user, setUser] = useState<ActiveUser | null>(() => {
    const u = loadLocal<ActiveUser | null>('alhan_active_user', null);
    if (u && (u.fullName?.includes('[DEMO]') || u.uid?.startsWith('demo-'))) {
      return null;
    }
    return u;
  });
  const [authReady, setAuthReady] = useState(false);

  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserAccount[]>(() => {
    const stored = loadLocal<RegisteredUserAccount[]>('alhan_registered_users', []);
    const rawStoredEnrollments = loadLocal<EnrollmentItem[]>('alhan_enrollments', INITIAL_ENROLLMENTS);
    const storedEnrollments = [...rawStoredEnrollments];
    INITIAL_ENROLLMENTS.forEach((initEnr) => {
      const initEmail = (initEnr.studentEmail || '').trim().toLowerCase();
      const alreadyPresent = storedEnrollments.some(
        (e) =>
          e.id === initEnr.id ||
          (initEmail && (e.studentEmail || '').trim().toLowerCase() === initEmail)
      );
      if (!alreadyPresent) {
        storedEnrollments.unshift(initEnr);
      }
    });
    const merged = stored.map((u) => {
      const appState =
        u.approvalStatus ||
        (u.role === 'PROFESSOR' || u.role === 'ALUNO' ? 'pendente' : 'aprovado');
      return {
        ...u,
        approvalStatus: appState,
        firestoreStatus: u.firestoreStatus || toFirestoreApprovalState(appState),
      };
    });
    // Ensure every enrolled student also has a RegisteredUserAccount record visible in the Admin Panel
    storedEnrollments.forEach((enr) => {
      const cleanEmail = (enr.studentEmail || '').trim().toLowerCase();
      const exists = merged.some(
        (u) =>
          u.uid === enr.studentId ||
          (cleanEmail && u.email.toLowerCase() === cleanEmail)
      );
      if (!exists && enr.studentName) {
        const appState = enr.enrollmentApprovalStatus || 'pendente';
        merged.push({
          uid: enr.studentId || `usr-${enr.id}`,
          fullName: enr.studentName.replace('[DEMO] ', ''),
          username: cleanEmail ? cleanEmail.split('@')[0] : `aluno.${enr.id}`,
          email: cleanEmail || 'aluno@alhan.pro',
          phone: enr.studentPhone || '+244 922 021 211',
          studentBI: enr.studentBI,
          password: 'Alhan@Aluno2026',
          role: 'ALUNO',
          companyId: 'alhan-aluno',
          approvalStatus: appState,
          firestoreStatus: enr.firestoreStatus || toFirestoreApprovalState(appState),
          createdAt: enr.createdAt || new Date().toISOString(),
        });
      }
    });
    return merged;
  });

  const [courses, setCourses] = useState<CourseItem[]>(() => {
    const stored = loadLocal<CourseItem[]>('alhan_courses', INITIAL_COURSES);
    const mergedMap = new Map<string, CourseItem>();
    // Always place INITIAL_COURSES first so featured HSE course is guaranteed at the top
    INITIAL_COURSES.forEach((ic) => mergedMap.set(ic.id, ic));
    stored.forEach((sc) => {
      const initialMatch = INITIAL_COURSES.find((ic) => ic.id === sc.id);
      mergedMap.set(sc.id, {
        ...initialMatch,
        ...sc,
        featured: initialMatch?.featured ?? sc.featured,
        featuredBadge: initialMatch?.featuredBadge ?? sc.featuredBadge,
        imageUrl: initialMatch?.imageUrl || sc.imageUrl || '/assets/aistudio/iso_a9fe34ed.jpg',
      });
    });
    return Array.from(mergedMap.values()).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  });

  const [isoStandards, setIsoStandards] = useState<IsoStandardItem[]>(() => loadLocal('alhan_iso_standards', INITIAL_ISO_STANDARDS));
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>(() => {
    const rawStored = loadLocal<EnrollmentItem[]>('alhan_enrollments', INITIAL_ENROLLMENTS);
    const stored = [...rawStored];
    INITIAL_ENROLLMENTS.forEach((initEnr) => {
      const initEmail = (initEnr.studentEmail || '').trim().toLowerCase();
      const alreadyPresent = stored.some(
        (e) =>
          e.id === initEnr.id ||
          (initEmail && (e.studentEmail || '').trim().toLowerCase() === initEmail)
      );
      if (!alreadyPresent) {
        stored.unshift(initEnr);
      }
    });
    const storedUsers = loadLocal<RegisteredUserAccount[]>('alhan_registered_users', []);
    const todayStr = new Date().toISOString().slice(0, 10);
    const normalized: EnrollmentItem[] = stored.map((e): EnrollmentItem => {
      const matchedCourse = INITIAL_COURSES.find((c) => c.id === e.courseId);
      const calc = computeCourseInstallments(matchedCourse, e.createdAt);
      const firstStatus: InstallmentStatus =
        e.firstInstallmentStatus || (e.paymentStatus === 'Pago' ? 'Pago' : 'Pendente');
      const secondDue = e.secondInstallmentDueDate || calc.secondDueDate;
      let secondStatus: InstallmentStatus =
        e.secondInstallmentStatus || (e.paymentStatus === 'Pago' ? 'Pago' : 'Pendente');
      if (secondStatus === 'Pendente' && secondDue < todayStr) {
        secondStatus = 'Em atraso';
      }
      const appState =
        e.enrollmentApprovalStatus ||
        (e.paymentStatus === 'Pago' || e.paymentStatus === 'APROVADO' ? 'aprovado' : 'pendente');
      return {
        ...e,
        studentName: e.studentName.replace('[DEMO] ', ''),
        enrollmentApprovalStatus: appState,
        firestoreStatus: e.firestoreStatus || toFirestoreApprovalState(appState),
        certificateRequested: e.certificateRequested ?? true,
        certificateRequestedAt: e.certificateRequestedAt || e.createdAt || new Date().toISOString(),
        certificateRequestName: e.certificateRequestName || e.studentName.replace('[DEMO] ', ''),
        certificateRequestEmail: e.certificateRequestEmail || e.studentEmail,
        certificateRequestPhone: e.certificateRequestPhone || e.studentPhone,
        certificateRequestBI: e.certificateRequestBI || e.studentBI || '',
        courseStartDate: e.courseStartDate || calc.courseStartDate,
        firstInstallmentAmountKz: e.firstInstallmentAmountKz ?? calc.firstKz,
        firstInstallmentDueDate: e.firstInstallmentDueDate || calc.firstDueDate,
        firstInstallmentStatus: firstStatus,
        secondInstallmentAmountKz: e.secondInstallmentAmountKz ?? calc.secondKz,
        secondInstallmentDueDate: secondDue,
        secondInstallmentStatus: secondStatus,
        paymentHistory:
          e.paymentHistory && e.paymentHistory.length > 0
            ? e.paymentHistory
            : [
                {
                  id: `hist-p1-${e.id}`,
                  installment: '1ª Parcela',
                  amountKz: e.firstInstallmentAmountKz ?? calc.firstKz,
                  dueDate: e.firstInstallmentDueDate || calc.firstDueDate,
                  paidAt: firstStatus === 'Pago' ? (e.createdAt || todayStr).slice(0, 10) : undefined,
                  method: e.paymentMethod,
                  reference: `${e.paymentReference}-P1`,
                  status: firstStatus,
                  note: '1ª Parcela obrigatória no acto da inscrição para confirmar a vaga.',
                },
                {
                  id: `hist-p2-${e.id}`,
                  installment: '2ª Parcela',
                  amountKz: e.secondInstallmentAmountKz ?? calc.secondKz,
                  dueDate: secondDue,
                  paidAt: secondStatus === 'Pago' ? secondDue : undefined,
                  method: e.paymentMethod,
                  reference: `${e.paymentReference}-P2`,
                  status: secondStatus,
                  note: '2ª Parcela (restante valor) com vencimento 1 semana após o início da formação.',
                },
              ],
      };
    });

    // Ensure every registered ALUNO account also has a corresponding EnrollmentItem so it appears in all Admin tables
    storedUsers
      .filter((u) => u.role === 'ALUNO')
      .forEach((u) => {
        const cleanEmail = (u.email || '').trim().toLowerCase();
        const hasEnr = normalized.some(
          (e) =>
            e.studentId === u.uid ||
            (cleanEmail && e.studentEmail?.toLowerCase() === cleanEmail)
        );
        if (!hasEnr) {
          const defaultCourse = INITIAL_COURSES[0];
          const calc = computeCourseInstallments(defaultCourse, u.createdAt, {
            applyBlackFriday: true,
          });
          const appState =
            u.approvalStatus === 'aprovado' || u.approvalStatus === 'rejeitado'
              ? u.approvalStatus
              : 'pendente';
          const fsState = u.firestoreStatus || toFirestoreApprovalState(appState);
          const enrId = `enr-${u.uid}`;
          normalized.unshift({
            id: enrId,
            studentId: u.uid,
            studentName: u.fullName,
            studentPhone: u.phone || '+244 922 021 211',
            studentEmail: u.email,
            studentBI: u.studentBI,
            courseId: defaultCourse.id,
            courseTitle: defaultCourse.title,
            modality: defaultCourse.modality,
            originalAmountKz: calc.originalPriceKz,
            amountKz: calc.totalKz,
            discountPercent: calc.discountPercent,
            blackFridayApplied: calc.blackFridayApplied,
            paymentMethod: 'Express Angola',
            paymentReference: `CAD-${u.uid.slice(-6).toUpperCase()}`,
            receiptNote:
              'Cadastro realizado no Painel do Aluno — Aguarda aprovação do estado no Painel Administrativo Central ALHAN – SGI.',
            paymentStatus: fsState === 'APROVADO' ? 'APROVADO' : 'PENDENTE',
            enrollmentApprovalStatus: appState,
            firestoreStatus: fsState,
            courseStartDate: calc.courseStartDate,
            firstInstallmentAmountKz: calc.firstKz,
            firstInstallmentDueDate: calc.firstDueDate,
            firstInstallmentStatus: 'Pendente',
            firstInstallmentReference: `CAD-${u.uid.slice(-6).toUpperCase()}-P1`,
            secondInstallmentAmountKz: calc.secondKz,
            secondInstallmentDueDate: calc.secondDueDate,
            secondInstallmentStatus: 'Pendente',
            secondInstallmentReference: `CAD-${u.uid.slice(-6).toUpperCase()}-P2`,
            paymentHistory: [],
            progressPercent: 0,
            completedLessons: [],
            completed: false,
            certificateRequested: true,
            certificateRequestedAt: u.createdAt || new Date().toISOString(),
            certificateRequestName: u.fullName,
            certificateRequestEmail: u.email,
            certificateRequestPhone: u.phone,
            certificateRequestBI: u.studentBI || '',
            certificateRequestNotes:
              'Solicitação de certificado vinculada ao cadastro do formando para aprovação administrativa.',
            enrolledAt: u.createdAt || new Date().toISOString(),
            createdAt: u.createdAt || new Date().toISOString(),
          });
        }
      });

    return normalized;
  });
  const [lastSystemBackup, setLastSystemBackup] = useState<SystemBackupSnapshot | null>(() =>
    loadLocal<SystemBackupSnapshot | null>('alhan_safety_backup_v1', null)
  );
  const [certificates, setCertificates] = useState<CertificateItem[]>(() => {
    const stored = loadLocal<CertificateItem[]>('alhan_certificates', INITIAL_CERTIFICATES);
    return stored.map((c) => ({
      ...c,
      code: c.code === 'ALHAN-DEMO-2026-001' ? 'ALHAN-SGI-2026-001' : c.code,
      studentName: c.studentName.replace('[DEMO] ', ''),
      // Certificates for students cannot be generated online automatically; only Admin-uploaded PDFs are valid
      certificateFileUrl: c.certificateFileUrl || '',
      isDemo: false,
    }));
  });
  const [certificateRequests, setCertificateRequests] = useState<CertificateRequestItem[]>(() => {
    const rawStored = loadLocal<CertificateRequestItem[]>(
      'alhan_certificate_requests',
      INITIAL_CERTIFICATE_REQUESTS
    );
    const stored = [...rawStored];
    INITIAL_CERTIFICATE_REQUESTS.forEach((initReq) => {
      const initEmail = (initReq.studentEmail || '').trim().toLowerCase();
      const alreadyPresent = stored.some(
        (r) =>
          r.id === initReq.id ||
          r.enrollmentId === initReq.enrollmentId ||
          (initEmail && (r.studentEmail || '').trim().toLowerCase() === initEmail)
      );
      if (!alreadyPresent) {
        stored.unshift(initReq);
      }
    });
    const rawStoredEnrollments = loadLocal<EnrollmentItem[]>('alhan_enrollments', INITIAL_ENROLLMENTS);
    const storedEnrollments = [...rawStoredEnrollments];
    INITIAL_ENROLLMENTS.forEach((initEnr) => {
      const initEmail = (initEnr.studentEmail || '').trim().toLowerCase();
      const alreadyPresent = storedEnrollments.some(
        (e) =>
          e.id === initEnr.id ||
          (initEmail && (e.studentEmail || '').trim().toLowerCase() === initEmail)
      );
      if (!alreadyPresent) {
        storedEnrollments.unshift(initEnr);
      }
    });
    const storedUsers = loadLocal<RegisteredUserAccount[]>('alhan_registered_users', []);
    const normalizedReqs = stored.map((req) => {
      // Do NOT auto-generate online PDFs. If a request has no Admin-uploaded PDF file URL, keep it PENDENTE for Admin emission
      const hasAdminUploadedPdf = Boolean(req.certificateFileUrl && req.certificateFileUrl.trim().length > 0);
      return {
        ...req,
        status: req.status === 'DISPONÍVEL' && !hasAdminUploadedPdf ? 'PENDENTE' : req.status,
        certificateFileUrl: hasAdminUploadedPdf ? req.certificateFileUrl : '',
      };
    });

    // Ensure every enrollment and every registered ALUNO has a CertificateRequestItem in the Admin Panel for state approval
    storedEnrollments.forEach((enr) => {
      const cleanEmail = (enr.studentEmail || '').trim().toLowerCase();
      const exists = normalizedReqs.some(
        (r) =>
          r.enrollmentId === enr.id ||
          (r.courseId === enr.courseId &&
            (r.userId === enr.studentId ||
              (cleanEmail && r.studentEmail.toLowerCase() === cleanEmail)))
      );
      if (!exists && enr.studentName) {
        const courseObj = INITIAL_COURSES.find((c) => c.id === enr.courseId);
        const nowIso = enr.createdAt || new Date().toISOString();
        normalizedReqs.unshift({
          id: `cert-req-${enr.id}`,
          enrollmentId: enr.id,
          userId: enr.studentId || `usr-${enr.id}`,
          studentName: enr.studentName.replace('[DEMO] ', ''),
          studentEmail: enr.studentEmail || 'aluno@alhan.pro',
          studentPhone: enr.studentPhone || '+244 922 021 211',
          studentBI: enr.studentBI || enr.certificateRequestBI || '',
          courseId: enr.courseId,
          courseName: enr.courseTitle,
          modality: enr.modality,
          workloadHours: courseObj?.durationHours || 40,
          enrollmentDate: nowIso.slice(0, 10),
          completionDate: nowIso.slice(0, 10),
          requestDate: nowIso,
          studentNotes:
            enr.certificateRequestNotes ||
            'Registo de formando e certificado submetidos para aprovação no Painel Administrativo Central.',
          status: enr.enrollmentApprovalStatus === 'aprovado' ? 'APROVADO' : 'PENDENTE',
          certificateStoragePath: '',
          certificateFileUrl: '',
          certificateFileName: '',
          certificateCode: '',
          issuedAt: '',
          issuedBy: '',
          adminNotes: '',
          auditHistory: [
            {
              id: `aud-init-${enr.id}`,
              action: 'SOLICITADO',
              statusAfter: 'PENDENTE',
              actorName: enr.studentName.replace('[DEMO] ', ''),
              actorRole: 'ALUNO',
              notes: 'Inscrição e registo de certificado criados no Painel do Aluno.',
              timestamp: nowIso,
            },
          ],
          createdAt: nowIso,
        });
      }
    });

    storedUsers
      .filter((u) => u.role === 'ALUNO')
      .forEach((u) => {
        const cleanEmail = (u.email || '').trim().toLowerCase();
        const exists = normalizedReqs.some(
          (r) =>
            r.userId === u.uid ||
            (cleanEmail && r.studentEmail.toLowerCase() === cleanEmail)
        );
        if (!exists) {
          const defaultCourse = INITIAL_COURSES[0];
          const nowIso = u.createdAt || new Date().toISOString();
          normalizedReqs.unshift({
            id: `cert-req-${u.uid}`,
            enrollmentId: `enr-${u.uid}`,
            userId: u.uid,
            studentName: u.fullName,
            studentEmail: u.email,
            studentPhone: u.phone || '+244 922 021 211',
            studentBI: u.studentBI || '',
            courseId: defaultCourse.id,
            courseName: defaultCourse.title,
            modality: defaultCourse.modality,
            workloadHours: defaultCourse.durationHours || 40,
            enrollmentDate: nowIso.slice(0, 10),
            completionDate: nowIso.slice(0, 10),
            requestDate: nowIso,
            studentNotes:
              'Cadastro de formando no Painel do Aluno — Aguarda aprovação do estado e emissão do certificado PDF pelo Administrador.',
            status: u.approvalStatus === 'aprovado' ? 'APROVADO' : 'PENDENTE',
            certificateStoragePath: '',
            certificateFileUrl: '',
            certificateFileName: '',
            certificateCode: '',
            issuedAt: '',
            issuedBy: '',
            adminNotes: '',
            auditHistory: [
              {
                id: `aud-init-${u.uid}`,
                action: 'SOLICITADO',
                statusAfter: 'PENDENTE',
                actorName: u.fullName,
                actorRole: 'ALUNO',
                notes: 'Cadastro do formando no Painel do Aluno.',
                timestamp: nowIso,
              },
            ],
            createdAt: nowIso,
          });
        }
      });

    return normalizedReqs;
  });
  const [adminNotifications, setAdminNotifications] = useState<AdminNotificationRecord[]>(() => {
    const rawStored = loadLocal<AdminNotificationRecord[]>(
      'alhan_admin_notifications',
      INITIAL_ADMIN_NOTIFICATIONS
    );
    const merged = [...rawStored];
    INITIAL_ADMIN_NOTIFICATIONS.forEach((initNotif) => {
      if (!merged.some((n) => n.id === initNotif.id)) {
        merged.unshift(initNotif);
      }
    });
    return merged;
  });
  const [dynamicCounters, setDynamicCounters] = useState<DynamicCountersConfig>(() =>
    loadLocal<DynamicCountersConfig>('alhan_dynamic_counters', INITIAL_DYNAMIC_COUNTERS)
  );
  const [employabilityIndicators, setEmployabilityIndicators] = useState<EmployabilityIndicatorItem[]>(() =>
    loadLocal<EmployabilityIndicatorItem[]>('alhan_employability_indicators', INITIAL_EMPLOYABILITY_INDICATORS)
  );
  const [alumniTrackingRecords, setAlumniTrackingRecords] = useState<AlumniTrackingRecord[]>(() =>
    loadLocal<AlumniTrackingRecord[]>('alhan_alumni_tracking', INITIAL_ALUMNI_TRACKING)
  );
  const [impactEvidences, setImpactEvidences] = useState<ImpactEvidenceDocument[]>(() =>
    loadLocal<ImpactEvidenceDocument[]>('alhan_impact_evidences', INITIAL_IMPACT_EVIDENCES)
  );
  const [trainingPortfolioHistory, setTrainingPortfolioHistory] = useState<TrainingPortfolioHistoryItem[]>(() =>
    loadLocal<TrainingPortfolioHistoryItem[]>('alhan_training_portfolio_history', INITIAL_TRAINING_PORTFOLIO_HISTORY)
  );
  const [institutionalPartnerships, setInstitutionalPartnerships] = useState<InstitutionalPartnershipItem[]>(() =>
    loadLocal<InstitutionalPartnershipItem[]>('alhan_institutional_partnerships', INITIAL_INSTITUTIONAL_PARTNERSHIPS)
  );
  const [impactReports, setImpactReports] = useState<PublicImpactReportItem[]>(() =>
    loadLocal<PublicImpactReportItem[]>('alhan_impact_reports', INITIAL_PUBLIC_IMPACT_REPORTS)
  );
  const [impactAuditLogs, setImpactAuditLogs] = useState<ImpactGovernanceAuditEntry[]>(() =>
    loadLocal<ImpactGovernanceAuditEntry[]>('alhan_impact_audit_logs', INITIAL_IMPACT_AUDIT_LOGS)
  );
  const [selectedAdminCertificateRequestId, setSelectedAdminCertificateRequestId] = useState<string | null>(null);
  const [isoProjects, setIsoProjects] = useState<IsoProjectItem[]>(() => {
    const stored = loadLocal<IsoProjectItem[]>('alhan_iso_projects', INITIAL_ISO_PROJECTS);
    return stored.map((p) => ({
      ...p,
      companyName: p.companyName.replace('[DEMO] ', ''),
      isDemo: false,
    }));
  });
  const [isoDocuments, setIsoDocuments] = useState<IsoDocumentItem[]>(() => loadLocal('alhan_iso_documents', INITIAL_ISO_DOCUMENTS));
  const [isoAudits, setIsoAudits] = useState<IsoAuditItem[]>(() => loadLocal('alhan_iso_audits', INITIAL_ISO_AUDITS));
  const [nonConformities, setNonConformities] = useState<NonConformityItem[]>(() => loadLocal('alhan_ncs', INITIAL_NON_CONFORMITIES));
  const [diagnosticRequests, setDiagnosticRequests] = useState<DiagnosticRequestItem[]>(() => loadLocal('alhan_diagnostics', []));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadLocal('alhan_notifications', INITIAL_NOTIFICATIONS));
  const [emailNotifications, setEmailNotifications] = useState<AdminEmailNotificationItem[]>(() =>
    loadLocal('alhan_email_notifications', [
      {
        id: 'em-notif-init-1',
        recipientEmail: 'geral@alhan.pro',
        panelOrigin: 'PAINEL_ALUNO',
        subject: 'Sistema de Notificações Activo — Painéis Professor, Aluno e Empresa',
        applicantName: 'Plataforma ALHAN – SGI',
        applicantEmail: 'geral@alhan.pro',
        applicantPhone: '+244 922 021 211',
        details:
          'Todas as inscrições realizadas nos painéis de Professor, Aluno e Empresa e solicitações de Certificado PDF são notificadas automaticamente ao Painel Administrativo e ao e-mail geral@alhan.pro.',
        createdAt: new Date().toISOString(),
      },
    ])
  );
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() =>
    loadLocal('alhan_testimonials', INITIAL_TESTIMONIALS)
  );
  const [panelCredentials, setPanelCredentials] = useState<PanelCredentialItem[]>(() => {
    const stored = loadLocal<PanelCredentialItem[]>('alhan_panel_credentials', INITIAL_PANEL_CREDENTIALS);
    return INITIAL_PANEL_CREDENTIALS.map((initCred) => {
      const existing = stored.find((s) => s.role === initCred.role);
      if (!existing) return initCred;
      // Ensure the single Unified Administrator route (/gestao-alhan-sgi) and credentials (alhan.admin / Alhan@2026) are synced
      if (initCred.role === 'ADMIN') {
        const isOldDefault =
          existing.username === 'superadmin' ||
          existing.username === 'admin' ||
          existing.username === 'gestao.alhan' ||
          existing.password === 'user';
        return {
          ...existing,
          panelName: initCred.panelName,
          route: '/gestao-alhan-sgi',
          username: isOldDefault ? initCred.username : existing.username,
          email: isOldDefault ? initCred.email : existing.email,
          password: isOldDefault ? initCred.password : existing.password,
          description: initCred.description,
        };
      }
      return {
        ...existing,
        panelName: initCred.panelName,
        description: initCred.description,
      };
    });
  });
  const [activityLogs, setActivityLogs] = useState<{ id: string; action: string; actor: string; timestamp: string }[]>(() =>
    loadLocal('alhan_activity_logs', [
      { id: 'log-1', action: 'Inicialização da Plataforma ALHAN – SGI', actor: 'Sistema', timestamp: new Date().toISOString() },
    ])
  );

  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  const isRemoteSyncRef = React.useRef(false);
  const broadcastChannelRef = React.useRef<BroadcastChannel | null>(null);

  const persistAndBroadcast = React.useCallback((key: string, data: unknown) => {
    try {
      const serialized = JSON.stringify(data);
      const current = localStorage.getItem(key);
      if (current !== serialized) {
        localStorage.setItem(key, serialized);
        if (!isRemoteSyncRef.current && broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({ key, serialized });
        }
      }
    } catch {
      // Ignore quota errors
    }
  }, []);

  // Instantaneous cross-tab & cross-panel real-time synchronization (BroadcastChannel + storage event)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyRemoteKey = (key: string, raw: string | null) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        isRemoteSyncRef.current = true;
        if (key === 'alhan_enrollments') setEnrollments(parsed);
        else if (key === 'alhan_certificates') setCertificates(parsed);
        else if (key === 'alhan_certificate_requests') setCertificateRequests(parsed);
        else if (key === 'alhan_admin_notifications') setAdminNotifications(parsed);
        else if (key === 'alhan_notifications') setNotifications(parsed);
        else if (key === 'alhan_email_notifications') setEmailNotifications(parsed);
        else if (key === 'alhan_registered_users') setRegisteredUsers(parsed);
        else if (key === 'alhan_courses') setCourses(parsed);
        else if (key === 'alhan_diagnostics') setDiagnosticRequests(parsed);
        else if (key === 'alhan_activity_logs') setActivityLogs(parsed);
        else if (key === 'alhan_dynamic_counters') setDynamicCounters(parsed);
        else if (key === 'alhan_employability_indicators') setEmployabilityIndicators(parsed);
        else if (key === 'alhan_alumni_tracking') setAlumniTrackingRecords(parsed);
        else if (key === 'alhan_impact_evidences') setImpactEvidences(parsed);
        else if (key === 'alhan_training_portfolio_history') setTrainingPortfolioHistory(parsed);
        else if (key === 'alhan_institutional_partnerships') setInstitutionalPartnerships(parsed);
        else if (key === 'alhan_impact_reports') setImpactReports(parsed);
        else if (key === 'alhan_impact_audit_logs') setImpactAuditLogs(parsed);
      } catch {
        // Ignore parse error
      } finally {
        setTimeout(() => {
          isRemoteSyncRef.current = false;
        }, 20);
      }
    };

    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('alhan_realtime_sync');
      broadcastChannelRef.current = bc;
      bc.onmessage = (ev) => {
        if (ev.data?.key && ev.data?.serialized) {
          applyRemoteKey(ev.data.key, ev.data.serialized);
        }
      };
    }

    const handleStorage = (ev: StorageEvent) => {
      if (ev.key && ev.newValue) {
        applyRemoteKey(ev.key, ev.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
      broadcastChannelRef.current = null;
    };
  }, []);

  // Persist state locally & broadcast instantaneously across open panels
  useEffect(() => { localStorage.setItem('alhan_active_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { persistAndBroadcast('alhan_registered_users', registeredUsers); }, [registeredUsers, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_courses', courses); }, [courses, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_iso_standards', isoStandards); }, [isoStandards, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_enrollments', enrollments); }, [enrollments, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_certificates', certificates); }, [certificates, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_certificate_requests', certificateRequests); }, [certificateRequests, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_admin_notifications', adminNotifications); }, [adminNotifications, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_testimonials', testimonials); }, [testimonials, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_panel_credentials', panelCredentials); }, [panelCredentials, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_iso_projects', isoProjects); }, [isoProjects, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_iso_documents', isoDocuments); }, [isoDocuments, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_iso_audits', isoAudits); }, [isoAudits, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_ncs', nonConformities); }, [nonConformities, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_diagnostics', diagnosticRequests); }, [diagnosticRequests, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_notifications', notifications); }, [notifications, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_email_notifications', emailNotifications); }, [emailNotifications, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_activity_logs', activityLogs); }, [activityLogs, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_dynamic_counters', dynamicCounters); }, [dynamicCounters, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_employability_indicators', employabilityIndicators); }, [employabilityIndicators, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_alumni_tracking', alumniTrackingRecords); }, [alumniTrackingRecords, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_impact_evidences', impactEvidences); }, [impactEvidences, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_training_portfolio_history', trainingPortfolioHistory); }, [trainingPortfolioHistory, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_institutional_partnerships', institutionalPartnerships); }, [institutionalPartnerships, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_impact_reports', impactReports); }, [impactReports, persistAndBroadcast]);
  useEffect(() => { persistAndBroadcast('alhan_impact_audit_logs', impactAuditLogs); }, [impactAuditLogs, persistAndBroadcast]);

  const logActivity = (action: string, actorName?: string) => {
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action,
        actor: actorName || user?.fullName || 'Visitante',
        timestamp: new Date().toISOString(),
      },
      ...prev.slice(0, 99),
    ]);
  };

  const triggerNotification = (
    category: NotificationItem['category'],
    title: string,
    message: string,
    targetRole: UserRole | 'ALL' = 'ALL'
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category,
      title,
      message,
      targetRole,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`ALHAN SGI · ${title}`, {
          body: message,
          icon: '/assets/aistudio/LOGOTIPO_ALHAN-02_b8f5e974.png',
        });
      } catch {
        // Fallback if Notification constructor is restricted in some mobile browsers
      }
    }
  };

  const notifyAdminAndEmailGeral = (payload: {
    panelOrigin: AdminEmailNotificationItem['panelOrigin'];
    subject: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    details: string;
  }) => {
    const item: AdminEmailNotificationItem = {
      id: `em-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      recipientEmail: 'geral@alhan.pro',
      panelOrigin: payload.panelOrigin,
      subject: payload.subject,
      applicantName: payload.applicantName,
      applicantEmail: payload.applicantEmail,
      applicantPhone: payload.applicantPhone,
      details: payload.details,
      createdAt: new Date().toISOString(),
    };
    setEmailNotifications((prev) => [item, ...prev.slice(0, 99)]);

    // Non-blocking dispatch to server endpoint & FormSubmit AJAX for geral@alhan.pro
    if (typeof window !== 'undefined') {
      fetch('/api/notify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }).catch(() => null);

      fetch('https://formsubmit.co/ajax/geral@alhan.pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `[ALHAN SGI] ${payload.subject}`,
          Painel: payload.panelOrigin,
          Inscrito: payload.applicantName,
          Email: payload.applicantEmail,
          Telefone_WhatsApp: payload.applicantPhone,
          Detalhes: payload.details,
        }),
      }).catch(() => null);
    }
  };

  const requestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setPushPermission(perm);
    if (perm === 'granted') {
      triggerNotification('Nova mensagem', 'Notificações Push Activadas', 'Receberá alertas em tempo real sobre aulas, certificados e projectos ISO.');
    }
  };

  // Firebase Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const cleanFbEmail = (fbUser.email || '').toLowerCase();
        const isSuperAdminEmail = cleanFbEmail === 'joaomuatxissombo22@gmail.com';

        // One-time Firestore cleanup for joaomuatxissombo22@gmail.com student records so they can re-register from scratch
        if (isSuperAdminEmail && typeof window !== 'undefined' && localStorage.getItem('alhan_purged_joao_firestore_v3') !== 'done') {
          localStorage.setItem('alhan_purged_joao_firestore_v3', 'done');
          try {
            await deleteDoc(doc(db, 'users', fbUser.uid)).catch(() => null);
          } catch {
            // Ignore if doc does not exist
          }
        }

        // Only set active user from Firebase Auth if they are not joaomuatxissombo22@gmail.com (unless they already re-registered as a student in registeredUsers)
        setRegisteredUsers((currentRegistered) => {
          const matchingRegistered = currentRegistered.find(
            (u) => u.email.toLowerCase() === cleanFbEmail
          );
          if (matchingRegistered) {
            const appState = matchingRegistered.approvalStatus || 'pendente';
            setUser({
              uid: matchingRegistered.uid,
              fullName: matchingRegistered.fullName,
              username: matchingRegistered.username,
              email: matchingRegistered.email,
              phone: matchingRegistered.phone,
              studentBI: matchingRegistered.studentBI,
              role: matchingRegistered.role,
              companyId: matchingRegistered.companyId,
              companyName: matchingRegistered.companyName,
              specialty: matchingRegistered.specialty,
              approvalStatus: appState,
              firestoreStatus: matchingRegistered.firestoreStatus || toFirestoreApprovalState(appState),
            });
          } else if (!isSuperAdminEmail) {
            const active: ActiveUser = {
              uid: fbUser.uid,
              fullName: fbUser.displayName || 'Formando Alhan',
              username: (fbUser.email || 'utilizador').split('@')[0],
              email: fbUser.email || '',
              phone: '+244 922 021 211',
              role: 'ALUNO',
              companyId: fbUser.uid,
              approvalStatus: 'pendente',
              firestoreStatus: 'PENDENTE',
            };
            setUser(active);
          }
          return currentRegistered;
        });

        if (fbUser.emailVerified && isSuperAdminEmail) {
          for (const c of INITIAL_COURSES) {
            try {
              await setDoc(
                doc(db, 'courses', c.id),
                {
                  id: c.id,
                  title: c.title.slice(0, 160),
                  category: c.category.slice(0, 80),
                  modality: c.modality,
                  priceKz: Number(c.priceKz),
                  durationHours: Number(c.durationHours),
                  lessonsCount: Number(c.lessonsCount),
                  instructorName: c.instructorName.slice(0, 120),
                  instructorId: c.instructorId.slice(0, 128),
                  published: Boolean(c.published),
                  description: c.description.slice(0, 1500),
                  objectives: c.objectives.slice(0, 1500),
                  syllabus: c.syllabus.slice(0, 2000),
                  createdAt: serverTimestamp(),
                },
                { merge: true }
              );
            } catch {
              // Ignore if already exists
            }
          }
        }
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Real-time Firestore listeners when authenticated with Firebase
  useEffect(() => {
    if (!authReady || !auth.currentUser) return;

    const uid = auth.currentUser.uid;
    const isAdminUser = auth.currentUser.email === 'joaomuatxissombo22@gmail.com';

    const coursesQuery = isAdminUser
      ? collection(db, 'courses')
      : query(collection(db, 'courses'), where('published', '==', true));

    const unsubCourses = onSnapshot(
      coursesQuery,
      (snap) => {
        if (!snap.empty) {
          const remoteCourses = snap.docs.map((d) => {
            const data = d.data();
            const existing = INITIAL_COURSES.find((c) => c.id === d.id);
            return {
              ...existing,
              ...data,
              id: d.id,
              modules: existing?.modules || [],
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            } as CourseItem;
          });
          setCourses((prev) => {
            const mergedMap = new Map<string, CourseItem>();
            INITIAL_COURSES.forEach((c) => mergedMap.set(c.id, c));
            prev.forEach((c) => mergedMap.set(c.id, c));
            remoteCourses.forEach((c) => mergedMap.set(c.id, c));
            return Array.from(mergedMap.values()).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'courses')
    );

    const usersQuery = isAdminUser
      ? collection(db, 'users')
      : query(collection(db, 'users'), where('uid', '==', uid));

    const unsubUsers = onSnapshot(
      usersQuery,
      async (snap) => {
        if (!snap.empty) {
          // Fetch private/contact documents in parallel for Admin so real email & phone from Firestore are resolved
          const contactMap = new Map<string, { email?: string; phone?: string }>();
          if (isAdminUser) {
            await Promise.all(
              snap.docs.map(async (d) => {
                try {
                  const cSnap = await getDoc(doc(db, 'users', d.id, 'private', 'contact'));
                  if (cSnap.exists()) {
                    const cData = cSnap.data();
                    contactMap.set(d.id, {
                      email: typeof cData.email === 'string' ? cData.email : undefined,
                      phone: typeof cData.phone === 'string' ? cData.phone : undefined,
                    });
                  }
                } catch {
                  // Ignore if contact subdoc does not exist
                }
              })
            );
          }

          setRegisteredUsers((prev) => {
            const map = new Map<string, RegisteredUserAccount>();
            prev.forEach((u) => map.set(u.uid, u));
            snap.docs.forEach((d) => {
              const data = d.data();
              if (data.role === 'SUPER_ADMIN' || data.role === 'ADMIN') return;
              const existing = map.get(d.id);
              const contactInfo = contactMap.get(d.id);
              const fsStatus = toFirestoreApprovalState(data.status);
              const appState = fromFirestoreApprovalState(data.status);
              if (existing) {
                map.set(d.id, {
                  ...existing,
                  fullName: data.fullName || existing.fullName,
                  username: data.username || existing.username,
                  email: contactInfo?.email || existing.email,
                  phone: contactInfo?.phone || existing.phone,
                  approvalStatus: appState,
                  firestoreStatus: fsStatus,
                });
              } else {
                map.set(d.id, {
                  uid: d.id,
                  fullName: data.fullName || 'Utilizador ALHAN',
                  username: data.username || 'utilizador',
                  email: contactInfo?.email || `${data.username || 'utilizador'}@alhan.pro`,
                  phone: contactInfo?.phone || '+244 922 021 211',
                  password: 'Alhan@User2026',
                  role: data.role === 'PROFESSOR' ? 'PROFESSOR' : data.role === 'CLIENTE_EMPRESARIAL' ? 'CLIENTE_EMPRESARIAL' : 'ALUNO',
                  companyId: data.companyId || 'ALHAN-FORMA',
                  approvalStatus: appState,
                  firestoreStatus: fsStatus,
                  createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                });
              }
            });
            return Array.from(map.values());
          });
        }
      },
      (err) => console.warn('Firestore users listener info:', err)
    );

    const enrollmentsQuery = isAdminUser
      ? collection(db, 'enrollments')
      : query(collection(db, 'enrollments'), where('studentId', '==', uid));

    const unsubEnrollments = onSnapshot(
      enrollmentsQuery,
      (snap) => {
        if (!snap.empty) {
          const remote = snap.docs.map((d) => {
            const data = d.data();
            const fsState = toFirestoreApprovalState(data.paymentStatus);
            const appState = fromFirestoreApprovalState(data.paymentStatus) as 'pendente' | 'aprovado' | 'rejeitado';
            return {
              ...data,
              id: d.id,
              enrollmentApprovalStatus: appState,
              firestoreStatus: fsState,
              completedLessons: [],
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            } as unknown as EnrollmentItem;
          });
          setEnrollments((prev) => {
            const map = new Map<string, EnrollmentItem>();
            prev.forEach((item) => map.set(item.id, item));
            remote.forEach((item) => {
              const existing = map.get(item.id);
              map.set(item.id, {
                ...existing,
                ...item,
                enrollmentApprovalStatus: item.enrollmentApprovalStatus || existing?.enrollmentApprovalStatus || 'pendente',
                firestoreStatus: item.firestoreStatus || existing?.firestoreStatus || 'PENDENTE',
                completedLessons: existing?.completedLessons || item.completedLessons || [],
              });
            });
            return Array.from(map.values());
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'enrollments')
    );

    const certReqQuery = isAdminUser
      ? collection(db, 'certificateRequests')
      : query(collection(db, 'certificateRequests'), where('userId', '==', uid));

    const unsubCertRequests = onSnapshot(
      certReqQuery,
      (snap) => {
        if (!snap.empty) {
          const remoteReqs = snap.docs.map((d) => {
            const data = d.data();
            return {
              ...data,
              id: d.id,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            } as unknown as CertificateRequestItem;
          });
          setCertificateRequests((prev) => {
            const map = new Map<string, CertificateRequestItem>();
            prev.forEach((item) => map.set(item.id, item));
            remoteReqs.forEach((item) => {
              const existing = map.get(item.id);
              map.set(item.id, {
                ...existing,
                ...item,
                auditHistory: existing?.auditHistory || item.auditHistory || [],
                certificateFileUrl: existing?.certificateFileUrl || item.certificateFileUrl || '',
                certificateFileName: existing?.certificateFileName || item.certificateFileName || 'certificate.pdf',
              });
            });
            return Array.from(map.values());
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'certificateRequests')
    );

    let unsubAdminNotifs = () => {};
    if (isAdminUser) {
      unsubAdminNotifs = onSnapshot(
        collection(db, 'adminNotifications'),
        (snap) => {
          if (!snap.empty) {
            const remoteNotifs = snap.docs.map((d) => {
              const data = d.data();
              return {
                ...data,
                id: d.id,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
              } as unknown as AdminNotificationRecord;
            });
            setAdminNotifications((prev) => {
              const map = new Map<string, AdminNotificationRecord>();
              prev.forEach((item) => map.set(item.id, item));
              remoteNotifs.forEach((item) => map.set(item.id, { ...map.get(item.id), ...item }));
              return Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'adminNotifications')
      );
    }

    return () => {
      unsubCourses();
      unsubUsers();
      unsubEnrollments();
      unsubCertRequests();
      unsubAdminNotifs();
    };
  }, [authReady]);

  // Real-time synchronization with Backend Approvals Registry (/api/approvals)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Sync local registeredUsers & enrollments to backend registry on startup
    registeredUsers.forEach((u) => {
      if (u.role === 'ALUNO' || u.role === 'PROFESSOR') {
        fetch('/api/approvals/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userRecord: u }),
        }).catch(() => null);
      }
    });
    enrollments.forEach((e) => {
      fetch('/api/approvals/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentRecord: e }),
      }).catch(() => null);
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pullBackendApprovals = async () => {
      try {
        const res = await fetch('/api/approvals', {
          headers: { 'x-alhan-role': user?.role || 'ADMIN' },
        });
        if (!res.ok) return;
        const payload = await res.json();
        if (payload.ok && Array.isArray(payload.users)) {
          setRegisteredUsers((prev) => {
            const map = new Map<string, RegisteredUserAccount>();
            prev.forEach((u) => map.set(u.uid, u));
            payload.users.forEach((remoteU: RegisteredUserAccount) => {
              if (!remoteU || !remoteU.uid) return;
              const existing = map.get(remoteU.uid);
              const useRemoteStatus = Boolean(remoteU.decidedAt) || !existing;
              map.set(remoteU.uid, {
                ...existing,
                ...remoteU,
                approvalStatus: useRemoteStatus
                  ? remoteU.approvalStatus || existing?.approvalStatus || 'pendente'
                  : existing?.approvalStatus || remoteU.approvalStatus || 'pendente',
                firestoreStatus: useRemoteStatus
                  ? remoteU.firestoreStatus || existing?.firestoreStatus || 'PENDENTE'
                  : existing?.firestoreStatus || remoteU.firestoreStatus || 'PENDENTE',
              });
            });
            return Array.from(map.values());
          });
        }
        if (payload.ok && Array.isArray(payload.enrollments)) {
          setEnrollments((prev) => {
            const map = new Map<string, EnrollmentItem>();
            prev.forEach((e) => map.set(e.id, e));
            payload.enrollments.forEach((remoteE: EnrollmentItem) => {
              if (!remoteE || !remoteE.id) return;
              const existing = map.get(remoteE.id);
              const useRemoteStatus = Boolean(remoteE.decidedAt) || !existing;
              map.set(remoteE.id, {
                ...existing,
                ...remoteE,
                enrollmentApprovalStatus: useRemoteStatus
                  ? remoteE.enrollmentApprovalStatus || existing?.enrollmentApprovalStatus || 'pendente'
                  : existing?.enrollmentApprovalStatus || remoteE.enrollmentApprovalStatus || 'pendente',
                firestoreStatus: useRemoteStatus
                  ? remoteE.firestoreStatus || existing?.firestoreStatus || 'PENDENTE'
                  : existing?.firestoreStatus || remoteE.firestoreStatus || 'PENDENTE',
              });
            });
            return Array.from(map.values());
          });
        }
      } catch {
        // Non-blocking sync
      }
    };

    const verifyActivePortalUser = async () => {
      if (!user || (user.role !== 'ALUNO' && user.role !== 'PROFESSOR')) return;
      try {
        const res = await fetch('/api/portal-access/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            role: user.role,
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && data.status) {
          const fsStatus = data.status as FirestoreApprovalState;
          const appStatus: AccountApprovalState =
            fsStatus === 'APROVADO'
              ? 'aprovado'
              : fsStatus === 'REJEITADO'
              ? 'rejeitado'
              : 'pendente';
          if (user.firestoreStatus !== fsStatus || user.approvalStatus !== appStatus) {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    approvalStatus: appStatus,
                    firestoreStatus: fsStatus,
                  }
                : prev
            );
          }
        }
      } catch {
        // Non-blocking verification
      }
    };

    pullBackendApprovals();
    verifyActivePortalUser();
    const timer = window.setInterval(() => {
      pullBackendApprovals();
      verifyActivePortalUser();
    }, 4000);
    return () => window.clearInterval(timer);
  }, [user?.role, user?.uid, user?.email, user?.firestoreStatus, user?.approvalStatus]);

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    logActivity('Autenticação via Google OAuth concluída');
  };

  const updatePanelCredential = (role: UserRole, username: string, email: string, password: string) => {
    setPanelCredentials((prev) =>
      prev.map((cred) =>
        cred.role === role
          ? {
              ...cred,
              username: username.trim() || cred.username,
              email: email.trim() || cred.email,
              password: password.trim() || cred.password,
            }
          : cred
      )
    );
    logActivity(`Credenciais de acesso actualizadas para o painel ${role}`);
  };

  const updateUserApprovalStatus = (uid: string, status: AccountApprovalState) => {
    // Security Rule: Only ADMIN or SUPER_ADMIN can approve or reject registrations
    const callerRole = user?.role || 'ADMIN';
    if (callerRole !== 'ADMIN' && callerRole !== 'SUPER_ADMIN') {
      throw new Error('Operação bloqueada: Apenas utilizadores com perfil ADMIN ou SUPER_ADMIN podem aprovar ou rejeitar registos.');
    }

    const fsStatus = toFirestoreApprovalState(status);
    const decidedAt = new Date().toISOString();
    const decidedBy = user?.fullName || 'Administrador Principal ALHAN – SGI';
    const decidedByEmail = user?.email || 'admin@alhan.pro';

    let targetUser: RegisteredUserAccount | undefined;
    setRegisteredUsers((prev) =>
      prev.map((u) => {
        if (u.uid === uid) {
          targetUser = {
            ...u,
            approvalStatus: status,
            firestoreStatus: fsStatus,
            decidedBy,
            decidedByEmail,
            decidedAt,
          };
          return targetUser;
        }
        return u;
      })
    );

    setUser((prev) =>
      prev && prev.uid === uid
        ? {
            ...prev,
            approvalStatus: status,
            firestoreStatus: fsStatus,
            decidedBy,
            decidedByEmail,
            decidedAt,
          }
        : prev
    );

    // Sync state ('PENDENTE' | 'APROVADO' | 'REJEITADO') to Firebase Firestore
    updateUserApprovalInFirestore(uid, fsStatus).catch(() => null);

    // Sync decision & audit trail to Backend (/api/approvals/decide)
    if (typeof window !== 'undefined') {
      fetch('/api/approvals/decide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-alhan-role': callerRole,
        },
        body: JSON.stringify({
          uid,
          email: targetUser?.email,
          status: fsStatus,
          actorRole: callerRole,
          actorName: decidedBy,
          actorEmail: decidedByEmail,
          notes: `Decisão administrativa (${fsStatus}) registada por ${decidedBy} em ${decidedAt}.`,
        }),
      }).catch(() => null);
    }

    if (targetUser) {
      if (targetUser.role === 'ALUNO' && (status === 'aprovado' || status === 'pendente' || status === 'rejeitado')) {
        setEnrollments((prev) =>
          prev.map((enr) => {
            const matches =
              enr.studentId === uid ||
              (targetUser && enr.studentEmail?.toLowerCase() === targetUser.email.toLowerCase());
            if (!matches) return enr;
            updateEnrollmentStatusInFirestore(enr.id, fsStatus).catch(() => null);
            return {
              ...enr,
              enrollmentApprovalStatus: status,
              firestoreStatus: fsStatus,
              paymentStatus: fsStatus,
              decidedBy,
              decidedByEmail,
              decidedAt,
            };
          })
        );
        setCertificateRequests((prev) =>
          prev.map((req) => {
            const matches =
              req.userId === uid ||
              (targetUser && req.studentEmail.toLowerCase() === targetUser.email.toLowerCase());
            if (!matches || req.status === 'DISPONÍVEL') return req;
            const nextCertSt: CertificateRequestStatus =
              status === 'aprovado'
                ? 'APROVADO'
                : status === 'rejeitado'
                ? 'REJEITADO'
                : 'PENDENTE';
            updateCertificateRequestInFirestore(req.id, { status: nextCertSt }).catch(() => null);
            return {
              ...req,
              status: nextCertSt,
            };
          })
        );
      }

      const statusLabel =
        status === 'aprovado'
          ? 'APROVADO (Firestore: APROVADO)'
          : status === 'rejeitado'
          ? 'REJEITADO (Firestore: REJEITADO)'
          : status === 'suspenso'
          ? 'SUSPENSO'
          : status === 'bloqueado'
          ? 'BLOQUEADO'
          : 'PENDENTE (Firestore: PENDENTE)';
      triggerNotification(
        'Novo registo',
        `Conta de ${targetUser.role === 'PROFESSOR' ? 'Professor' : 'Formando'} ${statusLabel}`,
        `O estado no Firebase Firestore da conta de ${targetUser.fullName} (${targetUser.email}) foi alterado por ${decidedBy} para ${fsStatus} em ${new Date(decidedAt).toLocaleString('pt-AO')}.`,
        targetUser.role
      );
      logActivity(
        `Decisão Administrativa (${targetUser.role}): ${targetUser.fullName} (${targetUser.email}) -> ${fsStatus} | Responsável: ${decidedBy} (${decidedByEmail}) | Data/Hora: ${new Date(decidedAt).toLocaleString('pt-AO')}`,
        decidedBy
      );
    }
  };

  const purgeStudentAccountByEmail = async (email: string): Promise<number> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) return 0;

    let removedCount = 0;
    const matchingUsers = registeredUsers.filter(
      (u) => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanEmail.split('@')[0]
    );
    const matchingEnrollments = enrollments.filter(
      (e) => e.studentEmail?.toLowerCase() === cleanEmail
    );

    removedCount = matchingUsers.length + matchingEnrollments.length;

    setRegisteredUsers((prev) =>
      prev.filter(
        (u) =>
          u.email.toLowerCase() !== cleanEmail &&
          u.username.toLowerCase() !== cleanEmail.split('@')[0]
      )
    );
    setEnrollments((prev) =>
      prev.filter((e) => e.studentEmail?.toLowerCase() !== cleanEmail)
    );
    setCertificateRequests((prev) =>
      prev.filter((r) => r.studentEmail?.toLowerCase() !== cleanEmail)
    );
    setUser((prev) => (prev && prev.email.toLowerCase() === cleanEmail ? null : prev));

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('alhan_panel_unlocked_ALUNO');
    }

    for (const u of matchingUsers) {
      await deleteUserRegistrationFromFirestore(u.uid).catch(() => null);
    }
    for (const e of matchingEnrollments) {
      await deleteEnrollmentFromFirestore(e.id).catch(() => null);
    }

    logActivity(
      `Conta de formando e registos associados a "${cleanEmail}" excluídos do sistema e do Firestore para permitir novo cadastro.`
    );
    return Math.max(1, removedCount);
  };

  const applyDiscountToEnrollment = async (
    enrollmentId: string,
    couponCode?: string,
    applyBlackFriday = true
  ) => {
    const targetEnr = enrollments.find((e) => e.id === enrollmentId);
    if (!targetEnr) return;
    const matchedCourse = courses.find((c) => c.id === targetEnr.courseId);
    const basePrice = targetEnr.originalAmountKz || matchedCourse?.priceKz || targetEnr.amountKz;
    const discountInfo = calculateCourseDiscountedPricing(basePrice, couponCode, applyBlackFriday);

    setEnrollments((prev) =>
      prev.map((enr) => {
        if (enr.id !== enrollmentId) return enr;
        return {
          ...enr,
          originalAmountKz: discountInfo.originalPriceKz,
          amountKz: discountInfo.finalPriceKz,
          discountPercent: discountInfo.effectiveDiscountPercent,
          appliedCoupon: discountInfo.couponValid ? ALHAN_COUPON_CODE : enr.appliedCoupon,
          blackFridayApplied: discountInfo.blackFridayApplied,
          firstInstallmentAmountKz: discountInfo.firstInstallmentKz,
          secondInstallmentAmountKz: discountInfo.secondInstallmentKz,
        };
      })
    );

    logActivity(
      `Desconto aplicado à inscrição #${enrollmentId} (${targetEnr.studentName}): ${discountInfo.discountBadgeLabel} -> Total: ${discountInfo.finalPriceKz.toLocaleString('pt-AO')} Kz`
    );
  };

  const updateStudentAccountDetails = (
    uidOrPayload:
      | string
      | {
          uid?: string;
          enrollmentId?: string;
          fullName?: string;
          email?: string;
          phone?: string;
          studentBI?: string;
          companyName?: string;
          approvalStatus?: AccountApprovalState;
          courseTitle?: string;
          modality?: 'Online' | 'Presencial' | 'Híbrida';
          amountKz?: number;
          firstInstallmentAmountKz?: number;
          secondInstallmentAmountKz?: number;
        },
    maybeUpdates?: {
      fullName?: string;
      email?: string;
      phone?: string;
      studentBI?: string;
      companyName?: string;
      approvalStatus?: AccountApprovalState;
    }
  ) => {
    const uid = typeof uidOrPayload === 'string' ? uidOrPayload : uidOrPayload.uid || '';
    const enrollmentId = typeof uidOrPayload === 'string' ? undefined : uidOrPayload.enrollmentId;
    const updates = typeof uidOrPayload === 'string' ? maybeUpdates || {} : uidOrPayload;

    let updatedAccount: RegisteredUserAccount | undefined;
    if (uid) {
      setRegisteredUsers((prev) =>
        prev.map((u) => {
          if (u.uid !== uid) return u;
          const nextApp = updates.approvalStatus || u.approvalStatus;
          updatedAccount = {
            ...u,
            fullName: updates.fullName?.trim() || u.fullName,
            email: updates.email?.trim().toLowerCase() || u.email,
            phone: updates.phone?.trim() || u.phone,
            studentBI: updates.studentBI !== undefined ? updates.studentBI.trim().toUpperCase() : u.studentBI,
            companyName: updates.companyName !== undefined ? updates.companyName.trim() : u.companyName,
            approvalStatus: nextApp,
            firestoreStatus: toFirestoreApprovalState(nextApp),
          };
          return updatedAccount;
        })
      );
    }

    const finalUpdated = updatedAccount as RegisteredUserAccount | undefined;
    setEnrollments((prev) =>
      prev.map((enr) => {
        const matchesEnrollment =
          (enrollmentId && enr.id === enrollmentId) ||
          (uid && enr.studentId === uid) ||
          (finalUpdated && enr.studentEmail?.toLowerCase() === finalUpdated.email.toLowerCase()) ||
          (updates.email && enr.studentEmail?.toLowerCase() === updates.email.trim().toLowerCase());
        if (!matchesEnrollment) return enr;

        const extraCourseFields = typeof uidOrPayload === 'string' ? {} : uidOrPayload;
        const nextEnrApproval =
          updates.approvalStatus === 'aprovado' ||
          updates.approvalStatus === 'pendente' ||
          updates.approvalStatus === 'rejeitado'
            ? updates.approvalStatus
            : enr.enrollmentApprovalStatus;
        return {
          ...enr,
          studentName: updates.fullName?.trim() || finalUpdated?.fullName || enr.studentName,
          studentEmail: updates.email?.trim().toLowerCase() || finalUpdated?.email || enr.studentEmail,
          studentPhone: updates.phone?.trim() || finalUpdated?.phone || enr.studentPhone,
          studentBI:
            updates.studentBI !== undefined
              ? updates.studentBI.trim().toUpperCase()
              : finalUpdated?.studentBI || enr.studentBI,
          enrollmentApprovalStatus: nextEnrApproval,
          firestoreStatus: toFirestoreApprovalState(nextEnrApproval),
          courseTitle: extraCourseFields.courseTitle?.trim() || enr.courseTitle,
          modality: extraCourseFields.modality || enr.modality,
          amountKz:
            extraCourseFields.amountKz !== undefined && extraCourseFields.amountKz > 0
              ? extraCourseFields.amountKz
              : enr.amountKz,
          firstInstallmentAmountKz:
            extraCourseFields.firstInstallmentAmountKz !== undefined &&
            extraCourseFields.firstInstallmentAmountKz >= 0
              ? extraCourseFields.firstInstallmentAmountKz
              : enr.firstInstallmentAmountKz,
          secondInstallmentAmountKz:
            extraCourseFields.secondInstallmentAmountKz !== undefined &&
            extraCourseFields.secondInstallmentAmountKz >= 0
              ? extraCourseFields.secondInstallmentAmountKz
              : enr.secondInstallmentAmountKz,
        };
      })
    );

    logActivity(
      `Dados pessoais e de inscrição do formando ${
        updates.fullName || finalUpdated?.fullName || uid
      } actualizados pelo Administrador Único`
    );
  };

  const requestSecurePasswordResetLink = async (
    emailOrUser: string,
    phoneHint?: string
  ): Promise<{
    fullName: string;
    email: string;
    phone: string;
    resetToken: string;
    resetLink: string;
    resetTokenUrl: string;
    dispatchedViaFirebase: boolean;
  }> => {
    const cleanTarget = emailOrUser.trim().toLowerCase();
    if (!cleanTarget) {
      throw new Error('Informe o e-mail ou utilizador registado do formando ou professor.');
    }

    const foundUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === cleanTarget || u.username.toLowerCase() === cleanTarget
    );
    const foundEnrollment = enrollments.find(
      (e) => e.studentEmail?.toLowerCase() === cleanTarget || e.studentName.toLowerCase() === cleanTarget
    );

    const targetEmail = foundUser?.email || foundEnrollment?.studentEmail || (cleanTarget.includes('@') ? cleanTarget : '');
    const targetName = foundUser?.fullName || foundEnrollment?.studentName || emailOrUser;
    const targetPhone = phoneHint?.trim() || foundUser?.phone || foundEnrollment?.studentPhone || '+244 922 021 211';

    if (!targetEmail) {
      throw new Error(`Nenhuma conta encontrada com o identificador "${emailOrUser}".`);
    }

    let dispatchedViaFirebase = false;
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      dispatchedViaFirebase = true;
    } catch {
      // Non-blocking fallback when account is managed in platform registry
    }

    const resetToken = `ALHAN-SEC-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
    const resetLink = `https://alhan.pro/login?modo=recuperar&email=${encodeURIComponent(
      targetEmail
    )}&token=${encodeURIComponent(resetToken)}`;

    notifyAdminAndEmailGeral({
      panelOrigin: 'PAINEL_ALUNO',
      subject: `Solicitação Segura de Redefinição de Senha — ${targetName}`,
      applicantName: targetName,
      applicantEmail: targetEmail,
      applicantPhone: targetPhone,
      details: `Mecanismo Seguro de Redefinição de Palavra-passe accionado pelo Administrador Único (sem exposição de senha actual). Token Seguro: ${resetToken} | Link: ${resetLink}`,
    });

    logActivity(
      `Solicitação segura de redefinição de palavra-passe emitida para ${targetName} (${targetEmail}) — Token ${resetToken}`
    );

    return {
      fullName: targetName,
      email: targetEmail,
      phone: targetPhone,
      resetToken,
      resetLink,
      resetTokenUrl: resetLink,
      dispatchedViaFirebase,
    };
  };

  const resetPasswordByEmail = async (
    emailOrUser: string,
    newPassword: string
  ): Promise<RegisteredUserAccount> => {
    const cleanTarget = emailOrUser.trim().toLowerCase();
    const cleanPass = newPassword.trim();
    if (!cleanTarget) {
      throw new Error('Por favor, informe o e-mail ou utilizador registado.');
    }
    if (cleanPass.length < 4) {
      throw new Error('A nova palavra-passe deve ter pelo menos 4 caracteres.');
    }

    const found = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanTarget ||
        u.username.toLowerCase() === cleanTarget
    );

    if (!found) {
      throw new Error(
        `Nenhuma conta de Aluno ou Formador foi encontrada com o e-mail/utilizador "${emailOrUser}". Verifique se digitou correctamente.`
      );
    }

    const updatedAccount: RegisteredUserAccount = {
      ...found,
      password: cleanPass,
    };

    setRegisteredUsers((prev) =>
      prev.map((u) => (u.uid === found.uid ? updatedAccount : u))
    );

    triggerNotification(
      'Novo registo',
      `Palavra-passe Redefinida (${found.role})`,
      `A palavra-passe da conta de ${found.fullName} (${found.email}) foi redefinida através do mecanismo seguro.`,
      'ADMIN'
    );
    logActivity(`Palavra-passe redefinida via mecanismo seguro para ${found.fullName} (${found.email})`);

    return updatedAccount;
  };

  const deleteRegisteredUser = (uid: string) => {
    const target = registeredUsers.find((u) => u.uid === uid);
    setRegisteredUsers((prev) => prev.filter((u) => u.uid !== uid));
    setUser((prev) => (prev && prev.uid === uid ? null : prev));
    deleteUserRegistrationFromFirestore(uid).catch(() => null);

    if (target) {
      if (target.role === 'ALUNO') {
        setEnrollments((prev) =>
          prev.filter((e) => {
            const matches =
              e.studentId === uid ||
              e.studentEmail?.toLowerCase() === target.email.toLowerCase();
            if (matches) {
              deleteEnrollmentFromFirestore(e.id).catch(() => null);
            }
            return !matches;
          })
        );
      }
      logActivity(
        `Registo no Firestore eliminado pelo Administrador Único (${target.role}): ${target.fullName} (${target.email})`
      );
    }
  };

  const deleteEnrollment = async (enrollmentId: string) => {
    const target = enrollments.find((e) => e.id === enrollmentId);
    setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
    await deleteEnrollmentFromFirestore(enrollmentId).catch(() => null);
    if (target) {
      logActivity(
        `Inscrição eliminada no Firestore pelo Administrador Único: ${target.studentName} (${target.courseTitle})`
      );
    }
  };

  // ==========================================================
  // SISTEMA DE PAGAMENTO EM DUAS PARCELAS & NOTIFICAÇÕES DE VENCIMENTO
  // ==========================================================
  const updateInstallmentPaymentStatus = async (
    enrollmentId: string,
    rawTarget: 'FIRST' | 'SECOND' | 'BOTH' | '1ª Parcela' | '2ª Parcela' | 'Ambas',
    status: InstallmentStatus,
    adminNote?: string
  ) => {
    const target: 'FIRST' | 'SECOND' | 'BOTH' =
      rawTarget === '1ª Parcela'
        ? 'FIRST'
        : rawTarget === '2ª Parcela'
        ? 'SECOND'
        : rawTarget === 'Ambas'
        ? 'BOTH'
        : rawTarget;
    const nowDate = new Date().toISOString().slice(0, 10);
    const adminName = user?.fullName || 'Administrador Geral ALHAN – SGI';
    const targetEnr = enrollments.find((e) => e.id === enrollmentId);
    if (!targetEnr) return;

    const matchedCourse = courses.find((c) => c.id === targetEnr.courseId);
    const calc = computeCourseInstallments(matchedCourse, targetEnr.createdAt);

    const nextFirstStatus: InstallmentStatus =
      target === 'FIRST' || target === 'BOTH'
        ? status
        : targetEnr.firstInstallmentStatus || 'Pendente';
    const nextSecondStatus: InstallmentStatus =
      target === 'SECOND' || target === 'BOTH'
        ? status
        : targetEnr.secondInstallmentStatus || 'Pendente';

    const overallPaymentStatus: EnrollmentItem['paymentStatus'] =
      nextFirstStatus === 'Pago' ? 'Pago' : 'Pendente';

    const instLabel: '1ª Parcela' | '2ª Parcela' | 'Pagamento Integral' =
      target === 'BOTH'
        ? 'Pagamento Integral'
        : target === 'FIRST'
        ? '1ª Parcela'
        : '2ª Parcela';

    const historyEntry: PaymentHistoryEntry = {
      id: `pay-adm-${Date.now()}`,
      installment: instLabel,
      installmentLabel: instLabel,
      amountKz:
        target === 'BOTH'
          ? targetEnr.amountKz
          : target === 'FIRST'
          ? targetEnr.firstInstallmentAmountKz ?? calc.firstKz
          : targetEnr.secondInstallmentAmountKz ?? calc.secondKz,
      dueDate:
        target === 'FIRST'
          ? targetEnr.firstInstallmentDueDate || calc.firstDueDate
          : targetEnr.secondInstallmentDueDate || calc.secondDueDate,
      paidAt: status === 'Pago' ? nowDate : undefined,
      recordedAt: nowDate,
      method: targetEnr.paymentMethod,
      reference: targetEnr.paymentReference,
      status,
      confirmedBy: adminName,
      note:
        adminNote ||
        `Estado actualizado pelo Administrador Único para «${status}» (${
          target === 'BOTH' ? '1ª e 2ª Parcelas' : target === 'FIRST' ? '1ª Parcela' : '2ª Parcela'
        }).`,
    };

    setEnrollments((prev) =>
      prev.map((enr) => {
        if (enr.id !== enrollmentId) return enr;
        const existingHist = enr.paymentHistory || [];
        const nextApp = status === 'Pago' ? 'aprovado' : enr.enrollmentApprovalStatus || 'pendente';
        return {
          ...enr,
          paymentStatus: overallPaymentStatus,
          enrollmentApprovalStatus: nextApp,
          firestoreStatus: toFirestoreApprovalState(nextApp),
          firstInstallmentStatus: nextFirstStatus,
          firstInstallmentPaidAt:
            (target === 'FIRST' || target === 'BOTH') && status === 'Pago'
              ? nowDate
              : enr.firstInstallmentPaidAt,
          secondInstallmentStatus: nextSecondStatus,
          secondInstallmentPaidAt:
            (target === 'SECOND' || target === 'BOTH') && status === 'Pago'
              ? nowDate
              : enr.secondInstallmentPaidAt,
          paymentHistory: [historyEntry, ...existingHist],
        };
      })
    );

    if (auth.currentUser && auth.currentUser.emailVerified) {
      await updateEnrollmentStatusInFirestore(
        enrollmentId,
        status === 'Pago' ? 'APROVADO' : overallPaymentStatus
      ).catch(() => null);
    }

    const parcelaLabel =
      target === 'BOTH' ? '1.ª e 2.ª Parcelas' : target === 'FIRST' ? '1.ª Parcela (Confirmação de Vaga)' : '2.ª Parcela';
    triggerNotification(
      'Pagamento aprovado',
      `Actualização de Pagamento (${parcelaLabel}): ${status}`,
      `O estado da ${parcelaLabel} da formação «${targetEnr.courseTitle}» (${targetEnr.studentName}) foi actualizado para «${status}».`,
      'ALUNO'
    );
    logActivity(
      `Pagamento (${parcelaLabel}) da inscrição #${enrollmentId} (${targetEnr.studentName}) actualizado para ${status}`,
      adminName
    );
  };

  const updateEnrollmentApprovalStatus = async (
    enrollmentId: string,
    approvalStatus: 'pendente' | 'aprovado' | 'rejeitado'
  ) => {
    const callerRole = user?.role || 'ADMIN';
    if (callerRole !== 'ADMIN' && callerRole !== 'SUPER_ADMIN') {
      throw new Error('Operação bloqueada: Apenas utilizadores com perfil ADMIN ou SUPER_ADMIN podem aprovar ou rejeitar inscrições.');
    }

    const fsStatus = toFirestoreApprovalState(approvalStatus);
    const decidedAt = new Date().toISOString();
    const decidedBy = user?.fullName || 'Administrador Principal ALHAN – SGI';
    const decidedByEmail = user?.email || 'admin@alhan.pro';

    const targetEnr = enrollments.find((e) => e.id === enrollmentId);
    setEnrollments((prev) =>
      prev.map((enr) =>
        enr.id === enrollmentId
          ? {
              ...enr,
              enrollmentApprovalStatus: approvalStatus,
              firestoreStatus: fsStatus,
              decidedBy,
              decidedByEmail,
              decidedAt,
              paymentStatus:
                approvalStatus === 'aprovado'
                  ? 'APROVADO'
                  : approvalStatus === 'rejeitado'
                  ? 'REJEITADO'
                  : 'PENDENTE',
            }
          : enr
      )
    );

    await updateEnrollmentStatusInFirestore(enrollmentId, fsStatus).catch(() => null);

    if (typeof window !== 'undefined') {
      fetch('/api/approvals/decide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-alhan-role': callerRole,
        },
        body: JSON.stringify({
          uid: targetEnr?.studentId,
          enrollmentId,
          email: targetEnr?.studentEmail,
          status: fsStatus,
          actorRole: callerRole,
          actorName: decidedBy,
          actorEmail: decidedByEmail,
          notes: `Decisão sobre inscrição #${enrollmentId} (${fsStatus}) por ${decidedBy} em ${decidedAt}.`,
        }),
      }).catch(() => null);
    }

    if (targetEnr) {
      // Also update the corresponding student user account in local state and Firestore
      setRegisteredUsers((prev) =>
        prev.map((u) => {
          const matches =
            u.uid === targetEnr.studentId ||
            (targetEnr.studentEmail && u.email.toLowerCase() === targetEnr.studentEmail.toLowerCase());
          if (!matches) return u;
          updateUserApprovalInFirestore(u.uid, fsStatus).catch(() => null);
          return {
            ...u,
            approvalStatus,
            firestoreStatus: fsStatus,
            decidedBy,
            decidedByEmail,
            decidedAt,
          };
        })
      );
      setUser((prev) =>
        prev &&
        (prev.uid === targetEnr.studentId ||
          (targetEnr.studentEmail && prev.email.toLowerCase() === targetEnr.studentEmail.toLowerCase()))
          ? {
              ...prev,
              approvalStatus,
              firestoreStatus: fsStatus,
              decidedBy,
              decidedByEmail,
              decidedAt,
            }
          : prev
      );
      setCertificateRequests((prev) =>
        prev.map((req) => {
          const matches =
            req.enrollmentId === enrollmentId ||
            req.userId === targetEnr.studentId ||
            (targetEnr.studentEmail &&
              req.studentEmail.toLowerCase() === targetEnr.studentEmail.toLowerCase() &&
              req.courseId === targetEnr.courseId);
          if (!matches || req.status === 'DISPONÍVEL') return req;
          const nextCertSt: CertificateRequestStatus =
            approvalStatus === 'aprovado'
              ? 'APROVADO'
              : approvalStatus === 'rejeitado'
              ? 'REJEITADO'
              : 'PENDENTE';
          updateCertificateRequestInFirestore(req.id, { status: nextCertSt }).catch(() => null);
          return {
            ...req,
            status: nextCertSt,
          };
        })
      );
      triggerNotification(
        'Nova inscrição',
        `Inscrição de Formando ${fsStatus} no Firestore`,
        `A inscrição de ${targetEnr.studentName} no curso «${targetEnr.courseTitle}» foi alterada para ${fsStatus} no Firebase Firestore por ${decidedBy} em ${new Date(decidedAt).toLocaleString('pt-AO')}.`,
        'ALUNO'
      );
      logActivity(
        `Decisão Administrativa (Inscrição #${enrollmentId}): ${targetEnr.studentName} (${targetEnr.courseTitle}) -> ${fsStatus} | Responsável: ${decidedBy} (${decidedByEmail}) | Data/Hora: ${new Date(decidedAt).toLocaleString('pt-AO')}`,
        decidedBy
      );
    }
  };

  const notifySecondInstallmentDue = (enrollmentId: string) => {
    const targetEnr = enrollments.find((e) => e.id === enrollmentId);
    if (!targetEnr) return;
    const matchedCourse = courses.find((c) => c.id === targetEnr.courseId);
    const calc = computeCourseInstallments(matchedCourse, targetEnr.createdAt);
    const secondAmt = targetEnr.secondInstallmentAmountKz ?? calc.secondKz;
    const secondDue = targetEnr.secondInstallmentDueDate || calc.secondDueDate;
    const nowIso = new Date().toISOString();

    setEnrollments((prev) =>
      prev.map((enr) =>
        enr.id === enrollmentId ? { ...enr, secondInstallmentNotifiedAt: nowIso } : enr
      )
    );

    triggerNotification(
      'Pagamento aprovado',
      `Aviso de Vencimento da 2.ª Parcela — ${targetEnr.courseTitle}`,
      `Prezado(a) formando(a) ${targetEnr.studentName}, recordamos que a 2.ª Parcela no valor de ${secondAmt.toLocaleString(
        'pt-AO'
      )} Kz (uma semana após o início da formação) vence em ${secondDue}. Efectue o pagamento no seu Painel do Aluno.`,
      'ALUNO'
    );

    notifyAdminAndEmailGeral({
      panelOrigin: 'PAINEL_ALUNO',
      subject: `Notificação de Vencimento da 2.ª Parcela — ${targetEnr.studentName} (${targetEnr.courseTitle})`,
      applicantName: targetEnr.studentName,
      applicantEmail: targetEnr.studentEmail || 'geral@alhan.pro',
      applicantPhone: targetEnr.studentPhone || '+244 922 021 211',
      details: `Curso: ${targetEnr.courseTitle} | 2.ª Parcela: ${secondAmt.toLocaleString('pt-AO')} Kz | Data de Vencimento: ${secondDue} | Estado: ${targetEnr.secondInstallmentStatus || 'Pendente'}`,
    });

    logActivity(
      `Notificação de vencimento da 2.ª Parcela (${secondAmt.toLocaleString('pt-AO')} Kz · Vencimento: ${secondDue}) enviada ao formando ${targetEnr.studentName}`
    );
  };

  // ==========================================================
  // 1. AUDITORIA, BACKUP E LIMPEZA DE DADOS COM CONFIRMAÇÃO DO ADMINISTRADOR
  // ==========================================================
  const auditCandidates: DataAuditCandidateItem[] = React.useMemo(() => {
    const items: DataAuditCandidateItem[] = [];

    // Audit Enrollments
    const seenEnrollmentKeys = new Set<string>();
    enrollments.forEach((enr) => {
      const key = `${(enr.studentEmail || enr.studentName).toLowerCase()}::${enr.courseId}`;
      const isDuplicate = seenEnrollmentKeys.has(key);
      seenEnrollmentKeys.add(key);

      const isInitialSeedTest =
        enr.id === 'enr-01' ||
        enr.studentId === 'aluno-01' ||
        (enr.studentEmail && enr.studentEmail.toLowerCase().endsWith('@empresa.ao')) ||
        enr.studentName.toLowerCase().includes('teste') ||
        enr.studentName.toLowerCase().includes('demo');

      if (isDuplicate) {
        items.push({
          id: `enr::${enr.id}`,
          category: 'INSCRICAO',
          title: `${enr.studentName} — ${enr.courseTitle}`,
          identifier: `Inscrição #${enr.id} (${enr.studentEmail || 'sem email'})`,
          reason: 'Registo de inscrição duplicado para o mesmo formando e curso.',
          classification: 'DUPLICADO',
          recommendedAction: 'ELIMINAR_APOS_CONFIRMACAO',
          createdAt: enr.createdAt,
        });
      } else if (isInitialSeedTest) {
        items.push({
          id: `enr::${enr.id}`,
          category: 'INSCRICAO',
          title: `${enr.studentName} — ${enr.courseTitle}`,
          identifier: `Inscrição #${enr.id} (${enr.studentEmail || 'manuel.mateus@empresa.ao'})`,
          reason:
            'Registo inicial fictício/demonstração de semente (domínio genérico @empresa.ao / aluno-01).',
          classification: 'REGISTO_TESTE_INICIAL',
          recommendedAction: 'ELIMINAR_APOS_CONFIRMACAO',
          createdAt: enr.createdAt,
        });
      } else {
        items.push({
          id: `enr::${enr.id}`,
          category: 'INSCRICAO',
          title: `${enr.studentName} — ${enr.courseTitle}`,
          identifier: `Inscrição #${enr.id} (${enr.studentEmail || enr.studentPhone || ''})`,
          reason: 'Inscrição legítima registada na plataforma.',
          classification: 'DADO_LEGITIMO_PRESERVADO',
          recommendedAction: 'PRESERVAR',
          createdAt: enr.createdAt,
        });
      }
    });

    // Audit Certificates
    const seenCertCodes = new Set<string>();
    certificates.forEach((cert) => {
      const isDuplicate = seenCertCodes.has(cert.code);
      seenCertCodes.add(cert.code);

      const isInitialSeedCert =
        cert.id === 'cert-sgi-001' ||
        cert.id === 'cert-pres-01' ||
        cert.studentId === 'aluno-01' ||
        cert.studentId === 'aluno-presencial-01' ||
        (cert.studentEmail && cert.studentEmail.toLowerCase().endsWith('@empresa.ao'));

      if (isDuplicate) {
        items.push({
          id: `cert::${cert.id}`,
          category: 'CERTIFICADO',
          title: `${cert.studentName} — ${cert.courseTitle}`,
          identifier: `Código: ${cert.code} (ID: ${cert.id})`,
          reason: 'Certificado com código duplicado.',
          classification: 'DUPLICADO',
          recommendedAction: 'ELIMINAR_APOS_CONFIRMACAO',
          createdAt: cert.createdAt,
        });
      } else if (isInitialSeedCert) {
        items.push({
          id: `cert::${cert.id}`,
          category: 'CERTIFICADO',
          title: `${cert.studentName} — ${cert.courseTitle}`,
          identifier: `Código: ${cert.code} · B.I.: ${cert.studentBI || 'N/A'}`,
          reason:
            'Certificado inicial fictício/exemplo pré-carregado na configuração base (@empresa.ao) sem emissão administrativa real.',
          classification: 'SEM_VALIDADE_REAL',
          recommendedAction: 'ELIMINAR_APOS_CONFIRMACAO',
          createdAt: cert.createdAt,
        });
      } else {
        items.push({
          id: `cert::${cert.id}`,
          category: 'CERTIFICADO',
          title: `${cert.studentName} — ${cert.courseTitle}`,
          identifier: `Código: ${cert.code} · B.I.: ${cert.studentBI || 'N/A'}`,
          reason: 'Certificado legítimo emitido pela Administração ALHAN.',
          classification: 'DADO_LEGITIMO_PRESERVADO',
          recommendedAction: 'PRESERVAR',
          createdAt: cert.createdAt,
        });
      }
    });

    // Audit Certificate Requests
    certificateRequests.forEach((req) => {
      const isInitialSeedReq =
        req.id === 'cert-req-01' ||
        req.userId === 'aluno-01' ||
        req.studentEmail.toLowerCase().endsWith('@empresa.ao');

      items.push({
        id: `certreq::${req.id}`,
        category: 'SOLICITACAO_CERTIFICADO',
        title: `${req.studentName} — ${req.courseName}`,
        identifier: `Pedido #${req.id} (${req.studentEmail})`,
        reason: isInitialSeedReq
          ? 'Solicitação inicial de demonstração pré-carregada para aluno-01 (@empresa.ao).'
          : 'Solicitação legítima de formando registado.',
        classification: isInitialSeedReq ? 'REGISTO_TESTE_INICIAL' : 'DADO_LEGITIMO_PRESERVADO',
        recommendedAction: isInitialSeedReq ? 'ELIMINAR_APOS_CONFIRMACAO' : 'PRESERVAR',
        createdAt: req.createdAt,
      });
    });

    // Audit Registered Users
    registeredUsers.forEach((u) => {
      const isTestAccount =
        u.email.toLowerCase().endsWith('@empresa.ao') ||
        u.email.toLowerCase().includes('teste') ||
        u.fullName.toLowerCase().includes('teste');

      items.push({
        id: `usr::${u.uid}`,
        category: 'FORMANDO',
        title: `${u.fullName} (${u.role})`,
        identifier: `${u.email} · User: ${u.username}`,
        reason: isTestAccount
          ? 'Conta identificada com dados de teste/fictícios.'
          : 'Conta registada legítima.',
        classification: isTestAccount ? 'REGISTO_TESTE_INICIAL' : 'DADO_LEGITIMO_PRESERVADO',
        recommendedAction: isTestAccount ? 'ELIMINAR_APOS_CONFIRMACAO' : 'PRESERVAR',
        createdAt: u.createdAt,
      });
    });

    return items.map((item) => ({
      ...item,
      subtitle: item.identifier,
      suggestedForDeletion: item.recommendedAction === 'ELIMINAR_APOS_CONFIRMACAO',
    }));
  }, [enrollments, certificates, certificateRequests, registeredUsers]);

  const createDataSafetyBackup = (): SystemBackupSnapshot => {
    const snapshot: SystemBackupSnapshot = {
      backupId: `BKP-ALHAN-${new Date().toISOString().replace(/[:.]/g, '-')}`,
      createdAt: new Date().toISOString(),
      createdBy: user?.fullName || 'Administrador Geral ALHAN – SGI',
      registeredUsers: [...registeredUsers],
      enrollments: [...enrollments],
      certificates: [...certificates],
      certificateRequests: [...certificateRequests],
    };
    setLastSystemBackup(snapshot);
    persistAndBroadcast('alhan_safety_backup_v1', snapshot);
    logActivity(
      `Cópia de segurança completa criada (${snapshot.backupId}) antes de operação de limpeza de dados`
    );
    return snapshot;
  };

  const executeAdminConfirmedDataCleanup = (selectedIds: string[]) => {
    // Always guarantee a safety backup before any deletion operation
    const backup = createDataSafetyBackup();

    const enrIdsToRemove = new Set(
      selectedIds.filter((id) => id.startsWith('enr::')).map((id) => id.replace('enr::', ''))
    );
    const certIdsToRemove = new Set(
      selectedIds.filter((id) => id.startsWith('cert::')).map((id) => id.replace('cert::', ''))
    );
    const reqIdsToRemove = new Set(
      selectedIds
        .filter((id) => id.startsWith('certreq::'))
        .map((id) => id.replace('certreq::', ''))
    );
    const usrIdsToRemove = new Set(
      selectedIds.filter((id) => id.startsWith('usr::')).map((id) => id.replace('usr::', ''))
    );

    if (enrIdsToRemove.size > 0) {
      setEnrollments((prev) => prev.filter((e) => !enrIdsToRemove.has(e.id)));
    }
    if (certIdsToRemove.size > 0) {
      setCertificates((prev) => prev.filter((c) => !certIdsToRemove.has(c.id)));
    }
    if (reqIdsToRemove.size > 0) {
      setCertificateRequests((prev) => prev.filter((r) => !reqIdsToRemove.has(r.id)));
    }
    if (usrIdsToRemove.size > 0) {
      setRegisteredUsers((prev) => prev.filter((u) => !usrIdsToRemove.has(u.uid)));
    }

    const removedCount =
      enrIdsToRemove.size + certIdsToRemove.size + reqIdsToRemove.size + usrIdsToRemove.size;

    logActivity(
      `Limpeza de dados confirmada pelo Administrador Único concluída: ${removedCount} registo(s) fictício(s)/teste eliminado(s). Backup preservado: ${backup.backupId}`
    );

    return {
      removedCount,
      deletedCount: removedCount,
      backupId: backup.backupId,
      backup,
    };
  };

  const restoreDataSafetyBackup = (): boolean => {
    if (!lastSystemBackup) return false;
    setRegisteredUsers(lastSystemBackup.registeredUsers);
    setEnrollments(lastSystemBackup.enrollments);
    setCertificates(lastSystemBackup.certificates);
    setCertificateRequests(lastSystemBackup.certificateRequests);
    logActivity(
      `Cópia de segurança (${lastSystemBackup.backupId}) restaurada com sucesso pelo Administrador Único`
    );
    return true;
  };

  const createAdminRealtimeNotification = (payload: {
    type: AdminNotificationRecord['type'];
    title: string;
    message: string;
    studentName: string;
    courseName: string;
    requestId: string;
  }) => {
    const newAdmNotif: AdminNotificationRecord = {
      id: `adm-notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      studentName: payload.studentName,
      courseName: payload.courseName,
      requestId: payload.requestId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setAdminNotifications((prev) => [newAdmNotif, ...prev]);
    if (auth.currentUser && auth.currentUser.emailVerified) {
      saveAdminNotificationToFirestore(newAdmNotif).catch(() => null);
    }
    return newAdmNotif;
  };

  const markAdminNotificationRead = (id: string) => {
    setAdminNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (auth.currentUser && auth.currentUser.email === 'joaomuatxissombo22@gmail.com') {
      updateDoc(doc(db, 'adminNotifications', id), { read: true }).catch(() => null);
    }
  };

  const markAllAdminNotificationsRead = () => {
    setAdminNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  /**
   * Module 1 & Module 3: Formal Certificate Request Submission
   * Enforces:
   * - Student must be enrolled in the course
   * - Student must have completed the training (or meets participation/completion criteria)
   * - No duplicate pending/active request exists for the same course
   */
  const submitCertificateRequest = async (payload: {
    enrollmentId: string;
    courseId: string;
    studentName: string;
    studentEmail: string;
    studentPhone?: string;
    studentBI?: string;
    studentNotes?: string;
  }): Promise<CertificateRequestItem> => {
    const nowIso = new Date().toISOString();
    const currentUserId = auth.currentUser?.uid || user?.uid || 'aluno-inscrito';

    const enrollment = enrollments.find(
      (e) =>
        e.id === payload.enrollmentId ||
        (e.courseId === payload.courseId &&
          (e.studentId === currentUserId ||
            (payload.studentEmail &&
              e.studentEmail?.toLowerCase() === payload.studentEmail.toLowerCase())))
    );

    if (!enrollment) {
      throw new Error(
        'Não foi encontrada uma inscrição activa associada à sua conta para este curso. Inscreva-se primeiro na formação.'
      );
    }

    // Certificates are NEVER generated online automatically. Any enrolled student can submit a certificate request
    // in their panel so the Administrator receives the request in the Admin Panel and sends the official PDF file.
    const existingBlockingRequest = certificateRequests.find(
      (r) =>
        r.courseId === enrollment.courseId &&
        (r.userId === enrollment.studentId ||
          r.userId === currentUserId ||
          (payload.studentEmail &&
            r.studentEmail.toLowerCase() === payload.studentEmail.toLowerCase())) &&
        (r.status === 'PENDENTE' ||
          r.status === 'EM PROCESSAMENTO' ||
          r.status === 'APROVADO')
    );

    if (existingBlockingRequest) {
      throw new Error(
        `Já existe uma solicitação em curso (${existingBlockingRequest.status}) para a formação "${enrollment.courseTitle}". Não são permitidas solicitações duplicadas enquanto o pedido estiver em análise.`
      );
    }

    const courseObj = courses.find((c) => c.id === enrollment.courseId);
    const reqId = `cert-req-${Date.now()}`;
    const cleanName = payload.studentName.trim() || enrollment.studentName;
    const cleanEmail = payload.studentEmail.trim() || enrollment.studentEmail || user?.email || '';
    const cleanPhone = payload.studentPhone?.trim() || enrollment.studentPhone || user?.phone || '';
    const cleanBI = payload.studentBI?.trim().toUpperCase() || enrollment.certificateRequestBI || '';
    const cleanNotes = payload.studentNotes?.trim() || '';

    const auditEntry: CertificateAuditEntry = {
      id: `aud-${Date.now()}`,
      action: 'SOLICITADO',
      statusAfter: 'PENDENTE',
      actorName: cleanName,
      actorRole: 'ALUNO',
      notes: cleanNotes
        ? `Solicitação submetida pelo formando. Observação: ${cleanNotes}`
        : 'Solicitação submetida pelo formando após conclusão da formação.',
      timestamp: nowIso,
    };

    const newRequest: CertificateRequestItem = {
      id: reqId,
      enrollmentId: enrollment.id,
      userId: enrollment.studentId || currentUserId,
      studentName: cleanName,
      studentEmail: cleanEmail,
      studentPhone: cleanPhone,
      studentBI: cleanBI,
      courseId: enrollment.courseId,
      courseName: enrollment.courseTitle,
      modality: enrollment.modality,
      workloadHours: courseObj?.durationHours || 40,
      enrollmentDate: enrollment.createdAt ? enrollment.createdAt.split('T')[0] : nowIso.split('T')[0],
      completionDate: nowIso.split('T')[0],
      requestDate: nowIso,
      studentNotes: cleanNotes,
      status: 'PENDENTE',
      certificateStoragePath: '',
      certificateFileUrl: '',
      certificateFileName: '',
      certificateCode: '',
      issuedAt: '',
      issuedBy: '',
      adminNotes: '',
      auditHistory: [auditEntry],
      createdAt: nowIso,
    };

    setCertificateRequests((prev) => [newRequest, ...prev]);

    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === enrollment.id
          ? {
              ...e,
              certificateRequested: true,
              certificateRequestedAt: nowIso,
              certificateRequestName: cleanName,
              certificateRequestBI: cleanBI,
              certificateRequestEmail: cleanEmail,
              certificateRequestPhone: cleanPhone,
              certificateRequestNotes: cleanNotes,
            }
          : e
      )
    );

    if (auth.currentUser && auth.currentUser.emailVerified) {
      await saveCertificateRequestToFirestore(newRequest).catch(() => null);
    }

    // Module 3.1: Real-time private notification exclusively for the Administrative Panel
    createAdminRealtimeNotification({
      type: 'SOLICITACAO_CERTIFICADO',
      title: 'Nova solicitação de certificado',
      message: `O formando ${cleanName} solicitou um certificado da formação ${enrollment.courseTitle}.`,
      studentName: cleanName,
      courseName: enrollment.courseTitle,
      requestId: reqId,
    });

    triggerNotification(
      'Certificado disponível',
      'Nova solicitação de certificado',
      `O formando ${cleanName} solicitou um certificado da formação ${enrollment.courseTitle}.`,
      'ADMIN'
    );

    notifyAdminAndEmailGeral({
      panelOrigin: 'SOLICITACAO_CERTIFICADO',
      subject: `Nova solicitação de certificado — ${cleanName} (${enrollment.courseTitle})`,
      applicantName: cleanName,
      applicantEmail: cleanEmail || 'geral@alhan.pro',
      applicantPhone: cleanPhone || '+244 922 021 211',
      details: `Formação: ${enrollment.courseTitle} | ID Formação: ${enrollment.courseId} | Data Pedido: ${nowIso} | Observação: ${cleanNotes || 'Sem observações'}`,
    });

    logActivity(
      `Nova solicitação de certificado submetida por ${cleanName} (${enrollment.courseTitle}) — Estado: PENDENTE`,
      cleanName
    );

    return newRequest;
  };

  /**
   * Module 2 & 5: Update Certificate Request Status (EM PROCESSAMENTO, APROVADO, REJEITADO) with full Audit Trail
   */
  const updateCertificateRequestStatus = async (
    requestId: string,
    nextStatus: Exclude<CertificateRequestStatus, 'NÃO SOLICITADO' | 'DISPONÍVEL'>,
    options?: {
      adminNotes?: string;
      rejectionReason?: string;
    }
  ): Promise<void> => {
    const nowIso = new Date().toISOString();
    const adminActor = user?.fullName || 'Administrador Geral ALHAN – SGI';
    const target = certificateRequests.find((r) => r.id === requestId);
    if (!target) return;

    const actionType: CertificateAuditEntry['action'] =
      nextStatus === 'EM PROCESSAMENTO'
        ? 'EM_ANALISE'
        : nextStatus === 'APROVADO'
        ? 'APROVADO'
        : nextStatus === 'REJEITADO'
        ? 'REJEITADO'
        : 'SOLICITADO';

    const auditEntry: CertificateAuditEntry = {
      id: `aud-${Date.now()}`,
      action: actionType,
      statusAfter: nextStatus,
      actorName: adminActor,
      actorRole: 'ADMIN',
      notes:
        nextStatus === 'REJEITADO'
          ? `Pedido rejeitado. Motivo: ${options?.rejectionReason || options?.adminNotes || 'Requisitos não cumpridos'}`
          : options?.adminNotes || `Estado alterado para ${nextStatus} pela administração.`,
      timestamp: nowIso,
    };

    setCertificateRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: nextStatus,
              adminNotes: options?.adminNotes !== undefined ? options.adminNotes : r.adminNotes,
              rejectionReason:
                nextStatus === 'REJEITADO'
                  ? options?.rejectionReason || options?.adminNotes || 'Requisitos não cumpridos'
                  : r.rejectionReason,
              auditHistory: [...r.auditHistory, auditEntry],
            }
          : r
      )
    );

    if (auth.currentUser && auth.currentUser.emailVerified) {
      await updateCertificateRequestInFirestore(requestId, {
        status: nextStatus,
        adminNotes: options?.adminNotes || options?.rejectionReason || target.adminNotes,
      }).catch(() => null);
    }

    logActivity(
      `Solicitação de certificado ${requestId} (${target.studentName} - ${target.courseName}) actualizada para ${nextStatus}`,
      adminActor
    );
  };

  /**
   * Module 2.2, 2.3 & Module 4: Attach PDF to Firebase Storage, associate strictly to the student's request,
   * transition status to DISPONÍVEL, and deliver automatically to the student's "OS MEUS CERTIFICADOS" section.
   */
  const emitAndDeliverCertificateRequest = async (
    requestId: string,
    payload: {
      pdfFile?: File;
      certificateFileUrl?: string;
      certificateFileName?: string;
      certificateCode?: string;
      issuedDate?: string;
      adminNotes?: string;
      studentBI?: string;
      grade?: string;
    }
  ): Promise<CertificateRequestItem> => {
    const targetReq = certificateRequests.find((r) => r.id === requestId);
    if (!targetReq) {
      throw new Error('Solicitação de certificado não encontrada.');
    }

    const nowIso = new Date().toISOString();
    const issuedDate = payload.issuedDate || nowIso.split('T')[0];
    const adminActor = user?.fullName || 'Administrador Geral ALHAN – SGI';
    const certCode =
      payload.certificateCode?.trim() ||
      targetReq.certificateCode ||
      `ALHAN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!payload.pdfFile && (!payload.certificateFileUrl || !payload.certificateFileUrl.trim())) {
      throw new Error(
        'Atenção: Os certificados para alunos não podem ser gerados automaticamente online. O Administrador deve anexar o ficheiro PDF oficial do certificado para enviá-lo ao painel do aluno.'
      );
    }

    // Validate via backend endpoint if pdfFile is provided
    if (payload.pdfFile) {
      const isPdf =
        payload.pdfFile.type === 'application/pdf' ||
        payload.pdfFile.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        throw new Error('Formato inválido: Apenas ficheiros PDF (application/pdf) são aceites.');
      }
      if (payload.pdfFile.size > 10 * 1024 * 1024) {
        throw new Error('O ficheiro PDF excede o limite máximo permitido de 10 MB.');
      }
      fetch('/api/certificates/validate-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: payload.pdfFile.name,
          mimeType: payload.pdfFile.type || 'application/pdf',
          fileSizeBytes: payload.pdfFile.size,
          userId: targetReq.userId,
          courseId: targetReq.courseId,
          requestId: targetReq.id,
        }),
      }).catch(() => null);
    }

    const { storagePath, downloadUrl } = await uploadCertificatePdfToStorage({
      userId: targetReq.userId,
      courseId: targetReq.courseId,
      file: payload.pdfFile,
      fallbackDataUrl: payload.certificateFileUrl || '',
    });

    const finalFileName =
      payload.pdfFile?.name ||
      payload.certificateFileName ||
      `Certificado_ALHAN_${certCode}_${targetReq.studentName.replace(/\s+/g, '_')}.pdf`;

    const auditEntry: CertificateAuditEntry = {
      id: `aud-${Date.now()}`,
      action: 'EMITIDO_E_DISPONIBILIZADO',
      statusAfter: 'DISPONÍVEL',
      actorName: adminActor,
      actorRole: 'ADMIN',
      notes: `Certificado PDF (${certCode}) anexado no Firebase Storage (${storagePath}) e disponibilizado automaticamente na conta do formando ${targetReq.studentName}. ${
        payload.adminNotes ? `Obs: ${payload.adminNotes}` : ''
      }`,
      timestamp: nowIso,
    };

    const updatedRequest: CertificateRequestItem = {
      ...targetReq,
      studentBI: payload.studentBI || targetReq.studentBI,
      status: 'DISPONÍVEL',
      certificateStoragePath: storagePath,
      certificateFileUrl: downloadUrl,
      certificateFileName: finalFileName,
      certificateCode: certCode,
      issuedAt: nowIso,
      issuedBy: adminActor,
      adminNotes: payload.adminNotes !== undefined ? payload.adminNotes : targetReq.adminNotes,
      auditHistory: [...targetReq.auditHistory, auditEntry],
    };

    setCertificateRequests((prev) =>
      prev.map((r) => (r.id === requestId ? updatedRequest : r))
    );

    // Sync with certificates collection & student's enrollment record
    const existingCert = certificates.find(
      (c) =>
        c.code === certCode ||
        (c.studentId === targetReq.userId && c.courseId === targetReq.courseId)
    );

    const certRecord: CertificateItem = {
      id: existingCert?.id || `cert-${Date.now()}`,
      code: certCode,
      studentId: targetReq.userId,
      studentName: targetReq.studentName,
      studentBI: payload.studentBI || targetReq.studentBI || '',
      studentPhone: targetReq.studentPhone || '',
      studentEmail: targetReq.studentEmail,
      courseId: targetReq.courseId,
      courseTitle: targetReq.courseName,
      modality: targetReq.modality || 'Online',
      workloadHours: targetReq.workloadHours || 40,
      grade: payload.grade || 'Aprovado com Distinção',
      issuedDate,
      responsibleName: adminActor,
      responsibleRole: 'Direcção Pedagógica – ALHAN SGI',
      status: 'valido',
      certificateFileUrl: downloadUrl,
      certificateFileName: finalFileName,
      certificateStoragePath: storagePath,
      isDemo: false,
      createdAt: existingCert?.createdAt || nowIso,
    };

    setCertificates((prev) => {
      const exists = prev.some((c) => c.id === certRecord.id);
      return exists ? prev.map((c) => (c.id === certRecord.id ? certRecord : c)) : [certRecord, ...prev];
    });

    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === targetReq.enrollmentId ||
        (e.studentId === targetReq.userId && e.courseId === targetReq.courseId)
          ? {
              ...e,
              completed: true,
              progressPercent: 100,
              certificateId: certRecord.id,
              certificateSentAt: nowIso,
            }
          : e
      )
    );

    if (auth.currentUser && auth.currentUser.emailVerified) {
      await updateCertificateRequestInFirestore(requestId, {
        status: 'DISPONÍVEL',
        certificateStoragePath: storagePath,
        certificateCode: certCode,
        issuedAt: nowIso,
        issuedBy: adminActor,
        adminNotes: updatedRequest.adminNotes,
      }).catch(() => null);
    }

    logActivity(
      `Certificado PDF emitido e disponibilizado (${certCode}) em ${storagePath} para o formando ${targetReq.studentName}`,
      adminActor
    );

    return updatedRequest;
  };

  /**
   * Module 5: Replace or Revoke an issued Certificate with mandatory justification and full audit trail
   */
  const replaceOrRevokeCertificateRequest = async (
    requestId: string,
    action: 'SUBSTITUIR' | 'REVOGAR',
    reason: string,
    replacementFile?: File
  ): Promise<void> => {
    const cleanReason = reason.trim();
    if (!cleanReason) {
      throw new Error('É obrigatório indicar o motivo/justificação para substituição ou revogação na auditoria.');
    }

    const targetReq = certificateRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const nowIso = new Date().toISOString();
    const adminActor = user?.fullName || 'Administrador Geral ALHAN – SGI';

    if (action === 'SUBSTITUIR' && replacementFile) {
      const { storagePath, downloadUrl } = await uploadCertificatePdfToStorage({
        userId: targetReq.userId,
        courseId: targetReq.courseId,
        file: replacementFile,
      });

      const auditEntry: CertificateAuditEntry = {
        id: `aud-${Date.now()}`,
        action: 'SUBSTITUIDO',
        statusAfter: 'DISPONÍVEL',
        actorName: adminActor,
        actorRole: 'ADMIN',
        notes: `Certificado PDF substituído no Firebase Storage (${storagePath}). Motivo: ${cleanReason}`,
        timestamp: nowIso,
      };

      setCertificateRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'DISPONÍVEL',
                certificateStoragePath: storagePath,
                certificateFileUrl: downloadUrl,
                certificateFileName: replacementFile.name,
                issuedAt: nowIso,
                issuedBy: adminActor,
                adminNotes: `${r.adminNotes ? r.adminNotes + ' | ' : ''}Substituído em ${nowIso.split('T')[0]}: ${cleanReason}`,
                auditHistory: [...r.auditHistory, auditEntry],
              }
            : r
        )
      );

      setCertificates((prev) =>
        prev.map((c) =>
          c.code === targetReq.certificateCode ||
          (c.studentId === targetReq.userId && c.courseId === targetReq.courseId)
            ? {
                ...c,
                certificateFileUrl: downloadUrl,
                certificateFileName: replacementFile.name,
                certificateStoragePath: storagePath,
                status: 'valido',
              }
            : c
        )
      );

      logActivity(
        `Certificado substituído com registo de auditoria (${targetReq.certificateCode}) — Motivo: ${cleanReason}`,
        adminActor
      );
      return;
    }

    // Revocation with audit preservation
    const auditEntry: CertificateAuditEntry = {
      id: `aud-${Date.now()}`,
      action: 'REVOGADO',
      statusAfter: 'REJEITADO',
      actorName: adminActor,
      actorRole: 'ADMIN',
      notes: `Certificado revogado pela administração. Motivo da revogação: ${cleanReason}`,
      timestamp: nowIso,
    };

    setCertificateRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJEITADO',
              revocationReason: cleanReason,
              revokedAt: nowIso,
              revokedBy: adminActor,
              rejectionReason: `Certificado revogado: ${cleanReason}`,
              auditHistory: [...r.auditHistory, auditEntry],
            }
          : r
      )
    );

    setCertificates((prev) =>
      prev.map((c) =>
        c.code === targetReq.certificateCode ||
        (c.studentId === targetReq.userId && c.courseId === targetReq.courseId)
          ? {
              ...c,
              status: 'cancelado',
              revocationReason: cleanReason,
              revokedBy: adminActor,
              revokedAt: nowIso,
            }
          : c
      )
    );

    if (auth.currentUser && auth.currentUser.emailVerified) {
      await updateCertificateRequestInFirestore(requestId, {
        status: 'REJEITADO',
        adminNotes: `Revogado por ${adminActor}: ${cleanReason}`,
      }).catch(() => null);
    }

    logActivity(
      `Certificado revogado com auditoria (${targetReq.certificateCode} - ${targetReq.studentName}) — Motivo: ${cleanReason}`,
      adminActor
    );
  };

  const requestCertificate = async (
    enrollmentId: string,
    requestDetails?: {
      courseId?: string;
      studentName?: string;
      studentBI?: string;
      studentEmail?: string;
      studentPhone?: string;
      notes?: string;
    }
  ) => {
    const target = enrollments.find(
      (e) =>
        e.id === enrollmentId ||
        (requestDetails?.courseId &&
          e.courseId === requestDetails.courseId &&
          (e.studentId === user?.uid ||
            (user?.email && e.studentEmail?.toLowerCase() === user.email.toLowerCase())))
    );

    if (target) {
      // Ensure enrollment is marked completed if called from legacy quick button and delegate to submitCertificateRequest
      if (!target.completed) {
        setEnrollments((prev) =>
          prev.map((e) => (e.id === target.id ? { ...e, completed: true, progressPercent: 100 } : e))
        );
      }
      await submitCertificateRequest({
        enrollmentId: target.id,
        courseId: target.courseId,
        studentName: requestDetails?.studentName || target.studentName,
        studentEmail: requestDetails?.studentEmail || target.studentEmail || user?.email || '',
        studentPhone: requestDetails?.studentPhone || target.studentPhone || user?.phone || '',
        studentBI: requestDetails?.studentBI || target.certificateRequestBI || '',
        studentNotes: requestDetails?.notes || '',
      });
    }
  };

  const loginWithCredentials = async (
    identifier: string,
    password: string,
    selectedRole?: UserRole
  ): Promise<UserRole> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      throw new Error('Por favor, introduza o seu utilizador/e-mail e a palavra-passe.');
    }

    // 1. If logging into Admin Panel (/gestao-alhan-sgi), check Single Unified Principal Administrator Credentials first
    const adminCred = panelCredentials.find((c) => c.role === 'ADMIN');
    if (
      selectedRole === 'ADMIN' ||
      selectedRole === 'SUPER_ADMIN' ||
      (!selectedRole &&
        (cleanId === 'alhan.admin' ||
          cleanId === 'admin@alhan.pro' ||
          (adminCred &&
            (cleanId === adminCred.username.toLowerCase() ||
              cleanId === adminCred.email.toLowerCase()))))
    ) {
      if (
        (cleanId === 'alhan.admin' ||
          cleanId === 'admin@alhan.pro' ||
          cleanId === 'joaomuatxissombo22@gmail.com' ||
          (adminCred &&
            (cleanId === adminCred.username.toLowerCase() ||
              cleanId === adminCred.email.toLowerCase()))) &&
        (cleanPass === 'Alhan@2026' ||
          cleanPass === 'Alhan@SGI2026' ||
          (adminCred && cleanPass === adminCred.password))
      ) {
        const active: ActiveUser = {
          uid: 'staff-admin-unico',
          fullName: 'Administrador Principal ALHAN – SGI',
          username: adminCred?.username || 'alhan.admin',
          email: adminCred?.email || 'admin@alhan.pro',
          phone: '+244 922 021 211',
          role: 'ADMIN',
          companyId: 'alhan-sgi',
          approvalStatus: 'aprovado',
          firestoreStatus: 'APROVADO',
        };
        setUser(active);
        logActivity('Acesso exclusivo autorizado ao Administrador Principal Único ALHAN (ADMIN)', active.fullName);
        return 'ADMIN';
      }
    }

    // 2. Check Registered Accounts (Aluno, Professor/Formador, or Cliente Empresarial who registered on the platform)
    const registeredMatch = registeredUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    if (registeredMatch) {
      if (registeredMatch.password !== cleanPass) {
        throw new Error('Palavra-passe incorrecta para esta conta registada. Se esqueceu a senha, utilize a opção «Redefinir Palavra-passe com E-mail».');
      }
      const approvalStatus: AccountApprovalState =
        registeredMatch.approvalStatus ||
        (registeredMatch.role === 'PROFESSOR' || registeredMatch.role === 'ALUNO'
          ? 'pendente'
          : 'aprovado');
      const firestoreStatus = registeredMatch.firestoreStatus || toFirestoreApprovalState(approvalStatus);
      const active: ActiveUser = {
        uid: registeredMatch.uid,
        fullName: registeredMatch.fullName,
        username: registeredMatch.username,
        email: registeredMatch.email,
        phone: registeredMatch.phone,
        studentBI: registeredMatch.studentBI,
        role: registeredMatch.role,
        companyId: registeredMatch.companyId,
        companyName: registeredMatch.companyName,
        specialty: registeredMatch.specialty,
        approvalStatus,
        firestoreStatus,
      };
      setUser(active);
      logActivity(`Sessão iniciada (${active.role} · Estado Firestore: ${firestoreStatus}): ${active.fullName}`, active.fullName);
      return active.role;
    }

    // 3. Fallback Admin check when no role was specified
    if (
      (cleanId === 'alhan.admin' ||
        cleanId === 'admin@alhan.pro' ||
        cleanId === 'joaomuatxissombo22@gmail.com' ||
        (adminCred &&
          (cleanId === adminCred.username.toLowerCase() ||
            cleanId === adminCred.email.toLowerCase()))) &&
      (cleanPass === 'Alhan@2026' ||
        cleanPass === 'Alhan@SGI2026' ||
        (adminCred && cleanPass === adminCred.password))
    ) {
      const active: ActiveUser = {
        uid: 'staff-admin-unico',
        fullName: 'Administrador Principal ALHAN – SGI',
        username: adminCred?.username || 'alhan.admin',
        email: adminCred?.email || 'admin@alhan.pro',
        phone: '+244 922 021 211',
        role: 'ADMIN',
        companyId: 'alhan-sgi',
        approvalStatus: 'aprovado',
        firestoreStatus: 'APROVADO',
      };
      setUser(active);
      logActivity('Acesso exclusivo autorizado ao Administrador Principal Único ALHAN (ADMIN)', active.fullName);
      return 'ADMIN';
    }

    // 4. If user tried to log in as ALUNO, PROFESSOR or CLIENTE_EMPRESARIAL without registering first
    if (selectedRole === 'ALUNO' || selectedRole === 'CLIENTE_EMPRESARIAL' || selectedRole === 'PROFESSOR') {
      throw new Error(
        selectedRole === 'ALUNO'
          ? 'Conta de Formando não encontrada. Preencha o formulário de inscrição em «Criar Conta / Cadastrar» e aguarde a aprovação do Administrador (Estado: PENDENTE -> APROVADO no Firestore).'
          : selectedRole === 'PROFESSOR'
          ? 'Conta de Professor / Formador não encontrada. Solicite acesso no separador «Inscrever Professor / Criar Conta» e aguarde a autorização do Administrador (Estado: PENDENTE -> APROVADO no Firestore).'
          : 'Conta Empresarial não encontrada. O Painel do Cliente Empresarial só é activado após efectuar o cadastro da sua empresa em «Criar Conta / Cadastrar».'
      );
    }

    throw new Error('Utilizador ou palavra-passe inválidos. Acesso administrativo exclusivo ao Administrador Principal Único da ALHAN.');
  };

  const registerAccount = async (payload: {
    fullName: string;
    email: string;
    phone: string;
    studentBI?: string;
    username: string;
    password: string;
    role: UserRole;
    companyName?: string;
    specialty?: string;
    experience?: string;
    courseId?: string;
    modality?: 'Online' | 'Presencial' | 'Híbrida';
    couponCode?: string;
  }) => {
    // Security Rule 6: NEVER allow creation of additional ADMIN or SUPER_ADMIN accounts
    if (payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN') {
      throw new Error(
        'Operação bloqueada por segurança: A plataforma mantém exclusivamente UM Administrador Principal.'
      );
    }

    const allowedRegisterRole: 'ALUNO' | 'CLIENTE_EMPRESARIAL' | 'PROFESSOR' =
      payload.role === 'CLIENTE_EMPRESARIAL'
        ? 'CLIENTE_EMPRESARIAL'
        : payload.role === 'PROFESSOR'
        ? 'PROFESSOR'
        : 'ALUNO';

    const cleanUsername = (payload.username.trim() || payload.email.split('@')[0]).toLowerCase();
    const cleanEmail = payload.email.trim().toLowerCase();

    const exists = registeredUsers.some(
      (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
    );
    if (exists) {
      throw new Error('Já existe uma conta registada com este nome de utilizador ou e-mail.');
    }

    const nowIso = new Date().toISOString();
    const newUid = `usr-${Date.now()}`;
    const companyId =
      allowedRegisterRole === 'CLIENTE_EMPRESARIAL'
        ? `emp-${Date.now()}`
        : allowedRegisterRole === 'PROFESSOR'
        ? 'alhan-docente'
        : 'alhan-aluno';
    const companyTitle = payload.companyName?.trim() || payload.fullName.trim();
    // Both new students (ALUNO) and professors (PROFESSOR) start with status PENDENTE in Firebase Firestore until Administrator approval
    const initialApprovalStatus: AccountApprovalState =
      allowedRegisterRole === 'PROFESSOR' || allowedRegisterRole === 'ALUNO'
        ? 'pendente'
        : 'aprovado';
    const initialFirestoreStatus: FirestoreApprovalState =
      allowedRegisterRole === 'PROFESSOR' || allowedRegisterRole === 'ALUNO'
        ? 'PENDENTE'
        : 'APROVADO';

    const targetCourseForStudent =
      allowedRegisterRole === 'ALUNO'
        ? (payload.courseId && courses.find((c) => c.id === payload.courseId)) ||
          courses.find((c) => c.featured) ||
          courses[0] ||
          INITIAL_COURSES[0]
        : undefined;

    const newAccount: RegisteredUserAccount = {
      uid: newUid,
      fullName: payload.fullName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: payload.phone.trim(),
      studentBI: payload.studentBI?.trim().toUpperCase(),
      password: payload.password.trim(),
      role: allowedRegisterRole,
      companyId,
      companyName: allowedRegisterRole === 'CLIENTE_EMPRESARIAL' ? companyTitle : undefined,
      specialty:
        allowedRegisterRole === 'PROFESSOR'
          ? payload.specialty?.trim() || payload.companyName?.trim() || 'Consultoria e Formação SGI / Normas ISO & HSE'
          : undefined,
      experience:
        allowedRegisterRole === 'PROFESSOR'
          ? payload.experience?.trim() || '5+ anos em Consultoria e Formação Técnica SGI / ISO & HSE'
          : undefined,
      desiredCourseId: targetCourseForStudent?.id,
      desiredCourseTitle: targetCourseForStudent?.title,
      approvalStatus: initialApprovalStatus,
      firestoreStatus: initialFirestoreStatus,
      createdAt: nowIso,
    };

    setRegisteredUsers((prev) => [newAccount, ...prev]);

    // Persist registration in Firebase Firestore with state 'PENDENTE'
    await saveUserRegistrationToFirestore({
      uid: newUid,
      fullName: newAccount.fullName,
      username: newAccount.username,
      role: allowedRegisterRole,
      companyId,
      email: newAccount.email,
      phone: newAccount.phone,
      status: initialFirestoreStatus,
    }).catch(() => null);

    // Sync user registration to Backend Approvals Registry (/api/approvals/register)
    if (typeof window !== 'undefined' && (allowedRegisterRole === 'ALUNO' || allowedRegisterRole === 'PROFESSOR')) {
      fetch('/api/approvals/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRecord: newAccount }),
      }).catch(() => null);
    }

    // When a student (ALUNO) registers, immediately create their Course Enrollment AND Certificate Approval record
    // so both appear instantaneously in ALHAN – SGI · Painel Administrativo Central for state approval
    if (allowedRegisterRole === 'ALUNO') {
      const targetCourse =
        targetCourseForStudent ||
        courses.find((c) => c.featured) ||
        courses[0] ||
        INITIAL_COURSES[0];
      const targetModality = payload.modality || targetCourse.modality || 'Online';
      const calc = computeCourseInstallments(targetCourse, nowIso, {
        couponCode: payload.couponCode,
        applyBlackFriday: true,
      });
      const enrollmentId = `enr-${Date.now()}`;
      const refCode = `CAD-${Date.now().toString().slice(-6)}`;
      const discountSummary =
        calc.discountPercent > 0
          ? ` [Desconto Aplicado: ${calc.appliedCoupon ? `Cupom ${calc.appliedCoupon} (-25%)` : 'Black Friday Novembro (-15%)'}]`
          : '';

      const autoEnrollment: EnrollmentItem = {
        id: enrollmentId,
        studentId: newUid,
        studentName: newAccount.fullName,
        studentPhone: newAccount.phone,
        studentEmail: newAccount.email,
        studentBI: newAccount.studentBI,
        courseId: targetCourse.id,
        courseTitle: targetCourse.title,
        modality: targetModality,
        originalAmountKz: calc.originalPriceKz,
        amountKz: calc.totalKz,
        discountPercent: calc.discountPercent,
        appliedCoupon: calc.appliedCoupon,
        blackFridayApplied: calc.blackFridayApplied,
        paymentMethod: 'Express Angola',
        paymentReference: refCode,
        receiptNote: `Inscrição e cadastro realizados no Painel do Aluno (${targetCourse.title})${discountSummary}. Aguarda aprovação do estado (PENDENTE -> APROVADO) no Painel Administrativo Central ALHAN – SGI.`,
        paymentStatus: 'PENDENTE',
        enrollmentApprovalStatus: 'pendente',
        firestoreStatus: 'PENDENTE',
        courseStartDate: calc.courseStartDate,
        firstInstallmentAmountKz: calc.firstKz,
        firstInstallmentDueDate: calc.firstDueDate,
        firstInstallmentStatus: 'Pendente',
        firstInstallmentReference: `${refCode}-P1`,
        secondInstallmentAmountKz: calc.secondKz,
        secondInstallmentDueDate: calc.secondDueDate,
        secondInstallmentStatus: 'Pendente',
        secondInstallmentReference: `${refCode}-P2`,
        paymentHistory: [
          {
            id: `hist-p1-${enrollmentId}`,
            installment: '1ª Parcela',
            installmentLabel: '1ª Parcela',
            amountKz: calc.firstKz,
            dueDate: calc.firstDueDate,
            recordedAt: calc.firstDueDate,
            method: 'Express Angola',
            reference: `${refCode}-P1`,
            status: 'Pendente',
            note: `1.ª Parcela no acto da inscrição.${discountSummary}`,
          },
          {
            id: `hist-p2-${enrollmentId}`,
            installment: '2ª Parcela',
            installmentLabel: '2ª Parcela',
            amountKz: calc.secondKz,
            dueDate: calc.secondDueDate,
            recordedAt: calc.firstDueDate,
            method: 'Express Angola',
            reference: `${refCode}-P2`,
            status: 'Pendente',
            note: `2.ª Parcela (1 semana após o início da formação).${discountSummary}`,
          },
        ],
        progressPercent: 0,
        completedLessons: [],
        completed: false,
        certificateRequested: true,
        certificateRequestedAt: nowIso,
        certificateRequestName: newAccount.fullName,
        certificateRequestEmail: newAccount.email,
        certificateRequestPhone: newAccount.phone,
        certificateRequestBI: newAccount.studentBI || '',
        certificateRequestNotes:
          'Solicitação de certificado registada no cadastro do formando — aguarda aprovação do estado e envio do PDF pelo Administrador.',
        enrolledAt: nowIso,
        createdAt: nowIso,
      };

      const certReqId = `cert-req-${Date.now()}`;
      const autoCertRequest: CertificateRequestItem = {
        id: certReqId,
        enrollmentId,
        userId: newUid,
        studentName: newAccount.fullName,
        studentEmail: newAccount.email,
        studentPhone: newAccount.phone,
        studentBI: newAccount.studentBI || '',
        courseId: targetCourse.id,
        courseName: targetCourse.title,
        modality: targetModality,
        workloadHours: targetCourse.durationHours || 40,
        enrollmentDate: nowIso.slice(0, 10),
        completionDate: nowIso.slice(0, 10),
        requestDate: nowIso,
        studentNotes:
          'Cadastro de formando e certificado submetidos no Painel do Aluno para aprovação do estado no Painel Administrativo Central ALHAN – SGI.',
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
            id: `aud-${Date.now()}`,
            action: 'SOLICITADO',
            statusAfter: 'PENDENTE',
            actorName: newAccount.fullName,
            actorRole: 'ALUNO',
            notes: `Cadastro do formando e registo de certificado para o curso «${targetCourse.title}» submetidos para aprovação administrativa.`,
            timestamp: nowIso,
          },
        ],
        createdAt: nowIso,
      };

      setEnrollments((prev) => [autoEnrollment, ...prev]);
      setCertificateRequests((prev) => [autoCertRequest, ...prev]);

      await saveEnrollmentToFirestore(autoEnrollment).catch(() => null);
      await saveCertificateRequestToFirestore(autoCertRequest).catch(() => null);

      if (typeof window !== 'undefined') {
        fetch('/api/approvals/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userRecord: newAccount, enrollmentRecord: autoEnrollment }),
        }).catch(() => null);
      }

      createAdminRealtimeNotification({
        type: 'SOLICITACAO_CERTIFICADO',
        title: `Novo Cadastro & Certificado Pendente: ${newAccount.fullName}`,
        message: `O formando ${newAccount.fullName} (${newAccount.email}) cadastrou-se no curso «${targetCourse.title}». Inscrição e Certificado aguardam aprovação do estado no Painel Administrativo Central.`,
        studentName: newAccount.fullName,
        courseName: targetCourse.title,
        requestId: certReqId,
      });
    }

    if (allowedRegisterRole === 'CLIENTE_EMPRESARIAL') {
      const newCompanyProject: IsoProjectItem = {
        id: `proj-${Date.now()}`,
        companyId,
        companyName: companyTitle,
        standards: 'ISO 9001:2015 · ISO 14001:2015 · ISO 45001:2018 (SGI)',
        status: 'Diagnóstico',
        executionPercent: 15,
        nextActivity: 'Levantamento de Processos e Diagnóstico Gap Analysis com Consultor ALHAN',
        isDemo: false,
        createdAt: nowIso,
        tasks: [
          { id: `t1-${Date.now()}`, title: 'Reunião de Abertura e Diagnóstico Gap Analysis Inicial', dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], done: true },
          { id: `t2-${Date.now()}`, title: 'Definição do Escopo do SGI e Política Integrada', dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], done: false },
          { id: `t3-${Date.now()}`, title: 'Mapeamento de Processos e Matriz de Riscos Operacionais', dueDate: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0], done: false },
          { id: `t4-${Date.now()}`, title: 'Formação da Equipa e Auditoria Interna ISO 19011', dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0], done: false },
        ],
      };
      setIsoProjects((prev) => [newCompanyProject, ...prev]);
    }

    const newUser: ActiveUser = {
      uid: newUid,
      fullName: newAccount.fullName,
      username: newAccount.username,
      email: newAccount.email,
      phone: newAccount.phone,
      studentBI: newAccount.studentBI,
      role: allowedRegisterRole,
      companyId,
      companyName: newAccount.companyName,
      specialty: newAccount.specialty,
      approvalStatus: initialApprovalStatus,
      firestoreStatus: initialFirestoreStatus,
    };

    setUser(newUser);

    if (allowedRegisterRole === 'PROFESSOR') {
      createAdminRealtimeNotification({
        type: 'NOVO_FORMANDO',
        title: `Solicitação de Professor (Firestore: PENDENTE): ${newUser.fullName}`,
        message: `O professor/formador ${newUser.fullName} (${newUser.email}) registou-se com estado PENDENTE no Firestore e aguarda aprovação do Administrador.`,
        studentName: newUser.fullName,
        courseName: newAccount.specialty || 'Painel do Professor',
        requestId: newUid,
      });
      triggerNotification(
        'Novo registo',
        `Solicitação de Acesso ao Painel do Professor (PENDENTE): ${newUser.fullName}`,
        `O professor/formador ${newUser.fullName} (E-mail: ${newUser.email} · Tel: ${newUser.phone} · Especialidade: ${newAccount.specialty}) ficou com estado PENDENTE no Firestore e aguarda aprovação do Administrador Único.`,
        'ADMIN'
      );
      notifyAdminAndEmailGeral({
        panelOrigin: 'PAINEL_PROFESSOR',
        subject: `Nova Solicitação de Acesso ao Painel do Professor (Estado: PENDENTE) — ${newUser.fullName}`,
        applicantName: newUser.fullName,
        applicantEmail: newUser.email,
        applicantPhone: newUser.phone,
        details: `Utilizador: ${newUser.username} | Especialidade: ${newAccount.specialty} | Estado no Firestore: PENDENTE de aprovação do Administrador Único`,
      });
      logActivity(
        `Solicitação de acesso ao Painel do PROFESSOR (${newUser.fullName}) — Estado no Firestore: PENDENTE`,
        newUser.fullName
      );
    } else if (allowedRegisterRole === 'CLIENTE_EMPRESARIAL') {
      triggerNotification(
        'Novo registo',
        `Nova Inscrição no Painel da Empresa: ${companyTitle}`,
        `A empresa "${companyTitle}" (Responsável: ${newUser.fullName} · E-mail: ${newUser.email} · Tel: ${newUser.phone}) cadastrou-se no Painel do Cliente Empresarial.`,
        'ADMIN'
      );
      notifyAdminAndEmailGeral({
        panelOrigin: 'PAINEL_EMPRESA',
        subject: `Nova Inscrição no Painel da Empresa — ${companyTitle} (${newUser.fullName})`,
        applicantName: `${newUser.fullName} (${companyTitle})`,
        applicantEmail: newUser.email,
        applicantPhone: newUser.phone,
        details: `Empresa: ${companyTitle} | Responsável: ${newUser.fullName} | Utilizador: ${newUser.username} | Projecto SGI/ISO inicializado`,
      });
      logActivity(
        `Nova inscrição no Painel da EMPRESA (${companyTitle} - ${newUser.fullName})`,
        newUser.fullName
      );
    } else {
      createAdminRealtimeNotification({
        type: 'NOVO_FORMANDO',
        title: `Novo Formando (Firestore: PENDENTE): ${newUser.fullName}`,
        message: `O formando ${newUser.fullName} (${newUser.email}) registou-se com estado PENDENTE no Firebase Firestore e aguarda aprovação do Administrador para desbloquear o painel.`,
        studentName: newUser.fullName,
        courseName: 'Inscrição de Formando (Painel do Aluno)',
        requestId: newUid,
      });
      triggerNotification(
        'Novo registo',
        `Novo Formando (Estado Firestore: PENDENTE): ${newUser.fullName}`,
        `O formando ${newUser.fullName} (E-mail: ${newUser.email} · Tel: ${newUser.phone}) registou-se com estado PENDENTE no Firestore e aguarda aprovação do Administrador Único.`,
        'ADMIN'
      );
      notifyAdminAndEmailGeral({
        panelOrigin: 'PAINEL_ALUNO',
        subject: `Nova Inscrição de Formando e Certificado (Firestore: PENDENTE) — ${newUser.fullName}`,
        applicantName: newUser.fullName,
        applicantEmail: newUser.email,
        applicantPhone: newUser.phone,
        details: `Formando: ${newUser.fullName} | Utilizador: ${newUser.username} | E-mail: ${newUser.email} | Telefone: ${newUser.phone} | Estado da Inscrição e do Certificado no Firestore: PENDENTE até aprovação do Administrador`,
      });
      logActivity(
        `Nova inscrição de Formando e Certificado (${newUser.fullName}) registada no Firestore com estado PENDENTE`,
        newUser.fullName
      );
    }
  };

  const logout = async () => {
    if (auth.currentUser) {
      await signOut(auth);
    }
    setUser(null);
    localStorage.removeItem('alhan_active_user');
    logActivity('Sessão terminada');
  };

  const saveCourse = async (course: CourseItem) => {
    const calc = computeCourseInstallments(course);
    const normalizedCourse: CourseItem = {
      ...course,
      firstInstallmentKz: course.firstInstallmentKz ?? calc.firstKz,
      secondInstallmentKz: course.secondInstallmentKz ?? calc.secondKz,
      courseStartDate: course.courseStartDate || calc.courseStartDate,
    };
    setCourses((prev) => {
      const exists = prev.some((c) => c.id === normalizedCourse.id);
      return exists
        ? prev.map((c) => (c.id === normalizedCourse.id ? normalizedCourse : c))
        : [normalizedCourse, ...prev];
    });
    logActivity(
      `Curso guardado/actualizado: ${normalizedCourse.title} (Total: ${normalizedCourse.priceKz.toLocaleString(
        'pt-AO'
      )} Kz · 1ª Parcela: ${(normalizedCourse.firstInstallmentKz || 0).toLocaleString(
        'pt-AO'
      )} Kz · 2ª Parcela: ${(normalizedCourse.secondInstallmentKz || 0).toLocaleString('pt-AO')} Kz)`
    );
    triggerNotification('Nova aula', 'Catálogo de Formações Actualizado', `O curso "${normalizedCourse.title}" foi actualizado no catálogo.`);

    if (auth.currentUser && auth.currentUser.email === 'joaomuatxissombo22@gmail.com') {
      const path = `courses/${normalizedCourse.id}`;
      try {
        await setDoc(doc(db, 'courses', normalizedCourse.id), {
          id: normalizedCourse.id,
          title: normalizedCourse.title.slice(0, 160),
          category: normalizedCourse.category.slice(0, 80),
          modality: normalizedCourse.modality,
          priceKz: Number(normalizedCourse.priceKz),
          durationHours: Number(normalizedCourse.durationHours),
          lessonsCount: Number(normalizedCourse.lessonsCount),
          instructorName: normalizedCourse.instructorName.slice(0, 120),
          instructorId: normalizedCourse.instructorId.slice(0, 128),
          published: Boolean(normalizedCourse.published),
          description: normalizedCourse.description.slice(0, 1500),
          objectives: normalizedCourse.objectives.slice(0, 1500),
          syllabus: normalizedCourse.syllabus.slice(0, 2000),
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const deleteCourse = async (courseId: string) => {
    const target = courses.find((c) => c.id === courseId);
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    logActivity(`Curso eliminado: ${target?.title || courseId}`);

    if (auth.currentUser && auth.currentUser.email === 'joaomuatxissombo22@gmail.com') {
      const path = `courses/${courseId}`;
      try {
        await deleteDoc(doc(db, 'courses', courseId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const addIsoStandard = (standard: IsoStandardItem) => {
    setIsoStandards((prev) => [standard, ...prev]);
    logActivity(`Nova norma ISO adicionada ao catálogo: ${standard.code}`);
  };

  const addTestimonial = async (item: {
    clientName: string;
    role: string;
    companyName: string;
    companySector?: string;
    serviceType?: string;
    rating: number;
    feedback: string;
    projectOutcome?: string;
    testimonialType?: 'FORMANDO' | 'CLIENTE_EMPRESARIAL';
    authorizedForPublication?: boolean;
  }) => {
    const initials = item.clientName
      .replace('Eng.º ', '')
      .replace('Dra. ', '')
      .replace('Dr. ', '')
      .replace('Eng.ª ', '')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const isAdminActor = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    const newTestimonial: TestimonialItem = {
      id: `test-${Date.now()}`,
      clientName: item.clientName.trim(),
      role: item.role.trim() || 'Cliente / Formando',
      companyName: item.companyName.trim() || 'Empresa / Instituição',
      companySector: item.companySector?.trim() || 'Sector Empresarial em Angola',
      companyLogoText: (item.companyName.trim().slice(0, 3) || initials || 'ALH').toUpperCase(),
      serviceType: item.serviceType || 'Consultoria ISO & Formação SGI',
      standardImplemented: item.serviceType || 'Sistema de Gestão Integrado (SGI)',
      rating: Math.min(5, Math.max(1, item.rating || 5)),
      feedback: item.feedback.trim(),
      projectOutcome: item.projectOutcome?.trim() || 'Qualificação profissional e conformidade verificada.',
      verified: isAdminActor,
      testimonialType: item.testimonialType || 'FORMANDO',
      approvalStatus: isAdminActor ? 'aprovado' : 'pendente',
      authorizedForPublication: item.authorizedForPublication !== false,
      approvedBy: isAdminActor ? user?.fullName || 'Direcção Geral ALHAN' : undefined,
      approvedAt: isAdminActor ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };
    setTestimonials((prev) => [newTestimonial, ...prev]);
    triggerNotification(
      'Novo registo',
      isAdminActor ? 'Testemunho Publicado pelo ADM' : 'Novo Testemunho Pendente de Aprovação',
      `${newTestimonial.clientName} (${newTestimonial.companyName}) submeteu um testemunho (${newTestimonial.approvalStatus}).`,
      'ADMIN'
    );
    logActivity(`Testemunho registado (${newTestimonial.approvalStatus}): ${newTestimonial.clientName}`);
    return newTestimonial;
  };

  const updateTestimonialApprovalStatus = (
    id: string,
    approvalStatus: 'pendente' | 'aprovado' | 'rejeitado'
  ) => {
    const nowIso = new Date().toISOString();
    const actorName = user?.fullName || 'Administrador Geral ALHAN – SGI';
    setTestimonials((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              approvalStatus,
              verified: approvalStatus === 'aprovado',
              authorizedForPublication: approvalStatus === 'aprovado',
              approvedBy: approvalStatus === 'aprovado' ? actorName : t.approvedBy,
              approvedAt: approvalStatus === 'aprovado' ? nowIso : t.approvedAt,
            }
          : t
      )
    );
    setImpactAuditLogs((prev) => [
      {
        id: `imp-log-${Date.now()}`,
        action: `TESTEMUNHO_${approvalStatus.toUpperCase()}`,
        actorName,
        details: `Testemunho ${id} alterado para estado "${approvalStatus}" pela Administração.`,
        timestamp: nowIso,
      },
      ...prev,
    ]);
    logActivity(`Estado de aprovação do testemunho ${id} alterado para ${approvalStatus}`, actorName);
  };

  const deleteTestimonial = (id: string) => {
    const actorName = user?.fullName || 'Administrador Geral ALHAN – SGI';
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    logActivity(`Testemunho eliminado: ${id}`, actorName);
  };

  const recordImpactAudit = (action: string, details: string) => {
    const actorName = user?.fullName || 'Administrador Geral ALHAN – SGI';
    const nowIso = new Date().toISOString();
    setImpactAuditLogs((prev) => [
      {
        id: `imp-log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        action,
        actorName,
        details,
        timestamp: nowIso,
      },
      ...prev.slice(0, 199),
    ]);
    logActivity(`[Governance & Impacto] ${action}: ${details}`, actorName);
  };

  const updateDynamicCounters = (updates: Partial<DynamicCountersConfig>) => {
    const nowIso = new Date().toISOString();
    const actorName = user?.fullName || 'Direcção Geral – ALHAN SGI';
    setDynamicCounters((prev) => ({
      ...prev,
      ...updates,
      updatedAt: nowIso,
      updatedBy: actorName,
    }));
    recordImpactAudit(
      'ACTUALIZACAO_CONTADOR_DINAMICO',
      `Contadores dinâmicos actualizados (Formandos: ${
        updates.trainedStudentsValidated === false
          ? 'Dados em actualização'
          : updates.trainedStudentsCount ?? dynamicCounters.trainedStudentsCount
      }, Implementações: ${
        updates.sgiImplementationsValidated === false
          ? 'Dados em actualização'
          : updates.sgiImplementationsCount ?? dynamicCounters.sgiImplementationsCount
      }).`
    );
  };

  const saveEmployabilityIndicator = (item: EmployabilityIndicatorItem) => {
    const nowIso = new Date().toISOString();
    const actorName = user?.fullName || 'Direcção Geral – ALHAN SGI';
    const normalized: EmployabilityIndicatorItem = {
      ...item,
      value: item.validated ? item.value : null,
      updatedAt: nowIso,
      updatedBy: actorName,
    };
    setEmployabilityIndicators((prev) => {
      const exists = prev.some((i) => i.id === normalized.id || i.key === normalized.key);
      return exists
        ? prev.map((i) => (i.id === normalized.id || i.key === normalized.key ? normalized : i))
        : [...prev, normalized];
    });
    recordImpactAudit(
      'ACTUALIZACAO_INDICADOR_EMPREGABILIDADE',
      `Indicador "${normalized.label}" actualizado (${
        normalized.validated && normalized.value !== null
          ? `${normalized.value} ${normalized.unit} · Fonte: ${normalized.sourceMethod}`
          : 'Dados em actualização'
      }).`
    );
  };

  const saveAlumniTrackingRecord = (item: AlumniTrackingRecord) => {
    const nowIso = new Date().toISOString();
    const normalized: AlumniTrackingRecord = {
      ...item,
      updatedAt: nowIso,
    };
    setAlumniTrackingRecords((prev) => {
      const exists = prev.some((r) => r.id === normalized.id);
      return exists ? prev.map((r) => (r.id === normalized.id ? normalized : r)) : [normalized, ...prev];
    });
    recordImpactAudit(
      'REGISTO_ACOMPANHAMENTO_FORMANDO',
      `Registo de empregabilidade pós-formação guardado: ${normalized.studentName} (${normalized.outcomeCategory} · Consentimento Protecção de Dados: ${
        normalized.dataProtectionConsent ? 'Sim' : 'Não'
      }).`
    );
  };

  const deleteAlumniTrackingRecord = (id: string) => {
    const target = alumniTrackingRecords.find((r) => r.id === id);
    setAlumniTrackingRecords((prev) => prev.filter((r) => r.id !== id));
    recordImpactAudit(
      'ELIMINACAO_REGISTO_ACOMPANHAMENTO',
      `Registo de acompanhamento eliminado: ${target?.studentName || id}`
    );
  };

  const saveImpactEvidence = (item: ImpactEvidenceDocument) => {
    const nowIso = new Date().toISOString();
    const actorName = user?.fullName || 'Direcção Geral – ALHAN SGI';
    const normalized: ImpactEvidenceDocument = {
      ...item,
      uploadedAt: item.uploadedAt || nowIso,
      uploadedBy: actorName,
    };
    setImpactEvidences((prev) => {
      const exists = prev.some((e) => e.id === normalized.id);
      return exists ? prev.map((e) => (e.id === normalized.id ? normalized : e)) : [normalized, ...prev];
    });
    recordImpactAudit(
      'DOCUMENTO_EVIDENCIA_IMPACTO',
      `Evidência documental "${normalized.code} – ${normalized.title}" guardada/actualizada.`
    );
  };

  const deleteImpactEvidence = (id: string) => {
    const target = impactEvidences.find((e) => e.id === id);
    setImpactEvidences((prev) => prev.filter((e) => e.id !== id));
    recordImpactAudit(
      'ELIMINACAO_EVIDENCIA_IMPACTO',
      `Evidência documental eliminada: ${target?.code || id}`
    );
  };

  const saveTrainingPortfolioHistoryItem = (item: TrainingPortfolioHistoryItem) => {
    setTrainingPortfolioHistory((prev) => {
      const exists = prev.some((h) => h.id === item.id);
      return exists ? prev.map((h) => (h.id === item.id ? item : h)) : [item, ...prev];
    });
    recordImpactAudit(
      'PORTEFOLIO_HISTORICO_FORMACAO',
      `Registo do portefólio formativo actualizado: ${item.courseTitle} (${item.period})`
    );
  };

  const deleteTrainingPortfolioHistoryItem = (id: string) => {
    setTrainingPortfolioHistory((prev) => prev.filter((h) => h.id !== id));
    recordImpactAudit('ELIMINACAO_PORTEFOLIO_FORMACAO', `Item de portefólio eliminado: ${id}`);
  };

  const saveInstitutionalPartnership = (item: InstitutionalPartnershipItem) => {
    setInstitutionalPartnerships((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      return exists ? prev.map((p) => (p.id === item.id ? item : p)) : [item, ...prev];
    });
    recordImpactAudit(
      'PARCERIA_INSTITUCIONAL',
      `Parceria institucional actualizada: ${item.organizationName} (${item.partnershipType})`
    );
  };

  const deleteInstitutionalPartnership = (id: string) => {
    setInstitutionalPartnerships((prev) => prev.filter((p) => p.id !== id));
    recordImpactAudit('ELIMINACAO_PARCERIA_INSTITUCIONAL', `Parceria eliminada: ${id}`);
  };

  const saveImpactReport = (report: PublicImpactReportItem) => {
    const nowIso = new Date().toISOString();
    const actorName = user?.fullName || 'Direcção Geral – ALHAN CONSULTORIA E PRESTAÇÃO DE SERVIÇOS, LDA';
    const normalized: PublicImpactReportItem = {
      ...report,
      approvedBy: report.status === 'APROVADO_PUBLICADO' ? actorName : report.approvedBy || actorName,
      publishedAt:
        report.status === 'APROVADO_PUBLICADO'
          ? report.publishedAt || nowIso
          : report.publishedAt || nowIso,
      updatedAt: nowIso,
    };
    setImpactReports((prev) => {
      const exists = prev.some((r) => r.id === normalized.id);
      return exists ? prev.map((r) => (r.id === normalized.id ? normalized : r)) : [normalized, ...prev];
    });
    recordImpactAudit(
      normalized.status === 'APROVADO_PUBLICADO' ? 'PUBLICACAO_RELATORIO_IMPACTO' : 'EDICAO_RELATORIO_IMPACTO',
      `Relatório "${normalized.title}" (${normalized.editionYear}) guardado com estado ${normalized.status}.`
    );
  };

  const deleteImpactReport = (id: string) => {
    const target = impactReports.find((r) => r.id === id);
    setImpactReports((prev) => prev.filter((r) => r.id !== id));
    recordImpactAudit(
      'ELIMINACAO_RELATORIO_IMPACTO',
      `Relatório de impacto eliminado: ${target?.title || id}`
    );
  };

  const createEnrollment = async (payload: {
    course: CourseItem;
    modality: 'Online' | 'Presencial' | 'Híbrida';
    paymentMethod: EnrollmentItem['paymentMethod'];
    paymentReference: string;
    receiptNote: string;
    receiptFileUrl?: string;
    receiptFileName?: string;
    studentName?: string;
    studentPhone?: string;
    studentEmail?: string;
    studentBI?: string;
    installmentOption?: '1ª Parcela' | '2ª Parcela' | 'Pagamento Integral';
    installmentTarget?: '1ª Parcela' | '2ª Parcela' | 'Pagamento Integral';
    couponCode?: string;
    applyBlackFriday?: boolean;
  }) => {
    const nowIso = new Date().toISOString();
    const studentId = user?.uid || `inscrito-${Date.now()}`;
    const studentName = payload.studentName?.trim() || user?.fullName || 'Formando Inscrito';
    const studentEmail = (payload.studentEmail || user?.email || 'aluno@alhan.pro').trim().toLowerCase();
    const studentPhone = (payload.studentPhone || user?.phone || '+244 922 021 211').trim();
    const studentBI = (payload.studentBI || user?.studentBI || '').trim().toUpperCase();
    const enrollmentId = `enr-${Date.now()}`;
    const useBlackFriday = payload.applyBlackFriday !== false;
    const calc = computeCourseInstallments(payload.course, nowIso, {
      couponCode: payload.couponCode,
      applyBlackFriday: useBlackFriday,
    });
    const chosenInstallment = payload.installmentOption || payload.installmentTarget || '1ª Parcela';
    const refCode = payload.paymentReference || `REF-${Date.now().toString().slice(-6)}`;

    // Ensure every student enrollment also registers/updates a student account in registeredUsers with state PENDENTE
    const autoUsername = studentEmail.split('@')[0] || `aluno.${Date.now().toString().slice(-4)}`;
    setRegisteredUsers((prev) => {
      const exists = prev.some(
        (u) => u.uid === studentId || (studentEmail && u.email.toLowerCase() === studentEmail)
      );
      if (exists) return prev;
      const autoStudentAccount: RegisteredUserAccount = {
        uid: studentId,
        fullName: studentName,
        username: autoUsername,
        email: studentEmail,
        phone: studentPhone,
        studentBI: studentBI || undefined,
        password: 'Alhan@Aluno2026',
        role: 'ALUNO',
        companyId: 'alhan-aluno',
        approvalStatus: 'pendente',
        firestoreStatus: 'PENDENTE',
        createdAt: nowIso,
      };
      return [autoStudentAccount, ...prev];
    });

    await saveUserRegistrationToFirestore({
      uid: studentId,
      fullName: studentName,
      username: autoUsername,
      role: 'ALUNO',
      companyId: 'alhan-aluno',
      email: studentEmail,
      phone: studentPhone,
      status: 'PENDENTE',
    }).catch(() => null);

    const discountSummary =
      calc.discountPercent > 0
        ? ` [Desconto Aplicado: ${calc.appliedCoupon ? `Cupom ${calc.appliedCoupon} (-25%)` : 'Black Friday Novembro (-15%)'}]`
        : '';

    const initialHistory: PaymentHistoryEntry[] = [
      {
        id: `hist-p1-${enrollmentId}`,
        installment: '1ª Parcela',
        installmentLabel: '1ª Parcela',
        amountKz: calc.firstKz,
        dueDate: calc.firstDueDate,
        recordedAt: calc.firstDueDate,
        method: payload.paymentMethod,
        reference: `${refCode}-P1`,
        status: 'Pendente',
        note: `Primeira parcela obrigatória no acto da inscrição para confirmar a vaga do formando.${discountSummary}`,
      },
      {
        id: `hist-p2-${enrollmentId}`,
        installment: '2ª Parcela',
        installmentLabel: '2ª Parcela',
        amountKz: calc.secondKz,
        dueDate: calc.secondDueDate,
        recordedAt: calc.firstDueDate,
        method: payload.paymentMethod,
        reference: `${refCode}-P2`,
        status: 'Pendente',
        note: `Segunda parcela (${calc.secondKz.toLocaleString('pt-AO')} Kz) com vencimento 1 semana após o início da formação (${calc.secondDueDate}).${discountSummary}`,
      },
    ];

    const newEnrollment: EnrollmentItem = {
      id: enrollmentId,
      studentId,
      studentName,
      studentPhone,
      studentEmail,
      studentBI: studentBI || undefined,
      courseId: payload.course.id,
      courseTitle: payload.course.title,
      modality: payload.modality,
      originalAmountKz: calc.originalPriceKz,
      amountKz: calc.totalKz,
      discountPercent: calc.discountPercent,
      appliedCoupon: calc.appliedCoupon,
      blackFridayApplied: calc.blackFridayApplied,
      paymentMethod: payload.paymentMethod,
      paymentReference: refCode,
      receiptNote:
        payload.receiptNote ||
        `Inscrição submetida (${chosenInstallment})${discountSummary}. Aguarda aprovação no Firestore (PENDENTE -> APROVADO) e confirmação da 1.ª parcela (${calc.firstKz.toLocaleString('pt-AO')} Kz).`,
      receiptFileUrl: payload.receiptFileUrl,
      receiptFileName: payload.receiptFileName,
      paymentStatus: 'PENDENTE',
      enrollmentApprovalStatus: 'pendente',
      firestoreStatus: 'PENDENTE',
      courseStartDate: calc.courseStartDate,
      firstInstallmentAmountKz: calc.firstKz,
      firstInstallmentDueDate: calc.firstDueDate,
      firstInstallmentStatus: 'Pendente',
      firstInstallmentReference: `${refCode}-P1`,
      secondInstallmentAmountKz: calc.secondKz,
      secondInstallmentDueDate: calc.secondDueDate,
      secondInstallmentStatus: 'Pendente',
      secondInstallmentReference: `${refCode}-P2`,
      paymentHistory: initialHistory,
      progressPercent: 0,
      completedLessons: [],
      completed: false,
      certificateRequested: true,
      certificateRequestedAt: nowIso,
      certificateRequestName: studentName,
      certificateRequestEmail: studentEmail,
      certificateRequestPhone: studentPhone,
      certificateRequestBI: studentBI || '',
      certificateRequestNotes:
        'Inscrição e solicitação de certificado registadas para aprovação no Painel Administrativo Central ALHAN – SGI.',
      enrolledAt: nowIso,
      createdAt: nowIso,
    };

    const certReqId = `cert-req-${enrollmentId}`;
    const newCertRequest: CertificateRequestItem = {
      id: certReqId,
      enrollmentId,
      userId: studentId,
      studentName,
      studentEmail,
      studentPhone,
      studentBI: studentBI || '',
      courseId: payload.course.id,
      courseName: payload.course.title,
      modality: payload.modality,
      workloadHours: payload.course.durationHours || 40,
      enrollmentDate: nowIso.slice(0, 10),
      completionDate: nowIso.slice(0, 10),
      requestDate: nowIso,
      studentNotes:
        'Inscrição e certificado registados para aprovação do estado e envio de PDF no Painel Administrativo Central.',
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
          id: `aud-${Date.now()}`,
          action: 'SOLICITADO',
          statusAfter: 'PENDENTE',
          actorName: studentName,
          actorRole: 'ALUNO',
          notes: `Inscrição e pedido de certificado registados para o curso «${payload.course.title}».`,
          timestamp: nowIso,
        },
      ],
      createdAt: nowIso,
    };

    setEnrollments((prev) => [newEnrollment, ...prev]);
    setCertificateRequests((prev) => [newCertRequest, ...prev]);

    await saveEnrollmentToFirestore(newEnrollment).catch(() => null);
    await saveCertificateRequestToFirestore(newCertRequest).catch(() => null);

    if (typeof window !== 'undefined') {
      fetch('/api/approvals/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRecord: {
            uid: studentId,
            fullName: studentName,
            username: autoUsername,
            email: studentEmail,
            phone: studentPhone,
            studentBI: studentBI || undefined,
            role: 'ALUNO',
            companyId: 'alhan-aluno',
            desiredCourseId: payload.course.id,
            desiredCourseTitle: payload.course.title,
            approvalStatus: 'pendente',
            firestoreStatus: 'PENDENTE',
            createdAt: nowIso,
          },
          enrollmentRecord: newEnrollment,
        }),
      }).catch(() => null);
    }

    createAdminRealtimeNotification({
      type: 'NOVA_INSCRICAO',
      title: `Nova Inscrição (Firestore: PENDENTE): ${studentName}`,
      message: `${studentName} inscreveu-se em «${payload.course.title}»${discountSummary} (Total: ${calc.totalKz.toLocaleString('pt-AO')} Kz · 1.ª Parcela: ${calc.firstKz.toLocaleString('pt-AO')} Kz · 2.ª Parcela: ${calc.secondKz.toLocaleString('pt-AO')} Kz). Estado no Firestore: PENDENTE.`,
      studentName,
      courseName: payload.course.title,
      requestId: enrollmentId,
    });

    triggerNotification(
      'Nova inscrição',
      `Nova Inscrição (Firestore: PENDENTE): ${payload.course.title}`,
      `Inscrição de ${studentName} no curso "${payload.course.title}"${discountSummary} (Total: ${calc.totalKz.toLocaleString('pt-AO')} Kz | 1.ª Parcela: ${calc.firstKz.toLocaleString('pt-AO')} Kz | 2.ª Parcela: ${calc.secondKz.toLocaleString('pt-AO')} Kz com vencimento em ${calc.secondDueDate}).`,
      'ADMIN'
    );
    notifyAdminAndEmailGeral({
      panelOrigin: 'INSCRICAO_CURSO',
      subject: `Nova Inscrição em Curso (Firestore: PENDENTE) — ${studentName} (${payload.course.title})`,
      applicantName: studentName,
      applicantEmail: newEnrollment.studentEmail || 'geral@alhan.pro',
      applicantPhone: newEnrollment.studentPhone || '+244 922 021 211',
      details: `Curso: ${payload.course.title}${discountSummary} | Valor Total com Desconto: ${calc.totalKz.toLocaleString('pt-AO')} Kz | 1.ª Parcela: ${calc.firstKz.toLocaleString('pt-AO')} Kz | 2.ª Parcela (vencimento ${calc.secondDueDate}): ${calc.secondKz.toLocaleString('pt-AO')} Kz | Estado no Firestore: PENDENTE`,
    });
    logActivity(
      `Nova inscrição no curso ${payload.course.title} (${studentName})${discountSummary} — Estado no Firestore: PENDENTE`
    );

    return newEnrollment;
  };

  const submitStudentPaymentProof = async (payload: {
    enrollmentId?: string;
    course: CourseItem;
    modality: 'Online' | 'Presencial' | 'Híbrida';
    paymentMethod: EnrollmentItem['paymentMethod'];
    paymentReference: string;
    receiptNote: string;
    receiptFileUrl?: string;
    receiptFileName?: string;
    studentPhone?: string;
    studentEmail?: string;
    installmentOption?: '1ª Parcela' | '2ª Parcela' | 'Pagamento Integral';
    installmentTarget?: '1ª Parcela' | '2ª Parcela' | 'Pagamento Integral';
  }) => {
    const studentId = auth.currentUser?.uid || user?.uid || `inscrito-${Date.now()}`;
    const studentName = user?.fullName || 'Aluno Registado';
    const chosenInstallment = payload.installmentOption || payload.installmentTarget || '1ª Parcela';
    const calc = computeCourseInstallments(payload.course);

    const existing = enrollments.find(
      (e) =>
        (payload.enrollmentId && e.id === payload.enrollmentId) ||
        (e.courseId === payload.course.id &&
          (e.studentId === studentId ||
            (user?.email && e.studentEmail?.toLowerCase() === user.email.toLowerCase())))
    );

    if (existing) {
      const refCode =
        payload.paymentReference ||
        existing.paymentReference ||
        `REF-${Date.now().toString().slice(-6)}`;
      const amountSubmitted =
        chosenInstallment === 'Pagamento Integral'
          ? existing.amountKz
          : chosenInstallment === '2ª Parcela'
          ? existing.secondInstallmentAmountKz ?? calc.secondKz
          : existing.firstInstallmentAmountKz ?? calc.firstKz;

      const proofEntry: PaymentHistoryEntry = {
        id: `hist-proof-${Date.now()}`,
        installment: chosenInstallment,
        amountKz: amountSubmitted,
        dueDate:
          chosenInstallment === '2ª Parcela'
            ? existing.secondInstallmentDueDate || calc.secondDueDate
            : existing.firstInstallmentDueDate || calc.firstDueDate,
        method: payload.paymentMethod,
        reference: refCode,
        status: 'Pendente',
        note:
          payload.receiptNote ||
          `Comprovativo referente à ${chosenInstallment} (${amountSubmitted.toLocaleString(
            'pt-AO'
          )} Kz) submetido pelo formando para confirmação administrativa.`,
      };

      const updated: EnrollmentItem = {
        ...existing,
        studentId,
        studentName,
        studentPhone: payload.studentPhone || existing.studentPhone || user?.phone || '+244 922 021 211',
        studentEmail: payload.studentEmail || existing.studentEmail || user?.email || 'aluno@alhan.pro',
        paymentMethod: payload.paymentMethod,
        paymentReference: refCode,
        receiptNote:
          payload.receiptNote ||
          `Comprovativo da ${chosenInstallment} (${amountSubmitted.toLocaleString('pt-AO')} Kz via ${payload.paymentMethod}) submetido no Painel do Formando.`,
        receiptFileUrl: payload.receiptFileUrl || existing.receiptFileUrl,
        receiptFileName: payload.receiptFileName || existing.receiptFileName,
        firstInstallmentReference:
          chosenInstallment === '1ª Parcela' || chosenInstallment === 'Pagamento Integral'
            ? refCode
            : existing.firstInstallmentReference,
        secondInstallmentReference:
          chosenInstallment === '2ª Parcela' || chosenInstallment === 'Pagamento Integral'
            ? refCode
            : existing.secondInstallmentReference,
        paymentHistory: [proofEntry, ...(existing.paymentHistory || [])],
      };
      setEnrollments((prev) => prev.map((e) => (e.id === existing.id ? updated : e)));

      if (auth.currentUser && auth.currentUser.emailVerified) {
        await updateEnrollmentPaymentInFirestore(existing.id, {
          paymentMethod: updated.paymentMethod,
          paymentReference: updated.paymentReference,
          receiptNote: updated.receiptNote,
        });
      }

      createAdminRealtimeNotification({
        type: 'PAGAMENTO_REGISTADO',
        title: `Comprovativo de ${chosenInstallment}: ${studentName}`,
        message: `O formando ${studentName} submeteu o comprovativo da ${chosenInstallment} (${amountSubmitted.toLocaleString('pt-AO')} Kz via ${payload.paymentMethod}) para o curso «${payload.course.title}».`,
        studentName,
        courseName: payload.course.title,
        requestId: existing.id,
      });

      triggerNotification(
        'Nova inscrição',
        `Comprovativo da ${chosenInstallment} Submetido: ${payload.course.title}`,
        `O formando ${studentName} submeteu o comprovativo da ${chosenInstallment} (${amountSubmitted.toLocaleString('pt-AO')} Kz · Ref: ${updated.paymentReference}).`,
        'ADMIN'
      );
      logActivity(
        `Comprovativo de pagamento (${chosenInstallment} - ${amountSubmitted.toLocaleString('pt-AO')} Kz) submetido pelo formando ${studentName} (${payload.course.title})`,
        studentName
      );
      return updated;
    }

    return createEnrollment({
      course: payload.course,
      modality: payload.modality,
      paymentMethod: payload.paymentMethod,
      paymentReference: payload.paymentReference,
      receiptNote: payload.receiptNote,
      receiptFileUrl: payload.receiptFileUrl,
      receiptFileName: payload.receiptFileName,
      studentName,
      studentPhone: payload.studentPhone,
      studentEmail: payload.studentEmail,
      installmentOption: chosenInstallment,
    });
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: EnrollmentItem['paymentStatus']) => {
    const nowDate = new Date().toISOString().slice(0, 10);
    setEnrollments((prev) =>
      prev.map((item) =>
        item.id === enrollmentId
          ? {
              ...item,
              paymentStatus: status,
              enrollmentApprovalStatus:
                status === 'Pago' ? 'aprovado' : item.enrollmentApprovalStatus || 'pendente',
              firstInstallmentStatus:
                status === 'Pago' ? 'Pago' : item.firstInstallmentStatus || 'Pendente',
              firstInstallmentPaidAt:
                status === 'Pago' ? item.firstInstallmentPaidAt || nowDate : item.firstInstallmentPaidAt,
            }
          : item
      )
    );

    if (auth.currentUser && auth.currentUser.emailVerified) {
      await updateEnrollmentStatusInFirestore(enrollmentId, status);
    }

    const target = enrollments.find((e) => e.id === enrollmentId);
    if (status === 'Pago' && target) {
      triggerNotification(
        'Pagamento aprovado',
        'Vaga Confirmada e Acesso ao Curso Libertado',
        `O pagamento da formação "${target.courseTitle}" para ${target.studentName} foi confirmado pela Administração. Lembrete: a 2.ª Parcela vence em ${target.secondInstallmentDueDate || '1 semana após o início da formação'}.`,
        'ALUNO'
      );
    }
    logActivity(`Estado de pagamento da inscrição ${enrollmentId} alterado para ${status}`);
  };

  const completeLesson = async (enrollmentId: string, lessonId: string, totalLessons: number, quizScore?: number) => {
    let computedPct = 0;
    let computedCompleted = false;

    setEnrollments((prev) =>
      prev.map((item) => {
        if (item.id !== enrollmentId) return item;
        const updatedLessons = item.completedLessons.includes(lessonId)
          ? item.completedLessons
          : [...item.completedLessons, lessonId];
        const pct = Math.min(100, Math.round((updatedLessons.length / Math.max(1, totalLessons)) * 100));
        const isCompleted = pct >= 100;
        computedPct = pct;
        computedCompleted = isCompleted;
        return {
          ...item,
          completedLessons: updatedLessons,
          progressPercent: pct,
          quizScore: quizScore !== undefined ? quizScore : item.quizScore,
          completed: isCompleted,
        };
      })
    );

    if (auth.currentUser && auth.currentUser.emailVerified) {
      await updateEnrollmentProgressInFirestore(enrollmentId, computedPct, computedCompleted);
    }

    logActivity(`Progresso de aula registado (${lessonId})`);
  };

  const issueCertificate = async (
    enrollment: EnrollmentItem,
    pdfOptions?: {
      certificateFileUrl?: string;
      certificateFileName?: string;
      studentBI?: string;
      grade?: string;
    }
  ) => {
    const existingCert = certificates.find(
      (c) =>
        (c.studentId === enrollment.studentId && c.courseId === enrollment.courseId) ||
        (enrollment.certificateId && c.id === enrollment.certificateId)
    );

    const uploadedPdfUrl = pdfOptions?.certificateFileUrl || existingCert?.certificateFileUrl || '';
    if (!uploadedPdfUrl.trim()) {
      throw new Error(
        'Os certificados não podem ser gerados automaticamente online. O Administrador deve anexar o ficheiro PDF do certificado (máx. 2 MB) antes de enviá-lo para o painel do aluno.'
      );
    }

    const course = courses.find((c) => c.id === enrollment.courseId);
    const resolvedBI =
      pdfOptions?.studentBI?.trim().toUpperCase() ||
      enrollment.certificateRequestBI ||
      enrollment.studentBI ||
      existingCert?.studentBI ||
      '';
    const resolvedName =
      enrollment.certificateRequestName || enrollment.studentName;
    const resolvedGrade = pdfOptions?.grade?.trim() || existingCert?.grade || 'Aprovado com Distinção';
    const issuedDate = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();
    const adminActor = user?.fullName || 'Administrador Geral ALHAN – SGI';

    if (existingCert) {
      const updatedCert: CertificateItem = {
        ...existingCert,
        studentName: resolvedName,
        certificateFileUrl: uploadedPdfUrl,
        certificateFileName:
          pdfOptions?.certificateFileName ||
          existingCert.certificateFileName ||
          `Certificado_ALHAN_${existingCert.code}_${resolvedName.replace(/\s+/g, '_')}.pdf`,
        studentBI: resolvedBI,
        grade: resolvedGrade,
        status: 'valido',
      };
      setCertificates((prev) => prev.map((c) => (c.id === existingCert.id ? updatedCert : c)));
      setEnrollments((prev) =>
        prev.map((e) =>
          e.id === enrollment.id
            ? {
                ...e,
                completed: true,
                progressPercent: 100,
                certificateId: updatedCert.id,
                certificateSentAt: nowIso,
              }
            : e
        )
      );
      setCertificateRequests((prev) =>
        prev.map((r) =>
          r.enrollmentId === enrollment.id ||
          (r.userId === enrollment.studentId && r.courseId === enrollment.courseId)
            ? {
                ...r,
                status: 'DISPONÍVEL',
                certificateFileUrl: uploadedPdfUrl,
                certificateFileName:
                  updatedCert.certificateFileName ||
                  `Certificado_ALHAN_${updatedCert.code}.pdf`,
                certificateCode: updatedCert.code,
                issuedAt: nowIso,
                issuedBy: adminActor,
              }
            : r
        )
      );
      triggerNotification(
        'Certificado disponível',
        `Certificado em PDF Enviado pelo ADM: ${updatedCert.code}`,
        `O Administrador enviou o seu Certificado em PDF da formação "${enrollment.courseTitle}" (${resolvedName}). Já pode baixá-lo no seu Painel do Aluno!`,
        'ALUNO'
      );
      logActivity(
        `Certificado em PDF anexado pelo Administrador e enviado para o Painel do Aluno (${updatedCert.code}) — ${resolvedName}`
      );
      return updatedCert;
    }

    const code = `ALHAN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const workloadHours = course?.durationHours || 40;
    const finalFileName =
      pdfOptions?.certificateFileName ||
      `Certificado_ALHAN_${code}_${resolvedName.replace(/\s+/g, '_')}.pdf`;

    const newCert: CertificateItem = {
      id: `cert-${Date.now()}`,
      code,
      studentId: enrollment.studentId,
      studentName: resolvedName,
      studentBI: resolvedBI,
      studentPhone: enrollment.certificateRequestPhone || enrollment.studentPhone,
      studentEmail: enrollment.certificateRequestEmail || enrollment.studentEmail,
      courseId: enrollment.courseId,
      courseTitle: enrollment.courseTitle,
      modality: enrollment.modality || 'Online',
      workloadHours,
      grade: resolvedGrade,
      issuedDate,
      responsibleName: 'Direcção Pedagógica – ALHAN SGI',
      responsibleRole: 'Coordenação de Formação Profissional',
      status: 'valido',
      certificateFileUrl: uploadedPdfUrl,
      certificateFileName: finalFileName,
      isDemo: false,
      createdAt: nowIso,
    };

    setCertificates((prev) => [newCert, ...prev]);
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === enrollment.id
          ? {
              ...e,
              completed: true,
              progressPercent: 100,
              certificateId: newCert.id,
              certificateSentAt: nowIso,
            }
          : e
      )
    );
    setCertificateRequests((prev) => {
      const hasExistingReq = prev.some(
        (r) =>
          r.enrollmentId === enrollment.id ||
          (r.userId === enrollment.studentId && r.courseId === enrollment.courseId)
      );
      if (hasExistingReq) {
        return prev.map((r) =>
          r.enrollmentId === enrollment.id ||
          (r.userId === enrollment.studentId && r.courseId === enrollment.courseId)
            ? {
                ...r,
                status: 'DISPONÍVEL',
                certificateFileUrl: uploadedPdfUrl,
                certificateFileName: finalFileName,
                certificateCode: code,
                issuedAt: nowIso,
                issuedBy: adminActor,
              }
            : r
        );
      }
      const newReqRecord: CertificateRequestItem = {
        id: `cert-req-${Date.now()}`,
        enrollmentId: enrollment.id,
        userId: enrollment.studentId,
        studentName: resolvedName,
        studentEmail: enrollment.studentEmail || '',
        studentPhone: enrollment.studentPhone || '',
        studentBI: resolvedBI,
        courseId: enrollment.courseId,
        courseName: enrollment.courseTitle,
        modality: enrollment.modality,
        workloadHours,
        enrollmentDate: (enrollment.createdAt || nowIso).slice(0, 10),
        completionDate: issuedDate,
        requestDate: nowIso,
        studentNotes: enrollment.certificateRequestNotes || '',
        status: 'DISPONÍVEL',
        certificateStoragePath: `certificates/${enrollment.studentId}/${enrollment.courseId}/certificate.pdf`,
        certificateFileUrl: uploadedPdfUrl,
        certificateFileName: finalFileName,
        certificateCode: code,
        issuedAt: nowIso,
        issuedBy: adminActor,
        adminNotes: 'Certificado PDF anexado e enviado pelo Administrador.',
        auditHistory: [
          {
            id: `aud-${Date.now()}`,
            action: 'EMITIDO_E_DISPONIBILIZADO',
            statusAfter: 'DISPONÍVEL',
            actorName: adminActor,
            actorRole: 'ADMIN',
            notes: 'Certificado PDF anexado pelo Administrador e enviado ao Painel do Aluno.',
            timestamp: nowIso,
          },
        ],
        createdAt: nowIso,
      };
      return [newReqRecord, ...prev];
    });
    triggerNotification(
      'Certificado disponível',
      `Certificado em PDF Enviado pelo ADM: ${code}`,
      `O Administrador enviou o seu Certificado de Conclusão da formação "${enrollment.courseTitle}" em PDF para o seu Painel do Aluno. Já pode baixá-lo!`,
      'ALUNO'
    );
    logActivity(`Certificado em PDF anexado pelo Administrador e enviado para o Painel do Aluno (${code}) — ${resolvedName}`);
    return newCert;
  };

  const addPresencialCertificate = async (item: {
    studentName: string;
    studentBI?: string;
    studentPhone?: string;
    studentEmail?: string;
    courseTitle: string;
    workloadHours: number;
    issuedDate: string;
    grade?: string;
    certificateFileUrl?: string;
    certificateFileName?: string;
    responsibleName?: string;
    responsibleRole?: string;
    customCode?: string;
  }) => {
    const code =
      item.customCode?.trim() ||
      `ALH-PRES-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCert: CertificateItem = {
      id: `cert-pres-${Date.now()}`,
      code,
      studentId: `pres-${Date.now()}`,
      studentName: item.studentName.trim(),
      studentBI: item.studentBI?.trim().toUpperCase() || '',
      studentPhone: item.studentPhone?.trim() || '',
      studentEmail: item.studentEmail?.trim() || '',
      courseId: 'curso-presencial-alhan',
      courseTitle: item.courseTitle.trim(),
      modality: 'Presencial',
      workloadHours: item.workloadHours || 40,
      grade: item.grade?.trim() || 'Aprovado',
      issuedDate: item.issuedDate || new Date().toISOString().split('T')[0],
      responsibleName: item.responsibleName?.trim() || 'Direcção Pedagógica – ALHAN SGI',
      responsibleRole: item.responsibleRole?.trim() || 'Coordenação de Formação Profissional',
      status: 'valido',
      certificateFileUrl: item.certificateFileUrl || '',
      certificateFileName: item.certificateFileName || `Certificado_${item.studentName.replace(/\s+/g, '_')}.pdf`,
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    setCertificates((prev) => [newCert, ...prev]);
    triggerNotification(
      'Certificado disponível',
      `Certificado Presencial Emitido: ${code}`,
      `Certificado de formação presencial emitido para ${item.studentName} (BI: ${item.studentBI || 'N/A'}). Disponível para download pelo aluno.`,
      'ADMIN'
    );
    logActivity(`Certificado presencial emitido (${code}) para ${item.studentName}`);
    return newCert;
  };

  const updateCertificateStatus = async (certId: string, status: CertificateItem['status']) => {
    setCertificates((prev) => prev.map((c) => (c.id === certId ? { ...c, status } : c)));
    logActivity(`Estado do certificado ${certId} alterado para ${status}`);
  };

  const deleteCertificate = async (certId: string) => {
    const target = certificates.find((c) => c.id === certId);
    setCertificates((prev) => prev.filter((c) => c.id !== certId));
    setEnrollments((prev) =>
      prev.map((e) =>
        e.certificateId === certId ||
        (target && e.courseId === target.courseId && e.studentId === target.studentId)
          ? {
              ...e,
              certificateId: undefined,
              certificateSentAt: undefined,
            }
          : e
      )
    );
    if (target) {
      logActivity(
        `Certificado eliminado pelo Administrador na Secção 13: ${target.code} (${target.studentName} - ${target.courseTitle})`
      );
    }
    if (auth.currentUser && auth.currentUser.email === 'joaomuatxissombo22@gmail.com') {
      const path = `certificates/${certId}`;
      try {
        await deleteDoc(doc(db, 'certificates', certId));
      } catch (err) {
        console.warn('Firestore delete certificate info:', path, err);
      }
    }
  };

  const clearAllCertificates = async () => {
    setCertificates([]);
    setEnrollments((prev) =>
      prev.map((e) => ({
        ...e,
        certificateId: undefined,
        certificateSentAt: undefined,
        certificateRequested: false,
      }))
    );
    logActivity(
      'Todos os certificados emitidos na Secção 13 (Controlo de Certificados Emitidos, Anexo Presencial e Validação QR) foram eliminados pelo Administrador'
    );
  };

  const cancelCertificateRequest = async (enrollmentId: string) => {
    const target = enrollments.find((e) => e.id === enrollmentId);
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === enrollmentId
          ? {
              ...e,
              certificateRequested: false,
              certificateRequestedAt: undefined,
            }
          : e
      )
    );
    if (target) {
      logActivity(
        `Solicitação de certificado eliminada/arquivada pelo Administrador: ${target.studentName} (${target.courseTitle})`
      );
    }
  };

  const submitDiagnosticOrContact = async (
    item: Omit<DiagnosticRequestItem, 'id' | 'userId' | 'status' | 'createdAt'>
  ) => {
    const id = `req-${Date.now()}`;
    const userId = auth.currentUser?.uid || user?.uid || 'visitante-web';
    const fullItem: DiagnosticRequestItem = {
      ...item,
      id,
      userId,
      status: 'Novo',
      createdAt: new Date().toISOString(),
    };
    setDiagnosticRequests((prev) => [fullItem, ...prev]);

    const label =
      item.type === 'diagnostico'
        ? 'Pedido de Diagnóstico ISO'
        : item.type === 'inscricao_presencial'
        ? 'Inscrição em Formação Presencial'
        : 'Contacto Institucional';

    triggerNotification('Nova mensagem', `Novo ${label}`, `${item.contactName} (${item.companyName || 'Individual'}) enviou um pedido.`, 'ADMIN');
    notifyAdminAndEmailGeral({
      panelOrigin: item.type === 'diagnostico' ? 'PAINEL_EMPRESA' : 'INSCRICAO_CURSO',
      subject: `Novo ${label} — ${item.companyName || item.contactName}`,
      applicantName: `${item.contactName} (${item.companyName || 'Individual'})`,
      applicantEmail: item.email,
      applicantPhone: item.whatsapp || item.phone,
      details: `Tipo: ${label} | Norma/Curso: ${item.targetStandard} | Província: ${item.province} | Mensagem: ${item.message}`,
    });
    logActivity(`Submissão de formulário (${label}): ${item.contactName} — Notificado Painel Admin e geral@alhan.pro`);

    if (auth.currentUser && auth.currentUser.emailVerified) {
      const path = `diagnosticRequests/${id}`;
      try {
        await setDoc(doc(db, 'diagnosticRequests', id), {
          id,
          type: item.type,
          companyName: (item.companyName || 'Individual').slice(0, 160),
          contactName: item.contactName.slice(0, 120),
          role: (item.role || 'N/A').slice(0, 100),
          phone: item.phone.slice(0, 40),
          whatsapp: (item.whatsapp || item.phone).slice(0, 40),
          email: item.email.slice(0, 160),
          province: (item.province || 'Luanda').slice(0, 80),
          sector: (item.sector || 'Geral').slice(0, 100),
          employeesCount: (item.employeesCount || '1-10').slice(0, 40),
          targetStandard: (item.targetStandard || 'SGI').slice(0, 160),
          objective: (item.objective || 'Diagnóstico').slice(0, 500),
          message: (item.message || '').slice(0, 1500),
          userId: auth.currentUser.uid,
          status: 'Novo',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
  };

  const updateDiagnosticStatus = async (id: string, status: DiagnosticRequestItem['status']) => {
    setDiagnosticRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    logActivity(`Pedido ${id} actualizado para ${status}`);
    if (auth.currentUser && auth.currentUser.email === 'joaomuatxissombo22@gmail.com') {
      const path = `diagnosticRequests/${id}`;
      try {
        await updateDoc(doc(db, 'diagnosticRequests', id), { status });
      } catch (err) {
        console.warn('Firestore update info:', path, err);
      }
    }
  };

  const saveIsoProject = async (project: IsoProjectItem) => {
    setIsoProjects((prev) => {
      const exists = prev.some((p) => p.id === project.id);
      return exists ? prev.map((p) => (p.id === project.id ? project : p)) : [project, ...prev];
    });
    triggerNotification('Nova tarefa empresarial', `Projecto ISO Actualizado`, `O projecto de ${project.companyName} está em ${project.executionPercent}%.`, 'CLIENTE_EMPRESARIAL');
    logActivity(`Projecto ISO guardado: ${project.companyName}`);
  };

  const saveIsoDocument = async (docItem: IsoDocumentItem) => {
    setIsoDocuments((prev) => {
      const exists = prev.some((d) => d.id === docItem.id);
      return exists ? prev.map((d) => (d.id === docItem.id ? docItem : d)) : [docItem, ...prev];
    });
    logActivity(`Documento ISO guardado (${docItem.code} - ${docItem.status})`);
  };

  const saveIsoAudit = async (audit: IsoAuditItem) => {
    setIsoAudits((prev) => {
      const exists = prev.some((a) => a.id === audit.id);
      return exists ? prev.map((a) => (a.id === audit.id ? audit : a)) : [audit, ...prev];
    });
    triggerNotification('Nova auditoria', `Auditoria Registada: ${audit.standard}`, `Processo auditado: ${audit.processName} (${audit.classification}).`, 'CLIENTE_EMPRESARIAL');
    logActivity(`Auditoria registada (${audit.standard} - ${audit.processName})`);
  };

  const saveNonConformity = async (nc: NonConformityItem) => {
    setIsoProjects((prev) => prev);
    setNonConformities((prev) => {
      const exists = prev.some((n) => n.id === nc.id);
      return exists ? prev.map((n) => (n.id === nc.id ? nc : n)) : [nc, ...prev];
    });
    triggerNotification('Acção correctiva', `RNC ${nc.code} (${nc.status})`, `Processo: ${nc.processName} · Prazo: ${nc.deadline}`, 'CLIENTE_EMPRESARIAL');
    logActivity(`Não conformidade / Acção correctiva registada: ${nc.code}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authReady,
        registeredUsers,
        courses,
        isoStandards,
        enrollments,
        certificates,
        certificateRequests,
        adminNotifications,
        selectedAdminCertificateRequestId,
        setSelectedAdminCertificateRequestId,
        isoProjects,
        isoDocuments,
        isoAudits,
        nonConformities,
        diagnosticRequests,
        notifications,
        emailNotifications,
        testimonials,
        panelCredentials,
        updatePanelCredential,
        updateUserApprovalStatus,
        purgeStudentAccountByEmail,
        applyDiscountToEnrollment,
        updateStudentAccountDetails,
        requestSecurePasswordResetLink,
        resetPasswordByEmail,
        deleteRegisteredUser,
        deleteEnrollment,
        updateInstallmentPaymentStatus,
        updateEnrollmentApprovalStatus,
        notifySecondInstallmentDue,
        auditCandidates,
        lastSystemBackup,
        createDataSafetyBackup,
        executeAdminConfirmedDataCleanup,
        restoreDataSafetyBackup,
        requestCertificate,
        submitCertificateRequest,
        updateCertificateRequestStatus,
        emitAndDeliverCertificateRequest,
        replaceOrRevokeCertificateRequest,
        markAdminNotificationRead,
        markAllAdminNotificationsRead,
        activityLogs,
        pushPermission,
        requestPushPermission,
        loginWithGoogle,
        loginWithCredentials,
        registerAccount,
        logout,
        saveCourse,
        deleteCourse,
        addIsoStandard,
        addTestimonial,
        updateTestimonialApprovalStatus,
        deleteTestimonial,
        dynamicCounters,
        updateDynamicCounters,
        employabilityIndicators,
        saveEmployabilityIndicator,
        alumniTrackingRecords,
        saveAlumniTrackingRecord,
        deleteAlumniTrackingRecord,
        impactEvidences,
        saveImpactEvidence,
        deleteImpactEvidence,
        trainingPortfolioHistory,
        saveTrainingPortfolioHistoryItem,
        deleteTrainingPortfolioHistoryItem,
        institutionalPartnerships,
        saveInstitutionalPartnership,
        deleteInstitutionalPartnership,
        impactReports,
        saveImpactReport,
        deleteImpactReport,
        impactAuditLogs,
        createEnrollment,
        submitStudentPaymentProof,
        updateEnrollmentStatus,
        completeLesson,
        issueCertificate,
        addPresencialCertificate,
        updateCertificateStatus,
        deleteCertificate,
        clearAllCertificates,
        cancelCertificateRequest,
        submitDiagnosticOrContact,
        updateDiagnosticStatus,
        saveIsoProject,
        saveIsoDocument,
        saveIsoAudit,
        saveNonConformity,
        markNotificationRead,
        triggerNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
