import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  collection,
  doc,
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
} from '../firebase';
import {
  CourseItem,
  IsoStandardItem,
  EnrollmentItem,
  CertificateItem,
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
  INITIAL_ISO_PROJECTS,
  INITIAL_ISO_DOCUMENTS,
  INITIAL_ISO_AUDITS,
  INITIAL_NON_CONFORMITIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_TESTIMONIALS,
  PanelCredentialItem,
  INITIAL_PANEL_CREDENTIALS,
  AdminEmailNotificationItem,
} from '../data/initialData';
import { generateOfficialCertificatePdfDataUrl } from '../utils/pdfCertificateGenerator';

export interface ActiveUser {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  companyId: string;
  companyName?: string;
  specialty?: string;
  approvalStatus?: 'pendente' | 'aprovado' | 'rejeitado';
}

export interface RegisteredUserAccount {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: 'ALUNO' | 'CLIENTE_EMPRESARIAL' | 'PROFESSOR';
  companyId: string;
  companyName?: string;
  specialty?: string;
  approvalStatus?: 'pendente' | 'aprovado' | 'rejeitado';
  createdAt: string;
}

interface AppContextValue {
  user: ActiveUser | null;
  authReady: boolean;
  registeredUsers: RegisteredUserAccount[];
  courses: CourseItem[];
  isoStandards: IsoStandardItem[];
  enrollments: EnrollmentItem[];
  certificates: CertificateItem[];
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
  updateUserApprovalStatus: (uid: string, status: 'pendente' | 'aprovado' | 'rejeitado') => void;
  resetPasswordByEmail: (emailOrUser: string, newPassword: string) => Promise<RegisteredUserAccount>;
  deleteRegisteredUser: (uid: string) => void;
  deleteEnrollment: (enrollmentId: string) => Promise<void>;
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
  activityLogs: { id: string; action: string; actor: string; timestamp: string }[];
  pushPermission: NotificationPermission | 'unsupported';
  requestPushPermission: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithCredentials: (identifier: string, password: string, selectedRole?: UserRole) => Promise<UserRole>;
  registerAccount: (payload: {
    fullName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    role: UserRole;
    companyName?: string;
    specialty?: string;
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
  }) => Promise<TestimonialItem>;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ActiveUser | null>(() => {
    const u = loadLocal<ActiveUser | null>('alhan_active_user', null);
    if (u && (u.fullName?.includes('[DEMO]') || u.uid?.startsWith('demo-'))) {
      return null;
    }
    return u;
  });
  const [authReady, setAuthReady] = useState(false);

  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserAccount[]>(() =>
    loadLocal<RegisteredUserAccount[]>('alhan_registered_users', [])
  );

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
    const stored = loadLocal<EnrollmentItem[]>('alhan_enrollments', INITIAL_ENROLLMENTS);
    return stored.map((e) => ({
      ...e,
      studentName: e.studentName.replace('[DEMO] ', ''),
    }));
  });
  const [certificates, setCertificates] = useState<CertificateItem[]>(() => {
    const stored = loadLocal<CertificateItem[]>('alhan_certificates', INITIAL_CERTIFICATES);
    return stored.map((c) => ({
      ...c,
      code: c.code === 'ALHAN-DEMO-2026-001' ? 'ALHAN-SGI-2026-001' : c.code,
      studentName: c.studentName.replace('[DEMO] ', ''),
      isDemo: false,
    }));
  });
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
        else if (key === 'alhan_notifications') setNotifications(parsed);
        else if (key === 'alhan_email_notifications') setEmailNotifications(parsed);
        else if (key === 'alhan_registered_users') setRegisteredUsers(parsed);
        else if (key === 'alhan_courses') setCourses(parsed);
        else if (key === 'alhan_diagnostics') setDiagnosticRequests(parsed);
        else if (key === 'alhan_activity_logs') setActivityLogs(parsed);
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
        const isSuperAdminEmail = fbUser.email === 'joaomuatxissombo22@gmail.com';
        const role: UserRole = isSuperAdminEmail ? 'SUPER_ADMIN' : 'ALUNO';
        const active: ActiveUser = {
          uid: fbUser.uid,
          fullName: fbUser.displayName || 'Utilizador Alhan',
          username: (fbUser.email || 'utilizador').split('@')[0],
          email: fbUser.email || '',
          phone: '+244 922 021 211',
          role,
          companyId: fbUser.uid,
        };
        setUser(active);

        if (fbUser.emailVerified) {
          const userPath = `users/${fbUser.uid}`;
          try {
            await setDoc(
              doc(db, 'users', fbUser.uid),
              {
                uid: fbUser.uid,
                fullName: active.fullName.slice(0, 120),
                username: active.username.slice(0, 60),
                role: active.role,
                companyId: active.companyId.slice(0, 128),
                status: 'ativo',
                createdAt: serverTimestamp(),
              },
              { merge: true }
            );
          } catch (err) {
            console.warn('User profile sync info:', userPath, err);
          }

          if (isSuperAdminEmail) {
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

    const enrollmentsQuery = isAdminUser
      ? collection(db, 'enrollments')
      : query(collection(db, 'enrollments'), where('studentId', '==', uid));

    const unsubEnrollments = onSnapshot(
      enrollmentsQuery,
      (snap) => {
        if (!snap.empty) {
          const remote = snap.docs.map((d) => {
            const data = d.data();
            return {
              ...data,
              id: d.id,
              completedLessons: [],
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            } as unknown as EnrollmentItem;
          });
          setEnrollments((prev) => {
            const map = new Map<string, EnrollmentItem>();
            prev.forEach((item) => map.set(item.id, item));
            remote.forEach((item) => map.set(item.id, { ...map.get(item.id), ...item }));
            return Array.from(map.values());
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'enrollments')
    );

    return () => {
      unsubCourses();
      unsubEnrollments();
    };
  }, [authReady]);

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

  const updateUserApprovalStatus = (uid: string, status: 'pendente' | 'aprovado' | 'rejeitado') => {
    let targetUser: RegisteredUserAccount | undefined;
    setRegisteredUsers((prev) =>
      prev.map((u) => {
        if (u.uid === uid) {
          targetUser = { ...u, approvalStatus: status };
          return targetUser;
        }
        return u;
      })
    );

    setUser((prev) => (prev && prev.uid === uid ? { ...prev, approvalStatus: status } : prev));

    if (targetUser) {
      const statusLabel =
        status === 'aprovado'
          ? 'AUTORIZADO / APROVADO'
          : status === 'rejeitado'
          ? 'NÃO AUTORIZADO / SUSPENSO'
          : 'PENDENTE DE AUTORIZAÇÃO';
      triggerNotification(
        'Novo registo',
        `Inscrição de Professor ${status === 'aprovado' ? 'Autorizada' : 'Actualizada'}`,
        `O acesso do Professor / Formador ${targetUser.fullName} ao Painel do Professor foi marcado como ${statusLabel} pela Administração.`,
        'PROFESSOR'
      );
      logActivity(`Estado de autorização do professor ${targetUser.fullName} alterado para ${statusLabel}`);
    }
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
      `A palavra-passe da conta de ${found.fullName} (${found.email}) foi redefinida com sucesso.`,
      'ADMIN'
    );
    logActivity(`Palavra-passe redefinida via e-mail para ${found.fullName} (${found.email})`);

    return updatedAccount;
  };

  const deleteRegisteredUser = (uid: string) => {
    const target = registeredUsers.find((u) => u.uid === uid);
    setRegisteredUsers((prev) => prev.filter((u) => u.uid !== uid));
    if (target) {
      // Also clean up any enrollments tied to this deleted student if applicable
      if (target.role === 'ALUNO') {
        setEnrollments((prev) =>
          prev.filter(
            (e) =>
              e.studentId !== uid &&
              e.studentEmail?.toLowerCase() !== target.email.toLowerCase()
          )
        );
      }
      logActivity(
        `Conta de ${target.role === 'PROFESSOR' ? 'Professor/Formador' : 'Aluno/Utilizador'} eliminada pelo Administrador: ${target.fullName} (${target.email})`
      );
    }
  };

  const deleteEnrollment = async (enrollmentId: string) => {
    const target = enrollments.find((e) => e.id === enrollmentId);
    setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
    if (target) {
      logActivity(
        `Inscrição eliminada pelo Administrador: ${target.studentName} (${target.courseTitle})`
      );
    }
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
    const nowIso = new Date().toISOString();
    let target = enrollments.find((e) => e.id === enrollmentId);

    if (!target && requestDetails?.courseId) {
      target = enrollments.find(
        (e) =>
          e.courseId === requestDetails.courseId &&
          (e.studentId === user?.uid ||
            (user?.email && e.studentEmail?.toLowerCase() === user.email.toLowerCase()))
      );
    }

    if (target) {
      const reqName = requestDetails?.studentName?.trim() || target.studentName;
      const reqBI = requestDetails?.studentBI?.trim().toUpperCase() || target.certificateRequestBI || '';
      const reqEmail = requestDetails?.studentEmail?.trim() || target.studentEmail || user?.email || '';
      const reqPhone = requestDetails?.studentPhone?.trim() || target.studentPhone || user?.phone || '';
      const reqNotes = requestDetails?.notes?.trim() || target.certificateRequestNotes || '';

      setEnrollments((prev) =>
        prev.map((e) =>
          e.id === target!.id
            ? {
                ...e,
                studentId: user?.uid || e.studentId,
                studentName: reqName,
                studentEmail: reqEmail || e.studentEmail,
                studentPhone: reqPhone || e.studentPhone,
                certificateRequested: true,
                certificateRequestedAt: nowIso,
                certificateSentAt: undefined,
                certificateRequestName: reqName,
                certificateRequestBI: reqBI,
                certificateRequestEmail: reqEmail,
                certificateRequestPhone: reqPhone,
                certificateRequestNotes: reqNotes,
              }
            : e
        )
      );

      triggerNotification(
        'Certificado disponível',
        `Solicitação de Certificado PDF: ${reqName}`,
        `O aluno inscrito ${reqName} (B.I.: ${reqBI || 'N/A'} · E-mail: ${reqEmail}) solicitou o Certificado em PDF para o curso "${target.courseTitle}". Envie o PDF para o Painel do Aluno.`,
        'ADMIN'
      );
      notifyAdminAndEmailGeral({
        panelOrigin: 'SOLICITACAO_CERTIFICADO',
        subject: `Solicitação de Certificado PDF — Aluno: ${reqName} (${target.courseTitle})`,
        applicantName: reqName,
        applicantEmail: reqEmail || 'geral@alhan.pro',
        applicantPhone: reqPhone || '+244 922 021 211',
        details: `Curso: ${target.courseTitle} | B.I.: ${reqBI || 'Não informado'} | Estado Pagamento: ${target.paymentStatus} | Observações: ${reqNotes || 'Solicitação via Painel do Aluno'}`,
      });
      logActivity(
        `Aluno ${reqName} solicitou emissão de certificado em PDF (${target.courseTitle}) — Notificado Painel Admin e geral@alhan.pro`,
        reqName
      );
      return;
    }

    // If the student filled out the Certificate Request Form for a course they want to register & request right away
    const fallbackCourse =
      courses.find((c) => c.id === requestDetails?.courseId) || courses[0];
    if (fallbackCourse) {
      const reqName = requestDetails?.studentName?.trim() || user?.fullName || 'Aluno Inscrito';
      const reqBI = requestDetails?.studentBI?.trim().toUpperCase() || '';
      const reqEmail = requestDetails?.studentEmail?.trim() || user?.email || 'aluno@alhan.pro';
      const reqPhone = requestDetails?.studentPhone?.trim() || user?.phone || '+244 922 021 211';
      const reqNotes = requestDetails?.notes?.trim() || '';

      const newEnr: EnrollmentItem = {
        id: `enr-${Date.now()}`,
        studentId: user?.uid || `inscrito-${Date.now()}`,
        studentName: reqName,
        studentPhone: reqPhone,
        studentEmail: reqEmail,
        courseId: fallbackCourse.id,
        courseTitle: fallbackCourse.title,
        modality: fallbackCourse.modality,
        amountKz: fallbackCourse.priceKz,
        paymentMethod: 'Express Angola',
        paymentReference: `CERT-REQ-${Date.now().toString().slice(-5)}`,
        receiptNote: reqNotes || 'Inscrição e solicitação de Certificado em PDF via Painel do Aluno.',
        paymentStatus: 'Pendente',
        progressPercent: 100,
        completedLessons: [],
        completed: true,
        certificateRequested: true,
        certificateRequestedAt: nowIso,
        certificateRequestName: reqName,
        certificateRequestBI: reqBI,
        certificateRequestEmail: reqEmail,
        certificateRequestPhone: reqPhone,
        certificateRequestNotes: reqNotes,
        createdAt: nowIso,
      };
      setEnrollments((prev) => [newEnr, ...prev]);

      triggerNotification(
        'Certificado disponível',
        `Solicitação de Certificado PDF: ${reqName}`,
        `O aluno ${reqName} (B.I.: ${reqBI || 'N/A'}) solicitou o Certificado em PDF para o curso "${fallbackCourse.title}".`,
        'ADMIN'
      );
      notifyAdminAndEmailGeral({
        panelOrigin: 'SOLICITACAO_CERTIFICADO',
        subject: `Solicitação de Certificado PDF — Aluno: ${reqName} (${fallbackCourse.title})`,
        applicantName: reqName,
        applicantEmail: reqEmail,
        applicantPhone: reqPhone,
        details: `Curso: ${fallbackCourse.title} | B.I.: ${reqBI || 'Não informado'} | Observações: ${reqNotes || 'Solicitação via Painel do Aluno'}`,
      });
      logActivity(
        `Aluno ${reqName} solicitou certificado em PDF (${fallbackCourse.title}) — Notificado Painel Admin e geral@alhan.pro`,
        reqName
      );
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

    // 1. Check Registered Accounts (Aluno, Professor/Formador, or Cliente Empresarial who registered on the platform)
    const registeredMatch = registeredUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    if (registeredMatch) {
      if (registeredMatch.password !== cleanPass) {
        throw new Error('Palavra-passe incorrecta para esta conta registada. Se esqueceu a senha, utilize a opção «Redefinir Palavra-passe com E-mail».');
      }
      const approvalStatus =
        registeredMatch.approvalStatus ||
        (registeredMatch.role === 'PROFESSOR' ? 'pendente' : 'aprovado');
      const active: ActiveUser = {
        uid: registeredMatch.uid,
        fullName: registeredMatch.fullName,
        username: registeredMatch.username,
        email: registeredMatch.email,
        phone: registeredMatch.phone,
        role: registeredMatch.role,
        companyId: registeredMatch.companyId,
        companyName: registeredMatch.companyName,
        specialty: registeredMatch.specialty,
        approvalStatus,
      };
      setUser(active);
      logActivity(`Sessão iniciada (${active.role}): ${active.fullName}`, active.fullName);
      return active.role;
    }

    // 2. Check Single Unified Administrator Credentials (alhan.admin / admin@alhan.pro / Alhan@2026)
    if (
      (cleanId === 'alhan.admin' ||
        cleanId === 'admin@alhan.pro' ||
        cleanId === 'gestao.alhan' ||
        cleanId === 'gestao@alhan.pro' ||
        cleanId === 'admin' ||
        cleanId === 'superadmin') &&
      (cleanPass === 'Alhan@2026' || cleanPass === 'Alhan@SGI2026')
    ) {
      const active: ActiveUser = {
        uid: 'staff-admin-unico',
        fullName: 'Administrador Geral ALHAN – SGI',
        username: 'alhan.admin',
        email: 'admin@alhan.pro',
        phone: '+244 922 021 211',
        role: 'ADMIN',
        companyId: 'alhan-sgi',
        approvalStatus: 'aprovado',
      };
      setUser(active);
      logActivity('Acesso total autorizado ao Painel do Administrador Único ALHAN (ADMIN)', active.fullName);
      return 'ADMIN';
    }

    const internalCred = panelCredentials.find(
      (c) =>
        (c.role === 'SUPER_ADMIN' || c.role === 'ADMIN' || c.role === 'PROFESSOR') &&
        (c.username.toLowerCase() === cleanId || c.email.toLowerCase() === cleanId)
    );

    if (internalCred) {
      if (cleanPass !== internalCred.password) {
        throw new Error('Credenciais administrativas ou docentes inválidas. Acesso restrito.');
      }
      const active: ActiveUser = {
        uid: `staff-${internalCred.role.toLowerCase()}`,
        fullName:
          internalCred.role === 'SUPER_ADMIN'
            ? 'Super Administrador ALHAN'
            : internalCred.role === 'ADMIN'
            ? 'Gestor Operacional ALHAN'
            : 'Eng.º Formador SGI (ALHAN)',
        username: internalCred.username,
        email: internalCred.email,
        phone: '+244 922 021 211',
        role: internalCred.role,
        companyId: 'alhan-sgi',
        approvalStatus: 'aprovado',
      };
      setUser(active);
      logActivity(`Acesso autorizado ao painel ${internalCred.role}`, active.fullName);
      return internalCred.role;
    }

    // 3. If user tried to log in as ALUNO, PROFESSOR or CLIENTE_EMPRESARIAL without registering first
    if (selectedRole === 'ALUNO' || selectedRole === 'CLIENTE_EMPRESARIAL' || selectedRole === 'PROFESSOR') {
      throw new Error(
        selectedRole === 'ALUNO'
          ? 'Conta de Aluno não encontrada. O Painel do Aluno só é activado após efectuar o seu cadastro em «Criar Conta / Cadastrar».'
          : selectedRole === 'PROFESSOR'
          ? 'Conta de Professor / Formador não encontrada. Inscreva-se no separador «Criar Conta / Cadastrar» e aguarde a autorização do Painel Administrativo.'
          : 'Conta Empresarial não encontrada. O Painel do Cliente Empresarial só é activado após efectuar o cadastro da sua empresa em «Criar Conta / Cadastrar».'
      );
    }

    throw new Error('Utilizador ou palavra-passe inválidos. Verifique as suas credenciais de acesso.');
  };

  const registerAccount = async (payload: {
    fullName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    role: UserRole;
    companyName?: string;
    specialty?: string;
  }) => {
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

    const newUid = `usr-${Date.now()}`;
    const companyId =
      allowedRegisterRole === 'CLIENTE_EMPRESARIAL'
        ? `emp-${Date.now()}`
        : allowedRegisterRole === 'PROFESSOR'
        ? 'alhan-docente'
        : 'alhan-aluno';
    const companyTitle = payload.companyName?.trim() || payload.fullName.trim();
    const initialApprovalStatus: 'pendente' | 'aprovado' =
      allowedRegisterRole === 'PROFESSOR' ? 'pendente' : 'aprovado';

    const newAccount: RegisteredUserAccount = {
      uid: newUid,
      fullName: payload.fullName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: payload.phone.trim(),
      password: payload.password.trim(),
      role: allowedRegisterRole,
      companyId,
      companyName: allowedRegisterRole === 'CLIENTE_EMPRESARIAL' ? companyTitle : undefined,
      specialty:
        allowedRegisterRole === 'PROFESSOR'
          ? payload.specialty?.trim() || payload.companyName?.trim() || 'Consultoria e Formação SGI / Normas ISO & HSE'
          : undefined,
      approvalStatus: initialApprovalStatus,
      createdAt: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => [newAccount, ...prev]);

    // If registering as a Corporate Client, automatically initialize their private ISO Project in the portal
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
        createdAt: new Date().toISOString(),
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
      role: allowedRegisterRole,
      companyId,
      companyName: newAccount.companyName,
      specialty: newAccount.specialty,
      approvalStatus: initialApprovalStatus,
    };

    setUser(newUser);

    if (allowedRegisterRole === 'PROFESSOR') {
      triggerNotification(
        'Novo registo',
        `Nova Inscrição no Painel do Professor: ${newUser.fullName}`,
        `O professor/formador ${newUser.fullName} (E-mail: ${newUser.email} · Tel: ${newUser.phone} · Especialidade: ${newAccount.specialty}) inscreveu-se no Painel do Professor e aguarda autorização administrativa. Notificação enviada para geral@alhan.pro.`,
        'ADMIN'
      );
      notifyAdminAndEmailGeral({
        panelOrigin: 'PAINEL_PROFESSOR',
        subject: `Nova Inscrição no Painel do Professor — ${newUser.fullName}`,
        applicantName: newUser.fullName,
        applicantEmail: newUser.email,
        applicantPhone: newUser.phone,
        details: `Utilizador: ${newUser.username} | Especialidade: ${newAccount.specialty} | Estado: Aguardando Autorização do Painel Administrativo`,
      });
      logActivity(
        `Nova inscrição no Painel do PROFESSOR (${newUser.fullName}) — Notificado Painel Administrativo e geral@alhan.pro`,
        newUser.fullName
      );
    } else if (allowedRegisterRole === 'CLIENTE_EMPRESARIAL') {
      triggerNotification(
        'Novo registo',
        `Nova Inscrição no Painel da Empresa: ${companyTitle}`,
        `A empresa "${companyTitle}" (Responsável: ${newUser.fullName} · E-mail: ${newUser.email} · Tel: ${newUser.phone}) cadastrou-se no Painel do Cliente Empresarial. Notificação enviada para geral@alhan.pro.`,
        'ADMIN'
      );
      triggerNotification(
        'Novo registo',
        'Painel Empresarial Activado com Sucesso',
        `Bem-vindo(a) à plataforma ALHAN SGI, ${newUser.fullName} (${companyTitle}).`,
        'CLIENTE_EMPRESARIAL'
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
        `Nova inscrição no Painel da EMPRESA (${companyTitle} - ${newUser.fullName}) — Notificado Painel Administrativo e geral@alhan.pro`,
        newUser.fullName
      );
    } else {
      triggerNotification(
        'Novo registo',
        `Nova Inscrição no Painel do Aluno: ${newUser.fullName}`,
        `O aluno ${newUser.fullName} (E-mail: ${newUser.email} · Tel: ${newUser.phone}) cadastrou-se no Painel do Aluno. Notificação enviada para geral@alhan.pro.`,
        'ADMIN'
      );
      triggerNotification(
        'Novo registo',
        'Cadastro de Aluno Concluído com Sucesso',
        `Bem-vindo(a) à plataforma ALHAN SGI, ${newUser.fullName}. O seu Painel do Aluno foi activado.`,
        'ALUNO'
      );
      notifyAdminAndEmailGeral({
        panelOrigin: 'PAINEL_ALUNO',
        subject: `Nova Inscrição no Painel do Aluno — ${newUser.fullName}`,
        applicantName: newUser.fullName,
        applicantEmail: newUser.email,
        applicantPhone: newUser.phone,
        details: `Aluno: ${newUser.fullName} | Utilizador: ${newUser.username} | E-mail: ${newUser.email} | Telefone: ${newUser.phone}`,
      });
      logActivity(
        `Nova inscrição no Painel do ALUNO (${newUser.fullName}) — Notificado Painel Administrativo e geral@alhan.pro`,
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
    setCourses((prev) => {
      const exists = prev.some((c) => c.id === course.id);
      return exists ? prev.map((c) => (c.id === course.id ? course : c)) : [course, ...prev];
    });
    logActivity(`Curso guardado/actualizado: ${course.title}`);
    triggerNotification('Nova aula', 'Catálogo de Formações Actualizado', `O curso "${course.title}" foi actualizado no catálogo.`);

    if (auth.currentUser && auth.currentUser.email === 'joaomuatxissombo22@gmail.com') {
      const path = `courses/${course.id}`;
      try {
        await setDoc(doc(db, 'courses', course.id), {
          id: course.id,
          title: course.title.slice(0, 160),
          category: course.category.slice(0, 80),
          modality: course.modality,
          priceKz: Number(course.priceKz),
          durationHours: Number(course.durationHours),
          lessonsCount: Number(course.lessonsCount),
          instructorName: course.instructorName.slice(0, 120),
          instructorId: course.instructorId.slice(0, 128),
          published: Boolean(course.published),
          description: course.description.slice(0, 1500),
          objectives: course.objectives.slice(0, 1500),
          syllabus: course.syllabus.slice(0, 2000),
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
      projectOutcome: item.projectOutcome?.trim() || 'Excelência operacional e conformidade comprovada.',
      verified: true,
      createdAt: new Date().toISOString(),
    };
    setTestimonials((prev) => [newTestimonial, ...prev]);
    triggerNotification(
      'Novo registo',
      'Novo Testemunho Recebido',
      `${newTestimonial.clientName} (${newTestimonial.companyName}) avaliou os serviços da ALHAN.`,
      'ADMIN'
    );
    logActivity(`Novo testemunho registado: ${newTestimonial.clientName}`);
    return newTestimonial;
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
  }) => {
    const studentId = auth.currentUser?.uid || user?.uid || `inscrito-${Date.now()}`;
    const studentName = payload.studentName?.trim() || user?.fullName || 'Formando Inscrito';
    const enrollmentId = `enr-${Date.now()}`;
    const newEnrollment: EnrollmentItem = {
      id: enrollmentId,
      studentId,
      studentName,
      studentPhone: payload.studentPhone || user?.phone || '+244 922 021 211',
      studentEmail: payload.studentEmail || user?.email || 'aluno@alhan.pro',
      courseId: payload.course.id,
      courseTitle: payload.course.title,
      modality: payload.modality,
      amountKz: payload.course.priceKz,
      paymentMethod: payload.paymentMethod,
      paymentReference: payload.paymentReference || `REF-${Date.now().toString().slice(-6)}`,
      receiptNote: payload.receiptNote || 'Comprovativo submetido para validação administrativa.',
      receiptFileUrl: payload.receiptFileUrl,
      receiptFileName: payload.receiptFileName,
      paymentStatus: 'Pendente',
      progressPercent: 0,
      completedLessons: [],
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setEnrollments((prev) => [newEnrollment, ...prev]);

    if (auth.currentUser && auth.currentUser.emailVerified) {
      await saveEnrollmentToFirestore(newEnrollment);
    }

    triggerNotification(
      'Nova inscrição',
      `Nova Inscrição de Aluno em Curso: ${payload.course.title}`,
      `Inscrição de ${studentName} (Tel: ${newEnrollment.studentPhone} · E-mail: ${newEnrollment.studentEmail}) no curso "${payload.course.title}" (${payload.course.priceKz.toLocaleString('pt-AO')} Kz via ${payload.paymentMethod}). Notificado geral@alhan.pro.`,
      'ADMIN'
    );
    notifyAdminAndEmailGeral({
      panelOrigin: 'INSCRICAO_CURSO',
      subject: `Nova Inscrição em Curso — ${studentName} (${payload.course.title})`,
      applicantName: studentName,
      applicantEmail: newEnrollment.studentEmail || 'geral@alhan.pro',
      applicantPhone: newEnrollment.studentPhone || '+244 922 021 211',
      details: `Curso: ${payload.course.title} | Modalidade: ${payload.modality} | Valor: ${payload.course.priceKz.toLocaleString('pt-AO')} Kz | Canal: ${payload.paymentMethod} | Ref: ${newEnrollment.paymentReference}`,
    });
    logActivity(
      `Nova inscrição no curso ${payload.course.title} (${studentName}) — Notificado Painel Admin e geral@alhan.pro`
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
  }) => {
    const studentId = auth.currentUser?.uid || user?.uid || `inscrito-${Date.now()}`;
    const studentName = user?.fullName || 'Aluno Registado';

    const existing = enrollments.find(
      (e) =>
        (payload.enrollmentId && e.id === payload.enrollmentId) ||
        (e.courseId === payload.course.id &&
          (e.studentId === studentId ||
            (user?.email && e.studentEmail?.toLowerCase() === user.email.toLowerCase())))
    );

    if (existing) {
      const updated: EnrollmentItem = {
        ...existing,
        studentId,
        studentName,
        studentPhone: payload.studentPhone || existing.studentPhone || user?.phone || '+244 922 021 211',
        studentEmail: payload.studentEmail || existing.studentEmail || user?.email || 'aluno@alhan.pro',
        paymentMethod: payload.paymentMethod,
        paymentReference: payload.paymentReference || existing.paymentReference || `REF-${Date.now().toString().slice(-6)}`,
        receiptNote: payload.receiptNote || existing.receiptNote || `Comprovativo via ${payload.paymentMethod} submetido no Painel do Aluno.`,
        receiptFileUrl: payload.receiptFileUrl || existing.receiptFileUrl,
        receiptFileName: payload.receiptFileName || existing.receiptFileName,
      };
      setEnrollments((prev) => prev.map((e) => (e.id === existing.id ? updated : e)));

      if (auth.currentUser && auth.currentUser.emailVerified) {
        await updateEnrollmentPaymentInFirestore(existing.id, {
          paymentMethod: updated.paymentMethod,
          paymentReference: updated.paymentReference,
          receiptNote: updated.receiptNote,
        });
      }

      triggerNotification(
        'Nova inscrição',
        `Comprovativo Enviado pelo Aluno: ${payload.course.title}`,
        `O aluno ${studentName} submeteu o comprovativo de pagamento (${payload.paymentMethod} · Ref: ${updated.paymentReference}) para liberar a formação.`,
        'ADMIN'
      );
      logActivity(`Comprovativo de pagamento submetido pelo aluno ${studentName} (${payload.course.title})`, studentName);
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
    });
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: EnrollmentItem['paymentStatus']) => {
    setEnrollments((prev) =>
      prev.map((item) => (item.id === enrollmentId ? { ...item, paymentStatus: status } : item))
    );

    if (auth.currentUser && auth.currentUser.emailVerified) {
      await updateEnrollmentStatusInFirestore(enrollmentId, status);
    }

    const target = enrollments.find((e) => e.id === enrollmentId);
    if (status === 'Pago' && target) {
      triggerNotification(
        'Pagamento aprovado',
        'Acesso ao Curso Libertado',
        `O pagamento da formação "${target.courseTitle}" para ${target.studentName} foi validado com sucesso. Notifique o aluno no WhatsApp (${target.studentPhone || 'N/A'}) ou E-mail (${target.studentEmail || 'N/A'}).`,
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

    const course = courses.find((c) => c.id === enrollment.courseId);
    const resolvedBI =
      pdfOptions?.studentBI?.trim().toUpperCase() ||
      enrollment.certificateRequestBI ||
      existingCert?.studentBI ||
      '';
    const resolvedName =
      enrollment.certificateRequestName || enrollment.studentName;
    const resolvedGrade = pdfOptions?.grade?.trim() || existingCert?.grade || 'Aprovado com Distinção';
    const issuedDate = new Date().toISOString().split('T')[0];

    if (existingCert) {
      const generatedPdfUrl =
        pdfOptions?.certificateFileUrl ||
        existingCert.certificateFileUrl ||
        generateOfficialCertificatePdfDataUrl({
          code: existingCert.code,
          studentName: resolvedName,
          studentBI: resolvedBI,
          courseTitle: enrollment.courseTitle,
          modality: enrollment.modality,
          workloadHours: course?.durationHours || existingCert.workloadHours || 24,
          grade: resolvedGrade,
          issuedDate: existingCert.issuedDate || issuedDate,
        });

      const updatedCert: CertificateItem = {
        ...existingCert,
        studentName: resolvedName,
        certificateFileUrl: generatedPdfUrl,
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
                certificateSentAt: new Date().toISOString(),
              }
            : e
        )
      );
      triggerNotification(
        'Certificado disponível',
        `Certificado em PDF Enviado para o Seu Painel: ${updatedCert.code}`,
        `O Painel Administrativo enviou o seu Certificado em PDF da formação "${enrollment.courseTitle}" (${resolvedName}). Já pode baixá-lo em PDF no seu Painel do Aluno!`,
        'ALUNO'
      );
      logActivity(
        `Certificado em PDF enviado para o Painel do Aluno (${updatedCert.code}) — ${resolvedName}`
      );
      return updatedCert;
    }

    const code = `ALHAN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const workloadHours = course?.durationHours || 24;
    const pdfDataUrl =
      pdfOptions?.certificateFileUrl ||
      generateOfficialCertificatePdfDataUrl({
        code,
        studentName: resolvedName,
        studentBI: resolvedBI,
        courseTitle: enrollment.courseTitle,
        modality: enrollment.modality || 'Online',
        workloadHours,
        grade: resolvedGrade,
        issuedDate,
      });

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
      certificateFileUrl: pdfDataUrl,
      certificateFileName:
        pdfOptions?.certificateFileName ||
        `Certificado_ALHAN_${code}_${resolvedName.replace(/\s+/g, '_')}.pdf`,
      isDemo: false,
      createdAt: new Date().toISOString(),
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
              certificateSentAt: new Date().toISOString(),
            }
          : e
      )
    );
    triggerNotification(
      'Certificado disponível',
      `Certificado em PDF Enviado para o Seu Painel: ${code}`,
      `O Painel Administrativo enviou o seu Certificado de Conclusão da formação "${enrollment.courseTitle}" em PDF para o seu Painel do Aluno. Já pode baixá-lo!`,
      'ALUNO'
    );
    logActivity(`Certificado em PDF emitido e enviado para o Painel do Aluno (${code}) — ${resolvedName}`);
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
        resetPasswordByEmail,
        deleteRegisteredUser,
        deleteEnrollment,
        requestCertificate,
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
