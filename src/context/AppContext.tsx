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
} from '../data/initialData';

export interface ActiveUser {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  companyId: string;
  isDemoSession?: boolean;
}

interface AppContextValue {
  user: ActiveUser | null;
  authReady: boolean;
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
  activityLogs: { id: string; action: string; actor: string; timestamp: string }[];
  pushPermission: NotificationPermission | 'unsupported';
  requestPushPermission: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithCredentials: (identifier: string, password: string, selectedRole?: UserRole) => Promise<void>;
  registerAccount: (payload: {
    fullName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    role: UserRole;
    companyName?: string;
  }) => Promise<void>;
  switchRoleForDemo: (role: UserRole) => void;
  logout: () => Promise<void>;
  saveCourse: (course: CourseItem) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  addIsoStandard: (standard: IsoStandardItem) => void;
  createEnrollment: (payload: {
    course: CourseItem;
    modality: 'Online' | 'Presencial' | 'Híbrida';
    paymentMethod: EnrollmentItem['paymentMethod'];
    paymentReference: string;
    receiptNote: string;
  }) => Promise<EnrollmentItem>;
  updateEnrollmentStatus: (enrollmentId: string, status: EnrollmentItem['paymentStatus']) => Promise<void>;
  completeLesson: (enrollmentId: string, lessonId: string, totalLessons: number, quizScore?: number) => Promise<void>;
  issueCertificate: (enrollment: EnrollmentItem) => Promise<CertificateItem>;
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
  const [user, setUser] = useState<ActiveUser | null>(() => loadLocal<ActiveUser | null>('alhan_active_user', null));
  const [authReady, setAuthReady] = useState(false);

  const [courses, setCourses] = useState<CourseItem[]>(() => {
    const stored = loadLocal<CourseItem[]>('alhan_courses', INITIAL_COURSES);
    return stored.map((c) => {
      const initialMatch = INITIAL_COURSES.find((ic) => ic.id === c.id);
      return {
        ...initialMatch,
        ...c,
        imageUrl: c.imageUrl || initialMatch?.imageUrl || '/assets/aistudio/iso_a9fe34ed.jpg',
      };
    });
  });
  const [isoStandards, setIsoStandards] = useState<IsoStandardItem[]>(() => loadLocal('alhan_iso_standards', INITIAL_ISO_STANDARDS));
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>(() => loadLocal('alhan_enrollments', INITIAL_ENROLLMENTS));
  const [certificates, setCertificates] = useState<CertificateItem[]>(() => loadLocal('alhan_certificates', INITIAL_CERTIFICATES));
  const [isoProjects, setIsoProjects] = useState<IsoProjectItem[]>(() => loadLocal('alhan_iso_projects', INITIAL_ISO_PROJECTS));
  const [isoDocuments, setIsoDocuments] = useState<IsoDocumentItem[]>(() => loadLocal('alhan_iso_documents', INITIAL_ISO_DOCUMENTS));
  const [isoAudits, setIsoAudits] = useState<IsoAuditItem[]>(() => loadLocal('alhan_iso_audits', INITIAL_ISO_AUDITS));
  const [nonConformities, setNonConformities] = useState<NonConformityItem[]>(() => loadLocal('alhan_ncs', INITIAL_NON_CONFORMITIES));
  const [diagnosticRequests, setDiagnosticRequests] = useState<DiagnosticRequestItem[]>(() => loadLocal('alhan_diagnostics', []));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadLocal('alhan_notifications', INITIAL_NOTIFICATIONS));
  const [activityLogs, setActivityLogs] = useState<{ id: string; action: string; actor: string; timestamp: string }[]>(() =>
    loadLocal('alhan_activity_logs', [
      { id: 'log-1', action: 'Inicialização da Plataforma ALHAN – SGI', actor: 'Sistema', timestamp: new Date().toISOString() },
    ])
  );

  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  // Persist state locally for instant offline support across Angolan provinces
  useEffect(() => { localStorage.setItem('alhan_active_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('alhan_courses', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('alhan_iso_standards', JSON.stringify(isoStandards)); }, [isoStandards]);
  useEffect(() => { localStorage.setItem('alhan_enrollments', JSON.stringify(enrollments)); }, [enrollments]);
  useEffect(() => { localStorage.setItem('alhan_certificates', JSON.stringify(certificates)); }, [certificates]);
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
          isDemoSession: false,
        };
        setUser(active);

        // Sync user profile to Firestore if verified
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
            // Non-blocking if document already exists with immutable createdAt
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
            prev.forEach((c) => mergedMap.set(c.id, c));
            remoteCourses.forEach((c) => mergedMap.set(c.id, c));
            return Array.from(mergedMap.values());
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

  const loginWithCredentials = async (identifier: string, _password: string, selectedRole: UserRole = 'ALUNO') => {
    const cleanId = identifier.trim() || 'utilizador@alhan.pro';
    const isSuperAdmin = cleanId.toLowerCase() === 'joaomuatxissombo22@gmail.com' || selectedRole === 'SUPER_ADMIN';
    const role: UserRole = isSuperAdmin ? 'SUPER_ADMIN' : selectedRole;
    const newUser: ActiveUser = {
      uid: role === 'ALUNO' ? 'demo-aluno-01' : role === 'CLIENTE_EMPRESARIAL' ? 'demo-empresa-01' : `user-${role.toLowerCase()}`,
      fullName:
        role === 'SUPER_ADMIN'
          ? 'Super Administrador ALHAN'
          : role === 'ADMIN'
          ? 'Gestor Operacional ALHAN'
          : role === 'PROFESSOR'
          ? 'Eng.º Formador SGI (ALHAN)'
          : role === 'CLIENTE_EMPRESARIAL'
          ? '[DEMO] Empresa Industrial de Luanda, Lda'
          : '[DEMO] Manuel João Mateus',
      username: cleanId.split('@')[0],
      email: cleanId.includes('@') ? cleanId : `${cleanId}@alhan.pro`,
      phone: '+244 922 021 211',
      role,
      companyId: role === 'CLIENTE_EMPRESARIAL' ? 'demo-empresa-01' : 'alhan-sgi',
      isDemoSession: true,
    };
    setUser(newUser);
    logActivity(`Sessão iniciada com perfil ${role}`, newUser.fullName);
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
    const newUid = `usr-${Date.now()}`;
    const newUser: ActiveUser = {
      uid: newUid,
      fullName: payload.fullName.trim(),
      username: payload.username.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      role: payload.role,
      companyId: payload.role === 'CLIENTE_EMPRESARIAL' ? newUid : 'alhan-aluno',
      isDemoSession: true,
    };
    setUser(newUser);
    triggerNotification('Novo registo', 'Conta Criada com Sucesso', `Bem-vindo(a) à plataforma ALHAN SGI, ${newUser.fullName}.`, payload.role);
    logActivity(`Novo registo de utilizador (${payload.role}): ${newUser.fullName}`, newUser.fullName);
  };

  const switchRoleForDemo = (role: UserRole) => {
    loginWithCredentials(`${role.toLowerCase()}@alhan.pro`, 'demo', role);
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

  const createEnrollment = async (payload: {
    course: CourseItem;
    modality: 'Online' | 'Presencial' | 'Híbrida';
    paymentMethod: EnrollmentItem['paymentMethod'];
    paymentReference: string;
    receiptNote: string;
  }) => {
    const studentId = auth.currentUser?.uid || user?.uid || 'demo-aluno-01';
    const studentName = user?.fullName || '[DEMO] Manuel João Mateus';
    const enrollmentId = `enr-${Date.now()}`;
    const newEnrollment: EnrollmentItem = {
      id: enrollmentId,
      studentId,
      studentName,
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
        `O pagamento da formação "${target.courseTitle}" para ${target.studentName} foi validado com sucesso.`,
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
      courseId: enrollment.courseId,
      courseTitle: enrollment.courseTitle,
      workloadHours: course?.durationHours || 24,
      issuedDate: new Date().toISOString().split('T')[0],
      responsibleName: 'Direcção Pedagógica – ALHAN SGI',
      responsibleRole: 'Coordenação de Formação Profissional',
      status: 'valido',
      isDemo: enrollment.studentName.includes('[DEMO]'),
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
        activityLogs,
        pushPermission,
        requestPushPermission,
        loginWithGoogle,
        loginWithCredentials,
        registerAccount,
        switchRoleForDemo,
        logout,
        saveCourse,
        deleteCourse,
        addIsoStandard,
        createEnrollment,
        updateEnrollmentStatus,
        completeLesson,
        issueCertificate,
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
