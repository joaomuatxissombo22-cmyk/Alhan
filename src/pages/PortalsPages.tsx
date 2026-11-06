import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  FileText,
  CheckSquare,
  BarChart3,
  Award,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Lock,
  CheckCircle2,
  Video,
  Users,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  ShieldAlert,
  Building2,
  ClipboardCheck,
  AlertTriangle,
  Settings,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  COMPANY_INFO,
  CourseItem,
  EnrollmentItem,
  IsoDocumentItem,
  IsoAuditItem,
  NonConformityItem,
} from '../data/initialData';

// ==========================================
// 1. ÁREA DO ALUNO (LMS & DASHBOARD - SECÇÕES 7, 8, 10)
// ==========================================
export const StudentPortal: React.FC = () => {
  const {
    user,
    courses,
    enrollments,
    certificates,
    notifications,
    completeLesson,
    issueCertificate,
    logout,
    switchRoleForDemo,
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    | 'Dashboard'
    | 'Meus Cursos'
    | 'Aulas'
    | 'Materiais'
    | 'Avaliações'
    | 'Progresso'
    | 'Certificados'
    | 'Mensagens'
    | 'Notificações'
    | 'Meu Perfil'
  >('Dashboard');

  const currentStudentId = user?.role === 'ALUNO' ? user.uid : 'demo-aluno-01';
  const currentStudentName = user?.role === 'ALUNO' ? user.fullName : '[DEMO] Manuel João Mateus';

  // Data isolation: student only sees their own enrollments & certificates
  const myEnrollments = enrollments.filter(
    (e) => e.studentId === currentStudentId || e.studentId === 'demo-aluno-01'
  );
  const myCertificates = certificates.filter(
    (c) => c.studentId === currentStudentId || c.studentId === 'demo-aluno-01'
  );

  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>(
    myEnrollments[0]?.id || ''
  );
  const activeEnrollment =
    myEnrollments.find((e) => e.id === selectedEnrollmentId) || myEnrollments[0];
  const activeCourse = courses.find((c) => c.id === activeEnrollment?.courseId) || courses[0];

  const allLessons = activeCourse?.modules.flatMap((m) => m.lessons) || [];
  const [selectedLessonId, setSelectedLessonId] = useState<string>(allLessons[0]?.id || '');
  const activeLesson = allLessons.find((l) => l.id === selectedLessonId) || allLessons[0];

  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard },
    { id: 'Meus Cursos', icon: BookOpen },
    { id: 'Aulas', icon: PlayCircle },
    { id: 'Materiais', icon: FileText },
    { id: 'Avaliações', icon: CheckSquare },
    { id: 'Progresso', icon: BarChart3 },
    { id: 'Certificados', icon: Award },
    { id: 'Mensagens', icon: MessageSquare },
    { id: 'Notificações', icon: Bell },
    { id: 'Meu Perfil', icon: User },
  ] as const;

  const handleCompleteAndGrade = async () => {
    if (!activeEnrollment || !activeLesson) return;
    const isCorrect = selectedQuizAnswer === activeLesson.quizCorrectIndex;
    const score = isCorrect ? 100 : 70;
    await completeLesson(activeEnrollment.id, activeLesson.id, allLessons.length, score);
    setQuizFeedback(
      isCorrect
        ? 'Resposta Correcta (100%)! Aula marcada como concluída no seu progresso.'
        : 'Aula registada. Reveja o material de apoio para consolidar os conceitos.'
    );
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row bg-[#F5F9FC]">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-[#061A2D] text-[#F5F9FC] border-r border-white/10 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="px-3 py-3 border-b border-white/10">
            <p className="text-[11px] font-semibold text-[#19B5FE]">Área Reservada do Aluno · LMS</p>
            <p className="text-sm font-bold text-white truncate mt-0.5">{currentStudentName}</p>
            <p className="text-[11px] font-mono-tabular text-[#9AA6AE]">ID: {currentStudentId}</p>
          </div>

          <nav className="mt-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === item.id
                      ? 'bg-[#0077C8] text-white'
                      : 'text-[#F5F9FC]/80 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.id}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10 mt-6">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-8 space-y-8">
        {/* Top Greeting Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#0077C8]">Plataforma de Aprendizagem ALHAN – SGI</p>
            <h1 className="text-2xl font-extrabold text-[#061A2D] mt-0.5">
              Olá, {currentStudentName}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Os seus dados, progresso e certificados estão protegidos e isolados para a sua conta individual.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/formacoes"
              className="px-4 py-2 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-semibold"
            >
              Explorar Novas Formações
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500">Cursos Inscritos</p>
            <p className="text-2xl font-extrabold font-mono-tabular text-[#061A2D] mt-1">
              {myEnrollments.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500">Cursos Concluídos</p>
            <p className="text-2xl font-extrabold font-mono-tabular text-emerald-700 mt-1">
              {myEnrollments.filter((e) => e.completed).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500">Progresso Médio</p>
            <p className="text-2xl font-extrabold font-mono-tabular text-[#0077C8] mt-1">
              {myEnrollments.length
                ? Math.round(
                    myEnrollments.reduce((acc, e) => acc + e.progressPercent, 0) / myEnrollments.length
                  )
                : 0}
              %
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500">Certificados Disponíveis</p>
            <p className="text-2xl font-extrabold font-mono-tabular text-[#061A2D] mt-1">
              {myCertificates.length}
            </p>
          </div>
        </div>

        {/* Enrollments List & Course Selector */}
        {(activeTab === 'Dashboard' || activeTab === 'Meus Cursos' || activeTab === 'Progresso') && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#061A2D]">As Minhas Inscrições e Progresso por Curso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myEnrollments.map((enr) => {
                const matchedCourse = courses.find((c) => c.id === enr.courseId);
                return (
                <div
                  key={enr.id}
                  className={`p-5 rounded-xl border transition-colors ${
                    selectedEnrollmentId === enr.id
                      ? 'border-[#0077C8] bg-[#F5F9FC]'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {matchedCourse?.imageUrl && (
                    <div className="h-36 w-full rounded-lg overflow-hidden mb-3 border border-slate-200 bg-[#061A2D]">
                      <img
                        src={matchedCourse.imageUrl}
                        alt={enr.courseTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Modalidade: {enr.modality}</span>
                    <span className="font-mono-tabular font-semibold text-[#061A2D]">
                      Estado Pagamento: {enr.paymentStatus}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#061A2D] mt-1">{enr.courseTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Método: {enr.paymentMethod} · Ref: <span className="font-mono-tabular">{enr.paymentReference}</span>
                  </p>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">Progresso de Conclusão</span>
                      <span className="font-mono-tabular font-bold text-[#0077C8]">{enr.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-[#0077C8] transition-all"
                        style={{ width: `${enr.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                    {enr.paymentStatus === 'Pago' ? (
                      <button
                        onClick={() => {
                          setSelectedEnrollmentId(enr.id);
                          setActiveTab('Aulas');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#061A2D] hover:bg-[#0077C8] text-white text-xs font-semibold"
                      >
                        Assistir às Aulas e Materiais
                      </button>
                    ) : (
                      <span className="text-xs text-amber-700 font-medium">
                        Acesso aguarda validação do comprovativo pelo Administrador
                      </span>
                    )}

                    {enr.completed && enr.paymentStatus === 'Pago' && (
                      <button
                        onClick={async () => {
                          await issueCertificate(enr);
                          setActiveTab('Certificados');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold"
                      >
                        Obter Certificado QR
                      </button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Protected LMS Classroom (Aulas, Materiais, Avaliações - Secções 7 e 10) */}
        {(activeTab === 'Dashboard' ||
          activeTab === 'Aulas' ||
          activeTab === 'Materiais' ||
          activeTab === 'Avaliações') &&
          activeEnrollment && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 alhan-protected-content">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-semibold text-[#0077C8]">
                    Sala de Aula Virtual Protegida · {activeCourse.title}
                  </p>
                  <h2 className="text-lg font-bold text-[#061A2D] mt-0.5">
                    {activeLesson?.title || 'Seleccione uma aula'}
                  </h2>
                </div>
                {activeCourse.liveSessionLink && (
                  <a
                    href={activeCourse.liveSessionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#071B2F] text-[#19B5FE] text-xs font-semibold hover:bg-[#061A2D]"
                  >
                    <Video className="w-4 h-4" />
                    <span>Entrar na Aula ao Vivo ({activeCourse.livePlatform || 'Teams / Zoom'})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {activeEnrollment.paymentStatus !== 'Pago' ? (
                <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-amber-950">
                      Conteúdo Reservado a Alunos com Inscrição Validada
                    </h3>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      A sua inscrição no curso <strong>{activeEnrollment.courseTitle}</strong> encontra-se com estado <strong>«{activeEnrollment.paymentStatus}»</strong>. Assim que o Administrador validar o seu pagamento no Painel Administrativo, os vídeos e materiais serão libertados.
                    </p>
                    <button
                      onClick={() => {
                        switchRoleForDemo('ADMIN');
                        navigate('/admin');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#061A2D] text-white text-xs font-semibold"
                    >
                      Testar Validação como Administrador →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Modules & Lessons Tree */}
                  <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Módulos e Aulas do Curso
                    </h3>
                    {activeCourse.modules.map((mod) => (
                      <div key={mod.id} className="rounded-xl border border-slate-200 overflow-hidden">
                        <div className="bg-[#F5F9FC] px-4 py-2.5 text-xs font-bold text-[#061A2D] border-b border-slate-200">
                          {mod.title}
                        </div>
                        <div className="divide-y divide-slate-100">
                          {mod.lessons.map((les) => {
                            const isDone = activeEnrollment.completedLessons.includes(les.id);
                            return (
                              <button
                                key={les.id}
                                onClick={() => {
                                  setSelectedLessonId(les.id);
                                  setQuizFeedback(null);
                                }}
                                className={`w-full text-left px-4 py-3 text-xs flex items-center justify-between gap-2 transition-colors ${
                                  activeLesson?.id === les.id
                                    ? 'bg-[#0077C8]/10 text-[#061A2D] font-bold'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <span className="line-clamp-2">{les.title}</span>
                                <span className="font-mono-tabular text-[11px] shrink-0 text-slate-500">
                                  {isDone ? '✓ Concluída' : `${les.durationMinutes}m`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: Protected Video Player + Watermark + Protected Material Reader + Quiz */}
                  <div className="lg:col-span-8 space-y-6">
                    {activeLesson && (
                      <>
                        {/* Video Stream Container with Dynamic Student Watermark (Section 10) */}
                        <div
                          onContextMenu={(e) => e.preventDefault()}
                          className="relative rounded-xl overflow-hidden bg-[#061A2D] border border-slate-300 aspect-video"
                        >
                          <video
                            key={activeLesson.videoUrl}
                            src={activeLesson.videoUrl}
                            controls
                            controlsList="nodownload"
                            disablePictureInPicture
                            className="w-full h-full object-cover"
                          />
                          {/* Watermark Overlay with Student Identification */}
                          <div className="pointer-events-none absolute top-3 right-3 bg-[#061A2D]/75 border border-white/15 px-3 py-1 rounded text-[11px] font-mono-tabular text-white/80">
                            ALHAN SGI · {currentStudentName} · ID: {currentStudentId}
                          </div>
                        </div>

                        {/* Section 10 Honest Content Protection Notice */}
                        <div className="p-3.5 rounded-lg bg-[#F5F9FC] border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                          <strong>Protecção de Conteúdos (Secção 10):</strong> Este ambiente utiliza controlo de sessão por utilizador, marca de água dinâmica com identificação do formando ({currentStudentName}), desactivação de download directo e leitor integrado de documentos. Estas medidas reduzem significativamente a cópia e distribuição não autorizada de materiais, embora tecnicamente nenhum sistema web possa impedir totalmente gravações externas de ecrã ou capturas de imagem.
                        </div>

                        {/* Protected Material Viewer (without direct raw PDF file download) */}
                        <div className="rounded-xl border border-slate-200 p-5 bg-[#F5F9FC] space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-[#0077C8]">
                              Leitor Integrado de Material Pedagógico (Download Directo Desactivado)
                            </p>
                            <span className="text-[11px] font-mono-tabular text-slate-500">
                              Marca de água: {currentStudentId}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#061A2D]">{activeLesson.materialTitle}</h4>
                          <p className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200">
                            {activeLesson.materialSummary}
                          </p>
                        </div>

                        {/* Lesson Exercise / Quiz Evaluation */}
                        <div className="rounded-xl border border-slate-200 p-5 space-y-4">
                          <div>
                            <p className="text-xs font-bold text-[#0077C8]">Exercício e Avaliação da Aula</p>
                            <h4 className="text-sm font-bold text-[#061A2D] mt-1">
                              {activeLesson.quizQuestion}
                            </h4>
                          </div>

                          <div className="space-y-2">
                            {activeLesson.quizOptions.map((opt, idx) => (
                              <label
                                key={opt}
                                className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  selectedQuizAnswer === idx
                                    ? 'border-[#0077C8] bg-[#0077C8]/5 font-semibold text-[#061A2D]'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="lesson-quiz"
                                  checked={selectedQuizAnswer === idx}
                                  onChange={() => setSelectedQuizAnswer(idx)}
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>

                          {quizFeedback && (
                            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                              {quizFeedback}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <button
                              type="button"
                              onClick={handleCompleteAndGrade}
                              className="px-4 py-2 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold"
                            >
                              Submeter Avaliação e Concluir Aula
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Certificates Section */}
        {(activeTab === 'Dashboard' || activeTab === 'Certificados') && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#061A2D]">Meus Certificados Emitidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 rounded-xl border border-slate-200 bg-[#F5F9FC] flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs font-mono-tabular font-bold text-[#0077C8]">{cert.code}</p>
                    <h3 className="text-base font-bold text-[#061A2D] mt-0.5">{cert.courseTitle}</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Carga Horária: {cert.workloadHours}h · Conclusão: {cert.issuedDate} · Estado: {cert.status}
                    </p>
                    <Link
                      to={`/consultar-certificado?codigo=${encodeURIComponent(cert.code)}`}
                      className="inline-block mt-3 text-xs font-semibold text-[#0077C8] hover:underline"
                    >
                      Visualizar Certificado Completo e QR Code →
                    </Link>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shrink-0">
                    <QRCodeSVG
                      value={`https://www.alhan.pro/consultar-certificado?codigo=${cert.code}`}
                      size={64}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avisos, Mensagens, Notificações & Perfil */}
        {(activeTab === 'Mensagens' || activeTab === 'Notificações' || activeTab === 'Meu Perfil') && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#061A2D]">{activeTab}</h2>
            {activeTab === 'Meu Perfil' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-[#F5F9FC] border border-slate-200">
                  <p className="text-slate-500">Nome Completo</p>
                  <p className="text-sm font-bold text-[#061A2D] mt-0.5">{currentStudentName}</p>
                </div>
                <div className="p-4 rounded-lg bg-[#F5F9FC] border border-slate-200">
                  <p className="text-slate-500">Email Registado</p>
                  <p className="text-sm font-bold text-[#061A2D] mt-0.5">{user?.email || 'aluno@alhan.pro'}</p>
                </div>
                <div className="p-4 rounded-lg bg-[#F5F9FC] border border-slate-200">
                  <p className="text-slate-500">Telefone</p>
                  <p className="text-sm font-mono-tabular font-bold text-[#061A2D] mt-0.5">
                    {user?.phone || '+244 922 021 211'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[#F5F9FC] border border-slate-200">
                  <p className="text-slate-500">Perfil de Segurança</p>
                  <p className="text-sm font-bold text-[#0077C8] mt-0.5">ALUNO (Isolamento de Dados Activo)</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 rounded-lg bg-[#F5F9FC] border border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-[#0077C8]">{n.category}</span>
                      <span className="font-mono-tabular">{new Date(n.createdAt).toLocaleDateString('pt-AO')}</span>
                    </div>
                    <p className="text-sm font-bold text-[#061A2D] mt-1">{n.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. ÁREA DO PROFESSOR / FORMADOR (SECÇÃO 9)
// ==========================================
export const ProfessorPortal: React.FC = () => {
  const { courses, enrollments, saveCourse, triggerNotification } = useApp();

  const [activeMenu, setActiveMenu] = useState<string>('Dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Add Lesson / Live Link Form
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialSummary, setNewMaterialSummary] = useState('');
  const [newQuizQuestion, setNewQuizQuestion] = useState('');
  const [livePlatform, setLivePlatform] = useState<'Microsoft Teams' | 'Zoom' | 'Google Meet' | 'Jitsi'>(
    selectedCourse?.livePlatform || 'Microsoft Teams'
  );
  const [liveLink, setLiveLink] = useState(selectedCourse?.liveSessionLink || '');
  const [noticeText, setNoticeText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const professorMenu = [
    'Dashboard',
    'Meus Cursos',
    'Módulos',
    'Aulas',
    'Vídeos',
    'Materiais',
    'Questionários',
    'Avaliações',
    'Alunos',
    'Presenças',
    'Mensagens',
    'Aulas ao Vivo',
    'Relatórios',
    'Perfil',
  ];

  const handleAddLessonToCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !newLessonTitle) return;
    const updatedModules = [...selectedCourse.modules];
    if (updatedModules.length === 0) {
      updatedModules.push({ id: `mod-${Date.now()}`, title: 'Módulo 1', lessons: [] });
    }
    updatedModules[0] = {
      ...updatedModules[0],
      lessons: [
        ...updatedModules[0].lessons,
        {
          id: `les-${Date.now()}`,
          title: newLessonTitle,
          durationMinutes: 45,
          videoUrl: newVideoUrl,
          materialTitle: newMaterialTitle || 'Material de Apoio Técnico (PDF Protegido)',
          materialSummary: newMaterialSummary || 'Conteúdo técnico disponibilizado pelo formador.',
          quizQuestion: newQuizQuestion || 'Qual é o requisito aplicável apresentado nesta aula?',
          quizOptions: [
            'Cumprimento sistemático do requisito normativo e registo de evidências',
            'Aplicação opcional sem controlo',
            'Exclusão do processo',
            'Nenhuma das anteriores',
          ],
          quizCorrectIndex: 0,
        },
      ],
    };

    await saveCourse({
      ...selectedCourse,
      lessonsCount: selectedCourse.lessonsCount + 1,
      modules: updatedModules,
    });
    setNewLessonTitle('');
    setNewMaterialTitle('');
    setNewMaterialSummary('');
    setNewQuizQuestion('');
    setFeedbackMsg('Nova aula, vídeo, material e questionário adicionados ao curso com sucesso!');
  };

  const handleSaveLiveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    await saveCourse({
      ...selectedCourse,
      livePlatform,
      liveSessionLink: liveLink,
    });
    triggerNotification(
      'Nova aula',
      `Aula ao Vivo Agendada (${livePlatform})`,
      `O formador disponibilizou o link externo da aula ao vivo para o curso ${selectedCourse.title}.`,
      'ALUNO'
    );
    setFeedbackMsg(`Link de Aula ao Vivo (${livePlatform}) guardado e notificado aos alunos inscritos!`);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row bg-[#F5F9FC]">
      <aside className="w-full lg:w-64 bg-[#061A2D] text-[#F5F9FC] p-4 shrink-0">
        <div className="px-3 py-3 border-b border-white/10">
          <p className="text-[11px] font-semibold text-[#19B5FE]">Painel do Professor / Formador</p>
          <p className="text-sm font-bold text-white mt-0.5">Equipa Pedagógica ALHAN</p>
        </div>
        <nav className="mt-3 grid grid-cols-2 lg:grid-cols-1 gap-1">
          {professorMenu.map((item) => (
            <button
              key={item}
              onClick={() => setActiveMenu(item)}
              className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeMenu === item ? 'bg-[#0077C8] text-white' : 'text-[#F5F9FC]/80 hover:bg-white/10'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 p-6 lg:p-8 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#0077C8]">Gestão Pedagógica · Secção 9 · {activeMenu}</p>
            <h1 className="text-2xl font-extrabold text-[#061A2D] mt-0.5">
              Painel do Professor e Gestão de Formações Atribuídas
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#061A2D]">Curso Activo:</label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                const c = courses.find((item) => item.id === e.target.value);
                if (c) {
                  setLiveLink(c.liveSessionLink || '');
                  setLivePlatform(c.livePlatform || 'Microsoft Teams');
                }
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold bg-white"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {feedbackMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center justify-between">
            <span>{feedbackMsg}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-emerald-700 underline">
              Fechar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Lesson, Video, Material & Quiz */}
          <form onSubmit={handleAddLessonToCourse} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-[#061A2D]">
              Adicionar Aula, Vídeo, Material e Questionário ({selectedCourse?.title})
            </h2>
            <div>
              <label className="block text-xs font-bold text-[#061A2D] mb-1">Título da Aula *</label>
              <input
                type="text"
                required
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="Ex: Aula 2.2: Auditoria de Processos Operacionais"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#061A2D] mb-1">URL do Streaming de Vídeo</label>
              <input
                type="url"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#061A2D] mb-1">Título do Material (PDF Protegido)</label>
              <input
                type="text"
                value={newMaterialTitle}
                onChange={(e) => setNewMaterialTitle(e.target.value)}
                placeholder="Ex: Checklist de Auditoria Interna ISO 19011"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#061A2D] mb-1">Conteúdo / Resumo do Material</label>
              <textarea
                rows={2}
                value={newMaterialSummary}
                onChange={(e) => setNewMaterialSummary(e.target.value)}
                placeholder="Texto técnico que será exibido no leitor protegido sem download directo..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#061A2D] mb-1">Pergunta de Avaliação da Aula</label>
              <input
                type="text"
                value={newQuizQuestion}
                onChange={(e) => setNewQuizQuestion(e.target.value)}
                placeholder="Pergunta para avaliação do aluno..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold"
            >
              Publicar Aula no Curso
            </button>
          </form>

          {/* External Live Classes (Teams, Zoom, Google Meet, Jitsi) & Announcements */}
          <div className="space-y-6">
            <form onSubmit={handleSaveLiveLink} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-[#061A2D]">
                Aulas ao Vivo (Links Externos: Teams, Zoom, Google Meet, Jitsi)
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conforme definido na arquitectura técnica (Secção 9), configure o link da plataforma externa de videoconferência utilizada pela turma.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">Plataforma</label>
                  <select
                    value={livePlatform}
                    onChange={(e) => setLivePlatform(e.target.value as typeof livePlatform)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
                  >
                    <option>Microsoft Teams</option>
                    <option>Zoom</option>
                    <option>Google Meet</option>
                    <option>Jitsi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">URL da Sessão ao Vivo</label>
                  <input
                    type="url"
                    required
                    value={liveLink}
                    onChange={(e) => setLiveLink(e.target.value)}
                    placeholder="https://teams.microsoft.com/..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#061A2D] hover:bg-[#0077C8] text-white text-xs font-bold"
              >
                Guardar Link de Aula ao Vivo
              </button>
            </form>

            {/* Publish Notice to Students */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
              <h2 className="text-base font-bold text-[#061A2D]">Publicar Aviso ou Mensagem para a Turma</h2>
              <textarea
                rows={2}
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder="Escreva um aviso sobre datas de avaliação, presenças ou novos materiais..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (!noticeText.trim()) return;
                  triggerNotification('Nova mensagem', `Aviso do Formador (${selectedCourse?.title})`, noticeText, 'ALUNO');
                  setNoticeText('');
                  setFeedbackMsg('Aviso enviado para os alunos inscritos!');
                }}
                className="px-4 py-2 rounded-lg bg-[#0077C8] text-white text-xs font-bold"
              >
                Publicar Aviso
              </button>
            </div>
          </div>
        </div>

        {/* Enrolled Students, Progress, Attendance & Grades Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-[#061A2D]">
            Alunos Inscritos, Presenças, Progresso e Avaliações
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3">Formando</th>
                  <th className="py-2.5 px-3">Curso</th>
                  <th className="py-2.5 px-3">Modalidade</th>
                  <th className="py-2.5 px-3 text-right">Progresso</th>
                  <th className="py-2.5 px-3 text-right">Avaliação</th>
                  <th className="py-2.5 px-3">Presença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-[#061A2D]">{enr.studentName}</td>
                    <td className="py-3 px-3">{enr.courseTitle}</td>
                    <td className="py-3 px-3">{enr.modality}</td>
                    <td className="py-3 px-3 text-right font-mono-tabular font-bold text-[#0077C8]">
                      {enr.progressPercent}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular">
                      {enr.quizScore !== undefined ? `${enr.quizScore}%` : 'Pendente'}
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-semibold">Confirmada</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. ÁREA DE CLIENTES EMPRESARIAIS (SECÇÕES 17, 18, 19, 20, 21)
// ==========================================
export const CompanyPortal: React.FC = () => {
  const {
    isoProjects,
    isoDocuments,
    isoAudits,
    nonConformities,
    saveIsoProject,
    saveNonConformity,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'Visão Geral & Cronograma' | 'Gestão Documental ISO' | 'Auditorias Internas' | 'Não Conformidades e Acções Correctivas' | 'Indicadores'
  >('Visão Geral & Cronograma');

  // Strict Company Isolation: Company only sees its own ISO project
  const myProject = isoProjects[0];
  const myDocs = isoDocuments.filter((d) => d.companyId === myProject?.companyId);
  const myAudits = isoAudits.filter((a) => a.companyId === myProject?.companyId);
  const myNCs = nonConformities.filter((n) => n.companyId === myProject?.companyId);

  const toggleTask = async (taskId: string) => {
    if (!myProject) return;
    const updatedTasks = myProject.tasks.map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    const doneCount = updatedTasks.filter((t) => t.done).length;
    const pct = Math.round((doneCount / Math.max(1, updatedTasks.length)) * 100);
    await saveIsoProject({
      ...myProject,
      tasks: updatedTasks,
      executionPercent: pct,
    });
  };

  return (
    <div className="py-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-[#061A2D] text-[#F5F9FC] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <p className="text-xs font-semibold text-[#19B5FE]">
            Área Reservada de Clientes Empresariais · Isolamento por Empresa (Secção 17)
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {myProject?.companyName}
          </h1>
          <p className="text-xs text-[#F5F9FC]/80 mt-1">
            <strong>Normas em implementação:</strong> {myProject?.standards} · <strong>Estado:</strong> {myProject?.status}
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 min-w-[220px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9AA6AE]">Percentagem de Execução</span>
            <span className="font-mono-tabular font-extrabold text-lg text-[#19B5FE]">
              {myProject?.executionPercent}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/15 mt-2 overflow-hidden">
            <div
              className="h-full bg-[#19B5FE] transition-all"
              style={{ width: `${myProject?.executionPercent || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-[#F5F9FC]/80 mt-2">
            Próxima actividade: {myProject?.nextActivity}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-200/80 rounded-xl">
        {(
          [
            'Visão Geral & Cronograma',
            'Gestão Documental ISO',
            'Auditorias Internas',
            'Não Conformidades e Acções Correctivas',
            'Indicadores',
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-[#061A2D] shadow-sm'
                : 'text-slate-600 hover:text-[#061A2D]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* KPI Strip (Section 21) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-500">Implementação</p>
          <p className="text-xl font-extrabold font-mono-tabular text-[#0077C8] mt-1">
            {myProject?.executionPercent}%
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-500">Docs Aprovados</p>
          <p className="text-xl font-extrabold font-mono-tabular text-emerald-700 mt-1">
            {myDocs.filter((d) => d.status === 'Aprovado').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-500">Docs Pendentes</p>
          <p className="text-xl font-extrabold font-mono-tabular text-amber-700 mt-1">
            {myDocs.filter((d) => d.status === 'Rascunho' || d.status === 'Em revisão').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-500">Auditorias Realizadas</p>
          <p className="text-xl font-extrabold font-mono-tabular text-[#061A2D] mt-1">
            {myAudits.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-500">RNCs em Tratamento</p>
          <p className="text-xl font-extrabold font-mono-tabular text-amber-700 mt-1">
            {myNCs.filter((n) => n.status !== 'Concluída').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-500">Acções Concluídas</p>
          <p className="text-xl font-extrabold font-mono-tabular text-emerald-700 mt-1">
            {myNCs.filter((n) => n.status === 'Concluída').length}
          </p>
        </div>
      </div>

      {/* Tab 1: Overview & Tasks */}
      {activeTab === 'Visão Geral & Cronograma' && myProject && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#061A2D]">
            Cronograma de Actividades e Tarefas do Projecto ISO
          </h2>
          <div className="divide-y divide-slate-100">
            {myProject.tasks.map((t) => (
              <div key={t.id} className="py-3.5 flex items-center justify-between gap-4">
                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-[#061A2D]">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => toggleTask(t.id)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0077C8]"
                  />
                  <span className={t.done ? 'line-through text-slate-400' : ''}>{t.title}</span>
                </label>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono-tabular text-slate-500">Prazo: {t.dueDate}</span>
                  <span className={`font-bold ${t.done ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {t.done ? 'Concluída' : 'Em Curso'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: ISO Document Management (Section 18) */}
      {(activeTab === 'Gestão Documental ISO' || activeTab === 'Visão Geral & Cronograma') && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#061A2D]">
              Módulo de Gestão Documental ISO (Secção 18)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Categorias: Políticas · Manuais · Procedimentos · Instruções de trabalho · Formulários · Registos · Matrizes · Planos · Relatórios
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Título</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Norma / Processo</th>
                  <th className="py-2.5 px-3">Versão</th>
                  <th className="py-2.5 px-3">Responsável / Aprovador</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myDocs.map((docItem) => (
                  <tr key={docItem.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono-tabular font-bold text-[#0077C8]">{docItem.code}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-[#061A2D]">{docItem.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Histórico: {docItem.changeHistory.join(' | ')}
                      </p>
                    </td>
                    <td className="py-3 px-3">{docItem.category}</td>
                    <td className="py-3 px-3">
                      {docItem.standard} · {docItem.processName}
                    </td>
                    <td className="py-3 px-3 font-mono-tabular font-bold">{docItem.version}</td>
                    <td className="py-3 px-3">
                      {docItem.responsibleName} / {docItem.approverName}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#061A2D]">{docItem.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Internal Audits (Section 19) */}
      {(activeTab === 'Auditorias Internas' || activeTab === 'Visão Geral & Cronograma') && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#061A2D]">
            Módulo de Auditorias Internas ISO (Secção 19)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAudits.map((aud) => (
              <div key={aud.id} className="p-5 rounded-xl bg-[#F5F9FC] border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0077C8]">{aud.standard} · {aud.processName}</span>
                  <span className="font-mono-tabular text-slate-500">{aud.auditDate}</span>
                </div>
                <p className="font-bold text-[#061A2D]">
                  Classificação: {aud.classification}
                </p>
                <p className="text-slate-600"><strong>Critério:</strong> {aud.criteria}</p>
                <p className="text-slate-600"><strong>Constatações:</strong> {aud.findings}</p>
                <p className="text-slate-500"><strong>Evidências:</strong> {aud.evidenceNote} · Auditor: {aud.auditorName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Non-Conformities & Corrective Actions (Section 20) */}
      {(activeTab === 'Não Conformidades e Acções Correctivas' || activeTab === 'Visão Geral & Cronograma') && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#061A2D]">
            Não Conformidades e Acções Correctivas (Secção 20)
          </h2>
          <div className="space-y-4">
            {myNCs.map((nc) => (
              <div key={nc.id} className="p-5 rounded-xl border border-slate-200 bg-[#F5F9FC] space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono-tabular font-extrabold text-[#0077C8]">{nc.code}</span>
                    <span className="mx-2">·</span>
                    <span className="font-bold text-[#061A2D]">{nc.standard} ({nc.processName})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular text-slate-500">Prazo: {nc.deadline}</span>
                    <select
                      value={nc.status}
                      onChange={(e) =>
                        saveNonConformity({
                          ...nc,
                          status: e.target.value as NonConformityItem['status'],
                        })
                      }
                      className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-[#061A2D]"
                    >
                      <option>Aberta</option>
                      <option>Em tratamento</option>
                      <option>Aguardando verificação</option>
                      <option>Concluída</option>
                      <option>Reaberta</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <p><strong>Descrição do Problema:</strong> {nc.problemDescription}</p>
                  <p><strong>Evidência:</strong> {nc.evidence}</p>
                  <p><strong>Correcção / Acção Imediata:</strong> {nc.immediateAction}</p>
                  <p><strong>Análise da Causa Raiz:</strong> {nc.rootCause}</p>
                  <p><strong>Acção Correctiva:</strong> {nc.correctiveAction}</p>
                  <p><strong>Verificação de Eficácia:</strong> {nc.effectivenessCheck} (Resp: {nc.responsibleName})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. PAINEL ADMINISTRATIVO CENTRAL (SECÇÃO 25)
// ==========================================
export const AdminPortal: React.FC = () => {
  const {
    courses,
    isoStandards,
    enrollments,
    certificates,
    isoProjects,
    isoDocuments,
    isoAudits,
    nonConformities,
    diagnosticRequests,
    activityLogs,
    saveCourse,
    deleteCourse,
    addIsoStandard,
    updateEnrollmentStatus,
    issueCertificate,
    updateCertificateStatus,
    updateDiagnosticStatus,
    saveIsoDocument,
    saveIsoAudit,
    saveNonConformity,
  } = useApp();

  const [activeModule, setActiveModule] = useState<
    | 'Dashboard & Indicadores'
    | 'Cursos & Academia LMS'
    | 'Inscrições & Pagamentos Angola'
    | 'Certificados QR'
    | 'Pedidos de Diagnóstico & Presenciais'
    | 'Projectos & Gestão Documental ISO'
    | 'Auditorias & Não Conformidades'
    | 'Normas ISO'
    | 'Utilizadores, Parceiros & Configurações'
    | 'Registos de Actividade'
  >('Dashboard & Indicadores');

  // Course creation / edit state
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<CourseItem | null>(null);

  const [cTitle, setCTitle] = useState('');
  const [cCategory, setCCategory] = useState('Sistemas Integrados');
  const [cModality, setCModality] = useState<'Online' | 'Presencial' | 'Híbrida'>('Online');
  const [cPrice, setCPrice] = useState(95000);
  const [cHours, setCHours] = useState(24);
  const [cInstructor, setCInstructor] = useState('Equipa Técnica ALHAN');
  const [cImageUrl, setCImageUrl] = useState('/assets/aistudio/iso_a9fe34ed.jpg');
  const [cDesc, setCDesc] = useState('');
  const [cObj, setCObj] = useState('');
  const [cSyl, setCSyl] = useState('');

  // New ISO Standard state
  const [stdCode, setStdCode] = useState('');
  const [stdName, setStdName] = useState('');
  const [stdDesc, setStdDesc] = useState('');
  const [stdObj, setStdObj] = useState('');
  const [stdSectors, setStdSectors] = useState('');

  // New ISO Document state
  const [docCode, setDocCode] = useState('PRO-SGI-010');
  const [docTitle, setDocTitle] = useState('');
  const [docCat, setDocCat] = useState<IsoDocumentItem['category']>('Procedimentos');
  const [docStd, setDocStd] = useState('ISO 9001:2015');
  const [docProc, setDocProc] = useState('Operações');

  const startEditCourse = (c?: CourseItem) => {
    if (c) {
      setEditingCourse(c);
      setCTitle(c.title);
      setCCategory(c.category);
      setCModality(c.modality);
      setCPrice(c.priceKz);
      setCHours(c.durationHours);
      setCInstructor(c.instructorName);
      setCImageUrl(c.imageUrl || '/assets/aistudio/iso_a9fe34ed.jpg');
      setCDesc(c.description);
      setCObj(c.objectives);
      setCSyl(c.syllabus);
    } else {
      setEditingCourse({
        id: `curso-${Date.now()}`,
        title: '',
        category: 'Qualidade',
        modality: 'Online',
        priceKz: 95000,
        durationHours: 24,
        lessonsCount: 8,
        instructorName: 'Equipa Técnica ALHAN',
        instructorId: 'prof-alhan-01',
        published: true,
        imageUrl: '/assets/aistudio/iso_a9fe34ed.jpg',
        description: '',
        objectives: '',
        syllabus: '',
        modules: [],
        createdAt: new Date().toISOString(),
      });
      setCTitle('');
      setCImageUrl('/assets/aistudio/iso_a9fe34ed.jpg');
      setCDesc('');
      setCObj('');
      setCSyl('');
    }
  };

  const handleSaveCourseForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    await saveCourse({
      ...editingCourse,
      title: cTitle,
      category: cCategory,
      modality: cModality,
      priceKz: Number(cPrice),
      durationHours: Number(cHours),
      instructorName: cInstructor,
      imageUrl: cImageUrl || '/assets/aistudio/iso_a9fe34ed.jpg',
      description: cDesc,
      objectives: cObj,
      syllabus: cSyl,
    });
    setEditingCourse(null);
  };

  const adminModules = [
    'Dashboard & Indicadores',
    'Cursos & Academia LMS',
    'Inscrições & Pagamentos Angola',
    'Certificados QR',
    'Pedidos de Diagnóstico & Presenciais',
    'Projectos & Gestão Documental ISO',
    'Auditorias & Não Conformidades',
    'Normas ISO',
    'Utilizadores, Parceiros & Configurações',
    'Registos de Actividade',
  ] as const;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row bg-[#F5F9FC]">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-72 bg-[#061A2D] text-[#F5F9FC] p-4 shrink-0">
        <div className="px-3 py-3 border-b border-white/10">
          <p className="text-[11px] font-semibold text-[#19B5FE]">Painel Administrativo Central · Secção 25</p>
          <p className="text-sm font-bold text-white mt-0.5">ALHAN – Gestão Integrada</p>
        </div>
        <nav className="mt-3 space-y-1">
          {adminModules.map((m) => (
            <button
              key={m}
              onClick={() => setActiveModule(m)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                activeModule === m ? 'bg-[#0077C8] text-white' : 'text-[#F5F9FC]/80 hover:bg-white/10'
              }`}
            >
              {m}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-8 space-y-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#0077C8]">Administração Central ALHAN SGI</p>
            <h1 className="text-2xl font-extrabold text-[#061A2D] mt-0.5">{activeModule}</h1>
          </div>
          <button
            onClick={() => {
              setActiveModule('Cursos & Academia LMS');
              startEditCourse();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Curso</span>
          </button>
        </div>

        {/* 1. DASHBOARD & INDICADORES (Section 21 & 25) */}
        {activeModule === 'Dashboard & Indicadores' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs text-slate-500">Cursos no Catálogo</p>
                <p className="text-2xl font-extrabold font-mono-tabular text-[#061A2D] mt-1">
                  {courses.length}
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  {courses.filter((c) => c.published).length} publicados
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs text-slate-500">Inscrições & Pagamentos</p>
                <p className="text-2xl font-extrabold font-mono-tabular text-[#0077C8] mt-1">
                  {enrollments.length}
                </p>
                <p className="text-[11px] text-amber-700 mt-1">
                  {enrollments.filter((e) => e.paymentStatus === 'Pendente').length} pendentes de validação
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs text-slate-500">Projectos ISO Activos</p>
                <p className="text-2xl font-extrabold font-mono-tabular text-[#061A2D] mt-1">
                  {isoProjects.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isoDocuments.length} docs · {isoAudits.length} auditorias
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs text-slate-500">Pedidos de Diagnóstico / Inscrições</p>
                <p className="text-2xl font-extrabold font-mono-tabular text-emerald-700 mt-1">
                  {diagnosticRequests.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {certificates.length} certificados QR emitidos
                </p>
              </div>
            </div>

            {/* Quick Pending Payments Table */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#061A2D]">
                  Pagamentos e Comprovativos Recentes (Express Angola, Unitel Money, Africell Money, KWiK)
                </h2>
                <button
                  onClick={() => setActiveModule('Inscrições & Pagamentos Angola')}
                  className="text-xs font-semibold text-[#0077C8] hover:underline"
                >
                  Gerir todos →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 px-3">Aluno</th>
                      <th className="py-2.5 px-3">Formação</th>
                      <th className="py-2.5 px-3 text-right">Valor (Kz)</th>
                      <th className="py-2.5 px-3">Método / Referência</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3">Acção Administrativa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrollments.map((enr) => (
                      <tr key={enr.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-semibold text-[#061A2D]">{enr.studentName}</td>
                        <td className="py-3 px-3">{enr.courseTitle}</td>
                        <td className="py-3 px-3 text-right font-mono-tabular font-bold">
                          {enr.amountKz.toLocaleString('pt-AO')} Kz
                        </td>
                        <td className="py-3 px-3">
                          {enr.paymentMethod} · <span className="font-mono-tabular">{enr.paymentReference}</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-[#0077C8]">{enr.paymentStatus}</td>
                        <td className="py-3 px-3">
                          <select
                            value={enr.paymentStatus}
                            onChange={(e) =>
                              updateEnrollmentStatus(
                                enr.id,
                                e.target.value as EnrollmentItem['paymentStatus']
                              )
                            }
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold"
                          >
                            <option>Pendente</option>
                            <option>Pago</option>
                            <option>Falhado</option>
                            <option>Cancelado</option>
                            <option>Reembolsado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. CURSOS & ACADEMIA LMS (Create, Edit, Publish/Unpublish, Delete with confirmation) */}
        {activeModule === 'Cursos & Academia LMS' && (
          <div className="space-y-6">
            {editingCourse && (
              <form
                onSubmit={handleSaveCourseForm}
                className="bg-white rounded-xl border-2 border-[#0077C8] p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#061A2D]">
                    {courses.some((c) => c.id === editingCourse.id) ? 'Editar Curso' : 'Criar Novo Curso'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditingCourse(null)}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Nome do Curso *</label>
                    <input
                      type="text"
                      required
                      value={cTitle}
                      onChange={(e) => setCTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Categoria *</label>
                    <input
                      type="text"
                      required
                      value={cCategory}
                      onChange={(e) => setCCategory(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Modalidade</label>
                    <select
                      value={cModality}
                      onChange={(e) => setCModality(e.target.value as typeof cModality)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
                    >
                      <option>Online</option>
                      <option>Presencial</option>
                      <option>Híbrida</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Preço em Kz *</label>
                    <input
                      type="number"
                      required
                      value={cPrice}
                      onChange={(e) => setCPrice(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Carga Horária (Horas) *</label>
                    <input
                      type="number"
                      required
                      value={cHours}
                      onChange={(e) => setCHours(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Professor Responsável *</label>
                    <input
                      type="text"
                      required
                      value={cInstructor}
                      onChange={(e) => setCInstructor(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Fotografia / Capa da Formação (URL) *</label>
                    <input
                      type="text"
                      required
                      value={cImageUrl}
                      onChange={(e) => setCImageUrl(e.target.value)}
                      placeholder="/assets/aistudio/iso_a9fe34ed.jpg"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Descrição *</label>
                    <textarea
                      rows={3}
                      required
                      value={cDesc}
                      onChange={(e) => setCDesc(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Objectivos *</label>
                    <textarea
                      rows={3}
                      required
                      value={cObj}
                      onChange={(e) => setCObj(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Conteúdo Programático *</label>
                    <textarea
                      rows={3}
                      required
                      value={cSyl}
                      onChange={(e) => setCSyl(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold"
                >
                  Guardar Curso na Base de Dados
                </button>
              </form>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 px-3">Curso</th>
                      <th className="py-2.5 px-3">Modalidade</th>
                      <th className="py-2.5 px-3 text-right">Duração</th>
                      <th className="py-2.5 px-3 text-right">Preço (Kz)</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3">Operações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.imageUrl}
                              alt={c.title}
                              referrerPolicy="no-referrer"
                              className="h-10 w-14 rounded object-cover object-top border border-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-[#061A2D]">{c.title}</p>
                              <p className="text-[11px] text-slate-500">{c.instructorName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">{c.modality}</td>
                        <td className="py-3 px-3 text-right font-mono-tabular">{c.durationHours}h</td>
                        <td className="py-3 px-3 text-right font-mono-tabular font-bold">
                          {c.priceKz.toLocaleString('pt-AO')} Kz
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => saveCourse({ ...c, published: !c.published })}
                            className={`font-bold underline ${
                              c.published ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {c.published ? 'Publicado' : 'Rascunho (Oculto)'}
                          </button>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditCourse(c)}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[#061A2D] font-semibold"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => setCourseToDelete(c)}
                              className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-semibold"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal before Delete (Section 25 requirement) */}
        {courseToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061A2D]/70 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
              <h3 className="text-base font-bold text-[#061A2D]">Confirmar Eliminação de Curso</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tem a certeza de que pretende eliminar permanentemente o curso <strong>«{courseToDelete.title}»</strong>? Esta operação requer confirmação administrativa (Secção 25).
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setCourseToDelete(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    await deleteCourse(courseToDelete.id);
                    setCourseToDelete(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  Sim, Confirmar Eliminação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. INSCRIÇÕES E PAGAMENTOS ANGOLA (Section 12) */}
        {activeModule === 'Inscrições & Pagamentos Angola' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#061A2D]">
                Gestão de Inscrições e Validação Manual de Comprovativos (Secção 12)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Altere o estado para «Pago» após validar o comprovativo (Express Angola, Unitel Money, Africell Money, KWiK) para libertar o acesso do aluno ao curso.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3">Formando</th>
                    <th className="py-2.5 px-3">Curso</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                    <th className="py-2.5 px-3">Método / Referência</th>
                    <th className="py-2.5 px-3">Nota do Comprovativo</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3">Certificado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-[#061A2D]">{enr.studentName}</td>
                      <td className="py-3 px-3">{enr.courseTitle}</td>
                      <td className="py-3 px-3 text-right font-mono-tabular font-bold">
                        {enr.amountKz.toLocaleString('pt-AO')} Kz
                      </td>
                      <td className="py-3 px-3">
                        {enr.paymentMethod} · <span className="font-mono-tabular">{enr.paymentReference}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{enr.receiptNote}</td>
                      <td className="py-3 px-3">
                        <select
                          value={enr.paymentStatus}
                          onChange={(e) =>
                            updateEnrollmentStatus(
                              enr.id,
                              e.target.value as EnrollmentItem['paymentStatus']
                            )
                          }
                          className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-[#061A2D]"
                        >
                          <option>Pendente</option>
                          <option>Pago</option>
                          <option>Falhado</option>
                          <option>Cancelado</option>
                          <option>Reembolsado</option>
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => issueCertificate(enr)}
                          className="px-2.5 py-1 rounded bg-[#061A2D] text-white font-semibold hover:bg-[#0077C8]"
                        >
                          Emitir Certificado
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. CERTIFICADOS QR (Section 13) */}
        {activeModule === 'Certificados QR' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-[#061A2D]">
              Controlo de Certificados Emitidos e Validação QR
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3">Código Único</th>
                    <th className="py-2.5 px-3">Formando</th>
                    <th className="py-2.5 px-3">Formação</th>
                    <th className="py-2.5 px-3 text-right">Carga Horária</th>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3">Consulta Pública</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono-tabular font-bold text-[#0077C8]">{cert.code}</td>
                      <td className="py-3 px-3 font-semibold text-[#061A2D]">{cert.studentName}</td>
                      <td className="py-3 px-3">{cert.courseTitle}</td>
                      <td className="py-3 px-3 text-right font-mono-tabular">{cert.workloadHours}h</td>
                      <td className="py-3 px-3 font-mono-tabular">{cert.issuedDate}</td>
                      <td className="py-3 px-3">
                        <select
                          value={cert.status}
                          onChange={(e) =>
                            updateCertificateStatus(
                              cert.id,
                              e.target.value as 'valido' | 'cancelado' | 'expirado'
                            )
                          }
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-bold"
                        >
                          <option value="valido">Válido</option>
                          <option value="cancelado">Cancelado</option>
                          <option value="expirado">Expirado</option>
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          to={`/consultar-certificado?codigo=${encodeURIComponent(cert.code)}`}
                          className="text-[#0077C8] font-semibold hover:underline"
                        >
                          Abrir Validador →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. PEDIDOS DE DIAGNÓSTICO, CONTACTOS E INSCRIÇÕES PRESENCIAIS */}
        {activeModule === 'Pedidos de Diagnóstico & Presenciais' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-[#061A2D]">
              Pedidos de Diagnóstico Empresarial, Contactos e Inscrições em Formação Presencial
            </h2>
            {diagnosticRequests.length === 0 ? (
              <p className="text-xs text-slate-500">
                Ainda não existem novos pedidos submetidos nesta sessão. Teste os formulários em{' '}
                <Link to="/solicitar-diagnostico" className="text-[#0077C8] underline">
                  /solicitar-diagnostico
                </Link>{' '}
                ou a inscrição presencial em{' '}
                <Link to="/formacoes" className="text-[#0077C8] underline">
                  /formacoes
                </Link>
                .
              </p>
            ) : (
              <div className="space-y-3">
                {diagnosticRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-[#0077C8] uppercase">{req.type}</span>
                        <span className="mx-2">·</span>
                        <span className="font-bold text-[#061A2D]">{req.companyName}</span>
                        <span className="mx-2">·</span>
                        <span>Responsável: {req.contactName} ({req.role})</span>
                      </div>
                      <select
                        value={req.status}
                        onChange={(e) =>
                          updateDiagnosticStatus(req.id, e.target.value as typeof req.status)
                        }
                        className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold"
                      >
                        <option>Novo</option>
                        <option>Em análise</option>
                        <option>Respondido</option>
                        <option>Concluído</option>
                      </select>
                    </div>
                    <p className="text-slate-600">
                      <strong>Contactos:</strong> {req.phone} · WhatsApp: {req.whatsapp} · Email: {req.email} · Província: {req.province}
                    </p>
                    <p className="text-slate-600">
                      <strong>Norma / Curso Pretendido:</strong> {req.targetStandard} · <strong>Objectivo:</strong> {req.objective}
                    </p>
                    <p className="text-slate-700 bg-white p-3 rounded border border-slate-200">
                      {req.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. PROJECTOS & GESTÃO DOCUMENTAL ISO */}
        {activeModule === 'Projectos & Gestão Documental ISO' && (
          <div className="space-y-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!docTitle) return;
                await saveIsoDocument({
                  id: `doc-${Date.now()}`,
                  code: docCode,
                  title: docTitle,
                  category: docCat,
                  standard: docStd,
                  processName: docProc,
                  version: 'v1.0',
                  responsibleName: 'Consultor SGI Alhan',
                  approverName: 'Direcção Técnica',
                  status: 'Aprovado',
                  companyId: 'demo-empresa-01',
                  changeHistory: ['v1.0 – Emissão e aprovação no Painel Administrativo'],
                  createdAt: new Date().toISOString(),
                });
                setDocTitle('');
              }}
              className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
            >
              <h2 className="text-base font-bold text-[#061A2D]">Registar Novo Documento ISO</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">Código *</label>
                  <input
                    type="text"
                    required
                    value={docCode}
                    onChange={(e) => setDocCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">Título do Documento *</label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Ex: Procedimento de Controlo de Documentos e Registos"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">Categoria</label>
                  <select
                    value={docCat}
                    onChange={(e) => setDocCat(e.target.value as IsoDocumentItem['category'])}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
                  >
                    <option>Políticas</option>
                    <option>Manuais</option>
                    <option>Procedimentos</option>
                    <option>Instruções de trabalho</option>
                    <option>Formulários</option>
                    <option>Registos</option>
                    <option>Matrizes</option>
                    <option>Planos</option>
                    <option>Relatórios</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">Norma Associada</label>
                  <input
                    type="text"
                    value={docStd}
                    onChange={(e) => setDocStd(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">Processo</label>
                  <input
                    type="text"
                    value={docProc}
                    onChange={(e) => setDocProc(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0077C8] text-white text-xs font-bold"
              >
                Adicionar Documento ISO
              </button>
            </form>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-[#061A2D] mb-3">Documentos Controlados</h3>
              <div className="space-y-2 text-xs">
                {isoDocuments.map((d) => (
                  <div key={d.id} className="p-3 rounded-lg bg-[#F5F9FC] border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-mono-tabular font-bold text-[#0077C8]">{d.code}</span> ·{' '}
                      <strong className="text-[#061A2D]">{d.title}</strong> ({d.category} · {d.version})
                    </div>
                    <span className="font-bold">{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. AUDITORIAS & NÃO CONFORMIDADES */}
        {activeModule === 'Auditorias & Não Conformidades' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <h2 className="text-base font-bold text-[#061A2D]">
              Registos de Auditorias Internas ({isoAudits.length}) e Não Conformidades ({nonConformities.length})
            </h2>
            <div className="space-y-3 text-xs">
              {nonConformities.map((nc) => (
                <div key={nc.id} className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200">
                  <p className="font-bold text-[#061A2D]">
                    {nc.code} · {nc.companyName} · Estado: <span className="text-[#0077C8]">{nc.status}</span>
                  </p>
                  <p className="text-slate-600 mt-1">{nc.problemDescription}</p>
                  <p className="text-slate-500 mt-1">Acção Correctiva: {nc.correctiveAction}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. NORMAS ISO (Section 15 - Allow admin to add new standards) */}
        {activeModule === 'Normas ISO' && (
          <div className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!stdCode || !stdName) return;
                addIsoStandard({
                  id: `iso-${Date.now()}`,
                  code: stdCode,
                  name: stdName,
                  description: stdDesc,
                  objective: stdObj,
                  benefits: ['Melhoria contínua do sistema', 'Conformidade internacional'],
                  applicability: 'Aplicável a organizações do sector correspondente em Angola.',
                  sectorsInAngola: stdSectors ? stdSectors.split(',').map((s) => s.trim()) : ['Multi-sectorial'],
                });
                setStdCode('');
                setStdName('');
                setStdDesc('');
                setStdObj('');
                setStdSectors('');
              }}
              className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
            >
              <h2 className="text-base font-bold text-[#061A2D]">
                Acrescentar Nova Norma ISO ao Catálogo Público (Secção 15)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">Código da Norma *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ISO 31000"
                    value={stdCode}
                    onChange={(e) => setStdCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">Designação *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gestão de Riscos"
                    value={stdName}
                    onChange={(e) => setStdName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">Descrição *</label>
                  <input
                    type="text"
                    required
                    value={stdDesc}
                    onChange={(e) => setStdDesc(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">Objectivo *</label>
                  <input
                    type="text"
                    required
                    value={stdObj}
                    onChange={(e) => setStdObj(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0077C8] text-white text-xs font-bold"
              >
                Publicar Norma no Catálogo
              </button>
            </form>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-xs font-bold text-[#061A2D] mb-3">
                Normas Registadas ({isoStandards.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {isoStandards.map((s) => (
                  <div key={s.id} className="p-3 rounded-lg bg-[#F5F9FC] border border-slate-200">
                    <p className="font-mono-tabular font-bold text-[#0077C8]">{s.code}</p>
                    <p className="font-semibold text-[#061A2D]">{s.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 9. UTILIZADORES, PARCEIROS & CONFIGURAÇÕES (Transparent Pending Integrations) */}
        {activeModule === 'Utilizadores, Parceiros & Configurações' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#061A2D]">
                Estado das Integrações Externas e Credenciais de Comerciante
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Conforme a instrução principal do projecto, serviços externos que aguardam chaves de comerciante estão estruturados e identificados de forma transparente como «Configuração pendente», sem simular chamadas automáticas falsas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#061A2D]">Base de Dados & Autenticação (Firebase Cloud)</p>
                  <p className="text-slate-500 mt-0.5">Persistência Firestore, OAuth e Regras RBAC</p>
                </div>
                <span className="font-bold text-emerald-700">Operacional</span>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#061A2D]">API Automática EMIS / Multicaixa Express</p>
                  <p className="text-slate-500 mt-0.5">Validação manual de comprovativo activa</p>
                </div>
                <span className="font-bold text-amber-700">Configuração pendente</span>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#061A2D]">API Unitel Money / Africell Money / KWiK</p>
                  <p className="text-slate-500 mt-0.5">Validação manual de comprovativo activa</p>
                </div>
                <span className="font-bold text-amber-700">Configuração pendente</span>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#061A2D]">Servidor SMTP Externo / SMS Gateway Angola</p>
                  <p className="text-slate-500 mt-0.5">Notificações Push Web e internas activas</p>
                </div>
                <span className="font-bold text-amber-700">Configuração pendente</span>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#061A2D]">Hospedagem Hostinger (`public_html` + `.htaccess` SPA)</p>
                  <p className="text-slate-500 mt-0.5">Compatível com Apache/LiteSpeed, Desktop e Dispositivos Móveis (Android/iOS)</p>
                </div>
                <span className="font-bold text-emerald-700">Pronto para Hospedar</span>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#061A2D]">Redes Sociais Oficiais (Facebook & Instagram @alhan.sgi)</p>
                  <p className="text-slate-500 mt-0.5">Links directos e Feed integrados na plataforma</p>
                </div>
                <span className="font-bold text-emerald-700">Operacional</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#061A2D] text-[#F5F9FC] space-y-2 text-xs">
              <p className="font-bold text-[#19B5FE]">
                Guia Rápido de Publicação na Hostinger (www.alhan.pro) — Desktop & Mobile:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[#F5F9FC]/85 leading-relaxed">
                <li>Execute <code>npm run build</code> para gerar a pasta de produção optimizada <code>dist/</code>.</li>
                <li>No painel hPanel da <strong>Hostinger</strong>, aceda ao <strong>Gestor de Ficheiros</strong> → pasta <code>public_html</code> do domínio <code>alhan.pro</code>.</li>
                <li>Carregue todo o conteúdo da pasta <code>dist/</code> (incluindo o ficheiro <code>.htaccess</code> já configurado na raiz) para <code>public_html</code>.</li>
                <li>O ficheiro <code>.htaccess</code> garante que todas as rotas (<code>/formacoes</code>, <code>/consultoria-iso</code>, <code>/aluno</code>, <code>/admin</code>) abrem directamente sem erro 404 tanto em computadores (Desktop) como em telemóveis Android e iPhone.</li>
              </ol>
            </div>
          </div>
        )}

        {/* 10. REGISTOS DE ACTIVIDADE (Audit Log - Section 25 & 29) */}
        {activeModule === 'Registos de Actividade' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-[#061A2D]">
              Registo de Operações Administrativas e Auditoria de Segurança (Secção 29)
            </h2>
            <div className="divide-y divide-slate-100 text-xs">
              {activityLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-[#061A2D]">{log.action}</span>
                    <span className="text-slate-500 ml-2">({log.actor})</span>
                  </div>
                  <span className="font-mono-tabular text-slate-400">
                    {new Date(log.timestamp).toLocaleString('pt-AO')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
