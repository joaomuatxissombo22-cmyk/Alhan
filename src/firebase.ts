import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { EnrollmentItem } from './data/initialData';

// Initialize Firebase App & Firestore Database with the provided project configuration
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { firebaseConfig };

// Firestore Collections
export const enrollmentsCollection = collection(db, 'enrollments');
export const coursesCollection = collection(db, 'courses');
export const certificatesCollection = collection(db, 'certificates');
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

function sanitizeFirestoreId(rawId: string, fallbackPrefix = 'id'): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  return VALID_ID_REGEX.test(cleaned) && cleaned.length > 0 ? cleaned : `${fallbackPrefix}-${Date.now()}`;
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
    paymentStatus: 'Pendente' as const,
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
 * Updates an enrollment's payment status (e.g. 'Pago', 'Pendente', 'Falhado', 'Cancelado', 'Reembolsado') in Firestore.
 */
export async function updateEnrollmentStatusInFirestore(
  enrollmentId: string,
  paymentStatus: EnrollmentItem['paymentStatus']
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
