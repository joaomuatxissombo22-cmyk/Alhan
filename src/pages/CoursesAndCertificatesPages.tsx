import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Search,
  CheckCircle2,
  BookOpen,
  Clock,
  UserCheck,
  CreditCard,
  Award,
  ShieldCheck,
  X,
  AlertCircle,
  MessageCircle,
  MapPin,
  Mail,
  Phone,
  FileText,
  Lock,
  Copy,
  Download,
  Printer,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COMPANY_INFO, CourseItem, EnrollmentItem, UserRole } from '../data/initialData';

export const CoursesCatalogPage: React.FC = () => {
  const { courses, createEnrollment, submitDiagnosticOrContact, user, switchRoleForDemo } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialCourseId = searchParams.get('curso');
  const [modalityFilter, setModalityFilter] = useState<'Todas' | 'Online' | 'Presencial' | 'Híbrida'>('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(() => {
    if (initialCourseId) {
      return courses.find((c) => c.id === initialCourseId) || null;
    }
    return null;
  });

  const [enrollTab, setEnrollTab] = useState<'online_pagamento' | 'inscricao_presencial'>('online_pagamento');
  const [paymentMethod, setPaymentMethod] = useState<EnrollmentItem['paymentMethod']>('Express Angola');
  const [paymentRef, setPaymentRef] = useState('');
  const [receiptNote, setReceiptNote] = useState('');
  const [studentWhatsapp, setStudentWhatsapp] = useState(user?.phone || '+244 ');
  const [studentEmailInput, setStudentEmailInput] = useState(user?.email || '');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Presential Registration Form state
  const [presName, setPresName] = useState(user?.fullName || '');
  const [presEmail, setPresEmail] = useState(user?.email || '');
  const [presPhone, setPresPhone] = useState(user?.phone || '+244 ');
  const [presCompany, setPresCompany] = useState('');
  const [presProvince, setPresProvince] = useState('Luanda');
  const [presShift, setPresShift] = useState('Manhã (08h30 – 12h30)');
  const [presNotes, setPresNotes] = useState('');

  const publishedCourses = courses.filter((c) => c.published);
  const filteredCourses = publishedCourses.filter((c) => {
    const matchesModality = modalityFilter === 'Todas' || c.modality === modalityFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModality && matchesSearch;
  });

  const handleOnlineEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    if (!user) {
      switchRoleForDemo('ALUNO');
    }
    const created = await createEnrollment({
      course: selectedCourse,
      modality: selectedCourse.modality,
      paymentMethod,
      paymentReference: paymentRef || `REF-${Date.now().toString().slice(-6)}`,
      receiptNote: receiptNote || `Comprovativo via ${paymentMethod} enviado pelo formando.`,
      studentPhone: studentWhatsapp.trim(),
      studentEmail: studentEmailInput.trim(),
    });
    setEnrollSuccess(
      `Inscrição #${created.id} registada com sucesso! O comprovativo foi submetido para validação administrativa. Assim que o pagamento for confirmado pelo Administrador, receberá uma notificação no seu WhatsApp (${studentWhatsapp}) ou E-mail (${studentEmailInput}) e o acesso ao curso será automaticamente ativado.`
    );
  };

  const handlePresentialEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    await submitDiagnosticOrContact({
      type: 'inscricao_presencial',
      companyName: presCompany || 'Inscrição Individual Presencial',
      contactName: presName,
      role: `Turno: ${presShift}`,
      phone: presPhone,
      whatsapp: presPhone,
      email: presEmail,
      province: presProvince,
      sector: 'Formação Presencial',
      employeesCount: '1',
      targetStandard: selectedCourse.title,
      objective: `Inscrição para Formação Presencial (${selectedCourse.durationHours}h - ${selectedCourse.priceKz.toLocaleString('pt-AO')} Kz)`,
      message: presNotes || `Pedido de inscrição presencial na turma de ${selectedCourse.title}, turno ${presShift}.`,
    });
    setEnrollSuccess(
      `Ficha de Inscrição Presencial para «${selectedCourse.title}» registada com sucesso! A equipa pedagógica da ALHAN entrará em contacto pelo número ${presPhone}.`
    );
  };

  return (
    <div className="py-14 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-[#0077C8]">Catálogo de Cursos Administrável · Secção 6 e 7</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#061A2D] mt-2">
            Nossas Formações Profissionais (Online, Presencial e Híbrida)
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Cursos estruturados com módulos, vídeo-aulas protegidas, materiais técnicos, exercícios, avaliações e emissão de certificado validável por QR Code.
          </p>
        </div>

        {/* Interactive Filter Tabs (allowed per frontend-design) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg">
            {(['Todas', 'Online', 'Presencial', 'Híbrida'] as const).map((mod) => (
              <button
                key={mod}
                onClick={() => setModalityFilter(mod)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  modalityFilter === mod
                    ? 'bg-white text-[#061A2D] shadow-sm'
                    : 'text-slate-600 hover:text-[#061A2D]'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar formação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-xs focus:border-[#0077C8] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-[#0077C8] transition-colors group"
          >
            <div>
              <div className="relative h-48 w-full bg-[#061A2D] overflow-hidden border-b border-slate-200">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6">
                {/* Zero-pill metadata */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-[#0077C8]">{course.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{course.modality}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">{course.durationHours}h ({course.lessonsCount} aulas)</span>
                </div>

                <h2 className="text-xl font-bold text-[#061A2D] mt-2">{course.title}</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{course.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <p><strong>Objectivos:</strong> {course.objectives}</p>
                  <p><strong>Conteúdo programático:</strong> {course.syllabus}</p>
                  <p className="text-slate-500"><strong>Formador:</strong> {course.instructorName}</p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] text-slate-500">Valor da Inscrição</p>
                <p className="text-lg font-extrabold font-mono-tabular text-[#061A2D]">
                  {course.priceKz.toLocaleString('pt-AO')} Kz
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setEnrollTab(course.modality === 'Presencial' ? 'inscricao_presencial' : 'online_pagamento');
                    setEnrollSuccess(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Inscrever-se
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enrollment & Payment Modal (Online + Presential Form) */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061A2D]/75 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-[#061A2D] text-white px-6 py-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedCourse.imageUrl}
                  alt={selectedCourse.title}
                  referrerPolicy="no-referrer"
                  className="h-16 w-20 rounded-lg object-cover object-top border border-white/15 shrink-0 hidden sm:block"
                />
                <div>
                  <p className="text-xs font-semibold text-[#19B5FE]">
                    Inscrição na Formação · {selectedCourse.modality} · {selectedCourse.durationHours} Horas
                  </p>
                  <h2 className="text-lg sm:text-xl font-bold mt-0.5">{selectedCourse.title}</h2>
                  <p className="text-xs font-mono-tabular text-[#9AA6AE] mt-1">
                    Valor: {selectedCourse.priceKz.toLocaleString('pt-AO')} Kz · Formador: {selectedCourse.instructorName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="px-6 pt-4 bg-[#F5F9FC] border-b border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={() => { setEnrollTab('online_pagamento'); setEnrollSuccess(null); }}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-colors ${
                  enrollTab === 'online_pagamento'
                    ? 'bg-white text-[#061A2D] border-slate-200'
                    : 'bg-transparent text-slate-600 border-transparent hover:text-[#061A2D]'
                }`}
              >
                1. Inscrição LMS & Pagamentos Angola
              </button>
              <button
                type="button"
                onClick={() => { setEnrollTab('inscricao_presencial'); setEnrollSuccess(null); }}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-colors ${
                  enrollTab === 'inscricao_presencial'
                    ? 'bg-white text-[#061A2D] border-slate-200'
                    : 'bg-transparent text-slate-600 border-transparent hover:text-[#061A2D]'
                }`}
              >
                2. Formulário de Formação Presencial
              </button>
            </div>

            <div className="p-6">
              {enrollSuccess ? (
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-emerald-950">Registo Concluído com Sucesso</h3>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed">{enrollSuccess}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedCourse(null);
                        navigate('/aluno');
                      }}
                      className="px-4 py-2 rounded-lg bg-[#061A2D] text-white text-xs font-semibold hover:bg-[#0077C8]"
                    >
                      Ir para a Área do Aluno (LMS)
                    </button>
                    <button
                      onClick={() => setSelectedCourse(null)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              ) : enrollTab === 'online_pagamento' ? (
                <form onSubmit={handleOnlineEnroll} className="space-y-4">
                  {/* Official Payment Channels Box */}
                  <div className="p-4 rounded-xl bg-[#061A2D] text-white space-y-3.5 border border-[#0077C8]/40 shadow-sm">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#19B5FE]" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Canais de Pagamento Oficiais da ALHAN
                        </span>
                      </div>
                      <span className="text-[11px] font-mono-tabular font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Moeda: Kwanzas (Kz)
                      </span>
                    </div>

                    {/* Express Numbers */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-2">
                      <p className="text-xs font-bold text-[#19B5FE]">
                        1. Multicaixa Express (Transferência / Pagamento por Telemóvel):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between bg-black/30 p-2 rounded-lg border border-white/10">
                          <span className="font-mono-tabular font-bold text-white">927 496 287</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('927496287', 'exp1')}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#0077C8] hover:bg-[#008FEA] text-[10px] font-bold text-white"
                          >
                            {copiedField === 'exp1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'exp1' ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                        <div className="flex items-center justify-between bg-black/30 p-2 rounded-lg border border-white/10">
                          <span className="font-mono-tabular font-bold text-white">927 099 484</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('927099484', 'exp2')}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#0077C8] hover:bg-[#008FEA] text-[10px] font-bold text-white"
                          >
                            {copiedField === 'exp2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'exp2' ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* IBAN BANCO SOL */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-1.5">
                      <p className="text-xs font-bold text-[#19B5FE]">
                        2. Transferência Bancária — BANCO SOL (IBAN):
                      </p>
                      <div className="flex items-center justify-between bg-black/30 p-2 rounded-lg border border-white/10">
                        <div className="min-w-0 pr-2">
                          <p className="font-mono-tabular text-xs font-bold text-white tracking-wide truncate">
                            0044 0000 56903729141 08
                          </p>
                          <p className="text-[11px] text-slate-200 mt-0.5">
                            Banco: <strong>BANCO SOL</strong> · Titular: <strong>Graciete Garcia</strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('004400005690372914108', 'iban')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#0077C8] hover:bg-[#008FEA] text-[10px] font-bold text-white shrink-0"
                        >
                          {copiedField === 'iban' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'iban' ? 'Copiado!' : 'Copiar IBAN'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Validation & Prior Enrollment Rules */}
                    <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-400/30 text-[11px] text-amber-200 space-y-1">
                      <p>
                        <strong>1. Inscrição Obrigatória:</strong> No acto de pagamento, o aluno deve <strong>primeiro inscrever-se</strong> preenchendo os dados abaixo antes de enviar o comprovativo.
                      </p>
                      <p>
                        <strong>2. Prazos de Validação:</strong> Pagamentos pelo mesmo banco (<strong>BANCO SOL</strong> ou <strong>Express</strong>) são validados <strong>no mesmo dia</strong>. Caso seja de banco diferente, leva <strong>24h</strong> para ser validado.{' '}
                        <Link to="/politica-pagamentos" className="underline text-[#19B5FE] font-bold">
                          Ver Política de Pagamentos
                        </Link>
                      </p>
                    </div>

                    {/* Send Proof CTA */}
                    <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                      <span className="text-slate-300 text-[11px]">Envie o comprovativo para confirmação:</span>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <a
                          href={`https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
                            `Olá ALHAN, já me inscrevi e efectuei o pagamento da formação "${selectedCourse.title}" no valor de ${selectedCourse.priceKz.toLocaleString(
                              'pt-AO'
                            )} Kz via ${paymentMethod}. Segue o comprovativo para validação. Nome: ${
                              user?.fullName || 'Formando'
                            }.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Enviar no WhatsApp</span>
                        </a>
                        <a
                          href={`mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent(
                            `Comprovativo de Pagamento - ${selectedCourse.title}`
                          )}&body=${encodeURIComponent(
                            `Olá ALHAN,\n\nEfectuei o pagamento da formação "${selectedCourse.title}" no valor de ${selectedCourse.priceKz.toLocaleString(
                              'pt-AO'
                            )} Kz via ${paymentMethod}.\n\nNome: ${user?.fullName || ''}\nWhatsApp: ${
                              studentWhatsapp
                            }\nReferência: ${paymentRef}\n\nSegue comprovativo em anexo.`
                          )}`}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px]"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Student Contact Info for Notification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">
                        Seu WhatsApp / Telefone (para notificação de ativação) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: +244 923 000 000"
                        value={studentWhatsapp}
                        onChange={(e) => setStudentWhatsapp(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">
                        Seu E-mail (para envio de confirmação) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Ex: aluno@empresa.ao"
                        value={studentEmailInput}
                        onChange={(e) => setStudentEmailInput(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1.5">
                      Método Utilizado para Pagamento
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {(['Express Angola', 'Unitel Money', 'Africell Money', 'KWiK'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`p-3 rounded-lg border text-xs font-semibold text-left transition-colors ${
                            paymentMethod === method
                              ? 'border-[#0077C8] bg-[#0077C8]/10 text-[#061A2D]'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <p>{method}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-normal">
                            {method === 'Express Angola' ? '927496287 / 927099484' : 'Validação manual'}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">
                        Código de Transacção / Referência do Comprovativo
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: EXP-2026-88412"
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">
                        Valor a Validar (Kz)
                      </label>
                      <input
                        type="text"
                        disabled
                        value={`${selectedCourse.priceKz.toLocaleString('pt-AO')} Kz`}
                        className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-mono-tabular font-bold text-[#061A2D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">
                      Dados do Comprovativo / Observações de Pagamento
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Indique o titular da conta que transferiu, data/hora ou nota do comprovativo..."
                      value={receiptNote}
                      onChange={(e) => setReceiptNote(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCourse(null)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold"
                    >
                      Submeter Inscrição e Comprovativo
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePresentialEnroll} className="space-y-4">
                  <div className="p-3.5 rounded-lg bg-[#F5F9FC] border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <strong>Formulário de Inscrição para Formação Presencial:</strong> Preencha os seus dados para reservar vaga na turma presencial em Luanda (ou formação in-company na sua província). O seu pedido fica registado no Painel Administrativo da ALHAN.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">Nome Completo do Formando *</label>
                      <input
                        type="text"
                        required
                        value={presName}
                        onChange={(e) => setPresName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={presEmail}
                        onChange={(e) => setPresEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">Telefone / WhatsApp *</label>
                      <input
                        type="text"
                        required
                        value={presPhone}
                        onChange={(e) => setPresPhone(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">Empresa / Instituição (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Individual ou Nome da Empresa"
                        value={presCompany}
                        onChange={(e) => setPresCompany(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">Província</label>
                      <select
                        value={presProvince}
                        onChange={(e) => setPresProvince(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:border-[#0077C8] focus:outline-none"
                      >
                        <option>Luanda</option>
                        <option>Benguela</option>
                        <option>Huíla</option>
                        <option>Cabinda</option>
                        <option>Huambo</option>
                        <option>Zaire</option>
                        <option>Malanje</option>
                        <option>Outra Província</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">Turno Preferencial</label>
                      <select
                        value={presShift}
                        onChange={(e) => setPresShift(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:border-[#0077C8] focus:outline-none"
                      >
                        <option>Manhã (08h30 – 12h30)</option>
                        <option>Tarde (13h30 – 17h30)</option>
                        <option>Pós-Laboral (18h00 – 21h00)</option>
                        <option>Sábados Intensivo (08h30 – 16h30)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Observações ou Necessidades Específicas</label>
                    <textarea
                      rows={2}
                      value={presNotes}
                      onChange={(e) => setPresNotes(e.target.value)}
                      placeholder="Ex: Inscrição para equipa de 4 colaboradores, necessidade de factura pró-forma..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCourse(null)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg bg-[#061A2D] hover:bg-[#0077C8] text-white text-xs font-bold"
                    >
                      Confirmar Inscrição Presencial
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const VerifyCertificatePage: React.FC = () => {
  const { certificates } = useApp();
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('codigo') || 'ALHAN-DEMO-2026-001';

  // Mode tab: 'codigo' or 'presencial_bi'
  const [activeTab, setActiveTab] = useState<'codigo' | 'presencial_bi'>(
    searchParams.get('bi') ? 'presencial_bi' : 'codigo'
  );
  const [codeQuery, setCodeQuery] = useState(initialCode);
  const [biQuery, setBiQuery] = useState(searchParams.get('bi') || '007891234LA042');

  const matchedCert = certificates.find(
    (c) => c.code.toLowerCase() === codeQuery.trim().toLowerCase()
  );

  // Search by BI or Student Name for presencial training
  const presencialMatches = certificates.filter((c) => {
    if (!biQuery.trim()) return false;
    const q = biQuery.trim().toLowerCase();
    const matchBI = c.studentBI && c.studentBI.toLowerCase().includes(q);
    const matchName = c.studentName && c.studentName.toLowerCase().includes(q);
    const matchCode = c.code && c.code.toLowerCase().includes(q);
    return matchBI || matchName || matchCode;
  });

  const verificationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/consultar-certificado?codigo=${encodeURIComponent(
          matchedCert?.code || codeQuery
        )}`
      : `https://www.alhan.pro/consultar-certificado?codigo=${encodeURIComponent(codeQuery)}`;

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      window.print();
      return;
    }
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName || 'Certificado_ALHAN_SGI.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="py-14 max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold text-[#0077C8] uppercase tracking-wider">
          Portal de Certificados & Validação Oficial · ALHAN SGI
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#061A2D] mt-2">
          Consultar e Baixar Certificados de Formação
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Área pública para validação de certificados via código / QR Code e pesquisa para que alunos de formações presenciais possam descarregar o respectivo certificado de conclusão emitido pela ALHAN.
        </p>
      </div>

      {/* Tabs Selector: Código vs B.I. Formação Presencial */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('codigo')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'codigo'
              ? 'border-[#0077C8] text-[#0077C8] bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>1. Validar por Código Único ou QR Code</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('presencial_bi')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'presencial_bi'
              ? 'border-[#0077C8] text-[#0077C8] bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>2. Baixar Certificado Presencial (por Nº de B.I. / NIF)</span>
        </button>
      </div>

      {/* TAB 1: Search by Certificate Code */}
      {activeTab === 'codigo' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <label className="block text-xs font-bold text-[#061A2D]">
              Código Único do Certificado (impresso ou transmitido digitalmente)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={codeQuery}
                  onChange={(e) => setCodeQuery(e.target.value)}
                  placeholder="Introduza o código (Ex: ALHAN-DEMO-2026-001 ou ALH-PRES-2026-0042)"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 text-sm font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {certificates.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCodeQuery(c.code)}
                    className="px-3.5 py-2 rounded-lg bg-[#F5F9FC] hover:bg-slate-200 border border-slate-200 text-xs font-mono-tabular font-semibold text-[#061A2D]"
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Certificate Result */}
          {matchedCert ? (
            <div className="bg-white rounded-2xl border-2 border-[#061A2D] p-6 sm:p-12 shadow-sm relative overflow-hidden space-y-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={COMPANY_INFO.logoPath}
                    alt="Logotipo ALHAN"
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 object-contain"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#0077C8]">{COMPANY_INFO.brandName}</p>
                    <h2 className="text-lg font-extrabold text-[#061A2D]">{COMPANY_INFO.legalName}</h2>
                    <p className="text-xs text-slate-500">NIF: {COMPANY_INFO.nif} · {COMPANY_INFO.location}</p>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-xs text-slate-500">Estado de Validação Oficial</p>
                  <p
                    className={`text-sm font-bold mt-0.5 ${
                      matchedCert.status === 'valido'
                        ? 'text-emerald-700'
                        : matchedCert.status === 'expirado'
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  >
                    {matchedCert.status === 'valido'
                      ? '✓ CERTIFICADO VÁLIDO E VERIFICADO'
                      : matchedCert.status === 'expirado'
                      ? '⚠ CERTIFICADO EXPIRADO'
                      : '✕ CERTIFICADO CANCELADO'}
                  </p>
                  <p className="text-xs font-mono-tabular text-slate-500 mt-0.5">Código: {matchedCert.code}</p>
                </div>
              </div>

              <div className="py-2 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                      Certificado de Conclusão de Formação Profissional
                    </span>
                    {matchedCert.modality && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-sky-100 text-[#0077C8]">
                        Modalidade: {matchedCert.modality}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600">Certifica-se que o(a) formando(a):</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#061A2D]">
                    {matchedCert.studentName}
                  </p>

                  {matchedCert.studentBI && (
                    <p className="text-xs font-mono-tabular font-bold text-slate-700">
                      Documento de Identificação (B.I. / NIF): {matchedCert.studentBI}
                    </p>
                  )}

                  <p className="text-sm text-slate-600 leading-relaxed">
                    concluiu com aproveitamento os requisitos pedagógicos e avaliações da acção de formação profissional:
                  </p>
                  <p className="text-xl font-bold text-[#0077C8]">{matchedCert.courseTitle}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs">
                    <div>
                      <p className="text-slate-500">Carga Horária</p>
                      <p className="font-mono-tabular font-bold text-[#061A2D] text-sm mt-0.5">
                        {matchedCert.workloadHours} Horas
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Data de Conclusão</p>
                      <p className="font-mono-tabular font-bold text-[#061A2D] text-sm mt-0.5">
                        {matchedCert.issuedDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Classificação / Menção</p>
                      <p className="font-mono-tabular font-bold text-emerald-700 text-sm mt-0.5">
                        {matchedCert.grade || 'Aprovado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code Block */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-[#F5F9FC] border border-slate-200 text-center">
                  <QRCodeSVG value={verificationUrl} size={136} level="M" includeMargin />
                  <p className="text-[11px] font-mono-tabular text-slate-600 mt-3">{matchedCert.code}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Aponte a câmara para validar a autenticidade deste certificado em tempo real.
                  </p>
                </div>
              </div>

              {/* Action Bar: Download & Print */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  {matchedCert.certificateFileUrl ? (
                    <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Ficheiro oficial anexado pelo painel administrativo da ALHAN ({matchedCert.certificateFileName || 'PDF'}).
                    </span>
                  ) : (
                    <span>Documento digital oficial autenticado com assinatura da Direcção Pedagógica.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {matchedCert.certificateFileUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadFile(
                          matchedCert.certificateFileUrl || '',
                          matchedCert.certificateFileName || `Certificado_${matchedCert.code}.pdf`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar Ficheiro do Certificado (PDF)</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#061A2D] hover:bg-[#0077C8] text-white text-xs font-bold transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Certificado</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div>
                  <p className="font-bold text-[#061A2D]">{matchedCert.responsibleName}</p>
                  <p className="text-slate-500">{matchedCert.responsibleRole} · Assinatura Digital Autorizada</p>
                </div>
                <p className="text-[11px] text-slate-500 max-w-md">
                  Este certificado atesta a conclusão de formação profissional ministrada pela ALHAN. Não constitui certificação de Sistema de Gestão ISO de empresa.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="text-base font-bold text-[#061A2D]">Nenhum certificado encontrado com o código «{codeQuery}»</h3>
              <p className="text-xs text-slate-600">
                Verifique se digitou correctamente todos os caracteres ou clique num dos códigos de exemplo acima.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Download Presencial Certificate by Student B.I. / NIF */}
      {activeTab === 'presencial_bi' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#061A2D]">
                  Pesquisar Certificado de Formação Presencial
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Introduza o seu número de Bilhete de Identidade (BI), NIF ou Nome Completo utilizado na inscrição presencial.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Formações Presenciais
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={biQuery}
                  onChange={(e) => setBiQuery(e.target.value)}
                  placeholder="Introduza o seu Nº do B.I. (Ex: 007891234LA042) ou Nome Completo"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 text-sm font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                />
              </div>

              {/* Demo test button */}
              <button
                type="button"
                onClick={() => setBiQuery('007891234LA042')}
                className="px-4 py-2.5 rounded-lg bg-[#F5F9FC] hover:bg-slate-200 border border-slate-200 text-xs font-mono-tabular font-bold text-[#061A2D] whitespace-nowrap"
              >
                Testar: 007891234LA042
              </button>
            </div>
          </div>

          {/* Results List */}
          {presencialMatches.length > 0 ? (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-600">
                {presencialMatches.length} certificado(s) encontrado(s) para «{biQuery}»:
              </p>

              {presencialMatches.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border-2 border-[#0077C8]/40 p-6 sm:p-8 shadow-sm space-y-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 text-xs font-bold border border-emerald-500/20">
                          {cert.modality === 'Presencial' ? 'Formação Presencial · Luanda' : cert.modality || 'Formação Presencial'}
                        </span>
                        <span className="text-xs font-mono-tabular font-bold text-[#0077C8]">
                          {cert.code}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#061A2D] mt-1.5">
                        {cert.courseTitle}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Formando(a): <strong className="text-[#061A2D]">{cert.studentName}</strong>
                        {cert.studentBI && <> · B.I.: <span className="font-mono-tabular font-bold">{cert.studentBI}</span></>}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                        ✓ Estado: {cert.status.toUpperCase()}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">Concluído em: {cert.issuedDate}</p>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-[#F5F9FC] p-4 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-slate-500">Carga Horária:</p>
                      <p className="font-bold font-mono-tabular text-[#061A2D] text-sm mt-0.5">
                        {cert.workloadHours} Horas
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Aproveitamento:</p>
                      <p className="font-bold text-emerald-700 text-sm mt-0.5">
                        {cert.grade || 'Aprovado com Distinção'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Responsável:</p>
                      <p className="font-bold text-[#061A2D] mt-0.5">{cert.responsibleName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Anexo Administrativo:</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {cert.certificateFileUrl ? 'Ficheiro Oficial Disponível' : 'Documento Digital Gerado'}
                      </p>
                    </div>
                  </div>

                  {/* Download & Verification Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      {cert.certificateFileUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadFile(
                              cert.certificateFileUrl || '',
                              cert.certificateFileName || `Certificado_Presencial_${cert.studentName.replace(/\s+/g, '_')}.pdf`
                            )
                          }
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Baixar Certificado Oficial (PDF / Anexo)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setCodeQuery(cert.code);
                            setActiveTab('codigo');
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold shadow-sm transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Visualizar & Baixar Certificado</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setCodeQuery(cert.code);
                          setActiveTab('codigo');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#061A2D] text-xs font-semibold transition-colors"
                      >
                        <Award className="w-4 h-4" />
                        <span>Ver QR Code</span>
                      </button>
                    </div>

                    <a
                      href={`https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
                        `Olá ALHAN, realizei a formação presencial de "${cert.courseTitle}". Nome: ${cert.studentName}, B.I.: ${cert.studentBI || ''}. Gostaria de confirmar o meu certificado.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Apoio Pedagógico (+244 922 021 211)</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="text-base font-bold text-[#061A2D]">
                Nenhum certificado presencial localizado para «{biQuery}»
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Certifique-se de que o seu Bilhete de Identidade ou Nome foi digitado correctamente. Os certificados presenciais são emitidos e anexados pelo Painel Administrativo após a realização da formação no Kilamba.
              </p>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
                    `Olá ALHAN, participei numa formação presencial e não consigo localizar o meu certificado com o B.I. ${biQuery}. Poderiam verificar por favor?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contactar Secretaria no WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const DiagnosticAndContactPage: React.FC<{ mode: 'diagnostico' | 'contactos' }> = ({ mode }) => {
  const { submitDiagnosticOrContact } = useApp();
  const [searchParams] = useSearchParams();
  const prefilledNorma = searchParams.get('norma') || 'ISO 9001 – Gestão da Qualidade';

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('+244 ');
  const [whatsapp, setWhatsapp] = useState('+244 ');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('Luanda');
  const [sector, setSector] = useState('Prestação de Serviços');
  const [employeesCount, setEmployeesCount] = useState('11 a 50 colaboradores');
  const [targetStandard, setTargetStandard] = useState(prefilledNorma);
  const [existingSystem, setExistingSystem] = useState('Não possui sistema formal');
  const [hasCertification, setHasCertification] = useState('Não');
  const [objective, setObjective] = useState('Implementação e preparação para certificação');
  const [message, setMessage] = useState('');
  const [submittedOk, setSubmittedOk] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitDiagnosticOrContact({
      type: mode === 'diagnostico' ? 'diagnostico' : 'contacto',
      companyName,
      contactName,
      role,
      phone,
      whatsapp,
      email,
      province,
      sector,
      employeesCount,
      targetStandard,
      existingSystem,
      hasCertification,
      objective,
      message,
    });
    setSubmittedOk(true);
  };

  return (
    <div className="py-14 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-xs font-semibold text-[#0077C8]">
              {mode === 'diagnostico' ? 'Formulário de Diagnóstico Empresarial · Secção 22' : 'Canais Oficiais de Contacto · Secção 27'}
            </p>
            <h1 className="text-3xl font-extrabold text-[#061A2D] mt-2">
              {mode === 'diagnostico'
                ? 'Solicitar Diagnóstico Empresarial ISO / SGI'
                : 'Contacte a Equipa Técnica da ALHAN'}
            </h1>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              {mode === 'diagnostico'
                ? 'Preencha os dados da sua organização para agendarmos um diagnóstico técnico inicial das suas operações e processos em Angola.'
                : 'Estamos disponíveis em Luanda e através dos nossos canais digitais para apoiar a sua empresa ou esclarecer dúvidas sobre as nossas formações.'}
            </p>
          </div>

          <div className="bg-[#061A2D] text-[#F5F9FC] rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">{COMPANY_INFO.legalName}</h2>
            <div className="space-y-2.5 text-xs text-[#F5F9FC]/85">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#19B5FE] shrink-0 mt-0.5" />
                <span>{COMPANY_INFO.address} · NIF {COMPANY_INFO.nif}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#19B5FE] shrink-0" />
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:underline">{COMPANY_INFO.email}</a>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#19B5FE] shrink-0" />
                <span className="font-mono-tabular">{COMPANY_INFO.phone} (Telefone e WhatsApp)</span>
              </p>
            </div>
            <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2.5">
              <a
                href={`https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
                  COMPANY_INFO.whatsappDefaultMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
              <a
                href={COMPANY_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold"
              >
                <span>Facebook Oficial</span>
              </a>
              <a
                href={COMPANY_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              >
                <span>@{COMPANY_INFO.instagram}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            {submittedOk ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-emerald-950">Pedido Registado na Base de Dados ALHAN</h3>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      O seu pedido foi guardado com sucesso e já se encontra disponível no Painel Administrativo Central da ALHAN. Um consultor sénior entrará em contacto brevemente.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSubmittedOk(false)}
                  className="px-4 py-2 rounded-lg bg-[#061A2D] text-white text-xs font-semibold"
                >
                  Enviar Novo Pedido
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Nome da Empresa *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Sociedade Industrial, Lda"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Nome do Responsável *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Nome completo"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Cargo *</label>
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Ex: Director Geral / Gestor QSMS"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Email Corporativo *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nome@empresa.ao"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">Telefone *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>

                  {mode === 'diagnostico' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#061A2D] mb-1">Província</label>
                        <select
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:border-[#0077C8] focus:outline-none"
                        >
                          <option>Luanda</option>
                          <option>Benguela</option>
                          <option>Cabinda</option>
                          <option>Huíla</option>
                          <option>Huambo</option>
                          <option>Zaire</option>
                          <option>Lunda Norte / Sul</option>
                          <option>Outra Província</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#061A2D] mb-1">Sector de Actividade</label>
                        <input
                          type="text"
                          value={sector}
                          onChange={(e) => setSector(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#061A2D] mb-1">Número de Colaboradores</label>
                        <select
                          value={employeesCount}
                          onChange={(e) => setEmployeesCount(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:border-[#0077C8] focus:outline-none"
                        >
                          <option>1 a 10 colaboradores</option>
                          <option>11 a 50 colaboradores</option>
                          <option>51 a 200 colaboradores</option>
                          <option>Mais de 200 colaboradores</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#061A2D] mb-1">Norma Pretendida</label>
                        <select
                          value={targetStandard}
                          onChange={(e) => setTargetStandard(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:border-[#0077C8] focus:outline-none"
                        >
                          <option>Sistema de Gestão Integrado (SGI: 9001 + 14001 + 45001)</option>
                          <option>ISO 9001 – Gestão da Qualidade</option>
                          <option>ISO 14001 – Gestão Ambiental</option>
                          <option>ISO 45001 – Segurança e Saúde no Trabalho</option>
                          <option>ISO/IEC 27001 – Segurança da Informação</option>
                          <option>ISO 22000 – Segurança Alimentar</option>
                          <option>ISO 37001 – Gestão Antissuborno / Compliance</option>
                          <option>Outra Norma / Formação In-Company</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#061A2D] mb-1">Sistema Existente</label>
                        <input
                          type="text"
                          value={existingSystem}
                          onChange={(e) => setExistingSystem(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#061A2D] mb-1">Possui Certificação?</label>
                        <select
                          value={hasCertification}
                          onChange={(e) => setHasCertification(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:border-[#0077C8] focus:outline-none"
                        >
                          <option>Não</option>
                          <option>Sim, em processo de renovação / migração</option>
                          <option>Sim, pretendemos integrar novas normas</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">
                    {mode === 'diagnostico' ? 'Objectivo do Projecto *' : 'Assunto *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">Mensagem / Detalhes Adicionais *</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva as necessidades da sua organização, prazos pretendidos ou dúvidas técnicas..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-sm font-bold transition-colors"
                >
                  {mode === 'diagnostico' ? 'Submeter Pedido de Diagnóstico Empresarial' : 'Enviar Mensagem para a ALHAN'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AuthPages: React.FC<{ initialMode: 'login' | 'registo' }> = ({ initialMode }) => {
  const { loginWithGoogle, loginWithCredentials, registerAccount, panelCredentials } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'registo' | 'recuperar'>(initialMode);
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('admin');
  const [phone, setPhone] = useState('+244 ');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('user');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recoverySent, setRecoverySent] = useState(false);

  const redirectByRole = (r: UserRole) => {
    if (r === 'SUPER_ADMIN' || r === 'ADMIN') navigate('/admin');
    else if (r === 'PROFESSOR') navigate('/professor');
    else if (r === 'CLIENTE_EMPRESARIAL') navigate('/empresa');
    else navigate('/aluno');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'recuperar') {
      setRecoverySent(true);
      return;
    }

    try {
      if (mode === 'registo') {
        if (password !== confirmPassword) {
          setErrorMsg('A palavra-passe e a confirmação da palavra-passe não coincidem.');
          return;
        }
        await registerAccount({
          fullName,
          email,
          phone,
          username,
          password,
          role,
        });
        redirectByRole(role);
      } else {
        const resolvedRole = await loginWithCredentials(email || username, password, role);
        redirectByRole(resolvedRole);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao autenticar credenciais.');
    }
  };

  return (
    <div className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Login / Register Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={COMPANY_INFO.logoPath}
              alt="Logotipo ALHAN"
              referrerPolicy="no-referrer"
              className="h-12 w-12 object-contain"
            />
            <div>
              <p className="text-xs font-bold text-[#0077C8]">Controlo de Acesso e Sessões · Secção 11</p>
              <h1 className="text-xl font-extrabold text-[#061A2D]">
                {mode === 'login' ? 'Iniciar Sessão no Painel' : mode === 'registo' ? 'Criar Conta na Plataforma' : 'Recuperar Palavra-passe'}
              </h1>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`py-2 text-xs font-bold rounded-md ${
                mode === 'login' ? 'bg-white text-[#061A2D] shadow-sm' : 'text-slate-600'
              }`}
            >
              Login (Utilizador & Senha)
            </button>
            <button
              type="button"
              onClick={() => { setMode('registo'); setErrorMsg(null); }}
              className={`py-2 text-xs font-bold rounded-md ${
                mode === 'registo' ? 'bg-white text-[#061A2D] shadow-sm' : 'text-slate-600'
              }`}
            >
              Registo Completo
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {mode === 'recuperar' && recoverySent ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-3">
              <p>Instruções de recuperação de palavra-passe registadas para <strong>{email}</strong>.</p>
              <button
                type="button"
                onClick={() => { setMode('login'); setRecoverySent(false); }}
                className="px-4 py-2 rounded-lg bg-[#061A2D] text-white font-semibold"
              >
                Voltar ao Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#061A2D] mb-1">Painel / Perfil de Acesso (RBAC)</label>
                <select
                  value={role}
                  onChange={(e) => {
                    const newRole = e.target.value as UserRole;
                    setRole(newRole);
                    const cred = panelCredentials.find((c) => c.role === newRole);
                    if (cred && mode === 'login') {
                      setEmail(cred.username);
                      setPassword(cred.password);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:border-[#0077C8] focus:outline-none font-semibold text-[#061A2D]"
                >
                  <option value="ADMIN">ADMIN (Painel Administrativo Operacional)</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN (Painel Administrativo Central)</option>
                  <option value="PROFESSOR">PROFESSOR / FORMADOR (Painel Docente)</option>
                  <option value="CLIENTE_EMPRESARIAL">CLIENTE EMPRESARIAL (Painel Consultoria ISO)</option>
                  <option value="ALUNO">ALUNO (Painel Academia LMS)</option>
                </select>
              </div>

              {mode === 'registo' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">1. Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nome completo"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">2. Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="utilizador@exemplo.ao"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">3. Telefone *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-[#061A2D] mb-1">
                  {mode === 'registo' ? '4. Nome de Utilizador (User) *' : 'Utilizador (User) ou Email *'}
                </label>
                <input
                  type="text"
                  required
                  value={mode === 'registo' ? username : email}
                  onChange={(e) => (mode === 'registo' ? setUsername(e.target.value) : setEmail(e.target.value))}
                  placeholder={mode === 'registo' ? 'Ex: manuel.mateus' : 'Ex: admin, superadmin, professor, empresa, aluno'}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                />
              </div>

              {mode !== 'recuperar' && (
                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">
                    {mode === 'registo' ? '5. Senha (Palavra-passe) *' : 'Senha (Palavra-passe) *'}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha padrão: user"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                  />
                </div>
              )}

              {mode === 'registo' && (
                <div>
                  <label className="block text-xs font-bold text-[#061A2D] mb-1">6. Confirmação da Palavra-passe *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode('recuperar')}
                    className="text-[11px] font-semibold text-[#0077C8] hover:underline"
                  >
                    Esqueceu a palavra-passe?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold transition-colors"
              >
                {mode === 'login' ? 'Entrar no Painel Seleccionado' : mode === 'registo' ? 'Concluir Registo' : 'Enviar Instruções'}
              </button>
            </form>
          )}

          <div className="mt-5 pt-5 border-t border-slate-200 space-y-3">
            <button
              type="button"
              onClick={async () => {
                await loginWithGoogle();
                navigate('/admin');
              }}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-[#061A2D] flex items-center justify-center gap-2 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-[#0077C8]" />
              <span>Autenticar com Conta Google (Firebase Auth)</span>
            </button>
          </div>
        </div>

        {/* Right: Credenciais de Acesso para Cada Painel (Utilizador & Senha: user) */}
        <div className="lg:col-span-6 bg-[#061A2D] text-white rounded-2xl border border-[#0077C8]/40 p-6 sm:p-8 space-y-5">
          <div>
            <p className="text-xs font-semibold text-[#19B5FE]">Acesso Directo por Perfil RBAC</p>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
              Credenciais de Acesso para Cada Painel (User & Senha)
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Utilize o <strong>Utilizador (User)</strong> e a <strong>Senha</strong> abaixo para aceder a cada painel administrativo e operacional da plataforma ALHAN, ou clique em «Entrar Agora» para iniciar sessão imediata:
            </p>
          </div>

          <div className="space-y-3">
            {panelCredentials.map((cred) => (
              <div
                key={cred.role}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#19B5FE]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-white">{cred.panelName}</p>
                  <p className="text-[11px] text-slate-300">{cred.description}</p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono-tabular">
                    <span className="text-slate-300">
                      User: <strong className="text-[#19B5FE]">{cred.username}</strong>
                    </span>
                    <span aria-hidden="true" className="text-white/25">·</span>
                    <span className="text-slate-300">
                      Senha: <strong className="text-emerald-400">{cred.password}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setRole(cred.role);
                      setEmail(cred.username);
                      setPassword(cred.password);
                      setErrorMsg(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-white text-[11px] font-semibold transition-colors whitespace-nowrap"
                  >
                    Preencher
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const r = await loginWithCredentials(cred.username, cred.password, cred.role);
                      redirectByRole(r);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-[11px] font-bold transition-colors whitespace-nowrap"
                  >
                    Entrar Agora →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
