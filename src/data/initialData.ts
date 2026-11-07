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
  createdAt: string;
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

export interface EnrollmentItem {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  studentEmail?: string;
  courseId: string;
  courseTitle: string;
  modality: 'Online' | 'Presencial' | 'Híbrida';
  amountKz: number;
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
  paymentStatus: 'Pendente' | 'Pago' | 'Falhado' | 'Cancelado' | 'Reembolsado';
  progressPercent: number;
  completedLessons: string[];
  quizScore?: number;
  completed: boolean;
  certificateRequested?: boolean;
  certificateRequestedAt?: string;
  certificateId?: string;
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
  responsibleName: string;
  responsibleRole: string;
  status: 'valido' | 'cancelado' | 'expirado';
  certificateFileUrl?: string;
  certificateFileName?: string;
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
      'Excelente rigor técnico e pontualidade. Os formadores da Academia ALHAN qualificaram 28 auditores internos da nossa equipa offshore com material didáctico irrepreensível e simulações realistas alinhadas à directriz ISO 19011. Recomendo vivamente.',
    standardImplemented: 'Formação Auditor Líder ISO 19011 & ISO 45001',
    projectOutcome: '28 auditores certificados com validação de QR Code emitida e registada',
    verified: true,
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
  },
  {
    id: 'test-5',
    clientName: 'Dr. Sebastião Quaresma',
    role: 'Director Executivo',
    companyName: 'AgroSul Alimentos & Bebidas',
    companySector: 'Agroindústria & Segurança Alimentar',
    companyLogoText: 'AGROSUL',
    rating: 5,
    feedback:
      'A equipa da ALHAN demonstrou profundo conhecimento do quadro legal angolano e das normas internacionais. A implementação das boas práticas e controlos preventivos permitiu-nos alcançar um patamar de excelência exigido pelas maiores redes retalhistas.',
    standardImplemented: 'ISO 22000 & Boas Práticas Operacionais',
    projectOutcome: 'Rastreabilidade total da cadeia produtiva e homologação como fornecedor classe A',
    verified: true,
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

export const INITIAL_CERTIFICATES: CertificateItem[] = [
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
    id: 'enr-01',
    studentId: 'aluno-01',
    studentName: 'Manuel João Mateus',
    studentPhone: '+244 923 456 789',
    studentEmail: 'manuel.mateus@empresa.ao',
    courseId: 'curso-sgi-01',
    courseTitle: 'Sistema de Gestão Integrado – SGI',
    modality: 'Híbrida',
    amountKz: 145000,
    paymentMethod: 'Express Angola',
    paymentReference: 'EXP-992817',
    receiptNote: 'Comprovativo Multicaixa Express validado pela administração.',
    paymentStatus: 'Pago',
    progressPercent: 100,
    completedLessons: ['les-sgi-1', 'les-sgi-2', 'les-sgi-3'],
    quizScore: 100,
    completed: true,
    createdAt: '2026-02-01T10:00:00Z',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-hse',
    category: 'Nova aula',
    title: 'Turma de Novembro: Formação em HSE Aberta',
    message: 'Inscrições abertas para a Formação em HSE – Saúde, Segurança e Meio Ambiente (Online via Teams & Presencial).',
    targetRole: 'ALL',
    read: false,
    createdAt: '2026-11-01T08:30:00Z',
  },
  {
    id: 'notif-1',
    category: 'Certificado disponível',
    title: 'Validação Pública de Certificados Activa',
    message: 'Consulte a autenticidade de certificados de formação e baixe certificados presenciais pelo número de B.I.',
    targetRole: 'ALL',
    read: false,
    createdAt: '2026-02-25T08:30:00Z',
  },
];
