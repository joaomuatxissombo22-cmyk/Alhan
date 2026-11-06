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
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
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
} from '../data/initialData';

export interface ActiveUser {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  companyId: string;
  companyName?: string;
}

export interface RegisteredUserAccount {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: 'ALUNO' | 'CLIENTE_EMPRESARIAL';
  companyId: string;
  companyName?: string;
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
  testimonials: TestimonialItem[];
  panelCredentials: PanelCredentialItem[];
  updatePanelCredential: (role: UserRole, username: string, email: string, password: string) => void;
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
    studentName?: string;
    studentPhone?: string;
    studentEmail?: string;
  }) => Promise<EnrollmentItem>;
  updateEnrollmentStatus: (enrollmentId: string, status: EnrollmentItem['paymentStatus']) => Promise<void>;
  completeLesson: (enrollmentId: string, lessonId: string, totalLessons: number, quizScore?: number) => Promise<void>;
  issueCertificate: (enrollment: EnrollmentItem) => Promise<CertificateItem>;
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
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() =>
    loadLocal('alhan_testimonials', INITIAL_TESTIMONIALS)
  );
  const [panelCredentials, setPanelCredentials] = useState<PanelCredentialItem[]>(() =>
    loadLocal('alhan_panel_credentials', INITIAL_PANEL_CREDENTIALS)
  );
  const [activityLogs, setActivityLogs] = useState<{ id: string; action: string; actor: string; timestamp: string }[]>(() =>
    loadLocal('alhan_activity_logs', [
      { id: 'log-1', action: 'Inicialização da Plataforma ALHAN – SGI', actor: 'Sistema', timestamp: new Date().toISOString() },
    ])
  );

  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  // Persist state locally
  useEffect(() => { localStorage.setItem('alhan_active_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('alhan_registered_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
  useEffect(() => { localStorage.setItem('alhan_courses', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('alhan_iso_standards', JSON.stringify(isoStandards)); }, [isoStandards]);
  useEffect(() => { localStorage.setItem('alhan_enrollments', JSON.stringify(enrollments)); }, [enrollments]);
  useEffect(() => { localStorage.setItem('alhan_certificates', JSON.stringify(certificates)); }, [certificates]);
  useEffect(() => { localStorage.setItem('alhan_testimonials', JSON.stringify(testimonials)); }, [testimonials]);
  useEffect(() => { localStorage.setItem('alhan_panel_credentials', JSON.stringify(panelCredentials)); }, [panelCredentials]);
  useEffect(() => { localStorage.setItem('alhan_iso_projects', JSON.stringify(isoProjects)); }, [isoProjects]);
  useEffect(() => { localStorage.setItem('alhan_iso_documents', JSON.stringify(isoDocuments)); }, [isoDocuments]);
  useEffect(() => { localStorage.setItem('alhan_iso_audits', JSON.stringify(isoAudits)); }, [isoAudits]);
  useEffect(() => { localStorage.setItem('alhan_ncs', JSON.stringify(nonConformities)); }, [nonConformities]);
  useEffect(() => { localStorage.setItem('alhan_diagnostics', JSON.stringify(diagnosticRequests)); }, [diagnosticRequests]);
  useEffect(() => { localStorage.setItem('alhan_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('alhan_activity_logs', JSON.stringify(activityLogs)); }, [activityLogs]);

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

    // 1. Check Registered Accounts (Aluno or Cliente Empresarial who registered on the platform)
    const registeredMatch = registeredUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    if (registeredMatch) {
      if (registeredMatch.password !== cleanPass) {
        throw new Error('Palavra-passe incorrecta para esta conta registada.');
      }
      const active: ActiveUser = {
        uid: registeredMatch.uid,
        fullName: registeredMatch.fullName,
        username: registeredMatch.username,
        email: registeredMatch.email,
        phone: registeredMatch.phone,
        role: registeredMatch.role,
        companyId: registeredMatch.companyId,
        companyName: registeredMatch.companyName,
      };
      setUser(active);
      logActivity(`Sessão iniciada (${active.role}): ${active.fullName}`, active.fullName);
      return active.role;
    }

    // 2. Check Private Internal Panel Credentials (Admin, Super Admin, Professor)
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
      };
      setUser(active);
      logActivity(`Acesso privado autorizado ao painel ${internalCred.role}`, active.fullName);
      return internalCred.role;
    }

    // 3. If user tried to log in as ALUNO or CLIENTE_EMPRESARIAL without registering first
    if (selectedRole === 'ALUNO' || selectedRole === 'CLIENTE_EMPRESARIAL') {
      throw new Error(
        selectedRole === 'ALUNO'
          ? 'Conta de Aluno não encontrada. O Painel do Aluno só é activado após efectuar o seu cadastro em «Criar Conta / Cadastrar».'
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
  }) => {
    const allowedRegisterRole: 'ALUNO' | 'CLIENTE_EMPRESARIAL' =
      payload.role === 'CLIENTE_EMPRESARIAL' ? 'CLIENTE_EMPRESARIAL' : 'ALUNO';

    const cleanUsername = (payload.username.trim() || payload.email.split('@')[0]).toLowerCase();
    const cleanEmail = payload.email.trim().toLowerCase();

    const exists = registeredUsers.some(
      (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
    );
    if (exists) {
      throw new Error('Já existe uma conta registada com este nome de utilizador ou e-mail.');
    }

    const newUid = `usr-${Date.now()}`;
    const companyId = allowedRegisterRole === 'CLIENTE_EMPRESARIAL' ? `emp-${Date.now()}` : 'alhan-aluno';
    const companyTitle = payload.companyName?.trim() || payload.fullName.trim();

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
    };

    setUser(newUser);
    triggerNotification(
      'Novo registo',
      'Cadastro Concluído com Sucesso',
      `Bem-vindo(a) à plataforma ALHAN SGI, ${newUser.fullName}. O seu painel privado foi activado.`,
      allowedRegisterRole
    );
    logActivity(`Novo cadastro de ${allowedRegisterRole}: ${newUser.fullName}`, newUser.fullName);
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
      paymentStatus: 'Pendente',
      progressPercent: 0,
      completedLessons: [],
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setEnrollments((prev) => [newEnrollment, ...prev]);
    triggerNotification(
      'Nova inscrição',
      `Nova Inscrição: ${payload.course.title}`,
      `Inscrição de ${studentName} (${payload.course.priceKz.toLocaleString('pt-AO')} Kz via ${payload.paymentMethod}) aguarda validação.`
    );
    logActivity(`Nova inscrição no curso ${payload.course.title} (${payload.paymentMethod})`);

    return newEnrollment;
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: EnrollmentItem['paymentStatus']) => {
    setEnrollments((prev) =>
      prev.map((item) => (item.id === enrollmentId ? { ...item, paymentStatus: status } : item))
    );
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
    setEnrollments((prev) =>
      prev.map((item) => {
        if (item.id !== enrollmentId) return item;
        const updatedLessons = item.completedLessons.includes(lessonId)
          ? item.completedLessons
          : [...item.completedLessons, lessonId];
        const pct = Math.min(100, Math.round((updatedLessons.length / Math.max(1, totalLessons)) * 100));
        const isCompleted = pct >= 100;
        return {
          ...item,
          completedLessons: updatedLessons,
          progressPercent: pct,
          quizScore: quizScore !== undefined ? quizScore : item.quizScore,
          completed: isCompleted,
        };
      })
    );
    logActivity(`Progresso de aula registado (${lessonId})`);
  };

  const issueCertificate = async (enrollment: EnrollmentItem) => {
    const existingCert = certificates.find(
      (c) => c.studentId === enrollment.studentId && c.courseId === enrollment.courseId
    );
    if (existingCert) return existingCert;

    const course = courses.find((c) => c.id === enrollment.courseId);
    const code = `ALHAN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCert: CertificateItem = {
      id: `cert-${Date.now()}`,
      code,
      studentId: enrollment.studentId,
      studentName: enrollment.studentName,
      studentPhone: enrollment.studentPhone,
      studentEmail: enrollment.studentEmail,
      courseId: enrollment.courseId,
      courseTitle: enrollment.courseTitle,
      modality: enrollment.modality || 'Online',
      workloadHours: course?.durationHours || 24,
      issuedDate: new Date().toISOString().split('T')[0],
      responsibleName: 'Direcção Pedagógica – ALHAN SGI',
      responsibleRole: 'Coordenação de Formação Profissional',
      status: 'valido',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    setCertificates((prev) => [newCert, ...prev]);
    triggerNotification(
      'Certificado disponível',
      `Certificado Emitido: ${code}`,
      `O certificado de conclusão da formação "${enrollment.courseTitle}" encontra-se disponível.`,
      'ALUNO'
    );
    logActivity(`Certificado emitido (${code}) para ${enrollment.studentName}`);
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
    logActivity(`Submissão de formulário (${label}): ${item.contactName}`);

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
        testimonials,
        panelCredentials,
        updatePanelCredential,
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
        updateEnrollmentStatus,
        completeLesson,
        issueCertificate,
        addPresencialCertificate,
        updateCertificateStatus,
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
