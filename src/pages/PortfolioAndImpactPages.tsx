import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  GraduationCap,
  Handshake,
  Lock,
  Printer,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  ArrowRight,
  ExternalLink,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmployabilityOutcomeCategory } from '../data/initialData';

const OUTCOME_LABELS: Record<EmployabilityOutcomeCategory, { label: string; badgeClass: string }> = {
  PRIMEIRO_EMPREGO: {
    label: 'Primeiro Emprego',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  REINTEGRACAO_MERCADO: {
    label: 'Reintegração no Mercado',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  PROMOCAO_PROFISSIONAL: {
    label: 'Promoção Profissional',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  CONTA_PROPRIA: {
    label: 'Actividade por Conta Própria',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  EM_ACOMPANHAMENTO: {
    label: 'Em Acompanhamento Pós-Formação',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
  },
};

export const PortfolioImpactPage: React.FC = () => {
  const {
    courses,
    certificates,
    enrollments,
    isoProjects,
    testimonials,
    dynamicCounters,
    employabilityIndicators,
    alumniTrackingRecords,
    impactEvidences,
    trainingPortfolioHistory,
    institutionalPartnerships,
  } = useApp();

  const [activePortfolioTab, setActivePortfolioTab] = useState<
    'todos' | 'historico' | 'cursos' | 'projectos' | 'parcerias'
  >('todos');

  // Only show authorized & Admin-approved testimonials
  const approvedTestimonials = testimonials.filter(
    (t) =>
      t.approvalStatus !== 'pendente' &&
      t.approvalStatus !== 'rejeitado' &&
      t.authorizedForPublication !== false
  );

  // Validated alumni tracking records with personal data protection consent
  const publishedAlumniRecords = alumniTrackingRecords.filter(
    (r) => r.validatedByAdmin && r.dataProtectionConsent
  );

  // Published documentary evidences
  const publishedEvidences = impactEvidences.filter((e) => e.validated && e.published);

  // Compute validated student count per course from real certificates / approved enrollments
  const getCourseStudentCountStatus = (courseId: string, courseTitle: string) => {
    const validCerts = certificates.filter(
      (c) =>
        c.status === 'valido' &&
        (c.courseId === courseId ||
          c.courseTitle.toLowerCase().includes(courseTitle.toLowerCase().slice(0, 18)))
    );
    const approvedEnrs = enrollments.filter(
      (e) =>
        e.courseId === courseId &&
        (e.enrollmentApprovalStatus === 'aprovado' || e.paymentStatus === 'Pago')
    );
    const historyMatch = trainingPortfolioHistory.find((h) =>
      h.courseTitle.toLowerCase().includes(courseTitle.toLowerCase().slice(0, 15))
    );
    if (historyMatch && historyMatch.validatedCount && historyMatch.certifiedStudentsCount !== null) {
      return { validated: true, count: historyMatch.certifiedStudentsCount };
    }
    const count = Math.max(validCerts.length, approvedEnrs.length);
    if (count > 0) {
      return { validated: true, count };
    }
    return { validated: false, count: null };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Institutional Hero Header (Split: Text on Left, Visual Governance Card on Right) */}
      <section className="bg-[#041525] text-white border-b border-white/10 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#C8A951]/40 text-[#E5C97B] text-xs font-bold uppercase tracking-widest mb-4">
                <ShieldCheck className="w-4 h-4 text-[#C8A951]" />
                <span>Transparência, Governance & Resultados Verificados</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                Portefólio, Impacto e{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#34D399] to-[#C8A951]">
                  Empregabilidade
                </span>
              </h1>
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed mb-6">
                Conheça o histórico das formações realizadas, os projectos de implementação ISO/SGI desenvolvidos pela{' '}
                <strong className="text-white">ALHAN CONSULTORIA E PRESTAÇÃO DE SERVIÇOS, LDA</strong>, os indicadores auditados de empregabilidade e os mecanismos de Governance e Compliance que asseguram a veracidade de todos os dados publicados.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/relatorio-impacto"
                  className="inline-flex items-center gap-2 bg-[#C8A951] hover:bg-[#d8b960] text-[#041525] font-extrabold px-5 py-3.5 rounded-xl text-sm shadow-lg transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Consultar Relatório de Impacto Online</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#indicadores-empregabilidade"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold px-5 py-3.5 rounded-xl text-sm transition-all"
                >
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <span>Ver Indicadores de Empregabilidade</span>
                </a>
              </div>
            </div>

            {/* Right Column: Dynamic Institutional Summary Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#072038] border border-white/15 p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#E5C97B]">
                      Contador Dinâmico Institucional
                    </p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Período de referência: {dynamicCounters.referencePeriod}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Auditado
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 mb-5">
                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                    <p className="text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Formandos Formados
                    </p>
                    {dynamicCounters.trainedStudentsValidated &&
                    dynamicCounters.trainedStudentsCount !== null ? (
                      <p className="text-3xl font-extrabold text-white tabular-nums">
                        {dynamicCounters.trainedStudentsCount}
                      </p>
                    ) : (
                      <span className="inline-block text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-1 rounded">
                        Dados em actualização
                      </span>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">Com certificado PDF válido</p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                    <p className="text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Implementações SGI
                    </p>
                    {dynamicCounters.sgiImplementationsValidated &&
                    dynamicCounters.sgiImplementationsCount !== null ? (
                      <p className="text-3xl font-extrabold text-emerald-400 tabular-nums">
                        {dynamicCounters.sgiImplementationsCount}
                      </p>
                    ) : (
                      <span className="inline-block text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-1 rounded">
                        Dados em actualização
                      </span>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">Projectos ISO executados</p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                    <p className="text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Cursos & Especialidades
                    </p>
                    {dynamicCounters.coursesDeliveredValidated &&
                    dynamicCounters.coursesDeliveredCount !== null ? (
                      <p className="text-3xl font-extrabold text-sky-400 tabular-nums">
                        {dynamicCounters.coursesDeliveredCount}
                      </p>
                    ) : (
                      <span className="inline-block text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-1 rounded">
                        Dados em actualização
                      </span>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">Programas ministrados</p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                    <p className="text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Empresas Parceiras
                    </p>
                    {dynamicCounters.partnerCompaniesValidated &&
                    dynamicCounters.partnerCompaniesCount !== null ? (
                      <p className="text-3xl font-extrabold text-[#E5C97B] tabular-nums">
                        {dynamicCounters.partnerCompaniesCount}
                      </p>
                    ) : (
                      <span className="inline-block text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-1 rounded">
                        Dados em actualização
                      </span>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">Entidades acompanhadas</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 bg-white/[0.04] rounded-xl p-3 border border-white/10 flex items-center justify-between gap-2">
                  <span>
                    Última actualização: <strong>{dynamicCounters.updatedAt.slice(0, 10)}</strong>
                  </span>
                  <span className="text-sky-300 font-semibold">{dynamicCounters.updatedBy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          1. PORTEFÓLIO DO CENTRO
      ===================================================================== */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#0B4F6C] mb-2">
              <Briefcase className="w-4 h-4" />
              1. Portefólio Institucional do Centro
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Histórico de Formações, Especialidades, Projectos e Parcerias
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Apresentação estruturada das actividades formativas, fotografias das turmas (com texto separado da imagem), número de formandos por curso, projectos técnicos e parcerias institucionais.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
            {[
              { id: 'todos', label: 'Visão Completa' },
              { id: 'historico', label: 'Histórico & Fotos' },
              { id: 'cursos', label: 'Formandos por Curso' },
              { id: 'projectos', label: 'Projectos & Serviços' },
              { id: 'parcerias', label: 'Parcerias' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActivePortfolioTab(t.id as typeof activePortfolioTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePortfolioTab === t.id
                    ? 'bg-[#041525] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1.A. Histórico das Formações Realizadas & Fotografias das Actividades (Texto de um lado, Imagem limpa do outro) */}
        {(activePortfolioTab === 'todos' || activePortfolioTab === 'historico') && (
          <div className="mb-12">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#0B4F6C]" />
              <span>Histórico das Formações Realizadas e Fotografias de Actividades</span>
            </h3>
            <div className="space-y-6">
              {trainingPortfolioHistory.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12"
                >
                  {/* Text Column on one side */}
                  <div
                    className={`lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between ${
                      idx % 2 === 1 ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-900 text-[11px] font-extrabold uppercase">
                          Código: {item.editionCode}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                          Modalidade: {item.modality}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
                          Período: {item.period}
                        </span>
                      </div>

                      <h4 className="text-xl font-extrabold text-slate-900 mb-2">
                        {item.courseTitle}
                      </h4>
                      <p className="text-xs font-bold text-[#0B4F6C] uppercase tracking-wider mb-3">
                        Especialidade: {item.specialtyArea} · Local: {item.location}
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed mb-5">
                        {item.activityDescription}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase text-slate-500 block">
                          Formandos Certificados nesta Edição:
                        </span>
                        {item.validatedCount && item.certifiedStudentsCount !== null ? (
                          <span className="text-base font-extrabold text-emerald-700">
                            {item.certifiedStudentsCount} Formandos Certificados (Validado)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            Dados em actualização
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        Suporte Documental: <strong>{item.evidenceCode}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Unobstructed Image Column on the other side (Zero text over the photo) */}
                  <div
                    className={`lg:col-span-5 bg-slate-900 min-h-[240px] sm:min-h-[280px] ${
                      idx % 2 === 1 ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.courseTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1.B. Cursos e Especialidades Ministrados + Número de Formandos por Curso */}
        {(activePortfolioTab === 'todos' || activePortfolioTab === 'cursos') && (
          <div className="mb-12">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0B4F6C]" />
              <span>Cursos e Especialidades Ministrados & Número de Formandos por Curso</span>
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Curso / Especialidade Ministrada</th>
                      <th className="py-3.5 px-4">Área Técnica</th>
                      <th className="py-3.5 px-4">Modalidade</th>
                      <th className="py-3.5 px-4">Carga Horária</th>
                      <th className="py-3.5 px-4">N.º de Formandos Certificados</th>
                      <th className="py-3.5 px-4 text-right">Acção</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {courses.map((course) => {
                      const status = getCourseStudentCountStatus(course.id, course.title);
                      return (
                        <tr key={course.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{course.title}</td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs font-semibold">
                            {course.category}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                              {course.modality}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-semibold">
                            {course.durationHours}h
                          </td>
                          <td className="py-3.5 px-4">
                            {status.validated && status.count !== null ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {status.count} {status.count === 1 ? 'Formando validado' : 'Formandos validados'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                                <Clock className="w-3.5 h-3.5" />
                                Dados em actualização
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              to="/academia"
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#0B4F6C] hover:underline"
                            >
                              <span>Ver Curso</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 1.C. Projectos e Serviços Desenvolvidos */}
        {(activePortfolioTab === 'todos' || activePortfolioTab === 'projectos') && (
          <div className="mb-12">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#0B4F6C]" />
              <span>Projectos de Consultoria ISO/SGI e Serviços Técnicos Desenvolvidos</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isoProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        Fase: {proj.status}
                      </span>
                      <span className="text-xs font-extrabold text-slate-700">
                        Execução: {proj.executionPercent}%
                      </span>
                    </div>
                    <h4 className="text-lg font-extrabold text-slate-900 mb-1">
                      {proj.companyName}
                    </h4>
                    <p className="text-xs font-bold text-[#0B4F6C] mb-3">{proj.standards}</p>
                    <p className="text-xs text-slate-600 mb-4">
                      <strong>Próxima etapa técnica:</strong> {proj.nextActivity}
                    </p>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${proj.executionPercent}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="bg-gradient-to-br from-[#041525] to-[#0B3558] text-white rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-md bg-[#C8A951]/20 border border-[#C8A951]/40 text-[#E5C97B] text-[11px] font-bold uppercase mb-3">
                    Metodologia Proprietária em 14 Etapas
                  </span>
                  <h4 className="text-lg font-extrabold mb-2">
                    Implementação de Sistemas de Gestão e Auditorias ISO 19011
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                    Desenvolvemos diagnósticos Gap Analysis, mapeamento de processos SIPOC, matrizes LAIA (ISO 14001), análises preliminares de risco APR (ISO 45001), programas de Compliance (ISO 37001/37301) e preparação para certificação.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/consultoria-iso"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-[#C8A951] text-[#041525] px-4 py-2.5 rounded-xl"
                  >
                    <span>Ver Serviços de Consultoria</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/solicitar-diagnostico"
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 rounded-xl border border-white/15"
                  >
                    <span>Solicitar Diagnóstico Empresarial</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1.D. Parcerias Institucionais e Empresariais */}
        {(activePortfolioTab === 'todos' || activePortfolioTab === 'parcerias') && (
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Handshake className="w-5 h-5 text-[#0B4F6C]" />
              <span>Parcerias Institucionais, Clientes Corporativos e Entidades Empregadoras</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {institutionalPartnerships.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold">
                        {partner.partnershipType}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        Desde {partner.sinceYear}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 mb-1">
                      {partner.organizationName}
                    </h4>
                    <p className="text-xs font-semibold text-[#0B4F6C] mb-2.5">{partner.sector}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{partner.scopeDescription}</p>
                  </div>
                  {partner.verified && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Registo Institucional Verificado pela Administração</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          2. PAINEL DE INDICADORES DE EMPREGABILIDADE (COM GRÁFICOS E TRANSPARÊNCIA)
      ===================================================================== */}
      <section
        id="indicadores-empregabilidade"
        className="py-14 bg-white border-y border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-emerald-700 mb-2">
                <TrendingUp className="w-4 h-4" />
                2. Painel Estatístico de Indicadores de Empregabilidade
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                Indicadores Auditados de Inserção, Progressão e Empregabilidade
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Em cumprimento rigoroso da nossa política de Governance e Verdade Estatística, apenas são apresentados números com validação documental concluída. Indicadores em fase de recolha/validação exibem o estado oficial <strong>“Dados em actualização”</strong>.
              </p>
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 shrink-0">
              <div className="font-bold text-slate-900">
                Período de Referência: {dynamicCounters.referencePeriod}
              </div>
              <div>Actualizado em: {dynamicCounters.updatedAt.slice(0, 10)}</div>
            </div>
          </div>

          {/* Grid of 6 Mandatory Employability Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {employabilityIndicators.map((ind) => {
              const hasValidNumber = ind.validated && ind.value !== null && ind.value !== undefined;
              const pct =
                hasValidNumber && ind.percentageOfTotal !== null && ind.percentageOfTotal !== undefined
                  ? Math.min(100, Math.max(0, ind.percentageOfTotal))
                  : null;

              return (
                <div
                  key={ind.id}
                  className="rounded-2xl bg-slate-50 border border-slate-200 p-6 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Período: {ind.referencePeriod}
                      </span>
                      {hasValidNumber ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                          <CheckCircle2 className="w-3 h-3" />
                          Dado Validado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold">
                          <Clock className="w-3 h-3" />
                          Em Validação
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 mb-2">{ind.label}</h3>

                    {/* Value or "Dados em actualização" */}
                    <div className="my-4">
                      {hasValidNumber ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-extrabold text-[#041525] tabular-nums">
                            {ind.value}
                          </span>
                          <span className="text-sm font-bold text-slate-600">{ind.unit}</span>
                          {pct !== null && (
                            <span className="ml-auto text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              {pct}% dos certificados
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5">
                          <span className="text-sm font-extrabold text-amber-900 block">
                            Dados em actualização
                          </span>
                          <span className="text-[11px] text-amber-800">
                            Inquérito e validação documental pós-formação em curso pela Administração.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Visual Progress Bar Chart */}
                    <div className="mb-4">
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        {hasValidNumber ? (
                          <div
                            className="h-full bg-gradient-to-r from-[#0B4F6C] to-emerald-600 rounded-full transition-all duration-700"
                            style={{ width: `${pct !== null ? pct : 100}%` }}
                          />
                        ) : (
                          <div className="h-full w-1/4 bg-amber-400/60 rounded-full" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {ind.description}
                    </p>
                  </div>

                  {/* Governance Source Metadata */}
                  <div className="pt-3 border-t border-slate-200/80 space-y-1 text-[11px] text-slate-500">
                    <div>
                      <strong className="text-slate-700">Fonte:</strong> {ind.sourceMethod}
                    </div>
                    <div>
                      <strong className="text-slate-700">Evidência:</strong> {ind.evidenceReference}
                    </div>
                    <div>
                      <strong className="text-slate-700">Actualizado em:</strong>{' '}
                      {ind.updatedAt.slice(0, 10)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Validated Alumni Career Progression Registry (With LGPD/Data Protection Consent) */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0B4F6C]" />
                  <span>Registos Auditados de Acompanhamento de Antigos Formandos (Com Consentimento de Dados)</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Apenas constam nesta listagem formandos com certificado validado e consentimento expresso para divulgação institucional.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <Lock className="w-3.5 h-3.5" />
                Protecção de Dados Pessoais Activa
              </span>
            </div>

            {publishedAlumniRecords.length === 0 ? (
              <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4 font-semibold">
                Dados em actualização — Aguardando validação administrativa de novos termos de consentimento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                      <th className="py-2.5 px-3">Antigo Formando</th>
                      <th className="py-2.5 px-3">Formação Concluída / Certificado</th>
                      <th className="py-2.5 px-3">Impacto na Carreira</th>
                      <th className="py-2.5 px-3">Entidade / Actividade</th>
                      <th className="py-2.5 px-3">Fonte de Verificação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {publishedAlumniRecords.map((rec) => {
                      const outMeta = OUTCOME_LABELS[rec.outcomeCategory];
                      return (
                        <tr key={rec.id} className="hover:bg-white">
                          <td className="py-3 px-3 font-bold text-slate-900">{rec.studentName}</td>
                          <td className="py-3 px-3 text-slate-700">
                            <div>{rec.courseTitle}</div>
                            <span className="text-[11px] font-mono text-slate-500">
                              Código: {rec.certificateCode} ({rec.completionYear})
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${outMeta.badgeClass}`}
                            >
                              {outMeta.label}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800">{rec.employerOrActivityName}</div>
                            <div className="text-xs text-slate-500">{rec.jobRoleOrService}</div>
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-600">
                            {rec.verificationSource}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          TESTEMUNHOS AUTORIZADOS DE ANTIGOS FORMANDOS E CLIENTES
      ===================================================================== */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#0B4F6C] mb-2">
            <Star className="w-4 h-4" />
            Depoimentos Verificados & Autorizados
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Testemunhos de Antigos Formandos e Clientes Empresariais
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Todos os testemunhos publicados foram previamente autorizados pelos seus titulares e aprovados pela Administração da ALHAN.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedTestimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold">
                    {item.testimonialType === 'FORMANDO' ? 'Antigo Formando' : 'Cliente Empresarial'}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: item.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic mb-4">
                  “{item.feedback}”
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="font-extrabold text-slate-900 text-sm">{item.clientName}</div>
                <div className="text-xs text-slate-600">
                  {item.role} · <strong>{item.companyName}</strong>
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Publicação Autorizada e Aprovada pelo ADM</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          4. GOVERNANCE, COMPLIANCE E EVIDÊNCIAS DOCUMENTAIS
      ===================================================================== */}
      <section className="py-14 bg-[#041525] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#E5C97B] mb-2">
                <ShieldCheck className="w-4 h-4" />
                4. Governance, Compliance e Verdade Estatística
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold mb-4">
                Rigor Metodológico e Protecção de Dados
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                A ALHAN aplica regras estritas de conformidade institucional na recolha, tratamento e divulgação de todos os indicadores de formação e empregabilidade:
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-200 mb-6">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Identificação da Fonte:</strong> Cada indicador publicado identifica a sua origem documental e o método de verificação.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Critérios Claros de Contabilização:</strong> Apenas são contabilizados vínculos de emprego, promoções ou reintegrações com confirmação pós-formação.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Proibição de Estimativas Não Validadas:</strong> Sempre que um indicador aguarda validação documental, o sistema apresenta obrigatoriamente <em>“Dados em actualização”</em>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Protecção de Dados Pessoais:</strong> Nenhum dado nominal de formando é publicado sem consentimento informado e aprovação administrativa.
                  </span>
                </li>
              </ul>
              <Link
                to="/relatorio-impacto"
                className="inline-flex items-center gap-2 bg-[#C8A951] hover:bg-[#d8b960] text-[#041525] font-extrabold px-5 py-3.5 rounded-xl text-sm transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Ler Relatório Público de Impacto Completo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-[#072038] border border-white/15 p-6">
                <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[#C8A951]" />
                  <span>Evidências e Documentos Institucionais de Suporte</span>
                </h3>
                <div className="space-y-3.5">
                  {publishedEvidences.map((evd) => (
                    <div
                      key={evd.id}
                      className="rounded-xl bg-white/[0.04] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[11px] font-mono font-bold">
                            {evd.code}
                          </span>
                          <span className="text-[11px] font-bold text-[#E5C97B]">
                            {evd.category}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            · Período: {evd.referencePeriod}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white mb-1">{evd.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{evd.description}</p>
                        <p className="text-[11px] text-slate-400 mt-1.5">
                          Fonte: {evd.sourceOrigin} · Validado em {evd.uploadedAt.slice(0, 10)}
                        </p>
                      </div>
                      {evd.fileUrl && (
                        <a
                          href={evd.fileUrl}
                          download={evd.fileName || `${evd.code}.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#C8A951] text-[#041525] text-xs font-extrabold shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ver Documento</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// 3. PÁGINA PÚBLICA: RELATÓRIO DE IMPACTO E EMPREGABILIDADE (/relatorio-impacto)
// ============================================================================

export const PublicImpactReportPage: React.FC = () => {
  const {
    impactReports,
    employabilityIndicators,
    impactEvidences,
    dynamicCounters,
  } = useApp();

  // Only show reports approved and published by Admin
  const publishedReports = impactReports.filter((r) => r.status === 'APROVADO_PUBLICADO');
  const [selectedReportId, setSelectedReportId] = useState<string>(
    publishedReports[0]?.id || ''
  );

  const activeReport =
    publishedReports.find((r) => r.id === selectedReportId) || publishedReports[0];

  const publishedEvidences = impactEvidences.filter((e) => e.validated && e.published);

  return (
    <div className="min-h-screen bg-slate-100 py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Action & Archive Selector Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/portefolio-impacto"
              className="text-xs font-bold text-[#0B4F6C] hover:underline"
            >
              ← Voltar para Portefólio & Indicadores
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-bold text-slate-600">
              Consulta Online de Relatórios Publicados
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="report-edition-select" className="text-xs font-bold text-slate-700">
              Consultar Edição / Ano:
            </label>
            <select
              id="report-edition-select"
              value={activeReport?.id || ''}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900"
            >
              {publishedReports.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  Edição {rep.editionYear} — {rep.referencePeriod}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#041525] text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar Leitura</span>
            </button>
          </div>
        </div>

        {!activeReport ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <p className="text-base font-bold text-slate-800">
              Relatório institucional em actualização pela Administração.
            </p>
          </div>
        ) : (
          /* Official Online Institutional Report Document */
          <article className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            {/* Document Header */}
            <header className="bg-[#041525] text-white p-8 sm:p-10 border-b-4 border-[#C8A951]">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-[#C8A951]/40 text-[#E5C97B] text-xs font-extrabold uppercase tracking-widest">
                  <FileText className="w-3.5 h-3.5" />
                  Relatório Público de Impacto e Empregabilidade · Edição {activeReport.editionYear}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Aprovado e Publicado pela Administração
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
                {activeReport.title}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mb-6">{activeReport.subtitle}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-white/15 text-xs text-slate-300">
                <div>
                  <span className="text-slate-400 block">Entidade Emitente:</span>
                  <strong className="text-white">
                    ALHAN CONSULTORIA E PRESTAÇÃO DE SERVIÇOS, LDA (NIF 5000682557)
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Período de Referência:</span>
                  <strong className="text-white">{activeReport.referencePeriod}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Data de Publicação / Actualização:</span>
                  <strong className="text-white">
                    {activeReport.updatedAt.slice(0, 10)} · {activeReport.approvedBy}
                  </strong>
                </div>
              </div>
            </header>

            {/* Report Body — 7 Mandatory Institutional Chapters */}
            <div className="p-8 sm:p-10 space-y-10 text-slate-800 leading-relaxed">
              {/* Secção 1 */}
              <section>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#041525] border-b border-slate-200 pb-2 mb-3">
                  1. Apresentação e Objectivos do Centro
                </h2>
                <p className="text-sm sm:text-base text-slate-700 whitespace-pre-line">
                  {activeReport.section1PresentationAndObjectives}
                </p>
              </section>

              {/* Secção 2 */}
              <section>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#041525] border-b border-slate-200 pb-2 mb-3">
                  2. Actividades e Formações Realizadas
                </h2>
                <p className="text-sm sm:text-base text-slate-700 whitespace-pre-line">
                  {activeReport.section2ActivitiesAndTrainings}
                </p>
              </section>

              {/* Secção 3 */}
              <section>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#041525] border-b border-slate-200 pb-2 mb-3">
                  3. Resultados Alcançados
                </h2>
                <p className="text-sm sm:text-base text-slate-700 whitespace-pre-line mb-4">
                  {activeReport.section3AchievedResults}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 block">
                      Formandos Formados
                    </span>
                    <strong className="text-lg font-extrabold text-slate-900">
                      {dynamicCounters.trainedStudentsValidated &&
                      dynamicCounters.trainedStudentsCount !== null
                        ? dynamicCounters.trainedStudentsCount
                        : 'Dados em actualização'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 block">
                      Implementações SGI
                    </span>
                    <strong className="text-lg font-extrabold text-slate-900">
                      {dynamicCounters.sgiImplementationsValidated &&
                      dynamicCounters.sgiImplementationsCount !== null
                        ? dynamicCounters.sgiImplementationsCount
                        : 'Dados em actualização'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 block">
                      Cursos Ministrados
                    </span>
                    <strong className="text-lg font-extrabold text-slate-900">
                      {dynamicCounters.coursesDeliveredValidated &&
                      dynamicCounters.coursesDeliveredCount !== null
                        ? dynamicCounters.coursesDeliveredCount
                        : 'Dados em actualização'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 block">
                      Empresas Parceiras
                    </span>
                    <strong className="text-lg font-extrabold text-slate-900">
                      {dynamicCounters.partnerCompaniesValidated &&
                      dynamicCounters.partnerCompaniesCount !== null
                        ? dynamicCounters.partnerCompaniesCount
                        : 'Dados em actualização'}
                    </strong>
                  </div>
                </div>
              </section>

              {/* Secção 4 */}
              <section>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#041525] border-b border-slate-200 pb-2 mb-3">
                  4. Indicadores de Empregabilidade
                </h2>
                <p className="text-sm sm:text-base text-slate-700 whitespace-pre-line mb-4">
                  {activeReport.section4EmployabilityIndicatorsSummary}
                </p>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold">
                        <th className="py-3 px-4">Indicador Estatístico</th>
                        <th className="py-3 px-4">Resultado Validado</th>
                        <th className="py-3 px-4">Período</th>
                        <th className="py-3 px-4">Fonte & Critério de Contabilização</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {employabilityIndicators.map((ind) => (
                        <tr key={ind.id}>
                          <td className="py-3 px-4 font-bold text-slate-900">{ind.label}</td>
                          <td className="py-3 px-4">
                            {ind.validated && ind.value !== null ? (
                              <span className="font-extrabold text-emerald-700">
                                {ind.value} {ind.unit}
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                                Dados em actualização
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{ind.referencePeriod}</td>
                          <td className="py-3 px-4 text-xs text-slate-600">
                            <div>
                              <strong>Fonte:</strong> {ind.sourceMethod}
                            </div>
                            <div>
                              <strong>Critério:</strong> {ind.accountingCriteria}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Secção 5 */}
              <section>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#041525] border-b border-slate-200 pb-2 mb-3">
                  5. Metodologia de Recolha e Validação dos Dados
                </h2>
                <p className="text-sm sm:text-base text-slate-700 whitespace-pre-line">
                  {activeReport.section5MethodologyAndValidation}
                </p>
              </section>

              {/* Secção 6 */}
              <section>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#041525] border-b border-slate-200 pb-2 mb-3">
                  6. Evidências e Documentos de Suporte
                </h2>
                <p className="text-sm sm:text-base text-slate-700 whitespace-pre-line mb-4">
                  {activeReport.section6EvidencesAndSupportDocs}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {publishedEvidences.map((evd) => (
                    <div
                      key={evd.id}
                      className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs"
                    >
                      <span className="font-mono font-bold text-[#0B4F6C] block mb-1">
                        {evd.code} · {evd.category}
                      </span>
                      <strong className="text-slate-900 block mb-1">{evd.title}</strong>
                      <p className="text-slate-600 mb-2">{evd.description}</p>
                      <span className="text-[11px] text-slate-500">
                        Origem: {evd.sourceOrigin}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Secção 7 */}
              <section>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#041525] border-b border-slate-200 pb-2 mb-3">
                  7. Conclusões e Perspectivas Futuras
                </h2>
                <p className="text-sm sm:text-base text-slate-700 whitespace-pre-line">
                  {activeReport.section7ConclusionsAndFuturePerspectives}
                </p>
              </section>
            </div>

            {/* Footer Seal */}
            <footer className="bg-slate-50 border-t border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600">
              <div>
                <strong className="text-slate-900 block">
                  ALHAN CONSULTORIA E PRESTAÇÃO DE SERVIÇOS, LDA
                </strong>
                <span>
                  Luanda – Centralidade do Kilamba, Quarteirão Q, Prédio Q13, Apartamento 41 · geral@alhan.pro
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                <CheckSquare className="w-4 h-4" />
                <span>Documento Público Validado pela Administração</span>
              </div>
            </footer>
          </article>
        )}
      </div>
    </div>
  );
};
