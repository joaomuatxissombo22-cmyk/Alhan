import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';
import type {
  EnrollmentItem,
  CertificateRequestItem,
  AdminNotificationRecord,
  UserRole,
} from './data/initialData';

// Initialize Firebase App, Firestore Database & Storage with the provided project configuration
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export { firebaseConfig };

// Firestore Collections
export const enrollmentsCollection = collection(db, 'enrollments');
export const coursesCollection = collection(db, 'courses');
export const certificatesCollection = collection(db, 'certificates');
export const certificateRequestsCollection = collection(db, 'certificateRequests');
export const adminNotificationsCollection = collection(db, 'adminNotifications');
export const usersCollection = collection(db, 'users');

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export function sanitizeFirestoreId(rawId: string, fallbackPrefix = 'id'): string {
  const cleaned = (rawId || '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  return VALID_ID_REGEX.test(cleaned) && cleaned.length > 0 ? cleaned : `${fallbackPrefix}-${Date.now()}`;
}

/**
 * Stores a new Student (ALUNO) or Professor (PROFESSOR) registration in Firestore (/users/{userId})
 * with state 'PENDENTE' until approved by the Administrator.
 */
export async function saveUserRegistrationToFirestore(params: {
  uid: string;
  fullName: string;
  username: string;
  role: UserRole;
  companyId?: string;
  email?: string;
  phone?: string;
  status?: 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'ativo' | 'inativo';
}): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;

  const isCurrentAdmin = auth.currentUser.email === 'joaomuatxissombo22@gmail.com';
  const targetUid = isCurrentAdmin
    ? sanitizeFirestoreId(params.uid, 'usr')
    : sanitizeFirestoreId(auth.currentUser.uid, 'usr');
  const path = `users/${targetUid}`;

  const payload = {
    uid: targetUid,
    fullName: (params.fullName || 'Utilizador ALHAN').trim().slice(0, 120),
    username: (params.username || 'utilizador').trim().slice(0, 60),
    role: params.role,
    companyId: (params.companyId || 'ALHAN-FORMA').trim().slice(0, 128),
    status: params.status || ('PENDENTE' as const),
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', targetUid), payload);
    if (params.email || params.phone) {
      await setDoc(doc(db, 'users', targetUid, 'private', 'contact'), {
        uid: targetUid,
        email: (params.email || auth.currentUser.email || 'geral@alhan.pro').trim().slice(0, 160),
        phone: (params.phone || '+244 900 000 000').trim().slice(0, 40),
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.warn('Firestore user registration sync warning:', path, error);
  }
}

/**
 * Updates a Student or Professor account status in Firestore (/users/{userId}) to 'APROVADO', 'REJEITADO', or 'PENDENTE'.
 */
export async function updateUserApprovalInFirestore(
  uid: string,
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'ativo' | 'inativo'
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;

  const safeUid = sanitizeFirestoreId(uid, 'usr');
  const path = `users/${safeUid}`;

  try {
    await updateDoc(doc(db, 'users', safeUid), {
      status,
    });
  } catch (error) {
    console.warn('Firestore user approval update warning:', path, error);
  }
}

/**
 * Deletes a user registration record from Firestore (/users/{userId}).
 */
export async function deleteUserRegistrationFromFirestore(uid: string): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;

  const safeUid = sanitizeFirestoreId(uid, 'usr');
  const path = `users/${safeUid}`;

  try {
    await deleteDoc(doc(db, 'users', safeUid));
  } catch (error) {
    console.warn('Firestore user deletion warning:', path, error);
  }
}

/**
 * Deletes an enrollment record from Firestore (/enrollments/{enrollmentId}).
 */
export async function deleteEnrollmentFromFirestore(enrollmentId: string): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;

  const safeId = sanitizeFirestoreId(enrollmentId, 'enr');
  const path = `enrollments/${safeId}`;

  try {
    await deleteDoc(doc(db, 'enrollments', safeId));
  } catch (error) {
    console.warn('Firestore enrollment deletion warning:', path, error);
  }
}

/**
 * Module 4: Uploads a Certificate PDF to Firebase Storage under
 * certificates/{userId}/{courseId}/certificate.pdf
 * Validates PDF MIME type and size <= 10 MB.
 * Falls back gracefully to DataURL if Firebase Storage bucket is not yet provisioned in preview.
 */
export async function uploadCertificatePdfToStorage(params: {
  userId: string;
  courseId: string;
  file?: File;
  fallbackDataUrl?: string;
}): Promise<{ storagePath: string; downloadUrl: string }> {
  const safeUserId = sanitizeFirestoreId(params.userId, 'usr');
  const safeCourseId = sanitizeFirestoreId(params.courseId, 'course');
  const storagePath = `certificates/${safeUserId}/${safeCourseId}/certificate.pdf`;

  if (params.file) {
    const isPdf =
      params.file.type === 'application/pdf' ||
      params.file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      throw new Error('Formato de ficheiro inválido. Apenas ficheiros PDF (application/pdf) são aceites.');
    }
    const maxBytes = 10 * 1024 * 1024;
    if (params.file.size <= 0 || params.file.size > maxBytes) {
      throw new Error('O ficheiro PDF excede o tamanho máximo permitido de 10 MB.');
    }

    // Attempt Firebase Storage upload when authenticated
    if (auth.currentUser) {
      try {
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, params.file, {
          contentType: 'application/pdf',
          customMetadata: {
            userId: safeUserId,
            courseId: safeCourseId,
            issuedBy: auth.currentUser.email || 'admin@alhan.pro',
            issuedAt: new Date().toISOString(),
          },
        });
        const downloadUrl = await getDownloadURL(storageRef);
        return { storagePath, downloadUrl };
      } catch (err) {
        console.warn('Firebase Storage fallback to secure DataURL:', err);
      }
    }

    // Convert File to DataURL if Storage bucket is offline in preview
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Erro ao processar o ficheiro PDF.'));
      reader.readAsDataURL(params.file!);
    });
    return { storagePath, downloadUrl: dataUrl };
  }

  return {
    storagePath,
    downloadUrl: params.fallbackDataUrl || '',
  };
}

/**
 * Stores a Certificate Request in Firestore (/certificateRequests/{requestId})
 */
export async function saveCertificateRequestToFirestore(reqItem: CertificateRequestItem): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;

  const safeId = sanitizeFirestoreId(reqItem.id, 'creq');
  const safeUserId = sanitizeFirestoreId(auth.currentUser.uid, 'usr');
  const safeCourseId = sanitizeFirestoreId(reqItem.courseId, 'course');
  const path = `certificateRequests/${safeId}`;

  const payload = {
    id: safeId,
    userId: safeUserId,
    studentName: (reqItem.studentName || 'Formando ALHAN').trim().slice(0, 120),
    studentEmail: (reqItem.studentEmail || auth.currentUser.email || '').trim().slice(0, 160),
    courseId: safeCourseId,
    courseName: (reqItem.courseName || 'Formação ALHAN').trim().slice(0, 160),
    enrollmentDate: (reqItem.enrollmentDate || '').slice(0, 40),
    completionDate: (reqItem.completionDate || '').slice(0, 40),
    requestDate: (reqItem.requestDate || new Date().toISOString()).slice(0, 40),
    status: 'PENDENTE' as const,
    certificateStoragePath: '',
    certificateCode: (reqItem.certificateCode || '').slice(0, 80),
    issuedAt: '',
    issuedBy: '',
    adminNotes: (reqItem.studentNotes || '').slice(0, 1000),
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'certificateRequests', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Updates a Certificate Request in Firestore (/certificateRequests/{requestId}) by Admin
 */
export async function updateCertificateRequestInFirestore(
  requestId: string,
  updates: {
    status: 'PENDENTE' | 'EM PROCESSAMENTO' | 'APROVADO' | 'DISPONÍVEL' | 'REJEITADO';
    certificateStoragePath?: string;
    certificateCode?: string;
    issuedAt?: string;
    issuedBy?: string;
    adminNotes?: string;
  }
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;

  const safeId = sanitizeFirestoreId(requestId, 'creq');
  const path = `certificateRequests/${safeId}`;

  const payload: Record<string, unknown> = {
    status: updates.status,
  };
  if (updates.certificateStoragePath !== undefined) {
    payload.certificateStoragePath = updates.certificateStoragePath.slice(0, 500);
  }
  if (updates.certificateCode !== undefined) {
    payload.certificateCode = updates.certificateCode.slice(0, 80);
  }
  if (updates.issuedAt !== undefined) {
    payload.issuedAt = updates.issuedAt.slice(0, 40);
  }
  if (updates.issuedBy !== undefined) {
    payload.issuedBy = updates.issuedBy.slice(0, 120);
  }
  if (updates.adminNotes !== undefined) {
    payload.adminNotes = updates.adminNotes.slice(0, 1000);
  }

  try {
    await updateDoc(doc(db, 'certificateRequests', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Stores a private Admin Notification in Firestore (/adminNotifications/{notificationId})
 */
export async function saveAdminNotificationToFirestore(notif: AdminNotificationRecord): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;

  const safeId = sanitizeFirestoreId(notif.id, 'admnotif');
  const path = `adminNotifications/${safeId}`;

  const payload = {
    id: safeId,
    type: notif.type,
    title: (notif.title || 'Notificação Administrativa').trim().slice(0, 160),
    message: (notif.message || '').trim().slice(0, 1000),
    studentName: (notif.studentName || '').trim().slice(0, 120),
    courseName: (notif.courseName || '').trim().slice(0, 160),
    requestId: sanitizeFirestoreId(notif.requestId || 'req', 'req'),
    read: false,
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'adminNotifications', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Stores a new student enrollment and initial payment status in Firestore (/enrollments/{enrollmentId})
 * adhering strictly to the schema and security rules in firebase-blueprint.json & firestore.rules.
 */
export async function saveEnrollmentToFirestore(enrollment: EnrollmentItem): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;

  const safeId = sanitizeFirestoreId(enrollment.id, 'enr');
  const safeStudentId = sanitizeFirestoreId(auth.currentUser.uid, 'usr');
  const safeCourseId = sanitizeFirestoreId(enrollment.courseId, 'course');
  const path = `enrollments/${safeId}`;

  const payload = {
    id: safeId,
    studentId: safeStudentId,
    studentName: (enrollment.studentName || 'Formando ALHAN').trim().slice(0, 120),
    courseId: safeCourseId,
    courseTitle: (enrollment.courseTitle || 'Formação ALHAN').trim().slice(0, 160),
    modality: enrollment.modality,
    amountKz: Math.max(0, Number(enrollment.amountKz) || 0),
    paymentMethod: enrollment.paymentMethod,
    paymentReference: (enrollment.paymentReference || '').trim().slice(0, 120),
    receiptNote: (enrollment.receiptNote || '').trim().slice(0, 500),
    paymentStatus: 'PENDENTE' as const,
    progressPercent: 0,
    completed: false,
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'enrollments', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Updates a student's payment proof (paymentMethod, paymentReference, receiptNote) in Firestore.
 */
export async function updateEnrollmentPaymentInFirestore(
  enrollmentId: string,
  updates: {
    paymentMethod: EnrollmentItem['paymentMethod'];
    paymentReference: string;
    receiptNote: string;
  }
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;

  const safeId = sanitizeFirestoreId(enrollmentId, 'enr');
  const path = `enrollments/${safeId}`;

  try {
    await updateDoc(doc(db, 'enrollments', safeId), {
      paymentMethod: updates.paymentMethod,
      paymentReference: (updates.paymentReference || '').trim().slice(0, 120),
      receiptNote: (updates.receiptNote || '').trim().slice(0, 500),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Updates an enrollment's status (e.g. 'PENDENTE', 'APROVADO', 'REJEITADO', 'Pago', 'Pendente', 'Falhado', 'Cancelado', 'Reembolsado') in Firestore.
 */
export async function updateEnrollmentStatusInFirestore(
  enrollmentId: string,
  paymentStatus: EnrollmentItem['paymentStatus'] | 'PENDENTE' | 'APROVADO' | 'REJEITADO'
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;

  const safeId = sanitizeFirestoreId(enrollmentId, 'enr');
  const path = `enrollments/${safeId}`;

  try {
    await updateDoc(doc(db, 'enrollments', safeId), {
      paymentStatus,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Updates an enrollment's course completion progress in Firestore.
 */
export async function updateEnrollmentProgressInFirestore(
  enrollmentId: string,
  progressPercent: number,
  completed: boolean
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;

  const safeId = sanitizeFirestoreId(enrollmentId, 'enr');
  const path = `enrollments/${safeId}`;

  try {
    await updateDoc(doc(db, 'enrollments', safeId), {
      progressPercent: Math.min(100, Math.max(0, Math.round(progressPercent))),
      completed: Boolean(completed),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();
