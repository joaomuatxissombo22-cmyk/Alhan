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
import { useApp, computeCourseInstallments } from '../context/AppContext';
import {
  COMPANY_INFO,
  CourseItem,
  EnrollmentItem,
  UserRole,
  ALHAN_COUPON_CODE,
  ALHAN_COUPON_DISCOUNT_PERCENT,
  ALHAN_BLACK_FRIDAY_DISCOUNT_PERCENT,
  calculateCourseDiscountedPricing,
} from '../data/initialData';

export const CoursesCatalogPage: React.FC = () => {
  const { courses, createEnrollment, submitStudentPaymentProof, submitDiagnosticOrContact, user } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialCourseId = searchParams.get('curso');
  const [modalityFilter, setModalityFilter] = useState<'Todas' | 'Online' | 'Presencial' | 'Híbrida'>('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Discount State: Black Friday Novembro (15% OFF) & Cupom SOUALHAN (25% OFF)
  const [applyBlackFriday, setApplyBlackFriday] = useState<boolean>(true);
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(() => {
    if (initialCourseId) {
      return courses.find((c) => c.id === initialCourseId) || null;
    }
    return null;
  });

  // 2-Step Flow: 1) 'inscricao_directa' (Direct Enrollment first) -> 2) 'pagamento' (Pay after enrolling)
  const [enrollStep, setEnrollStep] = useState<'inscricao_directa' | 'pagamento'>('inscricao_directa');
  const [createdEnrollment, setCreatedEnrollment] = useState<EnrollmentItem | null>(null);

  // Direct Enrollment Form State (Step 1)
  const [studentNameInput, setStudentNameInput] = useState(user?.fullName || '');
  const [studentWhatsapp, setStudentWhatsapp] = useState(user?.phone || '+244 ');
  const [studentEmailInput, setStudentEmailInput] = useState(user?.email || '');
  const [chosenModality, setChosenModality] = useState<'Online' | 'Presencial' | 'Híbrida'>('Online');
  const [presCompany, setPresCompany] = useState('');
  const [presProvince, setPresProvince] = useState('Luanda');
  const [presShift, setPresShift] = useState('Manhã (08h30 – 12h30)');
  const [presNotes, setPresNotes] = useState('');

  // Payment Form State (Step 2 - after direct enrollment)
  const [installmentTarget, setInstallmentTarget] = useState<'1ª Parcela' | '2ª Parcela' | 'Pagamento Integral'>('1ª Parcela');
  const [paymentMethod, setPaymentMethod] = useState<EnrollmentItem['paymentMethod']>('Express Angola');
  const [paymentRef, setPaymentRef] = useState('');
  const [receiptNote, setReceiptNote] = useState('');
  const [receiptFileUrl, setReceiptFileUrl] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentCompletedMsg, setPaymentCompletedMsg] = useState<string | null>(null);

  // Sync selectedCourse if URL query ?curso=... changes
  React.useEffect(() => {
    const cid = searchParams.get('curso');
    if (cid) {
      const found = courses.find((c) => c.id === cid);
      if (found) {
        setSelectedCourse(found);
        setChosenModality(found.modality);
        setEnrollStep('inscricao_directa');
        setCreatedEnrollment(null);
        setPaymentCompletedMsg(null);
      }
    }
  }, [searchParams, courses]);

  // Keep user details pre-filled when user logs in
  React.useEffect(() => {
    if (user) {
      setStudentNameInput((prev) => prev || user.fullName);
      setStudentWhatsapp((prev) => (prev === '+244 ' || !prev ? user.phone : prev));
      setStudentEmailInput((prev) => prev || user.email);
    }
  }, [user]);

  const handleApplyCouponCode = (rawCode?: string) => {
    const codeToTest = (rawCode !== undefined ? rawCode : couponInput).trim().toUpperCase();
    if (!codeToTest) {
      setAppliedCouponCode('');
      setCouponFeedback({
        type: 'err',
        msg: `Introduza o código do cupom «${ALHAN_COUPON_CODE}» para activar ${ALHAN_COUPON_DISCOUNT_PERCENT}% de desconto.`,
      });
      return;
    }
    if (codeToTest === ALHAN_COUPON_CODE) {
      setCouponInput(ALHAN_COUPON_CODE);
      setAppliedCouponCode(ALHAN_COUPON_CODE);
      setCouponFeedback({
        type: 'ok',
        msg: `✓ Cupom «${ALHAN_COUPON_CODE}» aplicado com sucesso! Desconto de ${ALHAN_COUPON_DISCOUNT_PERCENT}% activado sobre o valor total e sobre as 2 parcelas.`,
      });
    } else {
      setAppliedCouponCode('');
      setCouponFeedback({
        type: 'err',
        msg: `Cupom «${codeToTest}» inválido. Utilize o cupom oficial «${ALHAN_COUPON_CODE}» (${ALHAN_COUPON_DISCOUNT_PERCENT}% de desconto) ou aproveite a Black Friday Novembro (${ALHAN_BLACK_FRIDAY_DISCOUNT_PERCENT}% de desconto).`,
      });
    }
  };

  const openDirectEnrollment = (course: CourseItem) => {
    setSelectedCourse(course);
    setChosenModality(course.modality);
    setEnrollStep('inscricao_directa');
    setInstallmentTarget('1ª Parcela');
    setCreatedEnrollment(null);
    setPaymentCompletedMsg(null);
    setPaymentRef('');
    setReceiptNote('');
    setReceiptFileUrl('');
    setReceiptFileName('');
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceiptFileUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const publishedCourses = courses.filter((c) => c.published);
  const filteredCourses = publishedCourses.filter((c) => {
    const matchesModality = modalityFilter === 'Todas' || c.modality === modalityFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModality && matchesSearch;
  });

  // STEP 1: Direct Enrollment without requiring payment first
  const handleDirectEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const cleanName = studentNameInput.trim() || user?.fullName || 'Formando Inscrito';
    const cleanPhone = studentWhatsapp.trim() || user?.phone || '+244 922 021 211';
    const cleanEmail = studentEmailInput.trim() || user?.email || 'aluno@alhan.pro';
    const activeCoupon =
      appliedCouponCode ||
      (couponInput.trim().toUpperCase() === ALHAN_COUPON_CODE ? ALHAN_COUPON_CODE : undefined);
    const pricing = calculateCourseDiscountedPricing(
      selectedCourse.priceKz,
      activeCoupon,
      applyBlackFriday
    );

    const created = await createEnrollment({
      course: selectedCourse,
      modality: chosenModality,
      paymentMethod: 'Express Angola',
      paymentReference: 'INSCRICAO-DIRECTA',
      receiptNote: `Inscrição directa realizada (${chosenModality} · Turno: ${presShift}${
        pricing.discountBadgeLabel ? ` · ${pricing.discountBadgeLabel}` : ''
      }). Estado Firestore: PENDENTE.`,
      studentName: cleanName,
      studentPhone: cleanPhone,
      studentEmail: cleanEmail,
      couponCode: activeCoupon,
      applyBlackFriday,
    });

    if (chosenModality === 'Presencial' || chosenModality === 'Híbrida') {
      await submitDiagnosticOrContact({
        type: 'inscricao_presencial',
        companyName: presCompany || 'Inscrição Individual Directa',
        contactName: cleanName,
        role: `Modalidade: ${chosenModality} · Turno: ${presShift}`,
        phone: cleanPhone,
        whatsapp: cleanPhone,
        email: cleanEmail,
        province: presProvince,
        sector: 'Formação Profissional',
        employeesCount: '1',
        targetStandard: selectedCourse.title,
        objective: `Inscrição Directa (${selectedCourse.durationHours}h - ${pricing.finalPriceKz.toLocaleString('pt-AO')} Kz ${pricing.discountBadgeLabel})`,
        message: presNotes || `Inscrição directa na formação ${selectedCourse.title} (${chosenModality}, ${presShift}).`,
      });
    }

    setCreatedEnrollment(created);
    setEnrollStep('pagamento');
  };

  // STEP 2: Submit Payment Proof after enrolling
  const handlePaymentAfterEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const updated = await submitStudentPaymentProof({
      enrollmentId: createdEnrollment?.id,
      course: selectedCourse,
      modality: chosenModality,
      paymentMethod,
      paymentReference: paymentRef.trim() || `REF-${Date.now().toString().slice(-6)}`,
      receiptNote:
        receiptNote.trim() ||
        `Comprovativo (${installmentTarget}) via ${paymentMethod} enviado pelo formando após inscrição directa.`,
      receiptFileUrl: receiptFileUrl || undefined,
      receiptFileName: receiptFileName || undefined,
      studentPhone: studentWhatsapp.trim(),
      studentEmail: studentEmailInput.trim(),
      installmentTarget,
    });

    setCreatedEnrollment(updated);
    setPaymentCompletedMsg(
      `Comprovativo (${installmentTarget}) da inscrição #${updated.id} submetido com sucesso! A sua inscrição encontra-se com estado PENDENTE no Firebase Firestore até aprovação e confirmação pelo Administrador Principal da ALHAN.`
    );
  };

  return (
    <div className="py-14 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-[#0077C8]">Catálogo de Cursos Administrável · Inscrição Directa</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#061A2D] mt-2">
            Nossas Formações Profissionais (Online, Presencial e Híbrida)
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            <strong>Clique em qualquer curso</strong> para realizar logo a sua <strong>inscrição directa</strong> (registada no Firebase Firestore com estado <strong>PENDENTE</strong> até aprovação do Administrador) e aproveitar o desconto de <strong>Black Friday Novembro (-15%)</strong> ou o cupom <strong>{ALHAN_COUPON_CODE} (-25%)</strong>.
          </p>
        </div>

        {/* Interactive Filter Tabs */}
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

      {/* BANNER OFICIAL: BLACK FRIDAY NOVEMBRO (15% DE DESCONTO) + CUPOM SOUALHAN (25% DE DESCONTO) */}
      <div className="rounded-2xl bg-gradient-to-r from-[#061A2D] via-[#0A2540] to-[#061A2D] border-2 border-[#C8A951] p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#C8A951] text-[#061A2D] text-[11px] font-extrabold uppercase tracking-wider">
                🔥 Black Friday Novembro · -{ALHAN_BLACK_FRIDAY_DISCOUNT_PERCENT}% nas Formações
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider">
                🎟️ Cupom de Desconto: {ALHAN_COUPON_CODE} (-{ALHAN_COUPON_DISCOUNT_PERCENT}% OFF)
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-white">
              Aproveite a Black Friday Novembro (-15%) ou aplique o Cupom «{ALHAN_COUPON_CODE}» para 25% de Desconto!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Introduza o título do cupom <strong className="text-[#E5C97B] font-mono-tabular">{ALHAN_COUPON_CODE}</strong> abaixo ou no formulário de inscrição para reduzir automaticamente <strong>25% no valor total, na 1.ª Parcela e na 2.ª Parcela</strong> de qualquer formação.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl p-1.5">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder={`Cupom: ${ALHAN_COUPON_CODE}`}
                className="bg-transparent px-3 py-1.5 text-xs font-mono-tabular font-extrabold text-white placeholder:text-slate-400 focus:outline-none uppercase w-36"
              />
              <button
                type="button"
                onClick={() => handleApplyCouponCode()}
                className="px-3.5 py-2 rounded-lg bg-[#C8A951] hover:bg-[#d8b960] text-[#061A2D] text-xs font-extrabold transition-colors whitespace-nowrap"
              >
                Aplicar Cupom
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleApplyCouponCode(ALHAN_COUPON_CODE)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-colors whitespace-nowrap"
            >
              Activar {ALHAN_COUPON_CODE} (-25%)
            </button>
          </div>
        </div>

        {couponFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between gap-3 ${
              couponFeedback.type === 'ok'
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                : 'bg-amber-500/20 border-amber-400/40 text-amber-200'
            }`}
          >
            <span>{couponFeedback.msg}</span>
            {appliedCouponCode && (
              <button
                type="button"
                onClick={() => {
                  setAppliedCouponCode('');
                  setCouponInput('');
                  setCouponFeedback(null);
                }}
                className="text-[11px] underline text-white/80 hover:text-white shrink-0"
              >
                Remover cupom (manter Black Friday -15%)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Course Grid — Clicking ANY course card opens Direct Enrollment immediately */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const activeCoupon =
            appliedCouponCode ||
            (couponInput.trim().toUpperCase() === ALHAN_COUPON_CODE ? ALHAN_COUPON_CODE : undefined);
          const pricing = calculateCourseDiscountedPricing(
            course.priceKz,
            activeCoupon,
            applyBlackFriday
          );
          const couponPreviewPricing = calculateCourseDiscountedPricing(
            course.priceKz,
            ALHAN_COUPON_CODE,
            true
          );

          return (
            <div
              key={course.id}
              role="button"
              tabIndex={0}
              onClick={() => openDirectEnrollment(course)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openDirectEnrollment(course);
                }
              }}
              className={`bg-white rounded-xl cursor-pointer ${
                course.featured
                  ? 'border-2 border-[#0077C8] ring-4 ring-[#0077C8]/10 shadow-md'
                  : 'border border-slate-200'
              } overflow-hidden flex flex-col justify-between hover:border-[#0077C8] hover:shadow-lg transition-all group`}
            >
              <div>
                <div className="relative h-52 w-full bg-[#061A2D] overflow-hidden border-b border-slate-200">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  {course.featured && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-[#061A2D]/90 border border-[#19B5FE]/50 text-[#19B5FE] text-[11px] font-extrabold shadow-md">
                      ★ {course.featuredBadge || 'Formação em Destaque'}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-amber-500 text-[#061A2D] text-[10px] font-extrabold shadow-sm">
                    {pricing.couponValid
                      ? `🎟️ Cupom ${ALHAN_COUPON_CODE} -${ALHAN_COUPON_DISCOUNT_PERCENT}%`
                      : `🔥 Black Friday Novembro -${ALHAN_BLACK_FRIDAY_DISCOUNT_PERCENT}%`}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded bg-[#061A2D]/85 text-[#19B5FE] text-[10px] font-bold border border-white/15">
                    Clique para Inscrição Directa →
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-[#0077C8]">{course.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.modality}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{course.durationHours}h ({course.lessonsCount} aulas)</span>
                  </div>

                  <h2 className="text-xl font-bold text-[#061A2D] group-hover:text-[#0077C8] transition-colors mt-2">
                    {course.title}
                  </h2>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{course.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <p><strong>Objectivos:</strong> {course.objectives}</p>
                    <p><strong>Conteúdo programático:</strong> {course.syllabus}</p>
                    <p className="text-slate-500"><strong>Formador:</strong> {course.instructorName}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-slate-200 space-y-2.5">
                <div className="p-2.5 rounded-lg bg-[#F5F9FC] border border-slate-200/80 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <p className="text-slate-500 font-semibold">1.ª Parcela (Acto Inscrição)</p>
                    <p className="font-mono-tabular font-extrabold text-[#0077C8]">
                      {pricing.firstInstallmentKz.toLocaleString('pt-AO')} Kz
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold">2.ª Parcela (+7 dias início)</p>
                    <p className="font-mono-tabular font-extrabold text-[#061A2D]">
                      {pricing.secondInstallmentKz.toLocaleString('pt-AO')} Kz
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-slate-500">
                      Normal: <span className="line-through">{course.priceKz.toLocaleString('pt-AO')} Kz</span> ·{' '}
                      <span className="font-bold text-amber-700">
                        {pricing.couponValid
                          ? `Cupom ${ALHAN_COUPON_CODE} (-25%)`
                          : 'Black Friday Novembro (-15%)'}
                      </span>
                    </p>
                    <p className="text-lg font-extrabold font-mono-tabular text-[#061A2D]">
                      {pricing.finalPriceKz.toLocaleString('pt-AO')} Kz
                    </p>
                    {!pricing.couponValid && (
                      <p className="text-[11px] font-bold text-emerald-700 font-mono-tabular">
                        Com Cupom {ALHAN_COUPON_CODE} (-25%): {couponPreviewPricing.finalPriceKz.toLocaleString('pt-AO')} Kz
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDirectEnrollment(course);
                      }}
                      className="px-4 py-2.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
                    >
                      Inscrever-se Directo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-STEP MODAL: PASSO 1 (INSCRIÇÃO DIRECTA) -> PASSO 2 (PAGAMENTO DA FORMAÇÃO) */}
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
                    {enrollStep === 'inscricao_directa'
                      ? 'Passo 1 de 2 · Inscrição Directa Imediata na Formação (Firestore: PENDENTE)'
                      : 'Passo 2 de 2 · Pagamento da Formação para Liberar Acesso'}
                  </p>
                  <h2 className="text-lg sm:text-xl font-bold mt-0.5">{selectedCourse.title}</h2>
                  {(() => {
                    const activeCoupon =
                      appliedCouponCode ||
                      (couponInput.trim().toUpperCase() === ALHAN_COUPON_CODE
                        ? ALHAN_COUPON_CODE
                        : undefined);
                    const modalPricing = calculateCourseDiscountedPricing(
                      selectedCourse.priceKz,
                      activeCoupon,
                      applyBlackFriday
                    );
                    return (
                      <p className="text-xs font-mono-tabular text-[#9AA6AE] mt-1">
                        Valor Final: <strong className="text-emerald-400">{modalPricing.finalPriceKz.toLocaleString('pt-AO')} Kz</strong>{' '}
                        {modalPricing.effectiveDiscountPercent > 0 && (
                          <span className="line-through text-slate-500 mr-1">
                            ({selectedCourse.priceKz.toLocaleString('pt-AO')} Kz)
                          </span>
                        )}
                        · Carga Horária: {selectedCourse.durationHours}h · Formador: {selectedCourse.instructorName}
                      </p>
                    );
                  })()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicator Tabs */}
            <div className="px-6 pt-4 bg-[#F5F9FC] border-b border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={() => setEnrollStep('inscricao_directa')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-colors flex items-center gap-1.5 ${
                  enrollStep === 'inscricao_directa'
                    ? 'bg-white text-[#061A2D] border-slate-200'
                    : 'bg-transparent text-emerald-700 border-transparent hover:text-[#061A2D]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>1.º Passo: Inscrição Directa {createdEnrollment ? '✓' : ''}</span>
              </button>
              <button
                type="button"
                onClick={() => setEnrollStep('pagamento')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-colors flex items-center gap-1.5 ${
                  enrollStep === 'pagamento'
                    ? 'bg-white text-[#061A2D] border-slate-200'
                    : 'bg-transparent text-slate-600 border-transparent hover:text-[#061A2D]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>2.º Passo: Pagar a Formação</span>
              </button>
            </div>

            <div className="p-6">
              {enrollStep === 'inscricao_directa' ? (
                /* PASSO 1: INSCRIÇÃO DIRECTA (Sem exigir pagamento prévio) */
                <form onSubmit={handleDirectEnrollmentSubmit} className="space-y-4">
                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#0077C8] shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-[#061A2D]">
                          Inscrição Directa (Estado Firestore: PENDENTE) & Plano de Pagamento em Duas Parcelas
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                          Qualquer formando pode preencher o formulário de inscrição abaixo. A inscrição fica com o estado <strong>PENDENTE</strong> no Firebase Firestore até aprovação do Administrador. Para confirmar a vaga, o pagamento da <strong>1.ª Parcela</strong> é obrigatório no acto da inscrição, sendo a <strong>2.ª Parcela</strong> paga 1 semana após o início da formação.
                        </p>
                      </div>
                    </div>

                    {/* Interactive Coupon SOUALHAN (25% OFF) & Black Friday Novembro (15% OFF) inside Modal */}
                    <div className="p-3 rounded-xl bg-[#061A2D] text-white space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E5C97B]">
                            🎟️ Cupom de Desconto (25% OFF) & Black Friday Novembro (15% OFF)
                          </span>
                          <p className="text-xs font-bold text-white mt-0.5">
                            Título do Cupom de 25%: <span className="font-mono-tabular text-emerald-400">{ALHAN_COUPON_CODE}</span>
                          </p>
                        </div>
                        <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={applyBlackFriday}
                            onChange={(e) => setApplyBlackFriday(e.target.checked)}
                            className="rounded border-white/30 text-[#0077C8]"
                          />
                          <span>Black Friday Novembro (-{ALHAN_BLACK_FRIDAY_DISCOUNT_PERCENT}%)</span>
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder={`Digite o cupom ${ALHAN_COUPON_CODE}`}
                          className="flex-1 min-w-[160px] rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-mono-tabular font-bold text-white placeholder:text-slate-400 uppercase focus:outline-none focus:border-[#19B5FE]"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCouponCode()}
                          className="px-3.5 py-1.5 rounded-lg bg-[#C8A951] hover:bg-[#d8b960] text-[#061A2D] text-xs font-extrabold"
                        >
                          Aplicar Cupom
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyCouponCode(ALHAN_COUPON_CODE)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                        >
                          Usar {ALHAN_COUPON_CODE} (-25%)
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const inst = computeCourseInstallments(selectedCourse);
                      const activeCoupon =
                        appliedCouponCode ||
                        (couponInput.trim().toUpperCase() === ALHAN_COUPON_CODE
                          ? ALHAN_COUPON_CODE
                          : undefined);
                      const pr = calculateCourseDiscountedPricing(
                        selectedCourse.priceKz,
                        activeCoupon,
                        applyBlackFriday
                      );
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-sky-200/80 text-xs">
                          <div className="p-2.5 rounded-lg bg-white border border-sky-200">
                            <p className="text-[10px] font-bold uppercase text-slate-500">
                              Valor Total {pr.effectiveDiscountPercent > 0 ? `(-${pr.effectiveDiscountPercent}%)` : ''}
                            </p>
                            <p className="text-sm font-extrabold font-mono-tabular text-[#061A2D]">
                              {pr.finalPriceKz.toLocaleString('pt-AO')} Kz
                            </p>
                            {pr.effectiveDiscountPercent > 0 && (
                              <p className="text-[10px] text-emerald-700 font-bold">
                                Poupança: {pr.savingsKz.toLocaleString('pt-AO')} Kz
                              </p>
                            )}
                          </div>
                          <div className="p-2.5 rounded-lg bg-white border border-[#0077C8]/40">
                            <p className="text-[10px] font-bold uppercase text-[#0077C8]">1.ª Parcela (Acto Inscrição)</p>
                            <p className="text-sm font-extrabold font-mono-tabular text-[#0077C8]">
                              {pr.firstInstallmentKz.toLocaleString('pt-AO')} Kz
                            </p>
                            <p className="text-[10px] text-slate-500">Confirmação obrigatória da vaga</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                            <p className="text-[10px] font-bold uppercase text-slate-600">2.ª Parcela (Restante)</p>
                            <p className="text-sm font-extrabold font-mono-tabular text-[#061A2D]">
                              {pr.secondInstallmentKz.toLocaleString('pt-AO')} Kz
                            </p>
                            <p className="text-[10px] text-slate-500">Vence: {inst.secondDueDate} (+7 dias)</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">
                        Nome Completo do Aluno *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Seu nome completo"
                        value={studentNameInput}
                        onChange={(e) => setStudentNameInput(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">
                        WhatsApp / Telefone *
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
                        Seu E-mail *
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">
                        Modalidade de Frequência *
                      </label>
                      <select
                        value={chosenModality}
                        onChange={(e) =>
                          setChosenModality(e.target.value as 'Online' | 'Presencial' | 'Híbrida')
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:border-[#0077C8] focus:outline-none"
                      >
                        <option value="Online">Online (LMS + Microsoft Teams)</option>
                        <option value="Presencial">Presencial (Luanda · Vagas Limitadas)</option>
                        <option value="Híbrida">Híbrida (Online + Sessões Presenciais)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">
                        Turno Preferencial
                      </label>
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

                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">
                        Província
                      </label>
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">
                        Empresa / Instituição (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Individual ou Nome da Empresa"
                        value={presCompany}
                        onChange={(e) => setPresCompany(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">
                        Observações (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Solicito factura pró-forma..."
                        value={presNotes}
                        onChange={(e) => setPresNotes(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                    {(() => {
                      const activeCoupon =
                        appliedCouponCode ||
                        (couponInput.trim().toUpperCase() === ALHAN_COUPON_CODE
                          ? ALHAN_COUPON_CODE
                          : undefined);
                      const pr = calculateCourseDiscountedPricing(
                        selectedCourse.priceKz,
                        activeCoupon,
                        applyBlackFriday
                      );
                      return (
                        <p className="text-xs text-slate-500">
                          Valor final da formação:{' '}
                          <strong className="font-mono-tabular text-[#061A2D]">
                            {pr.finalPriceKz.toLocaleString('pt-AO')} Kz
                          </strong>{' '}
                          {pr.discountBadgeLabel ? `(${pr.discountBadgeLabel})` : ''}
                        </p>
                      );
                    })()}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedCourse(null)}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold shadow-md transition-colors"
                      >
                        Confirmar Inscrição Directa → Seguir para Pagamento
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* PASSO 2: PAGAMENTO DA FORMAÇÃO (Logo após a Inscrição Directa) */
                <div className="space-y-4">
                  {createdEnrollment && !paymentCompletedMsg && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                            ✓ Inscrição Directa Confirmada (#{createdEnrollment.id}) — Estado Firestore: PENDENTE!
                          </h3>
                          <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                            O formando <strong>{createdEnrollment.studentName}</strong> foi registado com o estado <strong>PENDENTE</strong> no Firebase Firestore em{' '}
                            <strong>{selectedCourse.title}</strong>. Realize o pagamento da 1.ª Parcela abaixo e aguarde a aprovação do Administrador.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCourse(null);
                          navigate('/aluno');
                        }}
                        className="px-3.5 py-2 rounded-lg bg-[#061A2D] hover:bg-[#0077C8] text-white text-xs font-bold shrink-0"
                      >
                        Ir para o Painel do Aluno →
                      </button>
                    </div>
                  )}

                  {paymentCompletedMsg ? (
                    <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-bold text-emerald-950">
                            Inscrição e Comprovativo Submetidos com Sucesso!
                          </h3>
                          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                            {paymentCompletedMsg}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCourse(null);
                            navigate('/aluno');
                          }}
                          className="px-4 py-2 rounded-lg bg-[#061A2D] text-white text-xs font-semibold hover:bg-[#0077C8]"
                        >
                          Abrir Painel do Aluno (LMS & Pagamentos)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCourse(null)}
                          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handlePaymentAfterEnrollmentSubmit} className="space-y-4">
                      {/* Selector of 1st Installment, 2nd Installment or Full Payment */}
                      {(() => {
                        const inst = computeCourseInstallments(selectedCourse, createdEnrollment?.enrolledAt);
                        const activeCoupon =
                          createdEnrollment?.appliedCoupon ||
                          appliedCouponCode ||
                          (couponInput.trim().toUpperCase() === ALHAN_COUPON_CODE
                            ? ALHAN_COUPON_CODE
                            : undefined);
                        const pr = calculateCourseDiscountedPricing(
                          selectedCourse.priceKz,
                          activeCoupon,
                          createdEnrollment?.blackFridayApplied ?? applyBlackFriday
                        );
                        const firstKz = createdEnrollment?.firstInstallmentAmountKz ?? pr.firstInstallmentKz;
                        const secondKz = createdEnrollment?.secondInstallmentAmountKz ?? pr.secondInstallmentKz;
                        const totalKz = createdEnrollment?.amountKz ?? pr.finalPriceKz;
                        return (
                          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-2.5">
                            <p className="text-xs font-extrabold text-[#061A2D]">
                              Seleccione a Modalidade de Pagamento / Parcela a Liquidar:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              {(
                                [
                                  {
                                    key: '1ª Parcela',
                                    title: '1.ª Parcela (Confirmar Vaga)',
                                    amount: firstKz,
                                    sub: `Obrigatória na inscrição · Vence: ${inst.firstDueDate}`,
                                  },
                                  {
                                    key: '2ª Parcela',
                                    title: '2.ª Parcela (Valor Restante)',
                                    amount: secondKz,
                                    sub: `1 semana após início · Vence: ${inst.secondDueDate}`,
                                  },
                                  {
                                    key: 'Pagamento Integral',
                                    title: 'Pagamento Integral (100%)',
                                    amount: totalKz,
                                    sub: 'Liquida 1.ª + 2.ª Parcelas',
                                  },
                                ] as const
                              ).map((opt) => (
                                <button
                                  key={opt.key}
                                  type="button"
                                  onClick={() => setInstallmentTarget(opt.key)}
                                  className={`p-2.5 rounded-lg border text-left transition-all ${
                                    installmentTarget === opt.key
                                      ? 'border-[#0077C8] bg-white ring-2 ring-[#0077C8]/20 shadow-sm'
                                      : 'border-slate-200 bg-white/70 hover:bg-white'
                                  }`}
                                >
                                  <p className="text-xs font-extrabold text-[#061A2D]">{opt.title}</p>
                                  <p className="text-sm font-mono-tabular font-extrabold text-[#0077C8] mt-0.5">
                                    {opt.amount.toLocaleString('pt-AO')} Kz
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Official Payment Channels Box */}
                      <div className="p-4 rounded-xl bg-[#061A2D] text-white space-y-3.5 border border-[#0077C8]/40 shadow-sm">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#19B5FE]" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              Canais de Pagamento Oficiais ({installmentTarget})
                            </span>
                          </div>
                          <span className="text-[11px] font-mono-tabular font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            Total Curso: {selectedCourse.priceKz.toLocaleString('pt-AO')} Kz
                          </span>
                        </div>

                        {/* Express Numbers */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-2">
                          <p className="text-xs font-bold text-[#19B5FE]">
                            1. Multicaixa Express (Validação no mesmo dia):
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

                        {/* Validation Timing Note */}
                        <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-400/30 text-[11px] text-amber-200">
                          <strong>Prazos de Validação:</strong> Pagamentos pelo mesmo banco (<strong>BANCO SOL</strong> ou <strong>Express</strong>) são validados <strong>no mesmo dia</strong>. Caso seja de banco diferente, leva <strong>24h</strong> para ser validado.
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#061A2D] mb-1.5">
                          Canal Utilizado para Pagamento
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {(
                            [
                              'Express Angola',
                              'BANCO SOL (IBAN)',
                              'Transferência / Comprovativo',
                              'Unitel Money',
                              'Africell Money',
                              'KWiK',
                            ] as const
                          ).map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setPaymentMethod(method)}
                              className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-colors ${
                                paymentMethod === method
                                  ? 'border-[#0077C8] bg-[#0077C8]/10 text-[#061A2D]'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
                              }`}
                            >
                              <p>{method}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 font-normal">
                                {method === 'Express Angola'
                                  ? '927496287 / 927099484'
                                  : method === 'BANCO SOL (IBAN)'
                                  ? 'Graciete Garcia'
                                  : 'Validação administrativa'}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#061A2D] mb-1">
                            Referência / Nº do Talão de Pagamento
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: EXP-2026-88412 ou Nº de Operação"
                            value={paymentRef}
                            onChange={(e) => setPaymentRef(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#061A2D] mb-1">
                            Anexar Comprovativo (PDF ou Imagem — Opcional)
                          </label>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={handleReceiptUpload}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#061A2D] file:text-white"
                          />
                          {receiptFileName && (
                            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                              ✓ Ficheiro anexado: {receiptFileName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#061A2D] mb-1">
                          Observações do Pagamento (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Indique o titular da conta ordenante ou nota adicional..."
                          value={receiptNote}
                          onChange={(e) => setReceiptNote(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
                              `Olá ALHAN, já realizei a minha inscrição directa na formação "${selectedCourse.title}" (${selectedCourse.priceKz.toLocaleString(
                                'pt-AO'
                              )} Kz) e envio o comprovativo de pagamento via ${paymentMethod} para liberar a formação. Aluno: ${studentNameInput}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Enviar no WhatsApp</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCourse(null);
                              navigate('/aluno');
                            }}
                            className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Pagar Depois no Painel do Aluno
                          </button>
                        </div>

                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold shadow-sm"
                        >
                          Enviar Comprovativo e Liberar Formação
                        </button>
                      </div>
                    </form>
                  )}
                </div>
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
  const initialCode = searchParams.get('codigo') || 'ALHAN-SGI-2026-001';

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
                  placeholder="Introduza o código (Ex: ALHAN-SGI-2026-001 ou ALH-PRES-2026-0042)"
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
  const { courses, loginWithGoogle, loginWithCredentials, registerAccount, resetPasswordByEmail } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'registo' | 'recuperar'>(initialMode);
  const [role, setRole] = useState<UserRole>('ALUNO');
  const [fullName, setFullName] = useState('');
  const [studentBI, setStudentBI] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(
    () => courses.find((c) => c.featured)?.id || courses[0]?.id || ''
  );
  const [selectedModality, setSelectedModality] = useState<'Online' | 'Presencial' | 'Híbrida'>('Online');
  const [couponInput, setCouponInput] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+244 ');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveredAccountName, setRecoveredAccountName] = useState('');

  const [specialty, setSpecialty] = useState('Sistemas de Gestão Integrado (ISO 9001, ISO 14001, ISO 45001) & HSE');
  const [experience, setExperience] = useState('8 anos em Consultoria e Auditoria Líder SGI / Normas ISO e HSE');

  const redirectByRole = (r: UserRole) => {
    if (r === 'SUPER_ADMIN' || r === 'ADMIN') navigate('/gestao-alhan-sgi');
    else if (r === 'PROFESSOR') navigate('/professor');
    else if (r === 'CLIENTE_EMPRESARIAL') navigate('/empresa');
    else navigate('/aluno');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'recuperar') {
      try {
        if (password !== confirmPassword) {
          setErrorMsg('A nova palavra-passe e a confirmação não coincidem.');
          return;
        }
        const updated = await resetPasswordByEmail(email, password);
        setRecoveredAccountName(updated.fullName);
        setRecoverySent(true);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Erro ao redefinir a palavra-passe por e-mail.');
      }
      return;
    }

    try {
      if (mode === 'registo') {
        if (password !== confirmPassword) {
          setErrorMsg('A palavra-passe e a confirmação da palavra-passe não coincidem.');
          return;
        }
        const regRole: UserRole =
          role === 'CLIENTE_EMPRESARIAL'
            ? 'CLIENTE_EMPRESARIAL'
            : role === 'PROFESSOR'
            ? 'PROFESSOR'
            : 'ALUNO';
        await registerAccount({
          fullName,
          email,
          phone,
          studentBI: regRole === 'ALUNO' ? studentBI : undefined,
          username,
          password,
          role: regRole,
          companyName: regRole === 'CLIENTE_EMPRESARIAL' ? companyName : undefined,
          specialty: regRole === 'PROFESSOR' ? specialty : undefined,
          experience: regRole === 'PROFESSOR' ? experience : undefined,
          courseId: regRole === 'ALUNO' ? selectedCourseId : undefined,
          modality: regRole === 'ALUNO' ? selectedModality : undefined,
          couponCode: regRole === 'ALUNO' ? couponInput.trim() : undefined,
        });
        redirectByRole(regRole);
      } else {
        const resolvedRole = await loginWithCredentials(email || username, password, role);
        redirectByRole(resolvedRole);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao autenticar credenciais.');
    }
  };

  return (
    <div className="py-10 sm:py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Login / Register / Reset Password Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={COMPANY_INFO.logoPath}
              alt="Logotipo ALHAN"
              referrerPolicy="no-referrer"
              className="h-12 w-12 object-contain"
            />
            <div>
              <p className="text-xs font-bold text-[#0077C8]">Controlo de Acesso · ALHAN SGI</p>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#061A2D]">
                {mode === 'login'
                  ? 'Iniciar Sessão no Seu Painel'
                  : mode === 'registo'
                  ? 'Cadastro de Aluno, Professor ou Cliente Empresarial'
                  : 'Redefinir Palavra-passe com E-mail (Aluno / Formador)'}
              </h1>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setRecoverySent(false);
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-md ${
                mode === 'login' ? 'bg-white text-[#061A2D] shadow-sm' : 'text-slate-600'
              }`}
            >
              Iniciar Sessão
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('registo');
                setRecoverySent(false);
                if (role !== 'ALUNO' && role !== 'CLIENTE_EMPRESARIAL' && role !== 'PROFESSOR') {
                  setRole('ALUNO');
                }
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-md ${
                mode === 'registo' ? 'bg-white text-[#061A2D] shadow-sm' : 'text-slate-600'
              }`}
            >
              Criar Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('recuperar');
                setRecoverySent(false);
                setPassword('');
                setConfirmPassword('');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-md ${
                mode === 'recuperar' ? 'bg-white text-[#0077C8] shadow-sm' : 'text-slate-600'
              }`}
            >
              Redefinir Senha
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed">
              {errorMsg}
            </div>
          )}

          {mode === 'recuperar' && recoverySent ? (
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-3">
              <p className="font-extrabold text-sm text-emerald-900">
                Palavra-passe redefinida com sucesso!
              </p>
              <p className="leading-relaxed">
                A palavra-passe da conta de <strong>{recoveredAccountName || email}</strong> (E-mail: <strong>{email}</strong>) foi actualizada no sistema ALHAN – SGI. Já pode iniciar sessão com a sua nova palavra-passe.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setRecoverySent(false);
                  }}
                  className="px-4 py-2.5 rounded-lg bg-[#061A2D] hover:bg-[#0c2742] text-white font-bold"
                >
                  Iniciar Sessão Agora com a Nova Senha →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'recuperar' ? (
                <>
                  <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-slate-700 leading-relaxed">
                    <strong>Redefinição de Palavra-passe por E-mail (Aluno ou Formador):</strong> Caso tenha esquecido a sua palavra-passe, introduza abaixo o seu <strong>E-mail registado</strong> na plataforma e defina a sua nova palavra-passe.
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">
                      1. E-mail Registado do Aluno ou Formador *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: joao.mateus@email.ao"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">
                      2. Nova Palavra-passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Crie a sua nova palavra-passe (mín. 4 caracteres)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">
                      3. Confirmar Nova Palavra-passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova palavra-passe"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">
                      {mode === 'registo'
                        ? 'Tipo de Conta a Cadastrar *'
                        : 'Painel de Destino *'}
                    </label>
                    {mode === 'registo' ? (
                      <select
                        value={
                          role === 'CLIENTE_EMPRESARIAL'
                            ? 'CLIENTE_EMPRESARIAL'
                            : role === 'PROFESSOR'
                            ? 'PROFESSOR'
                            : 'ALUNO'
                        }
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-xs bg-white focus:border-[#0077C8] focus:outline-none font-bold text-[#061A2D]"
                      >
                        <option value="ALUNO">ALUNO (Activar Painel do Aluno / Academia LMS)</option>
                        <option value="PROFESSOR">
                          PROFESSOR / FORMADOR (Inscrever-se e Aguardar Autorização Administrativa)
                        </option>
                        <option value="CLIENTE_EMPRESARIAL">
                          CLIENTE EMPRESARIAL (Activar Painel de Consultoria ISO da Empresa)
                        </option>
                      </select>
                    ) : (
                      <select
                        value={role === 'ADMIN' || role === 'SUPER_ADMIN' ? 'ALUNO' : role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-xs bg-white focus:border-[#0077C8] focus:outline-none font-bold text-[#061A2D]"
                      >
                        <option value="ALUNO">Painel do Aluno (Academia LMS)</option>
                        <option value="PROFESSOR">Painel do Professor / Formador</option>
                        <option value="CLIENTE_EMPRESARIAL">
                          Painel do Cliente Empresarial (Consultoria ISO)
                        </option>
                      </select>
                    )}
                  </div>

                  {mode === 'registo' && (role === 'PROFESSOR' || role === 'ALUNO') && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                      {role === 'PROFESSOR' ? (
                        <>
                          <strong>Nota para Professores e Formadores:</strong> Qualquer professor pode solicitar acesso ao Painel do Professor. Contudo, após submeter a inscrição, a conta fica em estado <strong>«PENDENTE»</strong> e o professor só poderá aceder ao painel depois da autorização exclusiva do Administrador Principal.
                        </>
                      ) : (
                        <>
                          <strong>Nota para Novos Formandos:</strong> Ao preencher o cadastro abaixo, a sua inscrição e o seu registo de certificado são enviados imediatamente para o <strong>Painel Administrativo Central ALHAN – SGI</strong> com o estado <strong>«PENDENTE»</strong> para aprovação do Administrador.
                        </>
                      )}
                    </div>
                  )}

                  {mode === 'registo' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#061A2D] mb-1">
                          1.{' '}
                          {role === 'CLIENTE_EMPRESARIAL'
                            ? 'Nome do Responsável / Representante *'
                            : role === 'PROFESSOR'
                            ? 'Nome Completo do Professor / Formador *'
                            : 'Nome Completo do Aluno *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Introduza o seu nome completo"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                        />
                      </div>

                      {role === 'ALUNO' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-[#061A2D] mb-1">
                              Formação / Curso em que se Inscreve *
                            </label>
                            <select
                              value={selectedCourseId}
                              onChange={(e) => setSelectedCourseId(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-[#061A2D] focus:border-[#0077C8] focus:outline-none"
                            >
                              {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.title} ({c.priceKz.toLocaleString('pt-AO')} Kz)
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-[#061A2D] mb-1">
                                Modalidade *
                              </label>
                              <select
                                value={selectedModality}
                                onChange={(e) =>
                                  setSelectedModality(e.target.value as 'Online' | 'Presencial' | 'Híbrida')
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-[#061A2D]"
                              >
                                <option value="Online">Online</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Híbrida">Híbrida</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-[#061A2D] mb-1">
                                Nº B.I. / NIF (Certificado)
                              </label>
                              <input
                                type="text"
                                value={studentBI}
                                onChange={(e) => setStudentBI(e.target.value.toUpperCase())}
                                placeholder="Ex: 007891234LA042"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-[#0077C8] mb-1">
                                Cupom (-25% SOUALHAN)
                              </label>
                              <input
                                type="text"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                placeholder="Ex: SOUALHAN"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular uppercase"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {role === 'CLIENTE_EMPRESARIAL' && (
                        <div>
                          <label className="block text-xs font-bold text-[#061A2D] mb-1">
                            Designação Social da Empresa / Organização *
                          </label>
                          <input
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Ex: Empresa Industrial de Luanda, Lda"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                          />
                        </div>
                      )}

                      {role === 'PROFESSOR' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-[#061A2D] mb-1">
                              Especialidade Técnica / Normas e Áreas que Leciona *
                            </label>
                            <input
                              type="text"
                              required
                              value={specialty}
                              onChange={(e) => setSpecialty(e.target.value)}
                              placeholder="Ex: Auditor Líder ISO 9001, HSE, Segurança no Trabalho, ISO 14001..."
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#061A2D] mb-1">
                              Experiência Profissional *
                            </label>
                            <input
                              type="text"
                              required
                              value={experience}
                              onChange={(e) => setExperience(e.target.value)}
                              placeholder="Ex: 8 anos em Consultoria SGI, Auditoria ISO e Formação Corporativa"
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-[#061A2D] mb-1">2. E-mail *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="utilizador@empresa.ao"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#061A2D] mb-1">
                          3. Telefone / WhatsApp *
                        </label>
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
                      {mode === 'registo' ? '4. Nome de Utilizador (User) *' : 'Utilizador (User) ou E-mail *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={mode === 'registo' ? username : email}
                      onChange={(e) =>
                        mode === 'registo' ? setUsername(e.target.value) : setEmail(e.target.value)
                      }
                      placeholder={
                        mode === 'registo'
                          ? 'Ex: joao.mateus'
                          : 'Introduza o seu utilizador ou e-mail'
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#061A2D] mb-1">
                      {mode === 'registo' ? '5. Criar Palavra-passe *' : 'Palavra-passe (Senha) *'}
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Introduza a sua palavra-passe"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-tabular focus:border-[#0077C8] focus:outline-none"
                    />
                  </div>

                  {mode === 'registo' && (
                    <div>
                      <label className="block text-xs font-bold text-[#061A2D] mb-1">
                        6. Confirmar Palavra-passe *
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a palavra-passe"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0077C8] focus:outline-none"
                      />
                    </div>
                  )}

                  {mode === 'login' && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMode('registo')}
                        className="text-[11px] font-bold text-[#0077C8] hover:underline"
                      >
                        Ainda não tem conta? Cadastrar →
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('recuperar');
                          setPassword('');
                          setConfirmPassword('');
                          setErrorMsg(null);
                        }}
                        className="text-[11px] font-bold text-amber-700 hover:underline"
                      >
                        Esqueceu a palavra-passe? Redefinir com E-mail
                      </button>
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold transition-colors"
              >
                {mode === 'login'
                  ? 'Autenticar e Entrar no Painel'
                  : mode === 'registo'
                  ? role === 'PROFESSOR'
                    ? 'Submeter Inscrição de Professor para Autorização'
                    : 'Concluir Cadastro e Activar Meu Painel'
                  : 'Redefinir Palavra-passe com E-mail'}
              </button>
            </form>
          )}

          <div className="mt-5 pt-5 border-t border-slate-200 space-y-3">
            <button
              type="button"
              onClick={async () => {
                await loginWithGoogle();
                navigate('/aluno');
              }}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-[#061A2D] flex items-center justify-center gap-2 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-[#0077C8]" />
              <span>Autenticar com Conta Google (Firebase Auth)</span>
            </button>
          </div>
        </div>

        {/* Right: Política de Painéis e Inscrição */}
        <div className="lg:col-span-5 bg-[#061A2D] text-white rounded-2xl border border-[#0077C8]/40 p-6 sm:p-8 space-y-5">
          <div>
            <p className="text-xs font-semibold text-[#19B5FE]">Acesso e Inscrição nos Painéis</p>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
              Como Funciona o Acesso a Cada Painel
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Seleccione o seu perfil para aceder ou efectuar o seu registo na plataforma ALHAN – Sistema de Gestão Integrado:
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="font-bold text-[#19B5FE]">1. Painel do Aluno (Academia LMS)</p>
              <p className="text-slate-300 leading-relaxed">
                Activado mediante o seu <strong>cadastro de aluno</strong>. Permite inscrever-se directamente em qualquer curso, enviar o comprovativo de pagamento, assistir às aulas e baixar certificados.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="font-bold text-amber-300">2. Painel do Professor / Formador (Sujeito a Autorização)</p>
              <p className="text-slate-300 leading-relaxed">
                Qualquer professor ou formador pode <strong>inscrever-se publicamente</strong> na plataforma. Após a inscrição, o acesso fica a aguardar até que o <strong>Painel Administrativo autorize</strong> a sua inscrição docente.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="font-bold text-[#19B5FE]">3. Painel do Cliente Empresarial (Consultoria ISO)</p>
              <p className="text-slate-300 leading-relaxed">
                Exclusivo para empresas clientes registadas. Ao cadastrar a sua empresa, é inicializado o ambiente isolado do seu projecto ISO (cronograma, gestão documental, auditorias e RNCs).
              </p>
            </div>
          </div>

          {mode === 'login' && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('registo');
                  setRole('ALUNO');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
              >
                Criar Conta (Aluno, Professor ou Empresa) →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
