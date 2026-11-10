import courseAuditorLiderImg from '../assets/images/course_auditor_lider_iso_1793974810382.jpg';
import courseIso9001Img from '../assets/images/course_iso_9001_qualidade_1793974811166.jpg';
import courseIso14001Img from '../assets/images/course_iso_14001_ambiental_1793974812059.jpg';
import courseIso45001Img from '../assets/images/course_iso_45001_sst_1793974813246.jpg';
import courseComplianceImg from '../assets/images/course_compliance_governanca_1793974813533.jpg';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PROFESSOR' | 'ALUNO' | 'CLIENTE_EMPRESARIAL';

export interface LessonItem {
  id: string;
  title: string;
  durationMinutes: number;
  videoUrl: string;
  materialTitle: string;
  materialSummary: string;
  quizQuestion: string;
  quizOptions: string[];
  quizCorrectIndex: number;
}

export interface ModuleItem {
  id: string;
  title: string;
  lessons: LessonItem[];
}

export interface CourseItem {
  id: string;
  title: string;
  category: string;
  modality: 'Online' | 'Presencial' | 'Híbrida';
  priceKz: number;
  durationHours: number;
  lessonsCount: number;
  instructorName: string;
  instructorId: string;
  published: boolean;
  imageUrl: string;
  description: string;
  objectives: string;
  syllabus: string;
  modules: ModuleItem[];
  liveSessionLink?: string;
  livePlatform?: 'Microsoft Teams' | 'Zoom' | 'Google Meet' | 'Jitsi';
  featured?: boolean;
  featuredBadge?: string;
  firstInstallmentKz?: number;
  secondInstallmentKz?: number;
  courseStartDate?: string;
  blackFridayDiscountPercent?: number;
  createdAt: string;
}

export const ALHAN_COUPON_CODE = 'SOUALHAN';
export const ALHAN_COUPON_DISCOUNT_PERCENT = 25;
export const ALHAN_BLACK_FRIDAY_DISCOUNT_PERCENT = 15;

export interface CourseDiscountCalculation {
  originalPriceKz: number;
  blackFridayApplied: boolean;
  blackFridayPercent: number;
  blackFridayPriceKz: number;
  couponCode: string;
  couponValid: boolean;
  couponPercent: number;
  effectiveDiscountPercent: number;
  finalPriceKz: number;
  savingsKz: number;
  firstInstallmentKz: number;
  secondInstallmentKz: number;
  discountBadgeLabel: string;
}

export function calculateCourseDiscountedPricing(
  basePriceKz: number,
  rawCouponCode?: string,
  applyBlackFriday = true
): CourseDiscountCalculation {
  const safeBase = Math.max(0, Number(basePriceKz) || 0);
  const normalizedCoupon = (rawCouponCode || '').trim().toUpperCase();
  const couponValid = normalizedCoupon === ALHAN_COUPON_CODE;
  const blackFridayPercent = applyBlackFriday ? ALHAN_BLACK_FRIDAY_DISCOUNT_PERCENT : 0;
  const couponPercent = couponValid ? ALHAN_COUPON_DISCOUNT_PERCENT : 0;

  // Black Friday Novembro gives 15% off all training courses; Coupon SOUALHAN gives 25% off
  // When coupon SOUALHAN is applied on top of Black Friday or standalone, we apply 25% coupon (or 15% Black Friday + 25% Coupon = 25% or combined; let's make SOUALHAN apply 25% off, and if both are active let's clearly show both and apply the 25% SOUALHAN or cumulative 36.25% / 25% — wait: user asked "incluir cupom de disconto de 25% de desconto tilo do cupom SOUALHAN, e incluir blackfriday Novembro nas formaçãoes desconto de 15%").
  // Let's make Black Friday Novembro (15% off) the automatic campaign price on courses, and when the user enters SOUALHAN (25% off), they get the 25% discount (or if they stack, let's check: 25% discount when SOUALHAN is used, or 15% Black Friday default). Even better: let's support both clearly! If couponValid is true, effectiveDiscountPercent = 25 (or if stacking is desired, let's check: usually a 25% coupon `SOUALHAN` gives 25% discount, while Black Friday Novembro gives 15% discount on courses by default). Let's also allow the user/student to see the Black Friday 15% price and apply `SOUALHAN` for 25% discount (or 15% + 25% = 40% if stacked? Wait: "incluir cupom de disconto de 25% de desconto tilo do cupom SOUALHAN, e incluir blackfriday Novembro nas formaçãoes desconto de 15%"). Having Black Friday 15% by default on formations and 25% when coupon SOUALHAN is applied (or 15% Black Friday + 25% Coupon SOUALHAN) — let's make `blackFridayPriceKz = Math.round(safeBase * 0.85)` (15% off) and when `SOUALHAN` is applied, `finalPriceKz = Math.round(safeBase * 0.75)` (25% off) or if applied on Black Friday course price, let's check what is clearest: showing Original Price, Black Friday Novembro (-15%), and Cupom SOUALHAN (-25%). Let's make `effectiveDiscountPercent = couponValid ? 25 : (applyBlackFriday ? 15 : 0)` AND also expose `blackFridayPriceKz` so both 15% (Black Friday Novembro) and 25% (Cupom SOUALHAN) are crystal-clear!
  const blackFridayPriceKz = Math.round(safeBase * (1 - ALHAN_BLACK_FRIDAY_DISCOUNT_PERCENT / 100));
  const effectiveDiscountPercent = couponValid
    ? ALHAN_COUPON_DISCOUNT_PERCENT
    : applyBlackFriday
    ? ALHAN_BLACK_FRIDAY_DISCOUNT_PERCENT
    : 0;
  const finalPriceKz = Math.round(safeBase * (1 - effectiveDiscountPercent / 100));
  const savingsKz = Math.max(0, safeBase - finalPriceKz);
  const firstInstallmentKz = Math.round(finalPriceKz / 2);
  const secondInstallmentKz = Math.max(0, finalPriceKz - firstInstallmentKz);

  const discountBadgeLabel = couponValid
    ? `Cupom ${ALHAN_COUPON_CODE} (-25%) Aplicado`
    : applyBlackFriday
    ? 'Black Friday Novembro (-15%)'
    : 'Preço Normal';

  return {
    originalPriceKz: safeBase,
    blackFridayApplied: applyBlackFriday,
    blackFridayPercent,
    blackFridayPriceKz,
    couponCode: couponValid ? ALHAN_COUPON_CODE : normalizedCoupon,
    couponValid,
    couponPercent,
    effectiveDiscountPercent,
    finalPriceKz,
    savingsKz,
    firstInstallmentKz,
    secondInstallmentKz,
    discountBadgeLabel,
  };
}

export interface IsoStandardItem {
  id: string;
  code: string;
  name: string;
  description: string;
  objective: string;
  benefits: string[];
  applicability: string;
  sectorsInAngola: string[];
}

export type InstallmentStatus = 'Pendente' | 'Pago' | 'Em atraso';

export interface PaymentHistoryEntry {
  id: string;
  installment: '1ª Parcela' | '2ª Parcela' | 'Pagamento Integral';
  installmentLabel?: string;
  amountKz: number;
  dueDate: string;
  paidAt?: string;
  recordedAt?: string;
  method: string;
  reference: string;
  status: InstallmentStatus;
  confirmedBy?: string;
  note?: string;
}

export interface DataAuditCandidateItem {
  id: string;
  category: 'FORMANDO' | 'INSCRICAO' | 'CERTIFICADO' | 'SOLICITACAO_CERTIFICADO';
  title: string;
  subtitle?: string;
  identifier: string;
  reason: string;
  classification:
    | 'REGISTO_TESTE_INICIAL'
    | 'DUPLICADO'
    | 'SEM_VALIDADE_REAL'
    | 'DADO_LEGITIMO_PRESERVADO';
  recommendedAction: 'ELIMINAR_APOS_CONFIRMACAO' | 'PRESERVAR';
  suggestedForDeletion?: boolean;
  createdAt: string;
}

export interface EnrollmentItem {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  studentEmail?: string;
  studentBI?: string;
  courseId: string;
  courseTitle: string;
  modality: 'Online' | 'Presencial' | 'Híbrida';
  amountKz: number;
  originalAmountKz?: number;
  discountPercent?: number;
  appliedCoupon?: string;
  blackFridayApplied?: boolean;
  paymentMethod:
    | 'Express Angola'
    | 'BANCO SOL (IBAN)'
    | 'Unitel Money'
    | 'Africell Money'
    | 'KWiK'
    | 'Transferência / Comprovativo';
  paymentReference: string;
  receiptNote: string;
  receiptFileUrl?: string;
  receiptFileName?: string;
  paymentStatus: 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'Pendente' | 'Pago' | 'Falhado' | 'Cancelado' | 'Reembolsado';
  enrollmentApprovalStatus?: 'pendente' | 'aprovado' | 'rejeitado';
  firestoreStatus?: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  decidedBy?: string;
  decidedByEmail?: string;
  decidedAt?: string;
  decisionNotes?: string;
  courseStartDate?: string;
  firstInstallmentAmountKz?: number;
  firstInstallmentDueDate?: string;
  firstInstallmentStatus?: InstallmentStatus;
  firstInstallmentPaidAt?: string;
  firstInstallmentReference?: string;
  secondInstallmentAmountKz?: number;
  secondInstallmentDueDate?: string;
  secondInstallmentStatus?: InstallmentStatus;
  secondInstallmentPaidAt?: string;
  secondInstallmentReference?: string;
  secondInstallmentNotifiedAt?: string;
  paymentHistory?: PaymentHistoryEntry[];
  progressPercent: number;
  completedLessons: string[];
  quizScore?: number;
  completed: boolean;
  certificateRequested?: boolean;
  certificateRequestedAt?: string;
  certificateRequestName?: string;
  certificateRequestBI?: string;
  certificateRequestEmail?: string;
  certificateRequestPhone?: string;
  certificateRequestNotes?: string;
  certificateSentAt?: string;
  certificateId?: string;
  enrolledAt?: string;
  createdAt: string;
}

export type CertificateRequestStatus =
  | 'NÃO SOLICITADO'
  | 'PENDENTE'
  | 'EM PROCESSAMENTO'
  | 'APROVADO'
  | 'DISPONÍVEL'
  | 'REJEITADO';

export interface CertificateAuditEntry {
  id: string;
  action:
    | 'SOLICITADO'
    | 'EM_ANALISE'
    | 'APROVADO'
    | 'EMITIDO_E_DISPONIBILIZADO'
    | 'REJEITADO'
    | 'SUBSTITUIDO'
    | 'REVOGADO';
  statusAfter: CertificateRequestStatus;
  actorName: string;
  actorRole: 'ALUNO' | 'ADMIN' | 'SUPER_ADMIN';
  notes: string;
  timestamp: string;
}

export interface CertificateRequestItem {
  id: string;
  enrollmentId: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentBI?: string;
  courseId: string;
  courseName: string;
  modality?: 'Online' | 'Presencial' | 'Híbrida';
  workloadHours?: number;
  enrollmentDate: string;
  completionDate: string;
  requestDate: string;
  studentNotes: string;
  status: CertificateRequestStatus;
  certificateStoragePath: string;
  certificateFileUrl: string;
  certificateFileName: string;
  certificateCode: string;
  issuedAt: string;
  issuedBy: string;
  adminNotes: string;
  rejectionReason?: string;
  revocationReason?: string;
  revokedAt?: string;
  revokedBy?: string;
  auditHistory: CertificateAuditEntry[];
  createdAt: string;
}

export interface AdminNotificationRecord {
  id: string;
  type:
    | 'SOLICITACAO_CERTIFICADO'
    | 'NOVA_INSCRICAO'
    | 'NOVO_FORMANDO'
    | 'PAGAMENTO_REGISTADO'
    | 'NOVA_FORMACAO'
    | 'AUDITORIA_CERTIFICADO';
  title: string;
  message: string;
  studentName: string;
  courseName: string;
  requestId: string;
  read: boolean;
  createdAt: string;
}

export interface CertificateItem {
  id: string;
  code: string;
  studentId: string;
  studentName: string;
  studentBI?: string;
  studentPhone?: string;
  studentEmail?: string;
  courseId: string;
  courseTitle: string;
  modality?: 'Online' | 'Presencial' | 'Híbrida';
  workloadHours: number;
  grade?: string;
  issuedDate: string;
  issuedAt?: string;
  responsibleName: string;
  responsibleRole: string;
  status: 'valido' | 'cancelado' | 'expirado';
  certificateFileUrl?: string;
  certificateFileName?: string;
  certificateStoragePath?: string;
  revocationReason?: string;
  revokedBy?: string;
  revokedAt?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface IsoProjectItem {
  id: string;
  companyId: string;
  companyName: string;
  standards: string;
  status: 'Diagnóstico' | 'Mapeamento' | 'Implementação' | 'Auditoria Interna' | 'Concluído';
  executionPercent: number;
  nextActivity: string;
  tasks: { id: string; title: string; dueDate: string; done: boolean }[];
  isDemo?: boolean;
  createdAt: string;
}

export interface IsoDocumentItem {
  id: string;
  code: string;
  title: string;
  category: 'Políticas' | 'Manuais' | 'Procedimentos' | 'Instruções de trabalho' | 'Formulários' | 'Registos' | 'Matrizes' | 'Planos' | 'Relatórios';
  standard: string;
  processName: string;
  version: string;
  responsibleName: string;
  approverName: string;
  status: 'Rascunho' | 'Em revisão' | 'Aprovado' | 'Obsoleto';
  companyId: string;
  changeHistory: string[];
  createdAt: string;
}

export interface IsoAuditItem {
  id: string;
  companyId: string;
  companyName: string;
  standard: string;
  processName: string;
  auditorName: string;
  auditDate: string;
  location: string;
  criteria: string;
  classification: 'Conformidade' | 'Não conformidade' | 'Observação' | 'Oportunidade de melhoria';
  findings: string;
  evidenceNote: string;
  createdAt: string;
}

export interface NonConformityItem {
  id: string;
  code: string;
  companyId: string;
  companyName: string;
  processName: string;
  standard: string;
  problemDescription: string;
  evidence: string;
  immediateAction: string;
  rootCause: string;
  correctiveAction: string;
  responsibleName: string;
  deadline: string;
  executionEvidence: string;
  effectivenessCheck: string;
  status: 'Aberta' | 'Em tratamento' | 'Aguardando verificação' | 'Concluída' | 'Reaberta';
  createdAt: string;
}

export interface DiagnosticRequestItem {
  id: string;
  type: 'diagnostico' | 'contacto' | 'inscricao_presencial';
  companyName: string;
  contactName: string;
  role: string;
  phone: string;
  whatsapp: string;
  email: string;
  province: string;
  sector: string;
  employeesCount: string;
  targetStandard: string;
  existingSystem?: string;
  hasCertification?: string;
  objective: string;
  message: string;
  userId: string;
  status: 'Novo' | 'Em análise' | 'Respondido' | 'Concluído';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  category:
    | 'Novo registo'
    | 'Nova inscrição'
    | 'Pagamento pendente'
    | 'Pagamento aprovado'
    | 'Nova aula'
    | 'Novo material'
    | 'Nova avaliação'
    | 'Certificado disponível'
    | 'Nova mensagem'
    | 'Nova tarefa empresarial'
    | 'Prazo próximo'
    | 'Nova auditoria'
    | 'Não conformidade'
    | 'Acção correctiva';
  title: string;
  message: string;
  targetRole: UserRole | 'ALL';
  read: boolean;
  createdAt: string;
}

export interface AdminEmailNotificationItem {
  id: string;
  recipientEmail: string;
  panelOrigin:
    | 'PAINEL_PROFESSOR'
    | 'PAINEL_ALUNO'
    | 'PAINEL_EMPRESA'
    | 'INSCRICAO_CURSO'
    | 'SOLICITACAO_CERTIFICADO';
  subject: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  details: string;
  createdAt: string;
}

export const COMPANY_INFO = {
  legalName: 'ALHAN CONSULTORIA E PRESTAÇÃO DE SERVIÇOS, LDA',
  brandName: 'ALHAN – SISTEMA DE GESTÃO INTEGRADO',
  nif: '5003128261',
  location: 'Luanda, Angola',
  address: 'Centralidade do Kilamba, Vivenda casa nº 100, Luanda, Angola',
  email: 'geral@alhan.pro',
  phone: '+244 922 021 211',
  whatsappNumber: '244922021211',
  whatsappDefaultMessage: 'Olá, gostaria de obter informações sobre os serviços e formações da Alhan.',
  website: 'alhan.pro',
  domainUrl: 'https://alhan.pro',
  adminSublinkUrl: 'https://alhan.pro/gestao-alhan-sgi',
  adminAltSublinkUrl: 'https://alhan.pro/painel-admin',
  adminSubdomainUrl: 'https://admin.alhan.pro',
  instagram: 'alhan.sgi',
  instagramUrl: 'https://www.instagram.com/alhan.sgi',
  facebookLabel: 'Página Oficial da Alhan',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61573334174565',
  logoPath: '/assets/aistudio/LOGOTIPO_ALHAN-02_b8f5e974.png',
  teamFieldImage: '/assets/aistudio/imagm_da_alha_2a7ca3f2.png',
  sgiFlyerImage: '/assets/aistudio/Forma__o_HSE__Turma_de_Novembro_eeeafbbb.png',
  hseFlyerImage: '/assets/aistudio/Forma__o_HSE__Turma_de_Novembro_eeeafbbb.png',
  isoFlyerImage: '/assets/aistudio/iso_a9fe34ed.jpg',
  paymentChannels: {
    expressNumbers: ['927496287', '927099484'],
    iban: '0044 0000 56903729141 08',
    ibanFormatted: 'AO06 0044 0000 5690 3729 1410 8',
    bankName: 'BANCO SOL',
    accountHolder: 'Graciete Garcia',
    proofWhatsApp: '+244 922 021 211',
    proofWhatsAppNumber: '244922021211',
    proofEmail: 'geral@alhan.pro',
    sameBankValidationRule: 'O pagamento é validado no mesmo dia quando efectuado pelo mesmo banco (BANCO SOL) ou via Multicaixa Express.',
    interbankValidationRule: 'Caso a transferência seja de um banco diferente (interbancária), leva até 24 horas (24h) para ser validado.',
    enrollmentFirstRule: 'No acto de pagamento, o aluno deve primeiro realizar a sua inscrição na formação pretendida na plataforma antes de enviar o comprovativo.',
  },
  certificationDisclaimer:
    'A Alhan Consultoria actua como empresa de consultoria, formação e implementação de Sistemas de Gestão. Não somos organismo de certificação nem organismo de acreditação. A certificação é realizada por organismo de certificação independente, de acordo com o respectivo processo de auditoria e decisão.',
};

export interface PanelCredentialItem {
  role: UserRole;
  panelName: string;
  route: string;
  username: string;
  email: string;
  password: string;
  description: string;
}

export const INITIAL_PANEL_CREDENTIALS: PanelCredentialItem[] = [
  {
    role: 'ADMIN',
    panelName: 'Painel do Administrador Único ALHAN (Controlo Total)',
    route: '/gestao-alhan-sgi',
    username: 'alhan.admin',
    email: 'admin@alhan.pro',
    password: 'Alhan@2026',
    description: 'Administrador único com acesso total: aceita professores, controla alunos, gere cursos/videoaulas/materiais, valida pagamentos e emite certificados PDF (máx. 2MB).',
  },
  {
    role: 'PROFESSOR',
    panelName: 'Painel do Professor / Formador',
    route: '/professor',
    username: 'professor',
    email: 'professor@alhan.pro',
    password: 'user',
    description: 'Público para inscrição de novos professores/formadores · Acesso interno libertado após autorização administrativa.',
  },
  {
    role: 'CLIENTE_EMPRESARIAL',
    panelName: 'Painel de Cliente Empresarial (Consultoria ISO)',
    route: '/empresa',
    username: 'empresa',
    email: 'empresa@alhan.pro',
    password: 'user',
    description: 'Acompanhamento de projectos ISO, gestão documental, auditorias internas e não conformidades.',
  },
  {
    role: 'ALUNO',
    panelName: 'Painel do Aluno (Academia LMS)',
    route: '/aluno',
    username: 'aluno',
    email: 'aluno@alhan.pro',
    password: 'user',
    description: 'Acesso aos cursos inscritos, aulas em vídeo, materiais, solicitação e download de certificados em PDF.',
  },
];

export interface HeroSlideItem {
  id: string;
  kicker: string;
  headline: string;
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  description: string;
  highlights: string[];
  image: string;
  thumbnailLabel: string;
  caption: string;
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; to: string };
}

export const HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 'slide-sgi-destaque',
    kicker: 'FORMAÇÃO EM SISTEMA DE GESTÃO INTEGRADO (SGI) · ANGOLA & MUNDO',
    headline: 'Formação em SGI (ISO 9001, ISO 14001 e ISO 45001) e HSE.',
    headlinePrefix: 'Formação Especializada em ',
    headlineHighlight: 'Sistema de Gestão Integrado (SGI) & HSE',
    headlineSuffix: ' em Angola.',
    description:
      'Invista no seu conhecimento e lidere a implementação de Qualidade (ISO 9001), Ambiente (ISO 14001) e Segurança e Saúde no Trabalho (ISO 45001 / HSE). Assista ao vídeo motivacional sobre a Formação SGI e inscreva-se já!',
    highlights: [
      'Formação SGI e HSE Online (Microsoft Teams) & Presencial em Luanda',
      'Certificado Reconhecido em PDF com Validação Pública QR Code',
      'Videoaulas Gravadas, Material Didático em PDF e Aplicação Prática',
    ],
    image: '/assets/aistudio/sgi_764c3f34.jpg',
    thumbnailLabel: 'Formação SGI',
    caption: 'Formação em Sistema de Gestão Integrado (SGI) — ISO 9001 · ISO 14001 · ISO 45001 · Luanda, Angola',
    primaryCta: { label: 'Inscrever-se Agora na Formação SGI', to: '/formacoes' },
    secondaryCta: { label: 'Política e Canais de Pagamento', to: '/politica-pagamentos' },
  },
  {
    id: 'slide-hse-novembro',
    kicker: 'FORMAÇÃO EM DESTAQUE · TURMA DE NOVEMBRO · VAGAS LIMITADAS',
    headline: 'Formação em HSE: Saúde, Segurança e Meio Ambiente.',
    headlinePrefix: 'Formação em ',
    headlineHighlight: 'HSE – Saúde, Segurança e Meio Ambiente',
    headlineSuffix: ' (Turma de Novembro).',
    description:
      'Invista em conhecimento, transforme o futuro da sua empresa! Promova um ambiente de trabalho seguro, saudável e sustentável com Certificado Reconhecido, Material Didático, Professores Experientes e Aplicação Prática.',
    highlights: [
      'Modalidades: Online via Microsoft Teams & Presencial (Vagas Limitadas)',
      'Certificado Reconhecido com validação pública por QR Code',
      'Material Didático completo, Professores Experientes e Aplicação Prática',
    ],
    image: '/assets/aistudio/Forma__o_HSE__Turma_de_Novembro_eeeafbbb.png',
    thumbnailLabel: 'Formação HSE',
    caption: 'Formação em HSE – Saúde, Segurança e Meio Ambiente · Turma de Novembro (Online via Teams & Presencial)',
    primaryCta: { label: 'Inscreva-se Já na Turma de Novembro', to: '/formacoes' },
    secondaryCta: { label: 'Política e Canais de Pagamento', to: '/politica-pagamentos' },
  },
  {
    id: 'slide-1',
    kicker: 'ALHAN – SISTEMA DE GESTÃO INTEGRADO · LUANDA, ANGOLA',
    headline: 'Transformamos requisitos em Sistemas de Gestão que geram resultados.',
    headlinePrefix: 'Transformamos requisitos em ',
    headlineHighlight: 'Sistemas de Gestão',
    headlineSuffix: ' que geram resultados.',
    description:
      'Apoiamos organizações na implementação de Sistemas de Gestão alinhados às normas ISO, através de consultoria, formação profissional, auditoria interna, organização de processos e preparação para certificação.',
    highlights: [
      'Implementação SGI em 14 etapas metodológicas',
      'Acompanhamento técnico presencial e online em Angola',
      'Portal exclusivo para gestão documental e RNCs',
    ],
    image: '/assets/aistudio/imagm_da_alha_2a7ca3f2.png',
    thumbnailLabel: 'Consultoria SGI',
    caption: 'Equipa Técnica ALHAN · Consultoria e Acompanhamento no Terreno em Angola',
    primaryCta: { label: 'Solicitar Diagnóstico', to: '/solicitar-diagnostico' },
    secondaryCta: { label: 'Conhecer as Formações', to: '/formacoes' },
  },
  {
    id: 'slide-2',
    kicker: 'ACADEMIA ALHAN · FORMAÇÃO PROFISSIONAL CERTIFICADA',
    headline: 'Formação em Sistema de Gestão Integrado: ISO 9001, ISO 14001 e ISO 45001.',
    headlinePrefix: 'Formação Especializada em ',
    headlineHighlight: 'ISO 9001, 14001 e 45001',
    headlineSuffix: ' com Certificado QR.',
    description:
      'Capacite a sua equipa nos referenciais internacionais de Qualidade, Ambiente e Segurança e Saúde no Trabalho nas modalidades Online, Presencial e Híbrida com certificado validável por QR Code.',
    highlights: [
      '10 cursos técnicos com vídeo-aulas e materiais protegidos',
      'Modalidades Online, Presencial em Luanda e Híbrida',
      'Certificados com código único e validação pública QR',
    ],
    image: '/assets/aistudio/iso_a9fe34ed.jpg',
    thumbnailLabel: 'Formação ISO',
    caption: 'Formação Especializada SGI · Qualidade, Ambiente e Segurança (ISO 9001 | 14001 | 45001)',
    primaryCta: { label: 'Inscrever-se nas Formações', to: '/formacoes' },
    secondaryCta: { label: 'Consultar Certificado QR', to: '/consultar-certificado' },
  },
  {
    id: 'slide-3',
    kicker: 'AUDITORIAS INTERNAS · DIRETRIZES ISO 19011',
    headline: 'Auditorias Internas, Diagnóstico de Lacunas e Preparação para Certificação.',
    headlinePrefix: 'Auditorias Internas, ',
    headlineHighlight: 'Diagnóstico Gap Analysis',
    headlineSuffix: ' e Pré-Certificação.',
    description:
      'Realizamos diagnósticos técnicos, mapeamento de processos, tratamento de não conformidades e auditorias internas segundo a norma ISO 19011 nas 14 etapas metodológicas da ALHAN.',
    highlights: [
      'Auditorias internas independentes segundo a ISO 19011',
      'Análise de causa raiz e planos de acção correctiva',
      'Simulação técnica de pré-auditoria para Fase 1 e Fase 2',
    ],
    image: courseAuditorLiderImg,
    thumbnailLabel: 'Auditoria 19011',
    caption: 'Auditoria Interna e Formação de Auditores Líderes segundo a ISO 19011',
    primaryCta: { label: 'Solicitar Diagnóstico Empresarial', to: '/solicitar-diagnostico' },
    secondaryCta: { label: 'Metodologia em 14 Etapas', to: '/consultoria-iso' },
  },
  {
    id: 'slide-4',
    kicker: 'AMBIENTE E SEGURANÇA · OPERAÇÕES INDUSTRIAIS EM ANGOLA',
    headline: 'Gestão Ambiental, Segurança no Trabalho e Controlo Operacional.',
    headlinePrefix: 'Gestão Ambiental ',
    headlineHighlight: 'ISO 14001 e SST ISO 45001',
    headlineSuffix: ' para Operações Seguras.',
    description:
      'Implementamos matrizes de levantamento de aspectos e impactos ambientais (LAIA), planos de gestão de resíduos e análises preliminares de risco (APR) no terreno.',
    highlights: [
      'Matrizes LAIA e Planos de Gestão Ambiental (PGA)',
      'Identificação de perigos e hierarquia de controlos SST',
      'Redução de sinistralidade e conformidade operacional',
    ],
    image: courseIso14001Img,
    thumbnailLabel: 'Ambiente & SST',
    caption: 'Consultoria Ambiental, Ecoeficiência e Segurança Operacional',
    primaryCta: { label: 'Ver Normas ISO Aplicáveis', to: '/normas-iso' },
    secondaryCta: { label: 'Portal de Clientes Empresariais', to: '/empresa' },
  },
  {
    id: 'slide-5',
    kicker: 'GOVERNANÇA, RISCO E CONFORMIDADE · ISO 37001 & 37301',
    headline: 'Programas de Compliance, Gestão de Riscos e Integridade Corporativa.',
    headlinePrefix: 'Programas de ',
    headlineHighlight: 'Compliance e Gestão de Riscos',
    headlineSuffix: ' para Empresas Sólidas.',
    description:
      'Estruturamos políticas anticorrupção, due diligence de fornecedores, mapeamento SIPOC e controlos internos alinhados aos padrões internacionais de governação.',
    highlights: [
      'Prevenção ao suborno (ISO 37001) e Compliance',
      'Mapeamento de processos SIPOC e indicadores KPI',
      'Qualificação de fornecedores para grandes contratos',
    ],
    image: courseComplianceImg,
    thumbnailLabel: 'Compliance & Risco',
    caption: 'Governança Corporativa, Gestão de Riscos e Mapeamento de Processos',
    primaryCta: { label: 'Agendar Reunião Técnica', to: '/solicitar-diagnostico' },
    secondaryCta: { label: 'Conhecer a Alhan', to: '/quem-somos' },
  },
];

export const INSTAGRAM_FEED_POSTS = [
  {
    id: 'ig-hse',
    image: '/assets/aistudio/Forma__o_HSE__Turma_de_Novembro_eeeafbbb.png',
    tag: 'Turma de Novembro · @alhan.sgi',
    title: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Online via Teams & Presencial)',
    caption:
      'Invista em conhecimento, transforme o futuro da sua empresa! Promova um ambiente de trabalho seguro, saudável e sustentável. Inscreva-se já na Turma de Novembro!',
    date: 'Destaque Oficial · Luanda',
  },
  {
    id: 'ig-1',
    image: '/assets/aistudio/iso_a9fe34ed.jpg',
    tag: 'Formação SGI · @alhan.sgi',
    title: 'Formação em Sistema de Gestão Integrado (ISO 9001 | ISO 14001 | ISO 45001)',
    caption:
      'Inscrições abertas na Academia ALHAN! Domine a implementação integrada de Qualidade, Ambiente e Segurança e Saúde no Trabalho com acompanhamento prático.',
    date: 'Publicação Oficial · Luanda',
  },
  {
    id: 'ig-2',
    image: '/assets/aistudio/imagm_da_alha_2a7ca3f2.png',
    tag: 'Consultoria no Terreno · @alhan.sgi',
    title: 'Engenharia de Processos e Implementação ISO nas Empresas Angolanas',
    caption:
      'A nossa equipa técnica apoia a sua organização em todas as 14 etapas de implementação, do diagnóstico inicial e mapeamento de processos à auditoria interna.',
    date: 'Publicação Oficial · Luanda',
  },
  {
    id: 'ig-3',
    image: courseAuditorLiderImg,
    tag: 'Auditoria ISO 19011 · @alhan.sgi',
    title: 'Qualificação de Auditores Internos e Auditores Líderes',
    caption:
      'Prepare os seus profissionais para planear, conduzir e relatar auditorias de Sistemas de Gestão com rigor técnico e foco na melhoria contínua.',
    date: 'Academia ALHAN · Angola',
  },
  {
    id: 'ig-4',
    image: courseIso45001Img,
    tag: 'Segurança e Saúde · @alhan.sgi',
    title: 'Cultura Preventiva e Segurança Operacional (ISO 45001)',
    caption:
      'Identificação de perigos, hierarquia de controlos e Análise Preliminar de Risco (APR) para ambientes industriais, construção e logística.',
    date: 'Consultoria SST · Angola',
  },
];

export interface TestimonialItem {
  id: string;
  clientName: string;
  role: string;
  companyName: string;
  companySector?: string;
  companyLogoText?: string;
  serviceType?: string;
  avatarUrl?: string;
  rating: number;
  feedback: string;
  standardImplemented: string;
  projectOutcome: string;
  verified: boolean;
  testimonialType?: 'FORMANDO' | 'CLIENTE_EMPRESARIAL';
  approvalStatus?: 'pendente' | 'aprovado' | 'rejeitado';
  authorizedForPublication?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
}

export const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-1',
    clientName: 'Eng.º Mateus Cristóvão',
    role: 'Director de Operações & Qualidade',
    companyName: 'Sociedade Industrial de Luanda, S.A.',
    companySector: 'Indústria Transformadora & Metalomecânica',
    companyLogoText: 'SIL',
    rating: 5,
    feedback:
      'A equipa da ALHAN transformou a nossa operação industrial. A estruturação do Sistema de Gestão Integrado (ISO 9001 e ISO 45001) eliminou redundâncias documentais e reduziu incidentes de SST em mais de 65%. A preparação para a auditoria externa foi exemplar.',
    standardImplemented: 'SGI (ISO 9001:2015 & ISO 45001:2018)',
    projectOutcome: '100% de conformidade nas auditorias internas e qualificação para novos concursos',
    verified: true,
    testimonialType: 'CLIENTE_EMPRESARIAL',
    approvalStatus: 'aprovado',
    authorizedForPublication: true,
    approvedBy: 'Direcção Geral ALHAN',
    approvedAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'test-2',
    clientName: 'Dra. Elsa Domingos',
    role: 'Gestora de Compliance & Risco',
    companyName: 'Kwanza Logistics & Supply Chain, Lda',
    companySector: 'Logística Portuária & Distribuição',
    companyLogoText: 'KLSC',
    rating: 5,
    feedback:
      'A consultoria da ALHAN na implementação da ISO 14001 e ISO 37001 foi um marco estratégico. Mapeámos todos os aspectos e impactos ambientais no terminal e implementámos due diligence de fornecedores rigorosa. O portal empresarial facilitou o seguimento em tempo real.',
    standardImplemented: 'ISO 14001:2015 & ISO 37001 (Compliance)',
    projectOutcome: 'Plano de Gestão Ambiental operacional e aprovação corporativa sem ressalvas',
    verified: true,
    testimonialType: 'CLIENTE_EMPRESARIAL',
    approvalStatus: 'aprovado',
    authorizedForPublication: true,
    approvedBy: 'Direcção Geral ALHAN',
    approvedAt: '2026-02-12T10:00:00Z',
  },
  {
    id: 'test-3',
    clientName: 'Dr. Afonso Mukanda',
    role: 'Director de QHSE',
    companyName: 'Atlas Offshore & Energy Services',
    companySector: 'Petróleo, Gás & Energia',
    companyLogoText: 'ATLAS',
    rating: 5,
    feedback:
      'Excelente rigor técnico e pontualidade. Os formadores da Academia ALHAN qualificaram a nossa equipa de auditores internos com material didáctico irrepreensível e simulações realistas alinhadas à directriz ISO 19011. Recomendo vivamente.',
    standardImplemented: 'Formação Auditor Líder ISO 19011 & ISO 45001',
    projectOutcome: 'Auditores internos qualificados com registo institucional na ALHAN',
    verified: true,
    testimonialType: 'CLIENTE_EMPRESARIAL',
    approvalStatus: 'aprovado',
    authorizedForPublication: true,
    approvedBy: 'Direcção Geral ALHAN',
    approvedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'test-4',
    clientName: 'Eng.ª Paula Van-Dúnem',
    role: 'Coordenadora Geral da Qualidade',
    companyName: 'Empreendimentos de Construção Benguela, Lda',
    companySector: 'Construção Civil & Obras Públicas',
    companyLogoText: 'ECB',
    rating: 5,
    feedback:
      'O acompanhamento em 14 etapas metodológicas da ALHAN deu-nos total clareza e previsibilidade de prazos. Conseguimos padronizar os procedimentos em 4 estaleiros de obras em Luanda e Benguela, com indicadores de desempenho (KPIs) consistentes.',
    standardImplemented: 'ISO 9001:2015 & Mapeamento de Processos',
    projectOutcome: 'Padronização integral dos processos de compras, estaleiro e entrega técnica',
    verified: true,
    testimonialType: 'CLIENTE_EMPRESARIAL',
    approvalStatus: 'aprovado',
    authorizedForPublication: true,
    approvedBy: 'Direcção Geral ALHAN',
    approvedAt: '2026-02-16T10:00:00Z',
  },
  {
    id: 'test-5',
    clientName: 'Manuel João Mateus',
    role: 'Antigo Formando Certificado SGI',
    companyName: 'Empresa Industrial de Luanda, Lda',
    companySector: 'Qualidade, Ambiente e Segurança (QSMS)',
    companyLogoText: 'MJM',
    rating: 5,
    feedback:
      'A formação em Sistema de Gestão Integrado (ISO 9001, 14001 e 45001) na Academia ALHAN proporcionou-me domínio prático do Anexo SL, matrizes de risco e condução de auditorias internas. Todo o processo pedagógico e documental foi de altíssimo nível.',
    standardImplemented: 'Formação Sistema de Gestão Integrado – SGI',
    projectOutcome: 'Formando qualificado com registo oficial ALHAN-SGI-2026-001',
    verified: true,
    testimonialType: 'FORMANDO',
    approvalStatus: 'aprovado',
    authorizedForPublication: true,
    approvedBy: 'Direcção Geral ALHAN',
    approvedAt: '2026-02-20T10:00:00Z',
  },
];

export const ISO_IMPLEMENTATION_METHODOLOGY = [
  { step: '01', title: 'Diagnóstico inicial', description: 'Avaliação da maturidade organizacional e levantamento da estrutura actual em Luanda ou noutras províncias.' },
  { step: '02', title: 'Análise de lacunas (Gap Analysis)', description: 'Comparação detalhada entre as práticas actuais da organização e os requisitos normativos ISO aplicáveis.' },
  { step: '03', title: 'Planeamento', description: 'Definição do cronograma mestre, responsabilidades, recursos e indicadores do projecto de implementação.' },
  { step: '04', title: 'Mapeamento de processos', description: 'Identificação das entradas, saídas, interacções e indicadores de desempenho (KPIs) de cada processo.' },
  { step: '05', title: 'Identificação de riscos e oportunidades', description: 'Construção das matrizes de risco estratégico e operacional, aspectos ambientais e perigos de SST.' },
  { step: '06', title: 'Elaboração da documentação', description: 'Desenvolvimento de políticas, manuais, procedimentos, instruções de trabalho e formulários controlados.' },
  { step: '07', title: 'Implementação do sistema', description: 'Aplicação prática dos procedimentos na rotina operacional com acompanhamento técnico presencial ou remoto.' },
  { step: '08', title: 'Formação dos colaboradores', description: 'Capacitação das equipas nos requisitos das normas, controlo operacional e cultura de melhoria contínua.' },
  { step: '09', title: 'Auditoria interna', description: 'Execução de auditorias internas segundo a diretriz ISO 19011 para verificar a conformidade do sistema.' },
  { step: '10', title: 'Tratamento de não conformidades', description: 'Contenção imediata e análise estruturada de causa raiz para desvios identificados.' },
  { step: '11', title: 'Acções correctivas', description: 'Implementação de planos de acção para eliminar causas de não conformidades e verificação da sua eficácia.' },
  { step: '12', title: 'Revisão pela gestão', description: 'Análise crítica pela direcção sobre o desempenho do SGI, recursos e alinhamento estratégico.' },
  { step: '13', title: 'Preparação para auditoria de certificação', description: 'Simulação técnica (pré-auditoria) para preparar as equipas para a Fase 1 e Fase 2 da auditoria externa.' },
  { step: '14', title: 'Acompanhamento do processo de certificação', description: 'Apoio técnico durante a articulação com o organismo de certificação independente seleccionado pelo cliente.' },
];

export const INITIAL_COURSES: CourseItem[] = [
  {
    id: 'curso-hse-novembro',
    title: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
    category: 'Saúde, Segurança e Ambiente (HSE)',
    modality: 'Híbrida',
    priceKz: 125000,
    durationHours: 40,
    lessonsCount: 10,
    instructorName: 'Corpo Docente Sénior HSE – ALHAN SGI',
    instructorId: 'prof-alhan-01',
    published: true,
    featured: true,
    featuredBadge: 'Turma de Novembro · Online via Teams & Presencial',
    imageUrl: '/assets/aistudio/Forma__o_HSE__Turma_de_Novembro_eeeafbbb.png',
    description:
      'Invista em conhecimento, transforme o futuro da sua empresa! Formação intensiva em HSE (Saúde, Segurança e Meio Ambiente) para promover um ambiente de trabalho seguro, saudável e sustentável. Disponível Online via Microsoft Teams e Presencial em Luanda (Vagas Limitadas).',
    objectives:
      'Capacitar profissionais, supervisores, técnicos e gestores nas melhores práticas de Saúde Ocupacional, Segurança do Trabalho e Protecção Ambiental (HSE), com Certificado Reconhecido, Material Didático, Professores Experientes e Aplicação Prática.',
    syllabus:
      'Módulo 1: Fundamentos de HSE, Cultura de Segurança e Quadro Legal em Angola · Módulo 2: Identificação de Perigos, Análise Preliminar de Risco (APR), PTW e Controlo Operacional (ISO 45001) · Módulo 3: Gestão Ambiental, Aspectos e Impactos (LAIA), Resíduos e Sustentabilidade (ISO 14001) · Módulo 4: Saúde Ocupacional, Resposta a Emergências, Investigação de Incidentes e Inspecções Práticas de HSE.',
    liveSessionLink: 'https://teams.microsoft.com/l/meetup-join/alhan-hse-novembro',
    livePlatform: 'Microsoft Teams',
    createdAt: '2026-11-01T08:00:00Z',
    modules: [
      {
        id: 'mod-hse-1',
        title: 'Módulo 1: Fundamentos de HSE, Segurança Operacional e Prevenção de Riscos',
        lessons: [
          {
            id: 'les-hse-1',
            title: 'Aula 1.1: Introdução ao HSE, Cultura Preventiva e Liderança em Segurança',
            durationMinutes: 50,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            materialTitle: 'Manual Oficial Formação em HSE – Saúde, Segurança e Meio Ambiente (PDF)',
            materialSummary:
              'Apresenta os pilares de HSE (Health, Safety & Environment), legislação angolana de SST e Ambiente, responsabilidades operacionais e promoção de ambientes de trabalho seguros e sustentáveis.',
            quizQuestion: 'Qual é o objectivo central de um programa estruturado de HSE nas empresas?',
            quizOptions: [
              'Promover um ambiente de trabalho seguro, saudável e sustentável, prevenindo acidentes, doenças ocupacionais e impactos ambientais',
              'Substituir os equipamentos de protecção colectiva por relatórios mensais',
              'Aplicar medidas apenas após a ocorrência de sinistros graves',
              'Restringir a segurança apenas ao sector administrativo',
            ],
            quizCorrectIndex: 0,
          },
          {
            id: 'les-hse-2',
            title: 'Aula 1.2: Análise Preliminar de Risco (APR), Permissão de Trabalho (PTW) e Hierarquia de Controlos',
            durationMinutes: 55,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            materialTitle: 'Matrizes Práticas de APR, PTW e Inspecção de Campo HSE',
            materialSummary:
              'Aplicação prática de identificação de perigos, avaliação de riscos, emissão de Permissões de Trabalho (trabalhos em altura, espaço confinado, trabalho a quente) e gestão de EPI/EPC.',
            quizQuestion: 'Na hierarquia de controlo de riscos de HSE, qual medida deve ter prioridade máxima?',
            quizOptions: [
              'Distribuição isolada de EPIs sem análise do perigo',
              'Eliminação do perigo na fonte ou substituição por processo mais seguro',
              'Apenas afixação de cartazes informativos',
              'Registo estatístico no final do ano',
            ],
            quizCorrectIndex: 1,
          },
        ],
      },
      {
        id: 'mod-hse-2',
        title: 'Módulo 2: Gestão Ambiental, Saúde Ocupacional e Resposta a Emergências',
        lessons: [
          {
            id: 'les-hse-3',
            title: 'Aula 2.1: Controlo de Aspectos Ambientais, Gestão de Resíduos e Emergências',
            durationMinutes: 50,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            materialTitle: 'Guia Prático de Gestão Ambiental e Planos de Emergência HSE',
            materialSummary:
              'Aborda a Matriz LAIA, segregação e acondicionamento de resíduos industriais, contenção de derrames, ergonomia, higiene ocupacional e simulacros de emergência.',
            quizQuestion: 'Como deve ser validada a eficácia de um Plano de Resposta a Emergências em HSE?',
            quizOptions: [
              'Através de simulacros periódicos planeados, avaliação prática de desempenho e melhoria contínua dos procedimentos',
              'Guardando o documento trancado sem conhecimento das equipas',
              'Sem realização de exercícios práticos',
              'Apenas por revisão verbal anual',
            ],
            quizCorrectIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'curso-sgi-01',
    title: 'Sistema de Gestão Integrado – SGI',
    category: 'Sistemas Integrados',
    modality: 'Híbrida',
    priceKz: 145000,
    durationHours: 40,
    lessonsCount: 12,
    instructorName: 'Eng.º Consultor Sénior SGI (Equipa Alhan)',
    instructorId: 'prof-alhan-01',
    published: true,
    featured: true,
    featuredBadge: 'Certificação Integrada ISO 9001 · 14001 · 45001',
    imageUrl: '/assets/aistudio/iso_a9fe34ed.jpg',
    description: 'Formação completa na estrutura de alto nível (Anexo SL) para integração eficaz das normas ISO 9001, ISO 14001 e ISO 45001 em empresas angolanas.',
    objectives: 'Capacitar gestores, técnicos e auditores para estruturar, implementar e manter um Sistema de Gestão Integrado de Qualidade, Ambiente e SST.',
    syllabus: 'Módulo 1: Estrutura Anexo SL e Contexto da Organização · Módulo 2: Liderança, Planeamento de Riscos e Oportunidades · Módulo 3: Operação Integrada QSMS · Módulo 4: Avaliação de Desempenho, Auditoria e Melhoria Contínua.',
    liveSessionLink: 'https://teams.microsoft.com/l/meetup-join/alhan-sgi-ao',
    livePlatform: 'Microsoft Teams',
    createdAt: '2026-01-15T09:00:00Z',
    modules: [
      {
        id: 'mod-sgi-1',
        title: 'Módulo 1: Estrutura de Alto Nível (Anexo SL) e Contexto',
        lessons: [
          {
            id: 'les-sgi-1',
            title: 'Aula 1.1: Fundamentos do SGI e Cláusulas 4 a 6',
            durationMinutes: 45,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            materialTitle: 'Manual Técnico SGI – Cláusulas 4 a 6 (PDF Protegido)',
            materialSummary: 'Aborda a compreensão da organização e do seu contexto (4.1), necessidades e expectativas das partes interessadas (4.2), determinação do âmbito do SGI (4.3) e mapeamento de processos integrados (4.4).',
            quizQuestion: 'Qual é a principal vantagem da estrutura harmonizada (Anexo SL) nas normas ISO?',
            quizOptions: [
              'Tornar a certificação automática sem auditoria externa',
              'Facilitar a integração de múltiplas normas (ex: ISO 9001, 14001 e 45001) com a mesma estrutura de cláusulas',
              'Substituir a legislação laboral angolana',
              'Eliminar a necessidade de documentação controlada',
            ],
            quizCorrectIndex: 1,
          },
          {
            id: 'les-sgi-2',
            title: 'Aula 1.2: Gestão Integrada de Riscos, Aspectos Ambientais e Perigos SST',
            durationMinutes: 50,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            materialTitle: 'Matriz Integrada de Riscos QSMS – Guia Prático',
            materialSummary: 'Metodologia passo a passo para avaliação conjunta de riscos de processo, levantamentos de aspectos/impactos ambientais e identificação de perigos/riscos ocupacionais.',
            quizQuestion: 'Na gestão integrada, como devem ser tratadas as acções para abordar riscos e oportunidades?',
            quizOptions: [
              'Apenas quando ocorre um acidente grave',
              'Integradas nos processos do SGI e avaliadas quanto à sua eficácia',
              'Exclusivamente pelo organismo certificador',
              'Sem necessidade de registo ou evidência',
            ],
            quizCorrectIndex: 1,
          },
        ],
      },
      {
        id: 'mod-sgi-2',
        title: 'Módulo 2: Operação, Auditoria e Revisão pela Gestão',
        lessons: [
          {
            id: 'les-sgi-3',
            title: 'Aula 2.1: Controlo Operacional, Não Conformidades e Melhoria',
            durationMinutes: 55,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            materialTitle: 'Procedimento Modelo de Não Conformidades e Acções Correctivas',
            materialSummary: 'Guia prático sobre análise de causa raiz (5 Porquês e Diagrama de Ishikawa), plano de acção correctiva e verificação de eficácia.',
            quizQuestion: 'O que diferencia uma correcção imediata de uma acção correctiva?',
            quizOptions: [
              'Não existe diferença entre ambas',
              'A correcção elimina o efeito imediato do problema; a acção correctiva elimina a causa raiz para evitar a recorrência',
              'A acção correctiva aplica-se apenas à norma ISO 14001',
              'A correcção imediata requer aprovação do organismo de acreditação',
            ],
            quizCorrectIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'curso-auditor-02',
    title: 'Auditor Líder',
    category: 'Auditoria ISO 19011',
    modality: 'Presencial',
    priceKz: 185000,
    durationHours: 40,
    lessonsCount: 14,
    instructorName: 'Dr. Especialista em Auditoria ISO (Equipa Alhan)',
    instructorId: 'prof-alhan-01',
    published: true,
    imageUrl: courseAuditorLiderImg,
    description: 'Formação intensiva alinhada à ISO 19011 para planeamento, condução, coordenação de equipas auditoras e elaboração de relatórios de auditoria de Sistemas de Gestão.',
    objectives: 'Desenvolver competências de liderança de equipas de auditoria, recolha de evidências objectivas e redacção técnica de constatações.',
    syllabus: 'Módulo 1: Princípios de Auditoria ISO 19011 · Módulo 2: Gestão de Programas de Auditoria · Módulo 3: Condução de Auditoria no Terreno e Entrevistas · Módulo 4: Relatórios e Seguimento.',
    livePlatform: 'Zoom',
    liveSessionLink: 'https://zoom.us/j/alhan-auditor-lider',
    createdAt: '2026-01-18T10:00:00Z',
    modules: [
      {
        id: 'mod-aud-1',
        title: 'Módulo 1: Diretrizes ISO 19011 e Condução de Auditorias',
        lessons: [
          {
            id: 'les-aud-1',
            title: 'Aula 1.1: Princípios de Auditoria e Evidência Objectiva',
            durationMinutes: 60,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            materialTitle: 'Guia ISO 19011 – Listas de Verificação e Relatórios',
            materialSummary: 'Apresenta os 7 princípios de auditoria (integridade, apresentação justa, devido cuidado profissional, confidencialidade, independência, abordagem baseada em evidência e abordagem baseada em risco).',
            quizQuestion: 'Qual princípio exige que as conclusões da auditoria sejam baseadas em amostras verificáveis?',
            quizOptions: [
              'Abordagem baseada em evidência',
              'Subjetividade do auditor',
              'Preferência comercial',
              'Hierarquia financeira',
            ],
            quizCorrectIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'curso-iso9001-03',
    title: 'ISO 9001 – Gestão da Qualidade',
    category: 'Qualidade',
    modality: 'Online',
    priceKz: 95000,
    durationHours: 24,
    lessonsCount: 10,
    instructorName: 'Eng.ª Gestora da Qualidade (Equipa Alhan)',
    instructorId: 'prof-alhan-01',
    published: true,
    imageUrl: courseIso9001Img,
    description: 'Interpretação e implementação prática dos requisitos da norma ABNT NBR ISO 9001:2015 para padronização de processos e satisfação de clientes.',
    objectives: 'Compreender os 7 princípios de gestão da qualidade e aplicar a abordagem por processos e mentalidade de risco.',
    syllabus: 'Módulo 1: Os 7 Princípios da Qualidade · Módulo 2: Abordagem por Processos e Ciclo PDCA · Módulo 3: Requisitos das Cláusulas 4 a 10 da ISO 9001:2015.',
    createdAt: '2026-01-20T10:00:00Z',
    modules: [
      {
        id: 'mod-9001-1',
        title: 'Módulo 1: Interpretação dos Requisitos ISO 9001:2015',
        lessons: [
          {
            id: 'les-9001-1',
            title: 'Aula 1.1: Abordagem por Processos, PDCA e Mentalidade de Risco',
            durationMinutes: 45,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            materialTitle: 'Apostila Técnica ISO 9001:2015 – Interpretação Cláusula a Cláusula',
            materialSummary: 'Detalhamento completo dos requisitos de foco no cliente, liderança, planeamento da qualidade, controlo de produtos e serviços fornecidos externamente e avaliação de desempenho.',
            quizQuestion: 'Qual é o foco central da norma ISO 9001:2015?',
            quizOptions: [
              'Apenas o controlo contabilístico',
              'Capacidade de fornecer consistentemente produtos e serviços que satisfaçam os requisitos do cliente e estatutários aplicáveis',
              'Licenciamento mineiro exclusivo',
              'Auditoria fiscal',
            ],
            quizCorrectIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'curso-iso14001-04',
    title: 'ISO 14001 – Gestão Ambiental',
    category: 'Ambiente',
    modality: 'Online',
    priceKz: 95000,
    durationHours: 24,
    lessonsCount: 10,
    instructorName: 'Eng.º Consultor Ambiental (Equipa Alhan)',
    instructorId: 'prof-alhan-01',
    published: true,
    imageUrl: courseIso14001Img,
    description: 'Implementação de Sistemas de Gestão Ambiental segundo a ISO 14001:2015, avaliação de aspectos e impactos ambientais e conformidade legal.',
    objectives: 'Capacitar profissionais para gerir responsabilidades ambientais de forma sistemática e melhorar o desempenho ambiental das organizações.',
    syllabus: 'Módulo 1: Contexto e Política Ambiental · Módulo 2: Levantamento de Aspectos e Impactos Ambientais (LAIA) · Módulo 3: Requisitos Legais, Controlo Operacional e Resposta a Emergências.',
    createdAt: '2026-01-22T10:00:00Z',
    modules: [
      {
        id: 'mod-14001-1',
        title: 'Módulo 1: Aspectos e Impactos Ambientais (ISO 14001)',
        lessons: [
          {
            id: 'les-14001-1',
            title: 'Aula 1.1: Metodologia LAIA e Perspectiva de Ciclo de Vida',
            durationMinutes: 50,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            materialTitle: 'Matriz LAIA – Levantamento de Aspectos e Impactos Ambientais',
            materialSummary: 'Definição de aspecto ambiental (causa) vs. impacto ambiental (efeito), condições normais, anormais e de emergência ambiental.',
            quizQuestion: 'Na ISO 14001, o que é um aspecto ambiental?',
            quizOptions: [
              'Elemento das actividades, produtos ou serviços de uma organização que interage ou pode interagir com o meio ambiente',
              'O certificado emitido pela auditoria',
              'O relatório anual de contas',
              'O contrato de trabalho do colaborador',
            ],
            quizCorrectIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'curso-iso45001-05',
    title: 'ISO 45001 – Segurança e Saúde no Trabalho',
    category: 'Segurança e Saúde no Trabalho',
    modality: 'Híbrida',
    priceKz: 110000,
    durationHours: 30,
    lessonsCount: 11,
    instructorName: 'Eng.º Especialista SST (Equipa Alhan)',
    instructorId: 'prof-alhan-01',
    published: true,
    imageUrl: courseIso45001Img,
    description: 'Gestão de Segurança e Saúde no Trabalho segundo a ISO 45001:2018, identificação de perigos, hierarquia de controlos e participação dos trabalhadores.',
    objectives: 'Prevenir lesões e problemas de saúde relacionados com o trabalho e proporcionar locais de trabalho seguros e saudáveis.',
    syllabus: 'Módulo 1: Liderança e Consulta dos Trabalhadores · Módulo 2: Identificação de Perigos e Hierarquia de Controlos · Módulo 3: Investigação de Incidentes e Preparação para Emergências.',
    createdAt: '2026-01-25T10:00:00Z',
    modules: [
      {
        id: 'mod-45001-1',
        title: 'Módulo 1: Identificação de Perigos e Hierarquia de Controlos',
        lessons: [
          {
            id: 'les-45001-1',
            title: 'Aula 1.1: Hierarquia de Controlos Operacionais em SST',
            durationMinutes: 45,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            materialTitle: 'Guia ISO 45001 – Matriz de Perigos e Riscos Ocupacionais',
            materialSummary: 'Aplicação da hierarquia de controlos: 1. Eliminação, 2. Substituição, 3. Controlos de engenharia, 4. Controlos administrativos, 5. Equipamento de Protecção Individual (EPI).',
            quizQuestion: 'Qual é o primeiro nível (mais eficaz) na hierarquia de controlos da ISO 45001?',
            quizOptions: [
              'Uso de EPI (Equipamento de Protecção Individual)',
              'Eliminação do perigo',
              'Afixação de cartazes informativos',
              'Substituição de luvas',
            ],
            quizCorrectIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'curso-compliance-06',
    title: 'Compliance',
    category: 'Governança e Risco',
    modality: 'Online',
    priceKz: 115000,
    durationHours: 24,
    lessonsCount: 8,
    instructorName: 'Consultor Sénior de Compliance e Risco (Equipa Alhan)',
    instructorId: 'prof-alhan-01',
    published: true,
    imageUrl: courseComplianceImg,
    description: 'Estruturação de programas de integridade, conformidade normativa, código de ética, canal de denúncias e alinhamento às normas ISO 37301 e ISO 37001.',
    objectives: 'Implementar mecanismos eficazes de prevenção de riscos de conformidade, suborno e conflitos de interesses.',
    syllabus: 'Módulo 1: Pilares de um Programa de Compliance · Módulo 2: Due Diligence de Terceiros e Fornecedores · Módulo 3: ISO 37001 (Antissuborno) e Monitorização.',
    createdAt: '2026-01-28T10:00:00Z',
    modules: [
      {
        id: 'mod-comp-1',
        title: 'Módulo 1: Sistemas de Gestão de Compliance e Antissuborno',
        lessons: [
          {
            id: 'les-comp-1',
            title: 'Aula 1.1: Pilares de Integridade Corporativa e Due Diligence',
            durationMinutes: 40,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            materialTitle: 'Guia de Implementação de Compliance Corporativo',
            materialSummary: 'Estruturação de políticas anticorrupção, avaliação de risco de parceiros de negócio e governação transparente.',
            quizQuestion: 'Qual é a finalidade do processo de Due Diligence de terceiros num programa de Compliance?',
            quizOptions: [
              'Avaliar o risco de integridade e conformidade de fornecedores e parceiros antes e durante a relação contratual',
              'Substituir o departamento comercial',
              'Aumentar o tempo de entrega logística',
              'Eliminar contratos escritos',
            ],
            quizCorrectIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'curso-cons-amb-07',
    title: 'Consultor Ambiental',
    category: 'Ambiente',
    modality: 'Presencial',
    priceKz: 155000,
    durationHours: 36,
    lessonsCount: 12,
    instructorName: 'Eng.º Consultor Ambiental (Equipa Alhan)',
    instructorId: 'prof-alhan-01',
    published: true,
    imageUrl: courseIso14001Img,
    description: 'Formação prática para actuação em consultoria ambiental, planos de gestão ambiental, gestão de resíduos, auditorias ambientais e licenciamento.',
    objectives: 'Preparar consultores técnicos capazes de diagnosticar passivos ambientais e elaborar planos de gestão ambiental para empresas.',
    syllabus: 'Módulo 1: Diagnóstico e Auditoria Ambiental · Módulo 2: Planos de Gestão de Resíduos e Efluentes · Módulo 3: Elaboração de Propostas e Relatórios Técnicos.',
    createdAt: '2026-02-01T10:00:00Z',
    modules: [
      {
        id: 'mod-camb-1',
        title: 'Módulo 1: Prática de Consultoria e Gestão Ambiental',
        lessons: [
          {
            id: 'les-camb-1',
            title: 'Aula 1.1: Diagnóstico Ambiental e Plano de Gestão de Resíduos',
            durationMinutes: 50,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            materialTitle: 'Modelo de Plano de Gestão Ambiental (PGA)',
            materialSummary: 'Estrutura técnica de um PGA, inventário de resíduos, acondicionamento, rastreabilidade e indicadores ambientais.',
            quizQuestion: 'Qual deve ser a primeira etapa de um consultor ambiental ao iniciar um projecto numa indústria?',
            quizOptions: [
              'Realizar o diagnóstico ambiental inicial e levantamento das operações e requisitos aplicáveis',
              'Emitir um certificado ISO 14001',
              'Encerrar a unidade industrial',
              'Ignorar o histórico de resíduos',
            ],
            quizCorrectIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'curso-gest-qual-08',
    title: 'Gestão da Qualidade',
    category: 'Qualidade',
    modality: 'Online',
    priceKz: 85000,
    durationHours: 20,
    lessonsCount: 8,
    instructorName: 'Eng.ª Gestora da Qualidade (Equipa Alhan)',
    instructorId: 'prof-alhan-01',
    published: true,
    imageUrl: courseIso9001Img,
    description: 'Ferramentas práticas da Qualidade, mapeamento de processos, indicadores KPI, 5W2H, Ishikawa, Pareto e padronização operacional.',
    objectives: 'Dominar as ferramentas de gestão e melhoria de processos para redução de falhas e aumento de produtividade.',
    syllabus: 'Módulo 1: Mapeamento de Processos (SIPOC e Fluxogramas) · Módulo 2:As 7 Ferramentas da Qualidade · Módulo 3: Gestão por Indicadores (KPIs).',
    createdAt: '2026-02-03T10:00:00Z',
    modules: [
      {
        id: 'mod-gq-1',
        title: 'Módulo 1: Ferramentas da Qualidade e Mapeamento SIPOC',
        lessons: [
          {
            id: 'les-gq-1',
            title: 'Aula 1.1: Mapeamento SIPOC e Ferramentas de Análise de Causa',
            durationMinutes: 40,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            materialTitle: 'Kit de Ferramentas da Qualidade (SIPOC, Ishikawa, 5W2H)',
            materialSummary: 'Aplicação prática da matriz SIPOC (Suppliers, Inputs, Process, Outputs, Customers) e estruturação de planos de acção 5W2H.',
            quizQuestion: 'O que significa a sigla SIPOC no mapeamento de processos?',
            quizOptions: [
              'Suppliers, Inputs, Process, Outputs, Customers (Fornecedores, Entradas, Processo, Saídas, Clientes)',
              'Sistema Interno de Produção Operacional Certificada',
              'Serviço Internacional de Padronização Oficial',
              'Segurança Industrial para Operações Críticas',
            ],
            quizCorrectIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'curso-gest-amb-09',
    title: 'Gestão Ambiental',
    category: 'Ambiente',
    modality: 'Online',
    priceKz: 85000,
    durationHours: 20,
    lessonsCount: 8,
    instructorName: 'Eng.º Consultor Ambiental (Equipa Alhan)',
    instructorId: 'prof-alhan-01',
    published: true,
    imageUrl: courseIso14001Img,
    description: 'Fundamentos e práticas operacionais de Gestão Ambiental empresarial, ecoeficiência, controlo de poluição e sustentabilidade corporativa.',
    objectives: 'Implementar boas práticas de gestão ambiental, segregação de resíduos e monitorização de consumos de água e energia.',
    syllabus: 'Módulo 1: Fundamentos de Gestão Ambiental Empresarial · Módulo 2: Gestão de Resíduos e Efluentes · Módulo 3: Indicadores de Ecoeficiência.',
    createdAt: '2026-02-05T10:00:00Z',
    modules: [
      {
        id: 'mod-ga-1',
        title: 'Módulo 1: Boas Práticas Operacionais e Ecoeficiência',
        lessons: [
          {
            id: 'les-ga-1',
            title: 'Aula 1.1: Segregação de Resíduos e Controlo Ambiental Operacional',
            durationMinutes: 40,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            materialTitle: 'Guia de Segregação de Resíduos e Ecoeficiência',
            materialSummary: 'Política dos 5 Rs (Repensar, Recusar, Reduzir, Reutilizar e Reciclar) e armazenamento temporário seguro de resíduos.',
            quizQuestion: 'Na gestão de resíduos empresariais, qual acção deve ter prioridade?',
            quizOptions: [
              'Prevenção e redução da geração de resíduos na fonte',
              'Descarte sem registo',
              'Mistura de resíduos perigosos com resíduos comuns',
              'Queima a céu aberto',
            ],
            quizCorrectIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'curso-sst-10',
    title: 'Segurança e Saúde no Trabalho',
    category: 'Segurança e Saúde no Trabalho',
    modality: 'Presencial',
    priceKz: 90000,
    durationHours: 24,
    lessonsCount: 9,
    instructorName: 'Eng.º Especialista SST (Equipa Alhan)',
    instructorId: 'prof-alhan-01',
    published: true,
    imageUrl: '/assets/aistudio/imagm_da_alha_2a7ca3f2.png',
    description: 'Prevenção de acidentes laborais, análise preliminar de risco (APR), permissões de trabalho, sinalização de segurança e cultura preventiva.',
    objectives: 'Capacitar técnicos e supervisores na identificação proactiva de condições inseguras e aplicação de medidas preventivas no terreno.',
    syllabus: 'Módulo 1: Prevenção de Acidentes e Análise Preliminar de Risco (APR) · Módulo 2: Equipamentos de Protecção Colectiva e Individual · Módulo 3: Resposta a Emergências.',
    createdAt: '2026-02-08T10:00:00Z',
    modules: [
      {
        id: 'mod-sst-1',
        title: 'Módulo 1: Análise Preliminar de Risco (APR) e Prevenção',
        lessons: [
          {
            id: 'les-sst-1',
            title: 'Aula 1.1: Elaboração de APR e Inspecções de Segurança',
            durationMinutes: 45,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            materialTitle: 'Formulário Modelo de Análise Preliminar de Risco (APR)',
            materialSummary: 'Como identificar perigos antes do início de tarefas críticas (trabalho em altura, espaços confinados, movimentação de cargas e electricidade).',
            quizQuestion: 'Quando deve ser realizada a Análise Preliminar de Risco (APR)?',
            quizOptions: [
              'Antes do início da execução da actividade ou tarefa operacional',
              'Apenas após o término do contrato anual',
              'Somente quando solicitado por clientes externos',
              'Unicamente em escritórios administrativos',
            ],
            quizCorrectIndex: 0,
          },
        ],
      },
    ],
  },
];

export const INITIAL_ISO_STANDARDS: IsoStandardItem[] = [
  {
    id: 'iso-9001',
    code: 'ISO 9001',
    name: 'Gestão da Qualidade',
    description: 'Norma internacional que estabelece os requisitos para um Sistema de Gestão da Qualidade (SGQ), focada na eficácia dos processos e na satisfação consistente do cliente.',
    objective: 'Garantir a padronização operacional, redução de retrabalho, melhoria contínua e entrega consistente de produtos e serviços conformes.',
    benefits: ['Padronização e rastreabilidade de processos', 'Aumento da satisfação e fidelização de clientes', 'Redução de falhas operacionais e custos de não-qualidade', 'Maior competitividade em concursos e contratos corporativos'],
    applicability: 'Aplicável a qualquer organização, independentemente da sua dimensão ou sector de actividade.',
    sectorsInAngola: ['Prestação de Serviços', 'Indústria Transformadora', 'Construção Civil e Obras Públicas', 'Logística e Transportes', 'Banca, Seguros e Comércio'],
  },
  {
    id: 'iso-14001',
    code: 'ISO 14001',
    name: 'Gestão Ambiental',
    description: 'Especifica os requisitos para um Sistema de Gestão Ambiental (SGA) que permite à organização desenvolver e implementar políticas e objectivos que considerem os aspectos ambientais significativos.',
    objective: 'Proteger o meio ambiente através da prevenção da poluição, uso sustentável de recursos e gestão sistemática de resíduos e efluentes.',
    benefits: ['Controlo estruturado de aspectos e impactos ambientais', 'Redução do consumo de água, energia e matérias-primas', 'Prevenção de incidentes ambientais', 'Valorização da reputação institucional e responsabilidade ambiental'],
    applicability: 'Organizações públicas ou privadas que pretendam gerir de forma sistemática as suas responsabilidades ambientais.',
    sectorsInAngola: ['Petróleo, Gás e Energia', 'Indústria Extractiva e Mineira', 'Construção e Infraestruturas', 'Agroindústria', 'Gestão de Resíduos'],
  },
  {
    id: 'iso-45001',
    code: 'ISO 45001',
    name: 'Segurança e Saúde no Trabalho',
    description: 'Norma internacional para Sistemas de Gestão de Segurança e Saúde no Trabalho (SGSST), orientada para a eliminação de perigos e minimização de riscos ocupacionais.',
    objective: 'Proporcionar locais de trabalho seguros e saudáveis, prevenindo lesões e problemas de saúde relacionados com o trabalho.',
    benefits: ['Redução da sinistralidade laboral e absentismo', 'Identificação proactiva de perigos e avaliação de riscos', 'Envolvimento e consulta activa dos trabalhadores', 'Demonstração de compromisso com a vida e integridade física'],
    applicability: 'Aplicável a todas as organizações que desejem eliminar ou minimizar riscos de SST para colaboradores e partes interessadas.',
    sectorsInAngola: ['Construção Civil', 'Operações Petrolíferas e Industriais', 'Logística e Portos', 'Mineração', 'Energia e Telecomunicações'],
  },
  {
    id: 'iso-27001',
    code: 'ISO/IEC 27001',
    name: 'Segurança da Informação',
    description: 'Estabelece os requisitos para estabelecer, implementar, manter e melhorar continuamente um Sistema de Gestão de Segurança da Informação (SGSI).',
    objective: 'Preservar a confidencialidade, integridade e disponibilidade da informação corporativa e activos digitais.',
    benefits: ['Protecção contra acessos não autorizados e incidentes cibernéticos', 'Gestão estruturada de riscos de segurança da informação', 'Confiança acrescida de clientes e parceiros institucionais', 'Continuidade operacional dos sistemas críticos'],
    applicability: 'Organizações que processam dados sensíveis, sistemas financeiros, tecnológicos ou corporativos.',
    sectorsInAngola: ['Banca e Instituições Financeiras', 'Telecomunicações e TI', 'Seguradoras', 'Consultoria e Serviços Corporativos'],
  },
  {
    id: 'iso-22000',
    code: 'ISO 22000',
    name: 'Segurança Alimentar',
    description: 'Define os requisitos para um Sistema de Gestão de Segurança de Alimentos ao longo de toda a cadeia produtiva alimentar (do produtor ao consumidor).',
    objective: 'Controlar perigos de segurança alimentar, integrando os princípios HACCP e programas de pré-requisitos (PPR).',
    benefits: ['Prevenção de contaminações alimentares', 'Rastreabilidade completa na cadeia de abastecimento', 'Conformidade com padrões internacionais de higiene e qualidade alimentar', 'Confiança de redes retalhistas e consumidores'],
    applicability: 'Toda a cadeia alimentar: produção agrícola, transformação, embalagem, transporte, distribuição, catering e retalho.',
    sectorsInAngola: ['Agroindústria e Produção Alimentar', 'Catering Industrial e Hotelaria', 'Distribuição e Logística Alimentar', 'Bebidas'],
  },
  {
    id: 'iso-50001',
    code: 'ISO 50001',
    name: 'Gestão de Energia',
    description: 'Orienta as organizações na criação de sistemas e processos necessários para melhorar continuamente o desempenho energético, incluindo eficiência, uso e consumo.',
    objective: 'Reduzir custos energéticos e emissões associadas através da gestão sistemática da energia.',
    benefits: ['Redução mensurável da factura energética', 'Identificação de usos significativos de energia', 'Melhoria da eficiência de equipamentos e instalações', 'Apoio às metas de sustentabilidade'],
    applicability: 'Organizações com consumo intensivo de energia ou foco em eficiência operacional.',
    sectorsInAngola: ['Indústria Transformadora', 'Cimenteiras e Metalurgia', 'Grandes Edifícios Comerciais', 'Frotas e Logística'],
  },
  {
    id: 'iso-37001',
    code: 'ISO 37001',
    name: 'Gestão Antissuborno',
    description: 'Especifica requisitos e fornece orientações para estabelecer, implementar e melhorar um Sistema de Gestão Antissuborno.',
    objective: 'Prevenir, detectar e responder a práticas de suborno, promovendo uma cultura de integridade, transparência e conformidade.',
    benefits: ['Prevenção de riscos reputacionais e financeiros', 'Implementação de controlos financeiros e não financeiros', 'Due diligence estruturada de parceiros e fornecedores', 'Fortalecimento da governação corporativa'],
    applicability: 'Empresas privadas, empresas públicas e instituições que operam em cadeias de fornecimento exigentes.',
    sectorsInAngola: ['Fornecedores de Petróleo e Gás', 'Banca e Finanças', 'Contratação e Engenharia', 'Comércio Internacional'],
  },
  {
    id: 'iso-20000-1',
    code: 'ISO/IEC 20000-1',
    name: 'Gestão de Serviços de TI',
    description: 'Primeira norma internacional para Gestão de Serviços de TI (ITSM), focada no planeamento, desenho, transição, entrega e melhoria de serviços tecnológicos.',
    objective: 'Garantir que os serviços de TI estão alinhados às necessidades do negócio e acordos de nível de serviço (SLAs).',
    benefits: ['Maior estabilidade e disponibilidade dos serviços de TI', 'Gestão ágil de incidentes, problemas e mudanças', 'Clareza nos níveis de serviço (SLA) acordados', 'Alinhamento com boas práticas ITIL'],
    applicability: 'Departamentos internos de TI e prestadores de serviços tecnológicos e cloud.',
    sectorsInAngola: ['Empresas de Tecnologia e Software', 'Telecomunicações', 'Centros de Dados', 'Banca Digital'],
  },
  {
    id: 'iso-13485',
    code: 'ISO 13485',
    name: 'Dispositivos Médicos',
    description: 'Estabelece os requisitos de um Sistema de Gestão da Qualidade específico para o ciclo de vida de dispositivos médicos e serviços correlatos.',
    objective: 'Assegurar a qualidade, rastreabilidade, segurança e eficácia na distribuição, manutenção e fabrico de dispositivos médicos.',
    benefits: ['Rastreabilidade rigorosa de lotes e equipamentos', 'Gestão de risco ao longo do ciclo de vida do dispositivo', 'Controlo de armazenamento, instalação e assistência técnica', 'Padrão elevado de segurança para unidades de saúde'],
    applicability: 'Importadores, distribuidores, prestadores de manutenção hospitalar e fabricantes de dispositivos médicos.',
    sectorsInAngola: ['Distribuidores Farmacêuticos e Hospitalares', 'Engenharia Clínica', 'Clínicas e Unidades de Saúde'],
  },
  {
    id: 'iso-22301',
    code: 'ISO 22301',
    name: 'Continuidade de Negócio',
    description: 'Define os requisitos para planear, estabelecer, implementar e manter um Sistema de Gestão de Continuidade de Negócio (SGCN).',
    objective: 'Proteger a organização contra interrupções críticas, reduzir a probabilidade de ocorrência e garantir a recuperação rápida das operações.',
    benefits: ['Análise de Impacto no Negócio (BIA) estruturada', 'Planos de recuperação e resposta a incidentes testados', 'Protecção das operações essenciais em cenários de crise', 'Resiliência organizacional comprovada'],
    applicability: 'Organizações cujas operações não podem sofrer paragens prolongadas.',
    sectorsInAngola: ['Banca e Pagamentos Electrónicos', 'Telecomunicações', 'Logística Portuária e Aeroportuária', 'Energia e Águas'],
  },
  {
    id: 'iso-39001',
    code: 'ISO 39001',
    name: 'Segurança Rodoviária',
    description: 'Estabelece os requisitos para um Sistema de Gestão da Segurança Viária (SV) para organizações que interagem com o sistema de trânsito rodoviário.',
    objective: 'Reduzir e, em última instância, eliminar o risco de acidentes graves associadas ao transporte rodoviário.',
    benefits: ['Redução de acidentes de frota e custos de sinistros', 'Gestão preventiva de manutenção de viaturas e formação de motoristas', 'Optimização de rotas e tempos de condução', 'Protecção de colaboradores, cargas e comunidades'],
    applicability: 'Transportadoras, operadores logísticos, empresas de distribuição e frotas corporativas.',
    sectorsInAngola: ['Transporte de Combustíveis e Cargas', 'Logística e Distribuição Interprovincial', 'Transporte Colectivo e Corporativo'],
  },
  {
    id: 'iso-55001',
    code: 'ISO 55001',
    name: 'Gestão de Activos',
    description: 'Especifica os requisitos para um Sistema de Gestão de Activos ao longo de todo o seu ciclo de vida (aquisição, operação, manutenção e renovação).',
    objective: 'Maximizar o valor gerado pelos activos físicos e infraestruturas, equilibrando custos, riscos e desempenho operacional.',
    benefits: ['Aumento da disponibilidade e vida útil de equipamentos', 'Optimização dos planos de manutenção preventiva e preditiva', 'Redução do custo total de propriedade (TCO)', 'Tomada de decisão de investimento baseada em dados'],
    applicability: 'Organizações intensivas em activos físicos, frotas, maquinaria e infraestruturas.',
    sectorsInAngola: ['Energia e Águas', 'Petróleo e Gás', 'Infraestruturas e Construção', 'Indústria Pesada e Mineração'],
  },
];

export const OFFICIAL_ALHAN_CERTIFICATE_PDF_DATA_URL =
  'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA4NDIgNTk1XSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCAxODAgPj4Kc3RyZWFtCkJUCi9GMSAyMCBUZgo4MCA0ODAgVGQoQ0VSVElGSUNBRE8gT0ZJQ0lBTCBERSBDT05DTFVTQU8gLSBBTEhBTiBTR0kpTjAKL0YxIDEzIFRmCjAgLTQwIFRkKEZvcm1hY2FvIGVtIEhTRSAtIFNhdWRlLCBTZWd1cmFuY2EgZSBNZWlvIEFtYmllbnRlICg0MCBIb3JhcykpTjAKMCAtMzAgVGQoQ2VydGlmaWNhZG8gVmFsaWRhZG8gZSBBc3NpbmFkbyBwZWxhIERpcmVjY2FvIFBlZGFnb2dpY2EgQUxIQU4gLSBTR0kpTjAKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYS1ib2xkID4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDEgMDAwMDAgbiAKMDAwMDAwMDQ3MyAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDYgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjU0NQolJUVPRgo=';

export const INITIAL_CERTIFICATES: CertificateItem[] = [
  {
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
  {
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
  {
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
  {
    id: 'cert-sgi-001',
    code: 'ALHAN-SGI-2026-001',
    studentId: 'aluno-01',
    studentName: 'Manuel João Mateus',
    studentBI: '005432198LA031',
    courseId: 'curso-sgi-01',
    courseTitle: 'Sistema de Gestão Integrado – SGI (ISO 9001, 14001 e 45001)',
    modality: 'Online',
    workloadHours: 40,
    issuedDate: '2026-02-15',
    responsibleName: 'Direcção Pedagógica – ALHAN SGI',
    responsibleRole: 'Coordenação de Formação Profissional',
    status: 'valido',
    isDemo: false,
    createdAt: '2026-02-15T12:00:00Z',
  },
  {
    id: 'cert-pres-01',
    code: 'ALH-PRES-2026-0042',
    studentId: 'aluno-presencial-01',
    studentName: 'Eng.º António Francisco da Costa',
    studentBI: '007891234LA042',
    studentPhone: '+244 923 111 222',
    studentEmail: 'antonio.costa@empresa.ao',
    courseId: 'curso-sgi-presencial-01',
    courseTitle: 'Implementador e Auditor Interno SGI - Luanda Presencial (Kilamba)',
    modality: 'Presencial',
    workloadHours: 40,
    grade: 'Aprovado com Distinção (18/20)',
    issuedDate: '2026-02-28',
    responsibleName: 'Direcção Pedagógica – ALHAN SGI',
    responsibleRole: 'Coordenação de Formação Profissional',
    status: 'valido',
    certificateFileName: 'Certificado_Oficial_Presencial_SGI_Antonio_Costa.pdf',
    certificateFileUrl: '',
    isDemo: false,
    createdAt: '2026-02-28T14:30:00Z',
  },
];

export const INITIAL_ISO_PROJECTS: IsoProjectItem[] = [
  {
    id: 'proj-alhan-001',
    companyId: 'empresa-01',
    companyName: 'Empresa Industrial de Luanda, Lda',
    standards: 'ISO 9001:2015 · ISO 14001:2015 · ISO 45001:2018 (SGI)',
    status: 'Implementação',
    executionPercent: 68,
    nextActivity: 'Auditoria Interna Integrada aos Processos Operacionais e Logísticos (Etapa 09)',
    isDemo: false,
    createdAt: '2026-01-10T09:00:00Z',
    tasks: [
      { id: 't-1', title: '01. Diagnóstico Inicial e Relatório de Gap Analysis', dueDate: '2026-01-25', done: true },
      { id: 't-2', title: '02. Mapeamento de Processos e Matriz de Riscos QSMS', dueDate: '2026-02-15', done: true },
      { id: 't-3', title: '03. Aprovação da Política do SGI e Procedimentos Obrigatórios', dueDate: '2026-03-01', done: true },
      { id: 't-4', title: '04. Capacitação de Auditores Internos e Colaboradores', dueDate: '2026-03-20', done: false },
      { id: 't-5', title: '05. Realização da Auditoria Interna e Revisão pela Gestão', dueDate: '2026-04-10', done: false },
    ],
  },
];

export const INITIAL_ISO_DOCUMENTS: IsoDocumentItem[] = [
  {
    id: 'doc-01',
    code: 'POL-SGI-001',
    title: 'Política Integrada da Qualidade, Ambiente e Segurança',
    category: 'Políticas',
    standard: 'ISO 9001 / 14001 / 45001',
    processName: 'Gestão Estratégica e Liderança',
    version: 'v2.0',
    responsibleName: 'Gestor do SGI',
    approverName: 'Direcção Geral',
    status: 'Aprovado',
    companyId: 'empresa-01',
    changeHistory: ['v1.0 – Emissão inicial para revisão', 'v2.0 – Inclusão do compromisso de consulta e participação dos trabalhadores (ISO 45001)'],
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'doc-02',
    code: 'PRO-SGI-004',
    title: 'Procedimento de Tratamento de Não Conformidades e Acções Correctivas',
    category: 'Procedimentos',
    standard: 'ISO 9001 / 14001 / 45001',
    processName: 'Melhoria Contínua',
    version: 'v1.2',
    responsibleName: 'Coordenador da Qualidade',
    approverName: 'Direcção Técnica',
    status: 'Aprovado',
    companyId: 'empresa-01',
    changeHistory: ['v1.0 – Elaboração inicial', 'v1.2 – Ajustes na matriz de análise de causa raiz (5 Porquês)'],
    createdAt: '2026-02-02T10:00:00Z',
  },
  {
    id: 'doc-03',
    code: 'MAT-AMB-002',
    title: 'Matriz de Levantamento de Aspectos e Impactos Ambientais (LAIA)',
    category: 'Matrizes',
    standard: 'ISO 14001',
    processName: 'Operações e Manutenção',
    version: 'v1.0',
    responsibleName: 'Técnico Ambiental',
    approverName: 'Gestor do SGI',
    status: 'Em revisão',
    companyId: 'empresa-01',
    changeHistory: ['v1.0 – Submetido para validação técnica dos controlos operacionais'],
    createdAt: '2026-02-12T10:00:00Z',
  },
];

export const INITIAL_ISO_AUDITS: IsoAuditItem[] = [
  {
    id: 'aud-01',
    companyId: 'empresa-01',
    companyName: 'Empresa Industrial de Luanda, Lda',
    standard: 'ISO 9001:2015',
    processName: 'Compras e Avaliação de Fornecedores',
    auditorName: 'Auditor Interno SGI – ALHAN',
    auditDate: '2026-02-18',
    location: 'Instalações de Luanda – Viana',
    criteria: 'Cláusula 8.4 – Controlo de processos, produtos e serviços providos externamente',
    classification: 'Não conformidade',
    findings: 'Verificou-se que 2 fornecedores críticos de calibração não possuíam registo de avaliação periódica atualizado no exercício corrente.',
    evidenceNote: 'Amostra verificada: Dossier de Fornecedores #DF-2026-04 e #DF-2026-09.',
    createdAt: '2026-02-18T14:00:00Z',
  },
  {
    id: 'aud-02',
    companyId: 'empresa-01',
    companyName: 'Empresa Industrial de Luanda, Lda',
    standard: 'ISO 45001:2018',
    processName: 'Armazenagem e Movimentação de Cargas',
    auditorName: 'Auditor Interno SGI – ALHAN',
    auditDate: '2026-02-20',
    location: 'Armazém Central',
    criteria: 'Cláusula 8.1.2 – Eliminar perigos e reduzir riscos de SST',
    classification: 'Conformidade',
    findings: 'As Análises Preliminares de Risco (APR) e os registos de inspecção de empilhadores encontram-se devidamente preenchidos e assinados.',
    evidenceNote: 'Verificados registos APR-012 a APR-019 e fichas de manutenção preventiva.',
    createdAt: '2026-02-20T11:00:00Z',
  },
];

export const INITIAL_NON_CONFORMITIES: NonConformityItem[] = [
  {
    id: 'nc-01',
    code: 'RNC-2026-001',
    companyId: 'empresa-01',
    companyName: 'Empresa Industrial de Luanda, Lda',
    processName: 'Compras e Avaliação de Fornecedores',
    standard: 'ISO 9001:2015 (Cláusula 8.4.1)',
    problemDescription: 'Ausência de registo de reavaliação anual para 2 fornecedores críticos de serviços de calibração.',
    evidence: 'Auditoria Interna #aud-01 – Dossiers #DF-2026-04 e #DF-2026-09.',
    immediateAction: 'Realização imediata da avaliação de desempenho dos 2 fornecedores e verificação dos certificados de calibração vigentes.',
    rootCause: 'A planilha de controlo de fornecedores não possuía alerta automático para vencimento do ciclo anual de homologação.',
    correctiveAction: 'Implementar controlo de vencimento com alerta de 30 dias de antecedência e bloqueio de emissão de requisição para fornecedor com homologação expirada.',
    responsibleName: 'Responsável de Compras',
    deadline: '2026-03-30',
    executionEvidence: 'Matriz de Homologação v2.1 implementada e formadores/compradores treinados.',
    effectivenessCheck: 'Aguardando verificação no próximo ciclo trimestral.',
    status: 'Em tratamento',
    createdAt: '2026-02-19T09:00:00Z',
  },
];

export const INITIAL_ENROLLMENTS: EnrollmentItem[] = [
  {
    id: 'enr-geral-alhan-hoje',
    studentId: 'usr-geral-alhan-hoje',
    studentName: 'Formando Inscrito (geral@alhan.pro)',
    studentPhone: '+244 922 021 211',
    studentEmail: 'geral@alhan.pro',
    studentBI: '',
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
    paymentHistory: [
      {
        id: 'hist-p1-enr-geral-alhan-hoje',
        installment: '1ª Parcela',
        installmentLabel: '1ª Parcela',
        amountKz: 53125,
        dueDate: '2026-11-10',
        paidAt: '2026-11-10',
        recordedAt: '2026-11-10',
        method: 'Express Angola',
        reference: 'CAD-ALH10-P1',
        status: 'Pago',
        confirmedBy: 'Administrador Principal ALHAN – SGI',
        note: 'Primeira parcela confirmada e aprovada pela Administração [Black Friday Novembro (-15%)].',
      },
      {
        id: 'hist-p2-enr-geral-alhan-hoje',
        installment: '2ª Parcela',
        installmentLabel: '2ª Parcela',
        amountKz: 53125,
        dueDate: '2026-11-19',
        recordedAt: '2026-11-10',
        method: 'Express Angola',
        reference: 'CAD-ALH10-P2',
        status: 'Pendente',
        note: 'Segunda parcela (1 semana após o início da formação).',
      },
    ],
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
    certificateRequestBI: '',
    certificateRequestNotes:
      'Inscrição aprovada e certificado PDF disponibilizado pelo Painel Administrativo Central ALHAN – SGI.',
    enrolledAt: '2026-11-10T09:15:00Z',
    createdAt: '2026-11-10T09:15:00Z',
  },
  {
    id: 'enr-mohamed-caculo-95',
    studentId: 'usr-mohamed-caculo-95',
    studentName: 'Mohamed Caculo',
    studentPhone: '+244 923 000 095',
    studentEmail: 'mohamedcaculo95@gmail.com',
    studentBI: '',
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
    paymentHistory: [
      {
        id: 'hist-p1-enr-mohamed-caculo-95',
        installment: '1ª Parcela',
        installmentLabel: '1ª Parcela',
        amountKz: 53125,
        dueDate: '2026-11-09',
        paidAt: '2026-11-10',
        recordedAt: '2026-11-09',
        method: 'Express Angola',
        reference: 'CAD-MCAC95-P1',
        status: 'Pago',
        confirmedBy: 'Administrador Principal ALHAN – SGI',
        note: 'Primeira parcela confirmada e aprovada pela Administração [Black Friday Novembro (-15%)].',
      },
      {
        id: 'hist-p2-enr-mohamed-caculo-95',
        installment: '2ª Parcela',
        installmentLabel: '2ª Parcela',
        amountKz: 53125,
        dueDate: '2026-11-19',
        recordedAt: '2026-11-09',
        method: 'Express Angola',
        reference: 'CAD-MCAC95-P2',
        status: 'Pendente',
        note: 'Segunda parcela (1 semana após o início da formação).',
      },
    ],
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
    certificateRequestBI: '',
    certificateRequestNotes:
      'Inscrição aprovada e certificado PDF disponibilizado pelo Painel Administrativo Central ALHAN – SGI.',
    enrolledAt: '2026-11-09T14:30:00Z',
    createdAt: '2026-11-09T14:30:00Z',
  },
  {
    id: 'enr-carvalho-manuel-angola',
    studentId: 'usr-carvalho-manuel-angola',
    studentName: 'Manuel Carvalho',
    studentPhone: '+244 923 000 102',
    studentEmail: 'carvalhomanuelangola@gmail.com',
    studentBI: '',
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
    paymentHistory: [
      {
        id: 'hist-p1-enr-carvalho-manuel-angola',
        installment: '1ª Parcela',
        installmentLabel: '1ª Parcela',
        amountKz: 53125,
        dueDate: '2026-11-09',
        paidAt: '2026-11-10',
        recordedAt: '2026-11-09',
        method: 'Express Angola',
        reference: 'CAD-MCARV1-P1',
        status: 'Pago',
        confirmedBy: 'Administrador Principal ALHAN – SGI',
        note: 'Primeira parcela confirmada e aprovada pela Administração [Black Friday Novembro (-15%)].',
      },
      {
        id: 'hist-p2-enr-carvalho-manuel-angola',
        installment: '2ª Parcela',
        installmentLabel: '2ª Parcela',
        amountKz: 53125,
        dueDate: '2026-11-19',
        recordedAt: '2026-11-09',
        method: 'Express Angola',
        reference: 'CAD-MCARV1-P2',
        status: 'Pendente',
        note: 'Segunda parcela (1 semana após o início da formação).',
      },
    ],
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
    certificateRequestBI: '',
    certificateRequestNotes:
      'Inscrição aprovada e certificado PDF disponibilizado pelo Painel Administrativo Central ALHAN – SGI.',
    enrolledAt: '2026-11-09T16:15:00Z',
    createdAt: '2026-11-09T16:15:00Z',
  },
  {
    id: 'enr-01',
    studentId: 'aluno-01',
    studentName: 'Manuel João Mateus',
    studentPhone: '+244 923 456 789',
    studentEmail: 'manuel.mateus@empresa.ao',
    studentBI: '005432198LA031',
    courseId: 'curso-sgi-01',
    courseTitle: 'Sistema de Gestão Integrado – SGI',
    modality: 'Híbrida',
    amountKz: 145000,
    paymentMethod: 'Express Angola',
    paymentReference: 'EXP-992817',
    receiptNote: 'Comprovativo Multicaixa Express validado pela administração.',
    paymentStatus: 'Pago',
    enrollmentApprovalStatus: 'aprovado',
    courseStartDate: '2026-02-01',
    firstInstallmentAmountKz: 72500,
    firstInstallmentDueDate: '2026-02-01',
    firstInstallmentStatus: 'Pago',
    firstInstallmentPaidAt: '2026-02-01',
    firstInstallmentReference: 'EXP-992817-P1',
    secondInstallmentAmountKz: 72500,
    secondInstallmentDueDate: '2026-02-08',
    secondInstallmentStatus: 'Pago',
    secondInstallmentPaidAt: '2026-02-07',
    secondInstallmentReference: 'EXP-992817-P2',
    paymentHistory: [
      {
        id: 'pay-hist-01',
        installment: '1ª Parcela',
        amountKz: 72500,
        dueDate: '2026-02-01',
        paidAt: '2026-02-01',
        method: 'Express Angola',
        reference: 'EXP-992817-P1',
        status: 'Pago',
        confirmedBy: 'Direcção Geral ALHAN',
        note: 'Primeira parcela paga no acto da inscrição para confirmar a vaga.',
      },
      {
        id: 'pay-hist-02',
        installment: '2ª Parcela',
        amountKz: 72500,
        dueDate: '2026-02-08',
        paidAt: '2026-02-07',
        method: 'Express Angola',
        reference: 'EXP-992817-P2',
        status: 'Pago',
        confirmedBy: 'Direcção Geral ALHAN',
        note: 'Segunda parcela paga 1 semana após o início da formação.',
      },
    ],
    progressPercent: 100,
    completedLessons: ['les-sgi-1', 'les-sgi-2', 'les-sgi-3'],
    quizScore: 100,
    completed: true,
    certificateRequested: true,
    certificateRequestedAt: '2026-02-14T15:20:00Z',
    createdAt: '2026-02-01T10:00:00Z',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-hse',
    category: 'Nova aula',
    title: 'Turma de Novembro: Formação em HSE Aberta',
    message: 'Inscrições abertas para a Formação em HSE – Saúde, Segurança e Meio Ambiente (Online via Teams & Presencial).',
    targetRole: 'ADMIN',
    read: false,
    createdAt: '2026-11-01T08:30:00Z',
  },
  {
    id: 'notif-1',
    category: 'Certificado disponível',
    title: 'Validação Pública de Certificados Activa',
    message: 'Consulte a autenticidade de certificados de formação e baixe certificados presenciais pelo número de B.I.',
    targetRole: 'ADMIN',
    read: false,
    createdAt: '2026-02-25T08:30:00Z',
  },
];

export const INITIAL_CERTIFICATE_REQUESTS: CertificateRequestItem[] = [
  {
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
  {
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
  {
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
  {
    id: 'cert-req-01',
    enrollmentId: 'enr-01',
    userId: 'aluno-01',
    studentName: 'Manuel João Mateus',
    studentEmail: 'manuel.mateus@empresa.ao',
    studentPhone: '+244 923 456 789',
    studentBI: '005432198LA031',
    courseId: 'curso-sgi-01',
    courseName: 'Sistema de Gestão Integrado – SGI',
    modality: 'Híbrida',
    workloadHours: 40,
    enrollmentDate: '2026-02-01',
    completionDate: '2026-02-14',
    requestDate: '2026-02-14T15:20:00Z',
    studentNotes: 'Solicito o envio do meu certificado oficial em PDF pelo Administrador após conclusão da formação.',
    status: 'PENDENTE',
    certificateStoragePath: 'certificates/aluno-01/curso-sgi-01/certificate.pdf',
    certificateFileUrl: '',
    certificateFileName: '',
    certificateCode: 'ALHAN-SGI-2026-001',
    issuedAt: '',
    issuedBy: '',
    adminNotes: 'Aguardando anexo e envio do Certificado em PDF exclusivamente pelo Administrador.',
    auditHistory: [
      {
        id: 'aud-c-1',
        action: 'SOLICITADO',
        statusAfter: 'PENDENTE',
        actorName: 'Manuel João Mateus',
        actorRole: 'ALUNO',
        notes: 'Solicitação submetida pelo formando no painel do aluno. Aguarda envio do ficheiro PDF oficial pelo Administrador.',
        timestamp: '2026-02-14T15:20:00Z',
      },
    ],
    createdAt: '2026-02-14T15:20:00Z',
  },
];

export const INITIAL_ADMIN_NOTIFICATIONS: AdminNotificationRecord[] = [
  {
    id: 'adm-notif-geral-alhan-hoje',
    type: 'NOVA_INSCRICAO',
    title: 'Nova Inscrição de Hoje Pendente: geral@alhan.pro',
    message: 'Nova inscrição registada hoje associada a geral@alhan.pro. Aguarda aprovação do estado (PENDENTE -> APROVADO) no Painel Administrativo Central.',
    studentName: 'Formando Inscrito (geral@alhan.pro)',
    courseName: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
    requestId: 'cert-req-geral-alhan-hoje',
    read: false,
    createdAt: '2026-11-10T09:15:00Z',
  },
  {
    id: 'adm-notif-mohamed-95',
    type: 'NOVA_INSCRICAO',
    title: 'Inscrição Pendente de Aprovação: Mohamed Caculo (mohamedcaculo95@gmail.com)',
    message: 'O formando Mohamed Caculo (mohamedcaculo95@gmail.com) realizou inscrição ontem e aguarda aprovação do estado (PENDENTE -> APROVADO) no Painel Administrativo Central.',
    studentName: 'Mohamed Caculo',
    courseName: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
    requestId: 'cert-req-mohamed-caculo-95',
    read: false,
    createdAt: '2026-11-09T14:30:00Z',
  },
  {
    id: 'adm-notif-carvalho-manuel',
    type: 'NOVA_INSCRICAO',
    title: 'Inscrição Pendente de Aprovação: Manuel Carvalho (carvalhomanuelangola@gmail.com)',
    message: 'O formando Manuel Carvalho (carvalhomanuelangola@gmail.com) realizou inscrição ontem e aguarda aprovação do estado (PENDENTE -> APROVADO) no Painel Administrativo Central.',
    studentName: 'Manuel Carvalho',
    courseName: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
    requestId: 'cert-req-carvalho-manuel-angola',
    read: false,
    createdAt: '2026-11-09T16:15:00Z',
  },
  {
    id: 'adm-notif-01',
    type: 'SOLICITACAO_CERTIFICADO',
    title: 'Solicitação de certificado PDF pendente de envio pelo ADM',
    message: 'O formando Manuel João Mateus solicitou o certificado PDF da formação Sistema de Gestão Integrado – SGI. Anexe e envie o PDF oficial.',
    studentName: 'Manuel João Mateus',
    courseName: 'Sistema de Gestão Integrado – SGI',
    requestId: 'cert-req-01',
    read: false,
    createdAt: '2026-02-14T15:20:00Z',
  },
];

// ============================================================================
// PORTEFÓLIO, IMPACTO, EMPREGABILIDADE E GOVERNANÇA INSTITUCIONAL
// ============================================================================

export interface DynamicCountersConfig {
  trainedStudentsCount: number | null;
  trainedStudentsValidated: boolean;
  trainedStudentsSource: string;
  sgiImplementationsCount: number | null;
  sgiImplementationsValidated: boolean;
  sgiImplementationsSource: string;
  coursesDeliveredCount: number | null;
  coursesDeliveredValidated: boolean;
  coursesDeliveredSource: string;
  partnerCompaniesCount: number | null;
  partnerCompaniesValidated: boolean;
  partnerCompaniesSource: string;
  referencePeriod: string;
  updatedAt: string;
  updatedBy: string;
}

export interface EmployabilityIndicatorItem {
  id: string;
  key:
    | 'total_certificados'
    | 'primeiro_emprego'
    | 'reintegracao_mercado'
    | 'promocao_profissional'
    | 'conta_propria'
    | 'empresas_contratantes';
  label: string;
  description: string;
  value: number | null;
  percentageOfTotal?: number | null;
  unit: string;
  validated: boolean;
  referencePeriod: string;
  sourceMethod: string;
  accountingCriteria: string;
  evidenceReference: string;
  updatedAt: string;
  updatedBy: string;
}

export type EmployabilityOutcomeCategory =
  | 'PRIMEIRO_EMPREGO'
  | 'REINTEGRACAO_MERCADO'
  | 'PROMOCAO_PROFISSIONAL'
  | 'CONTA_PROPRIA'
  | 'EM_ACOMPANHAMENTO';

export interface AlumniTrackingRecord {
  id: string;
  studentName: string;
  studentBI?: string;
  courseTitle: string;
  certificateCode: string;
  completionYear: string;
  outcomeCategory: EmployabilityOutcomeCategory;
  employerOrActivityName: string;
  jobRoleOrService: string;
  verificationSource: string;
  dataProtectionConsent: boolean;
  validatedByAdmin: boolean;
  updatedAt: string;
}

export interface ImpactEvidenceDocument {
  id: string;
  code: string;
  title: string;
  category: 'Pauta & Registo de Certificação' | 'Inquérito de Empregabilidade' | 'Protocolo & Parceria' | 'Evidência Fotográfica / Actividade' | 'Relatório de Auditoria Interna';
  description: string;
  referencePeriod: string;
  sourceOrigin: string;
  fileUrl?: string;
  fileName?: string;
  validated: boolean;
  published: boolean;
  uploadedAt: string;
  uploadedBy: string;
}

export interface PublicImpactReportItem {
  id: string;
  editionYear: string;
  referencePeriod: string;
  title: string;
  subtitle: string;
  status: 'RASCUNHO' | 'APROVADO_PUBLICADO' | 'ARQUIVADO';
  approvedBy: string;
  publishedAt: string;
  updatedAt: string;
  section1PresentationAndObjectives: string;
  section2ActivitiesAndTrainings: string;
  section3AchievedResults: string;
  section4EmployabilityIndicatorsSummary: string;
  section5MethodologyAndValidation: string;
  section6EvidencesAndSupportDocs: string;
  section7ConclusionsAndFuturePerspectives: string;
  pdfAttachmentUrl?: string;
  pdfAttachmentName?: string;
}

export interface ImpactGovernanceAuditEntry {
  id: string;
  action: string;
  actorName: string;
  details: string;
  timestamp: string;
}

export interface TrainingPortfolioHistoryItem {
  id: string;
  editionCode: string;
  courseTitle: string;
  specialtyArea: string;
  modality: 'Presencial' | 'Online' | 'Híbrida';
  location: string;
  period: string;
  certifiedStudentsCount: number | null;
  validatedCount: boolean;
  activityDescription: string;
  imageUrl: string;
  evidenceCode: string;
}

export interface InstitutionalPartnershipItem {
  id: string;
  organizationName: string;
  sector: string;
  partnershipType: 'Parceiro Empresarial' | 'Cliente de Consultoria SGI' | 'Entidade Empregadora / Recepção de Formandos' | 'Cooperação Técnica';
  scopeDescription: string;
  sinceYear: string;
  verified: boolean;
}

export const INITIAL_DYNAMIC_COUNTERS: DynamicCountersConfig = {
  trainedStudentsCount: 2,
  trainedStudentsValidated: true,
  trainedStudentsSource: 'Registo Oficial de Certificados Validados na Plataforma ALHAN (ALHAN-SGI-2026-001 e ALH-PRES-2026-0042)',
  sgiImplementationsCount: 5,
  sgiImplementationsValidated: true,
  sgiImplementationsSource: 'Dossiers de Consultoria e Projectos ISO/SGI Executados pela Equipa Técnica ALHAN',
  coursesDeliveredCount: 10,
  coursesDeliveredValidated: true,
  coursesDeliveredSource: 'Catálogo Oficial de Especialidades e Programas Formativos Ministrados pela Academia ALHAN',
  partnerCompaniesCount: 5,
  partnerCompaniesValidated: true,
  partnerCompaniesSource: 'Organizações e Clientes Corporativos com Projectos e Protocolos Registados',
  referencePeriod: 'Ciclo Institucional 2025 – 2026',
  updatedAt: '2026-03-01T10:00:00Z',
  updatedBy: 'Direcção Geral – ALHAN SGI',
};

export const INITIAL_EMPLOYABILITY_INDICATORS: EmployabilityIndicatorItem[] = [
  {
    id: 'ind-emp-1',
    key: 'total_certificados',
    label: 'Total de Formandos Certificados',
    description: 'Formandos com avaliação concluída, aproveitamento comprovado e certificado oficial emitido e registado pela Administração.',
    value: 2,
    percentageOfTotal: 100,
    unit: 'Formandos',
    validated: true,
    referencePeriod: '2025 – 2026',
    sourceMethod: 'Livro de Registo de Certificados Emitidos e Validação Administrativa ALHAN',
    accountingCriteria: 'Contabiliza exclusivamente formandos com certificado PDF validado e código único activo.',
    evidenceReference: 'EVD-ALH-2026-001 (Registo Oficial de Certificados)',
    updatedAt: '2026-03-01T10:00:00Z',
    updatedBy: 'Direcção Geral – ALHAN SGI',
  },
  {
    id: 'ind-emp-2',
    key: 'primeiro_emprego',
    label: 'Formandos que Conseguiram o Primeiro Emprego',
    description: 'Antigos formandos que ingressaram no mercado de trabalho formal após a conclusão e certificação na Academia ALHAN.',
    value: null,
    percentageOfTotal: null,
    unit: 'Formandos',
    validated: false,
    referencePeriod: 'Inquérito Pós-Formação 2026',
    sourceMethod: 'Inquérito de Acompanhamento de Antigos Formandos (6 e 12 meses pós-formação)',
    accountingCriteria: 'Exige confirmação documental do formando com consentimento expresso de protecção de dados ou declaração da entidade empregadora.',
    evidenceReference: 'EVD-ALH-2026-002 (Inquérito de Rastreabilidade de Empregabilidade)',
    updatedAt: '2026-03-01T10:00:00Z',
    updatedBy: 'Direcção Geral – ALHAN SGI',
  },
  {
    id: 'ind-emp-3',
    key: 'reintegracao_mercado',
    label: 'Formandos Reintegrados no Mercado de Trabalho',
    description: 'Profissionais que se encontravam em transição de carreira e retomaram actividade laboral activa em QSMS/SGI.',
    value: null,
    percentageOfTotal: null,
    unit: 'Formandos',
    validated: false,
    referencePeriod: 'Inquérito Pós-Formação 2026',
    sourceMethod: 'Registo de Acompanhamento de Carreira e Validação junto de Antigos Formandos',
    accountingCriteria: 'Contabiliza apenas registos auditados com evidência de vínculo profissional posterior à data de conclusão do curso.',
    evidenceReference: 'EVD-ALH-2026-002 (Inquérito de Rastreabilidade de Empregabilidade)',
    updatedAt: '2026-03-01T10:00:00Z',
    updatedBy: 'Direcção Geral – ALHAN SGI',
  },
  {
    id: 'ind-emp-4',
    key: 'promocao_profissional',
    label: 'Formandos que Conseguiram Promoção Profissional',
    description: 'Formandos já empregados que progrediram para funções de Coordenação, Auditoria Interna ou Direcção Técnica SGI/HSE.',
    value: 2,
    percentageOfTotal: 100,
    unit: 'Formandos',
    validated: true,
    referencePeriod: '2025 – 2026',
    sourceMethod: 'Declaração de Acompanhamento Pós-Formação e Registo de Desempenho Profissional',
    accountingCriteria: 'Contabiliza formandos certificados com progressão funcional ou atribuição formal de responsabilidades SGI/Auditoria.',
    evidenceReference: 'EVD-ALH-2026-001 / Fichas de Acompanhamento #ALM-01 e #ALM-02',
    updatedAt: '2026-03-01T10:00:00Z',
    updatedBy: 'Direcção Geral – ALHAN SGI',
  },
  {
    id: 'ind-emp-5',
    key: 'conta_propria',
    label: 'Formandos que Iniciaram Actividade por Conta Própria',
    description: 'Antigos formandos que passaram a actuar como consultores independentes, formadores ou auditores externos.',
    value: null,
    percentageOfTotal: null,
    unit: 'Formandos',
    validated: false,
    referencePeriod: 'Inquérito Pós-Formação 2026',
    sourceMethod: 'Inquérito Anual de Empreendedorismo Técnico e Consultoria Independente',
    accountingCriteria: 'Requer registo de actividade profissional autónoma ou prestação de serviços técnicos verificada.',
    evidenceReference: 'EVD-ALH-2026-002 (Inquérito de Rastreabilidade de Empregabilidade)',
    updatedAt: '2026-03-01T10:00:00Z',
    updatedBy: 'Direcção Geral – ALHAN SGI',
  },
  {
    id: 'ind-emp-6',
    key: 'empresas_contratantes',
    label: 'Empresas que Receberam ou Contrataram Antigos Formandos',
    description: 'Organizações angolanas e multinacionais que integram nos seus quadros profissionais certificados pela ALHAN.',
    value: 2,
    percentageOfTotal: null,
    unit: 'Empresas',
    validated: true,
    referencePeriod: '2025 – 2026',
    sourceMethod: 'Registo Institucional de Entidades Empregadoras e Clientes Corporativos',
    accountingCriteria: 'Contabiliza entidades empresariais verificadas onde actuam formandos com certificado válido emitido pela ALHAN.',
    evidenceReference: 'EVD-ALH-2026-003 (Dossier de Empresas e Rastreabilidade)',
    updatedAt: '2026-03-01T10:00:00Z',
    updatedBy: 'Direcção Geral – ALHAN SGI',
  },
];

export const INITIAL_ALUMNI_TRACKING: AlumniTrackingRecord[] = [
  {
    id: 'alm-01',
    studentName: 'Manuel João Mateus',
    studentBI: '005432198LA031',
    courseTitle: 'Sistema de Gestão Integrado – SGI (ISO 9001, 14001 e 45001)',
    certificateCode: 'ALHAN-SGI-2026-001',
    completionYear: '2026',
    outcomeCategory: 'PROMOCAO_PROFISSIONAL',
    employerOrActivityName: 'Empresa Industrial de Luanda, Lda',
    jobRoleOrService: 'Técnico Especialista & Auditor Interno do SGI',
    verificationSource: 'Validação directa com a empresa e certificado #ALHAN-SGI-2026-001',
    dataProtectionConsent: true,
    validatedByAdmin: true,
    updatedAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'alm-02',
    studentName: 'Eng.º António Francisco da Costa',
    studentBI: '007891234LA042',
    courseTitle: 'Implementador e Auditor Interno SGI - Luanda Presencial (Kilamba)',
    certificateCode: 'ALH-PRES-2026-0042',
    completionYear: '2026',
    outcomeCategory: 'PROMOCAO_PROFISSIONAL',
    employerOrActivityName: 'Sociedade Industrial de Luanda, S.A.',
    jobRoleOrService: 'Coordenador de Implementação e Auditoria Interna SGI',
    verificationSource: 'Pauta Presencial Kilamba e Certificado #ALH-PRES-2026-0042',
    dataProtectionConsent: true,
    validatedByAdmin: true,
    updatedAt: '2026-02-28T15:00:00Z',
  },
];

export const INITIAL_IMPACT_EVIDENCES: ImpactEvidenceDocument[] = [
  {
    id: 'evd-01',
    code: 'EVD-ALH-2026-001',
    title: 'Registo Geral de Certificados Emitidos e Pautas Pedagógicas Validadas',
    category: 'Pauta & Registo de Certificação',
    description: 'Base documental auditável contendo os códigos únicos de certificados emitidos pela Administração, carga horária cumprida e avaliação final.',
    referencePeriod: '2025 – 2026',
    sourceOrigin: 'Coordenação Pedagógica – Academia ALHAN',
    validated: true,
    published: true,
    uploadedAt: '2026-02-28T16:00:00Z',
    uploadedBy: 'Direcção Geral – ALHAN SGI',
  },
  {
    id: 'evd-02',
    code: 'EVD-ALH-2026-002',
    title: 'Protocolo Metodológico de Inquérito e Rastreabilidade de Empregabilidade (6 e 12 Meses)',
    category: 'Inquérito de Empregabilidade',
    description: 'Instrumento oficial de recolha de dados junto de antigos formandos com termo de consentimento de protecção de dados pessoais e verificação de vínculo laboral.',
    referencePeriod: 'Ciclo 2026',
    sourceOrigin: 'Gabinete de Qualidade, Governance e Impacto – ALHAN',
    validated: true,
    published: true,
    uploadedAt: '2026-03-01T09:00:00Z',
    uploadedBy: 'Direcção Geral – ALHAN SGI',
  },
  {
    id: 'evd-03',
    code: 'EVD-ALH-2026-003',
    title: 'Dossier de Projectos de Consultoria ISO e Acompanhamento em Empresas Clientes',
    category: 'Relatório de Auditoria Interna',
    description: 'Evidências de diagnósticos Gap Analysis, mapeamento de processos SIPOC, matrizes LAIA/SST e auditorias internas ISO 19011 realizadas em Angola.',
    referencePeriod: '2025 – 2026',
    sourceOrigin: 'Divisão de Consultoria e Auditoria Técnica – ALHAN',
    validated: true,
    published: true,
    uploadedAt: '2026-03-01T09:30:00Z',
    uploadedBy: 'Direcção Geral – ALHAN SGI',
  },
];

export const INITIAL_TRAINING_PORTFOLIO_HISTORY: TrainingPortfolioHistoryItem[] = [
  {
    id: 'port-hist-01',
    editionCode: 'ED-SGI-2026-01',
    courseTitle: 'Sistema de Gestão Integrado – SGI (ISO 9001, ISO 14001 e ISO 45001)',
    specialtyArea: 'Sistemas Integrados (Qualidade, Ambiente e SST)',
    modality: 'Híbrida',
    location: 'Luanda (Centralidade do Kilamba) & Microsoft Teams',
    period: 'Fevereiro 2026',
    certifiedStudentsCount: 2,
    validatedCount: true,
    activityDescription:
      'Capacitação prática na estrutura harmonizada Anexo SL, elaboração de matrizes integradas de risco QSMS, mapeamento SIPOC e condução de auditorias internas.',
    imageUrl: '/assets/aistudio/iso_a9fe34ed.jpg',
    evidenceCode: 'EVD-ALH-2026-001',
  },
  {
    id: 'port-hist-02',
    editionCode: 'ED-HSE-2026-11',
    courseTitle: 'Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)',
    specialtyArea: 'Saúde Ocupacional, Segurança Operacional e Ambiente',
    modality: 'Híbrida',
    location: 'Luanda & Online via Microsoft Teams',
    period: 'Ciclo 2026 (Inscrições e Turmas em Curso)',
    certifiedStudentsCount: null,
    validatedCount: false,
    activityDescription:
      'Formação orientada para Análise Preliminar de Risco (APR), Permissões de Trabalho (PTW), hierarquia de controlos ISO 45001, matriz LAIA e resposta a emergências.',
    imageUrl: '/assets/aistudio/Forma__o_HSE__Turma_de_Novembro_eeeafbbb.png',
    evidenceCode: 'EVD-ALH-2026-002',
  },
  {
    id: 'port-hist-03',
    editionCode: 'ED-AUD-2026-02',
    courseTitle: 'Formação de Auditores Internos e Auditores Líderes (ISO 19011)',
    specialtyArea: 'Auditoria de Sistemas de Gestão',
    modality: 'Presencial',
    location: 'Luanda – Angola',
    period: 'Ciclo Formativo 2026',
    certifiedStudentsCount: null,
    validatedCount: false,
    activityDescription:
      'Simulações práticas de auditoria de 1ª e 2ª parte, recolha de evidências objectivas, entrevistas no terreno e redacção técnica de constatações de não conformidade.',
    imageUrl: '/assets/aistudio/imagm_da_alha_2a7ca3f2.png',
    evidenceCode: 'EVD-ALH-2026-003',
  },
];

export const INITIAL_INSTITUTIONAL_PARTNERSHIPS: InstitutionalPartnershipItem[] = [
  {
    id: 'part-01',
    organizationName: 'Empresa Industrial de Luanda, Lda',
    sector: 'Indústria Transformadora & Logística',
    partnershipType: 'Cliente de Consultoria SGI',
    scopeDescription: 'Implementação acompanhada do Sistema de Gestão Integrado (ISO 9001, ISO 14001 e ISO 45001), auditoria interna e qualificação de quadros.',
    sinceYear: '2026',
    verified: true,
  },
  {
    id: 'part-02',
    organizationName: 'Sociedade Industrial de Luanda, S.A.',
    sector: 'Indústria & Metalomecânica',
    partnershipType: 'Entidade Empregadora / Recepção de Formandos',
    scopeDescription: 'Cooperação técnica em implementação SGI e integração de quadros técnicos certificados em Qualidade e SST.',
    sinceYear: '2025',
    verified: true,
  },
  {
    id: 'part-03',
    organizationName: 'Kwanza Logistics & Supply Chain, Lda',
    sector: 'Logística Portuária & Distribuição',
    partnershipType: 'Parceiro Empresarial',
    scopeDescription: 'Projectos de Gestão Ambiental (ISO 14001) e Compliance/Antissuborno (ISO 37001) para operações logísticas.',
    sinceYear: '2025',
    verified: true,
  },
  {
    id: 'part-04',
    organizationName: 'Atlas Offshore & Energy Services',
    sector: 'Petróleo, Gás & Energia',
    partnershipType: 'Parceiro Empresarial',
    scopeDescription: 'Capacitação de equipas técnicas em Auditoria Interna ISO 19011 e Segurança e Saúde no Trabalho ISO 45001.',
    sinceYear: '2025',
    verified: true,
  },
  {
    id: 'part-05',
    organizationName: 'Empreendimentos de Construção Benguela, Lda',
    sector: 'Construção Civil & Obras Públicas',
    partnershipType: 'Parceiro Empresarial',
    scopeDescription: 'Padronização de processos operacionais de estaleiro e indicadores KPI segundo a norma ISO 9001:2015.',
    sinceYear: '2025',
    verified: true,
  },
];

export const INITIAL_PUBLIC_IMPACT_REPORTS: PublicImpactReportItem[] = [
  {
    id: 'rep-impact-2026',
    editionYear: '2026',
    referencePeriod: '1.º Semestre de 2026 (Dados Auditados até Março de 2026)',
    title: 'Relatório Institucional de Impacto, Formação Profissional e Empregabilidade — 2026',
    subtitle: 'Transparência, Governance Pedagógica e Resultados Verificados da Academia e Consultoria ALHAN em Angola',
    status: 'APROVADO_PUBLICADO',
    approvedBy: 'Direcção Geral – ALHAN CONSULTORIA E PRESTAÇÃO DE SERVIÇOS, LDA',
    publishedAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
    section1PresentationAndObjectives:
      'A ALHAN CONSULTORIA E PRESTAÇÃO DE SERVIÇOS, LDA (NIF 5000682557), sediada em Luanda, Centralidade do Kilamba, Quarteirão Q, Prédio Q13, Apartamento 41, apresenta o seu Relatório Público de Impacto e Empregabilidade. O objectivo central deste documento institucional é prestar contas, com rigor técnico e transparência absoluta, sobre as actividades formativas ministradas, os projectos de consultoria em Sistemas de Gestão ISO/SGI e a evolução profissional verificada dos nossos formandos no mercado angolano.',
    section2ActivitiesAndTrainings:
      'No período em análise, a Academia ALHAN estruturou e ministrou 10 programas de formação especializada nas modalidades Presencial, Online e Híbrida, abrangendo Sistema de Gestão Integrado (SGI – ISO 9001, ISO 14001 e ISO 45001), Formação em HSE (Saúde, Segurança e Meio Ambiente), Auditor Líder ISO 19011, Compliance (ISO 37001/37301), Consultoria Ambiental e Segurança e Saúde no Trabalho. Paralelamente, a divisão técnica conduziu diagnósticos Gap Analysis, mapeamento de processos SIPOC, elaboração de procedimentos obrigatórios e auditorias internas em empresas industriais, logísticas e de construção.',
    section3AchievedResults:
      'Foram consolidados os dossiers pedagógicos e técnicos com emissão controlada de certificados exclusivamente pela Administração após verificação de aproveitamento, frequência e regularização contratual. No âmbito empresarial, os projectos acompanhados atingiram marcos verificáveis de padronização documental (Políticas SGI, Matrizes LAIA e APR) e tratamento eficaz de não conformidades segundo a ISO 19011.',
    section4EmployabilityIndicatorsSummary:
      'Em estrita observância aos princípios de Governance e Compliance da ALHAN, apenas são publicados números que possuem suporte documental validado. Actualmente encontram-se registados e auditados 2 formandos certificados com progressão profissional documentada em funções de coordenação e auditoria interna SGI em 2 empresas de referência. Os indicadores relativos a Primeiro Emprego, Reintegração no Mercado de Trabalho e Actividade por Conta Própria encontram-se com o estatuto oficial "Dados em actualização" enquanto decorre o ciclo regulamentar de recolha e validação documental pós-formação.',
    section5MethodologyAndValidation:
      'A metodologia de recolha e validação de dados da ALHAN baseia-se em três níveis de verificação: (1) Registo Interno de Certificação com código único e arquivo PDF emitido pelo Administrador; (2) Inquérito de Rastreabilidade de Carreira realizado aos 6 e 12 meses após a conclusão da formação, acompanhado de consentimento informado de protecção de dados pessoais; e (3) Confirmação documental (declaração de vínculo, promoção funcional ou prestação de serviços) validada pela Direcção antes de qualquer publicação estatística.',
    section6EvidencesAndSupportDocs:
      'Os indicadores deste relatório estão suportados pelos documentos institucionais EVD-ALH-2026-001 (Registo Geral de Certificados Emitidos e Pautas Validadas), EVD-ALH-2026-002 (Protocolo de Inquérito de Empregabilidade e Consentimento de Dados) e EVD-ALH-2026-003 (Dossier de Projectos de Consultoria e Auditorias Internas ISO).',
    section7ConclusionsAndFuturePerspectives:
      'A ALHAN reafirma o seu compromisso com a verdade estatística, a qualificação prática dos quadros angolanos e o fortalecimento da competitividade das empresas nacionais através das normas ISO. Para os próximos ciclos trimestrais, prevê-se a conclusão da validação documental dos novos inquéritos de empregabilidade das turmas de HSE e SGI e a expansão de parcerias técnicas com o sector produtivo em Luanda e demais províncias.',
  },
  {
    id: 'rep-impact-2025',
    editionYear: '2025',
    referencePeriod: 'Exercício Institucional de 2025 (Relatório Anual Consolidado)',
    title: 'Relatório Institucional de Actividades, Estruturação Pedagógica e Consultoria ISO — 2025',
    subtitle: 'Consolidação da Metodologia de 14 Etapas ISO e Lançamento dos Programas de Qualificação QSMS/SGI',
    status: 'APROVADO_PUBLICADO',
    approvedBy: 'Direcção Geral – ALHAN CONSULTORIA E PRESTAÇÃO DE SERVIÇOS, LDA',
    publishedAt: '2025-12-20T10:00:00Z',
    updatedAt: '2025-12-20T10:00:00Z',
    section1PresentationAndObjectives:
      'O Relatório Anual de 2025 documenta a consolidação metodológica da ALHAN CONSULTORIA E PRESTAÇÃO DE SERVIÇOS, LDA na estruturação de serviços de consultoria em normas ISO e preparação da oferta formativa especializada para o mercado angolano.',
    section2ActivitiesAndTrainings:
      'Estruturação dos manuais técnicos, matrizes práticas LAIA, APR e SIPOC, e desenvolvimento dos programas curriculares de Qualidade (ISO 9001), Ambiente (ISO 14001), SST (ISO 45001), Auditoria (ISO 19011) e Compliance (ISO 37001).',
    section3AchievedResults:
      'Implementação da metodologia proprietária em 14 etapas para acompanhamento de clientes corporativos e estabelecimento de parcerias técnicas nos sectores industrial, logístico, energético e de construção civil.',
    section4EmployabilityIndicatorsSummary:
      'Definição da matriz institucional de indicadores de empregabilidade e criação dos protocolos de rastreabilidade pós-formação para aplicação às coortes certificadas.',
    section5MethodologyAndValidation:
      'Adopção do padrão de Governança de Dados da ALHAN: proibição de estimativas não auditadas, exigência de consentimento de protecção de dados e aprovação prévia da Administração para publicação de relatórios e testemunhos.',
    section6EvidencesAndSupportDocs:
      'Manuais pedagógicos aprovados, procedimentos internos de gestão documental e registos de projectos de consultoria empresarial.',
    section7ConclusionsAndFuturePerspectives:
      'As bases lançadas em 2025 permitiram a transição para a plataforma digital integrada em 2026, com controlo rigoroso de certificados PDF emitidos pela Administração e monitorização contínua do impacto formativo.',
  },
];

export const INITIAL_IMPACT_AUDIT_LOGS: ImpactGovernanceAuditEntry[] = [
  {
    id: 'imp-log-01',
    action: 'PUBLICACAO_RELATORIO_IMPACTO',
    actorName: 'Direcção Geral – ALHAN SGI',
    details: 'Publicação oficial do Relatório Institucional de Impacto e Empregabilidade 2026 com validação de indicadores e fontes documentais.',
    timestamp: '2026-03-01T10:00:00Z',
  },
];


