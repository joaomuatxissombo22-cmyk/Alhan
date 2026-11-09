import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Building2,
  Search,
  ExternalLink,
  CreditCard,
  Copy,
  Check,
  MessageCircle,
  Mail,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Hero } from '../components/Hero';
import { Testimonials } from '../components/Testimonials';
import { FaqSection } from '../components/FaqSection';
import {
  COMPANY_INFO,
  INSTAGRAM_FEED_POSTS,
  ISO_IMPLEMENTATION_METHODOLOGY,
  ALHAN_COUPON_CODE,
  ALHAN_COUPON_DISCOUNT_PERCENT,
  ALHAN_BLACK_FRIDAY_DISCOUNT_PERCENT,
  calculateCourseDiscountedPricing,
} from '../data/initialData';

export const IsoRecommendationQuiz: React.FC = () => {
  const [sector, setSector] = useState('Prestação de Serviços / Consultoria');
  const [activity, setActivity] = useState('Operações comerciais e prestação de serviços B2B');
  const [employees, setEmployees] = useState('11 a 50 colaboradores');
  const [processes, setProcesses] = useState('Em fase de organização e padronização');
  const [clientReqs, setClientReqs] = useState('Sim, clientes exigem qualidade e conformidade');
  const [tenders, setTenders] = useState('Sim, participamos em concursos públicos ou privados');
  const [existingSys, setExistingSys] = useState('Ainda não possuímos sistema formal');
  const [currentCerts, setCurrentCerts] = useState('Nenhuma certificação actual');
  const [objective, setObjective] = useState('Qualidade operacional e satisfação do cliente');
  const [integrateMulti, setIntegrateMulti] = useState('Sim, pretendemos um Sistema de Gestão Integrado (SGI)');
  const [submitted, setSubmitted] = useState(false);

  const computeRecommendations = () => {
    const recs: { code: string; name: string; rationale: string }[] = [
      {
        code: 'ISO 9001:2015',
        name: 'Sistema de Gestão da Qualidade',
        rationale: 'Base estruturante para padronização de processos, controlo operacional e qualificação em concursos e contratos em Angola.',
      },
    ];

    if (
      sector.includes('Indústria') ||
      sector.includes('Construção') ||
      sector.includes('Petróleo') ||
      objective.includes('Ambiental') ||
      integrateMulti.startsWith('Sim')
    ) {
      recs.push({
        code: 'ISO 14001:2015',
        name: 'Sistema de Gestão Ambiental',
        rationale: 'Recomendada para controlo sistemático de aspectos e impactos ambientais, gestão de resíduos e conformidade ambiental.',
      });
    }

    if (
      sector.includes('Construção') ||
      sector.includes('Petróleo') ||
      sector.includes('Logística') ||
      objective.includes('Segurança') ||
      integrateMulti.startsWith('Sim')
    ) {
      recs.push({
        code: 'ISO 45001:2018',
        name: 'Segurança e Saúde no Trabalho',
        rationale: 'Essencial para prevenção de acidentes laborais, identificação de perigos e redução de riscos ocupacionais.',
      });
    }

    if (sector.includes('Tecnologia') || sector.includes('Banca')) {
      recs.push({
        code: 'ISO/IEC 27001',
        name: 'Segurança da Informação',
        rationale: 'Protecção da confidencialidade, integridade e disponibilidade de dados corporativos e de clientes.',
      });
    }

    if (sector.includes('Alimentar')) {
      recs.push({
        code: 'ISO 22000',
        name: 'Segurança de Alimentos',
        rationale: 'Controlo de perigos alimentares e rastreabilidade ao longo da cadeia produtiva e de distribuição.',
      });
    }

    return recs;
  };

  const recommendations = computeRecommendations();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold text-[#0077C8]">Orientação Preliminar Interactiva · Secção 23</p>
        <h3 className="text-xl sm:text-2xl font-bold text-[#061A2D] mt-1">
          Qual norma ISO a sua empresa precisa?
        </h3>
        <p className="text-sm text-slate-600 mt-2">
          Responda aos 10 parâmetros abaixo para receber uma orientação preliminar sobre as normas ISO aplicáveis à realidade da sua organização em Angola.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div>
          <label className="block text-xs font-semibold text-[#061A2D] mb-1">1. Sector de Actividade</label>
          <select
            value={sector}
            onChange={(e) => { setSector(e.target.value); setSubmitted(false); }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#0077C8] focus:outline-none"
          >
            <option>Prestação de Serviços / Consultoria</option>
            <option>Construção Civil e Obras Públicas</option>
            <option>Petróleo, Gás, Energia e Mineração</option>
            <option>Indústria Transformadora</option>
            <option>Logística, Transportes e Portos</option>
            <option>Agroindústria e Sector Alimentar</option>
            <option>Tecnologia da Informação, Telecomunicações e Banca</option>
            <option>Saúde, Clínicas e Dispositivos Médicos</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#061A2D] mb-1">2. Actividade Principal</label>
          <input
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0077C8] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#061A2D] mb-1">3. Número de Colaboradores</label>
          <select
            value={employees}
            onChange={(e) => setEmployees(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#0077C8] focus:outline-none"
          >
            <option>1 a 10 colaboradores</option>
            <option>11 a 50 colaboradores</option>
            <option>51 a 200 colaboradores</option>
            <option>Mais de 200 colaboradores</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#061A2D] mb-1">4. Maturidade dos Processos</label>
          <select
            value={processes}
            onChange={(e) => setProcesses(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#0077C8] focus:outline-none"
          >
            <option>Em fase de organização e padronização</option>
            <option>Parcialmente documentados</option>
            <option>Mapeados e com indicadores definidos</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#061A2D] mb-1">5. Exigências de Clientes</label>
          <select
            value={clientReqs}
            onChange={(e) => setClientReqs(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#0077C8] focus:outline-none"
          >
            <option>Sim, clientes exigem qualidade e conformidade</option>
            <option>Exigem requisitos específicos de Ambiente e SST (QSMS)</option>
            <option>Não há exigência formal imediata, procuramos melhoria interna</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#061A2D] mb-1">6. Concursos e Contratos</label>
          <select
            value={tenders}
            onChange={(e) => setTenders(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#0077C8] focus:outline-none"
          >
            <option>Sim, participamos em concursos públicos ou privados</option>
            <option>Pretendemos qualificar a empresa como fornecedora certificada</option>
            <option>Foco apenas no mercado retalhista</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#061A2D] mb-1">7. Sistema Existente</label>
          <select
            value={existingSys}
            onChange={(e) => setExistingSys(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#0077C8] focus:outline-none"
          >
            <option>Ainda não possuímos sistema formal</option>
            <option>Temos procedimentos internos em revisão</option>
            <option>Já temos uma norma implementada e queremos expandir</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#061A2D] mb-1">8. Certificações Actuais</label>
          <select
            value={currentCerts}
            onChange={(e) => setCurrentCerts(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#0077C8] focus:outline-none"
          >
            <option>Nenhuma certificação actual</option>
            <option>ISO 9001 certificada</option>
            <option>Outras certificações sectoriais</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#061A2D] mb-1">9. Objectivo Prioritário</label>
          <select
            value={objective}
            onChange={(e) => { setObjective(e.target.value); setSubmitted(false); }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#0077C8] focus:outline-none"
          >
            <option>Qualidade operacional e satisfação do cliente</option>
            <option>Gestão Ambiental e controlo de resíduos</option>
            <option>Segurança e Saúde no Trabalho (SST)</option>
            <option>Integridade, Compliance e Antissuborno</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#061A2D] mb-1">10. Necessidade de Integrar Várias Normas</label>
          <select
            value={integrateMulti}
            onChange={(e) => { setIntegrateMulti(e.target.value); setSubmitted(false); }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#0077C8] focus:outline-none"
          >
            <option>Sim, pretendemos um Sistema de Gestão Integrado (SGI)</option>
            <option>Não, pretendemos implementar uma norma de cada vez</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="px-5 py-2.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-sm font-semibold transition-colors"
        >
          Gerar Orientação Preliminar ISO
        </button>
      </div>

      {submitted && (
        <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
          <h4 className="text-base font-bold text-[#061A2D]">
            Normas Preliminarmente Recomendadas para o seu Perfil:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.code} className="p-4 rounded-lg bg-[#F5F9FC] border border-slate-200">
                <p className="text-sm font-bold text-[#0077C8]">{rec.code}</p>
                <p className="text-sm font-semibold text-[#061A2D] mt-0.5">{rec.name}</p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{rec.rationale}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-[#061A2D] text-[#F5F9FC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs leading-relaxed text-[#F5F9FC]/90">
              <strong>Nota Importante:</strong> «Esta é uma orientação preliminar e não substitui um diagnóstico técnico. Solicite uma avaliação com um consultor Alhan.»
            </p>
            <Link
              to="/solicitar-diagnostico"
              className="px-4 py-2 rounded-lg bg-[#008FEA] hover:bg-[#19B5FE] text-[#061A2D] font-bold text-xs whitespace-nowrap shrink-0"
            >
              Solicitar Diagnóstico Técnico
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export const HomePage: React.FC = () => {
  const { courses, isoStandards, employabilityIndicators, dynamicCounters } = useApp();
  const featuredCourses = courses.filter((c) => c.published).slice(0, 6);
  const featuredStandards = isoStandards.slice(0, 6);

  return (
    <div>
      {/* 1. DYNAMIC HERO COMPONENT (Corporate Image Gallery + Highlighted Text + CTAs) */}
      <Hero />

      {/* 2. APRESENTAÇÃO E SERVIÇOS (Asymmetric Bento Grid) */}
      <section className="py-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#0077C8]">Engenharia de Processos e Conformidade</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#061A2D] mt-1">
              Serviços de Consultoria e Implementação SGI
            </h2>
          </div>
          <Link
            to="/consultoria-iso"
            className="text-sm font-semibold text-[#0077C8] hover:text-[#008FEA] inline-flex items-center gap-1.5"
          >
            <span>Explorar todos os serviços de consultoria</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono-tabular text-[#0077C8] font-semibold">01. Sistemas de Gestão Integrados (SGI)</p>
              <h3 className="text-xl font-bold text-[#061A2D] mt-2">
                Implementação ISO 9001, ISO 14001 e ISO 45001
              </h3>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Desenvolvemos e implementamos Sistemas de Gestão sob medida para a realidade operacional de empresas em Angola. Unificamos Qualidade, Ambiente e Segurança e Saúde no Trabalho numa única estrutura documental ágil, reduzindo burocracia e elevando o desempenho operacional.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span>Diagnóstico Inicial e Gap Analysis</span>
              <span aria-hidden="true">·</span>
              <span>Mapeamento de Processos</span>
              <span aria-hidden="true">·</span>
              <span>Gestão Documental Controlada</span>
            </div>
          </div>

          <div className="bg-[#061A2D] text-[#F5F9FC] rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono-tabular text-[#19B5FE] font-semibold">02. Auditoria ISO 19011</p>
              <h3 className="text-xl font-bold text-white mt-2">
                Auditorias Internas e Pré-Certificação
              </h3>
              <p className="text-sm text-[#F5F9FC]/80 mt-3 leading-relaxed">
                Avaliação independente do grau de conformidade do seu sistema, identificação de oportunidades de melhoria, tratamento de não conformidades e preparação para auditorias externas.
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/solicitar-diagnostico"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#19B5FE] hover:underline"
              >
                <span>Agendar Auditoria de Diagnóstico</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-xs font-mono-tabular text-[#0077C8] font-semibold">03. Gestão Ambiental</p>
            <h3 className="text-lg font-bold text-[#061A2D] mt-2">Consultoria Ambiental e LAIA</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Levantamento de aspectos e impactos ambientais, planos de gestão de resíduos, ecoeficiência e conformidade ambiental operacional.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-xs font-mono-tabular text-[#0077C8] font-semibold">04. Governança Corporativa</p>
            <h3 className="text-lg font-bold text-[#061A2D] mt-2">Compliance e Gestão de Riscos</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Matrizes de risco operacional e estratégico, programas de integridade, prevenção ao suborno (ISO 37001) e controlo interno.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-xs font-mono-tabular text-[#0077C8] font-semibold">05. Academia Profissional</p>
            <h3 className="text-lg font-bold text-[#061A2D] mt-2">Formação In-Company e Online</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Capacitação de equipas, formação de auditores internos e líderes, com plataforma LMS própria e validação de certificados por QR Code.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FORMAÇÕES EM DESTAQUE (COM BLACK FRIDAY NOVEMBRO 15% & CUPOM SOUALHAN 25%) */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#0077C8]">Academia ALHAN · LMS & Formação Presencial</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#061A2D] mt-1">
                Formações Profissionais em Destaque
              </h2>
            </div>
            <Link
              to="/formacoes"
              className="text-sm font-semibold text-[#0077C8] hover:text-[#008FEA] inline-flex items-center gap-1.5"
            >
              <span>Ver catálogo completo ({courses.filter((c) => c.published).length} cursos)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Campanha Especial: Black Friday Novembro (-15% nas Formações) + Cupom SOUALHAN (-25% de Desconto) */}
          <div className="rounded-2xl bg-gradient-to-r from-[#061A2D] via-[#0B2B4C] to-[#061A2D] border-2 border-[#C8A951] p-5 sm:p-6 text-white shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#C8A951] text-[#061A2D] text-[11px] font-extrabold uppercase tracking-wider">
                  🔥 Black Friday Novembro · -{ALHAN_BLACK_FRIDAY_DISCOUNT_PERCENT}% nas Formações
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider">
                  🎟️ Cupom Exclusivo: {ALHAN_COUPON_CODE} (-{ALHAN_COUPON_DISCOUNT_PERCENT}% de Desconto)
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                Campanha Black Friday Novembro (15% OFF) & Cupom Promocional «{ALHAN_COUPON_CODE}» (25% OFF)
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Todas as formações contam com <strong>{ALHAN_BLACK_FRIDAY_DISCOUNT_PERCENT}% de desconto automático Black Friday Novembro</strong>, ou utilize o cupom <strong>{ALHAN_COUPON_CODE}</strong> no acto da inscrição para obter <strong>{ALHAN_COUPON_DISCOUNT_PERCENT}% de desconto</strong> sobre o valor total e sobre as 2 parcelas!
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/formacoes"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C8A951] hover:bg-[#d8b960] text-[#061A2D] text-xs font-extrabold transition-all shadow-md"
              >
                <span>Usar Cupom {ALHAN_COUPON_CODE} (-25%)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Destaque Principal: Formação em HSE – Turma de Novembro */}
          <div className="rounded-2xl bg-[#061A2D] text-white border-2 border-[#0077C8] overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 bg-[#041220] p-4 sm:p-6 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10">
              <img
                src={COMPANY_INFO.hseFlyerImage}
                alt="Formação em Destaque: Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro)"
                referrerPolicy="no-referrer"
                className="w-full max-w-md rounded-xl border border-white/15 object-contain shadow-lg"
              />
            </div>
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-[#19B5FE] uppercase tracking-wider">
                    ★ Formação em Destaque · Anúncio Oficial
                  </span>
                  <span aria-hidden="true" className="text-white/30">·</span>
                  <span className="font-bold text-amber-300">
                    Black Friday Novembro (-15%) & Cupom {ALHAN_COUPON_CODE} (-25%)
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Formação em HSE – Saúde, Segurança e Meio Ambiente
                </h3>

                <p className="text-sm text-slate-200 leading-relaxed">
                  Invista em conhecimento, transforme o futuro da sua empresa! Promova um ambiente de trabalho seguro, saudável e sustentável com formação prática alinhada às normas internacionais <strong>ISO 45001:2018</strong> (SST) e <strong>ISO 14001:2015</strong> (Ambiente).
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="font-bold text-[#19B5FE]">Certificado Reconhecido</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">Emitido em PDF pela ADM</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="font-bold text-[#19B5FE]">Material Didático</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">Manuais e Matrizes HSE</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="font-bold text-[#19B5FE]">Professores Experientes</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">Consultores SGI Activos</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="font-bold text-[#19B5FE]">Aplicação Prática</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">Estudos de Caso Reais</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-300">
                    Valor Normal: <span className="line-through text-slate-400">125.000 Kz</span> · Black Friday (-15%):{' '}
                    <strong className="text-amber-300 font-mono-tabular">106.250 Kz</strong>
                  </p>
                  <p className="text-xl sm:text-2xl font-extrabold font-mono-tabular text-emerald-400 mt-0.5">
                    Com Cupom {ALHAN_COUPON_CODE} (-25%): 93.750 Kz
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/formacoes?curso=curso-hse-novembro"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs sm:text-sm font-bold transition-colors shadow-lg"
                  >
                    <span>Inscreva-se Já na Turma de Novembro</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href={`https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
                      'Olá ALHAN, gostaria de me inscrever na Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro).'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar no WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => {
              const bfPricing = calculateCourseDiscountedPricing(course.priceKz, '', true);
              const couponPricing = calculateCourseDiscountedPricing(course.priceKz, ALHAN_COUPON_CODE, true);
              return (
                <Link
                  key={course.id}
                  to={`/formacoes?curso=${course.id}`}
                  className={`rounded-xl border ${
                    course.featured ? 'border-2 border-[#0077C8] ring-2 ring-[#0077C8]/15' : 'border-slate-200'
                  } bg-[#F5F9FC] overflow-hidden flex flex-col justify-between hover:border-[#0077C8] hover:shadow-md transition-all group cursor-pointer`}
                >
                  <div>
                    <div className="relative h-48 w-full bg-[#061A2D] overflow-hidden border-b border-slate-200">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-amber-500 text-[#061A2D] text-[10px] font-extrabold shadow-sm">
                        Black Friday Novembro -{ALHAN_BLACK_FRIDAY_DISCOUNT_PERCENT}%
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded bg-[#061A2D]/85 text-[#19B5FE] text-[10px] font-bold border border-white/15">
                        Clique para Inscrição Directa →
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Clean unboxed metadata per frontend-design zero-pill rule */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-[#0077C8]">{course.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>Modalidade {course.modality}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">{course.durationHours}h</span>
                      </div>

                      <h3 className="text-lg font-bold text-[#061A2D] group-hover:text-[#0077C8] transition-colors mt-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-4 border-t border-slate-200/80 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-slate-500">
                        Normal: <span className="line-through">{course.priceKz.toLocaleString('pt-AO')} Kz</span> · Black Friday (-15%):{' '}
                        <strong className="text-[#061A2D] font-mono-tabular">
                          {bfPricing.finalPriceKz.toLocaleString('pt-AO')} Kz
                        </strong>
                      </p>
                      <p className="text-xs font-extrabold font-mono-tabular text-emerald-700 mt-0.5">
                        Cupom {ALHAN_COUPON_CODE} (-25%): {couponPricing.finalPriceKz.toLocaleString('pt-AO')} Kz
                      </p>
                    </div>
                    <span className="px-4 py-2 rounded-lg bg-[#0077C8] group-hover:bg-[#008FEA] text-white text-xs font-bold transition-colors whitespace-nowrap">
                      Inscrever-se Directo
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. METODOLOGIA DE TRABALHO (14 Etapas) */}
      <section className="py-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-[#0077C8]">Rigor Técnico do Diagnóstico à Certificação</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#061A2D] mt-1">
            Metodologia de Implementação ALHAN em 14 Etapas
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Conduzimos cada projecto através de fases claras e auditáveis, acompanhando a sua empresa em todas as etapas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {ISO_IMPLEMENTATION_METHODOLOGY.slice(0, 8).map((item) => (
            <div key={item.step} className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs font-mono-tabular font-bold text-[#0077C8]">Etapa {item.step}</p>
              <h3 className="text-sm font-bold text-[#061A2D] mt-1">{item.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <Link to="/consultoria-iso" className="text-xs font-semibold text-[#0077C8] hover:underline">
            Ver todas as 14 etapas da metodologia →
          </Link>
        </div>
      </section>

      {/* 5. NORMAS ISO EM DESTAQUE */}
      <section className="py-16 bg-[#061A2D] text-[#F5F9FC]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#19B5FE]">Referenciais Internacionais Aplicáveis em Angola</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Principais Normas ISO que Implementamos
              </h2>
            </div>
            <Link
              to="/normas-iso"
              className="text-sm font-semibold text-[#19B5FE] hover:underline inline-flex items-center gap-1.5"
            >
              <span>Consultar todas as {isoStandards.length} normas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {featuredStandards.map((std) => (
              <div key={std.id} className="rounded-xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-mono-tabular font-bold text-[#19B5FE]">{std.code}</p>
                  <h3 className="text-base font-bold text-white mt-1">{std.name}</h3>
                  <p className="text-xs text-[#9AA6AE] mt-2 leading-relaxed">{std.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-[#F5F9FC]/75">
                  Sectores: {std.sectorsInAngola.slice(0, 3).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. QUESTIONÁRIO INTERACTIVO DE RECOMENDAÇÃO ISO */}
      <section className="py-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <IsoRecommendationQuiz />
      </section>

      {/* 6.5. SECÇÃO DE DESTAQUE: IMPACTO NA FORMAÇÃO E EMPREGABILIDADE */}
      <section className="py-16 bg-gradient-to-br from-[#041525] via-[#07223B] to-[#0B3558] text-white border-y border-white/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#C8A951]/40 text-[#E5C97B] text-xs font-extrabold uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-[#C8A951]" />
                <span>Portefólio, Impacto e Empregabilidade · {dynamicCounters.referencePeriod}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                Conheça o nosso impacto na formação e empregabilidade.
              </h2>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                Publicamos com transparência, rigor metodológico e conformidade documental o histórico das nossas formações, os indicadores reais de progressão profissional dos antigos formandos e o Relatório Público de Impacto da ALHAN.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/relatorio-impacto"
                  className="inline-flex items-center gap-2 bg-[#C8A951] hover:bg-[#d8b960] text-[#041525] font-extrabold px-5 py-3.5 rounded-xl text-sm shadow-lg transition-all"
                >
                  <span>Consultar Relatório de Impacto</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/portefolio-impacto"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold px-5 py-3.5 rounded-xl text-sm transition-all"
                >
                  <span>Explorar Portefólio e Indicadores</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {employabilityIndicators.slice(0, 4).map((ind) => (
                  <div
                    key={ind.id}
                    className="rounded-2xl bg-white/[0.06] border border-white/15 p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold uppercase text-sky-300">
                          {ind.referencePeriod}
                        </span>
                        {ind.validated && ind.value !== null ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            Validado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                            Em actualização
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white mb-2">{ind.label}</h3>
                    </div>
                    <div>
                      {ind.validated && ind.value !== null ? (
                        <p className="text-2xl sm:text-3xl font-extrabold text-[#E5C97B] tabular-nums">
                          {ind.value} <span className="text-xs font-semibold text-slate-300">{ind.unit}</span>
                        </p>
                      ) : (
                        <span className="inline-block text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2.5 py-1 rounded-lg">
                          Dados em actualização
                        </span>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">
                        Fonte: {ind.sourceMethod}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DEPOIMENTOS E TESTEMUNHOS DE CONFIANÇA (Carousel de Clientes e Logos) */}
      <Testimonials />

      {/* 8. FEED DO INSTAGRAM (@alhan.sgi) & PÁGINA OFICIAL DO FACEBOOK */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#0077C8]">
                Presença Digital Oficial · Instagram @{COMPANY_INFO.instagram} & Facebook
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#061A2D] mt-1">
                Acompanhe a ALHAN no Instagram e no Facebook
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Destaques das nossas formações, projectos de consultoria SGI e actividades técnicas em Luanda e em toda Angola.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={COMPANY_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#061A2D] hover:bg-[#0077C8] text-white text-xs font-bold transition-colors"
              >
                <span>Seguir @{COMPANY_INFO.instagram} no Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={COMPANY_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold transition-colors"
              >
                <span>Página Oficial no Facebook</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INSTAGRAM_FEED_POSTS.map((post) => (
              <a
                key={post.id}
                href={COMPANY_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-slate-200 bg-[#F5F9FC] overflow-hidden flex flex-col justify-between hover:border-[#0077C8] transition-all"
              >
                <div>
                  <div className="relative aspect-square w-full bg-[#061A2D] overflow-hidden border-b border-slate-200">
                    <img
                      src={post.image}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-semibold text-[#0077C8]">{post.tag}</p>
                    <h3 className="text-sm font-bold text-[#061A2D] mt-1 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                      {post.caption}
                    </p>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{post.date}</span>
                  <span className="font-semibold text-[#0077C8] group-hover:underline">
                    Ver no Instagram →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export const AboutPage: React.FC = () => {
  const servicesList = [
    '01. Consultoria empresarial',
    '02. Implementação de Sistemas de Gestão',
    '03. Formação profissional',
    '04. Sistemas de Gestão Integrados (SGI)',
    '05. Auditoria interna',
    '06. Preparação para certificação',
    '07. Gestão ambiental',
    '08. Compliance',
    '09. Gestão de riscos',
    '10. Mapeamento e melhoria de processos',
  ];

  return (
    <div className="py-14 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold text-[#0077C8]">Identidade Institucional · {COMPANY_INFO.address}</p>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#061A2D] mt-2">
            {COMPANY_INFO.legalName}
          </h1>
          <p className="text-sm font-mono-tabular text-slate-500 mt-1">
            Marca Comercial: {COMPANY_INFO.brandName} · NIF: {COMPANY_INFO.nif}
          </p>
          <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed">
            A <strong>ALHAN CONSULTORIA E PRESTAÇÃO DE SERVIÇOS, LDA</strong> é uma empresa angolana sediada em Luanda ({COMPANY_INFO.address}), especializada no apoio técnico a organizações públicas e privadas na estruturação, implementação, auditoria e melhoria contínua de Sistemas de Gestão alinhados às normas internacionais ISO.
          </p>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Combinamos rigor metodológico, conhecimento profundo do mercado angolano e uma plataforma tecnológica integrada que une formação profissional (LMS), acompanhamento de projectos empresariais e gestão documental.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
            <a
              href={COMPANY_INFO.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#061A2D] text-white font-semibold hover:bg-[#0077C8] transition-colors"
            >
              Visitar Página Oficial no Facebook
            </a>
            <a
              href={COMPANY_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-slate-300 text-[#061A2D] font-semibold hover:bg-slate-50 transition-colors"
            >
              Instagram @{COMPANY_INFO.instagram}
            </a>
          </div>
        </div>
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-[#061A2D] aspect-[3/4]">
            <img
              src={COMPANY_INFO.teamFieldImage}
              alt="Equipa Técnica ALHAN em Operações Industriais"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-[#061A2D] aspect-[3/4]">
            <img
              src={COMPANY_INFO.sgiFlyerImage}
              alt="Formação em Sistema de Gestão Integrado ALHAN"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>

      {/* 10 Core Areas */}
      <div>
        <h2 className="text-2xl font-bold text-[#061A2D]">Áreas de Actuação da Alhan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          {servicesList.map((srv) => (
            <div key={srv} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0077C8] shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-[#061A2D]">{srv}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Missão, Visão, Valores e Melhoria Contínua */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-xs font-bold text-[#0077C8]">01. Missão</p>
          <h3 className="text-base font-bold text-[#061A2D] mt-1">Propósito Corporativo</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Transformar requisitos normativos em Sistemas de Gestão práticos, eficientes e sustentáveis que impulsionem a competitividade das organizações e a qualificação dos profissionais em Angola.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-xs font-bold text-[#0077C8]">02. Visão</p>
          <h3 className="text-base font-bold text-[#061A2D] mt-1">Horizonte Estratégico</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Ser a referência nacional em consultoria de Sistemas de Gestão Integrados (SGI) e formação profissional certificada em Angola, reconhecida pela excelência técnica e ética.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-xs font-bold text-[#0077C8]">03. Valores</p>
          <h3 className="text-base font-bold text-[#061A2D] mt-1">Princípios Inegociáveis</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Rigor técnico, ética e transparência, confidencialidade, foco em resultados reais, valorização das pessoas e responsabilidade socioambiental.
          </p>
        </div>
        <div className="bg-[#061A2D] text-white rounded-xl p-6">
          <p className="text-xs font-bold text-[#19B5FE]">04. Compromisso</p>
          <h3 className="text-base font-bold text-white mt-1">Melhoria Contínua</h3>
          <p className="text-xs text-[#F5F9FC]/80 mt-2 leading-relaxed">
            Aplicamos o ciclo PDCA em todos os nossos projectos de consultoria e programas pedagógicos, garantindo evolução permanente de processos e resultados.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ConsultoriaIsoPage: React.FC = () => {
  const consultingServices = [
    { num: '01', title: 'Implementação ISO 9001', desc: 'Estruturação completa do Sistema de Gestão da Qualidade para padronização de processos e satisfação do cliente.' },
    { num: '02', title: 'Implementação ISO 14001', desc: 'Desenvolvimento do Sistema de Gestão Ambiental, controlo operacional de resíduos, efluentes e matriz LAIA.' },
    { num: '03', title: 'Implementação ISO 45001', desc: 'Gestão de Segurança e Saúde no Trabalho, identificação de perigos, avaliação de riscos e redução de sinistralidade.' },
    { num: '04', title: 'Implementação de SGI', desc: 'Integração inteligente de múltiplas normas (Qualidade, Ambiente, SST e outras) num sistema único e coeso.' },
    { num: '05', title: 'Auditorias internas', desc: 'Planeamento e execução de auditorias internas segundo a norma ISO 19011 por auditores qualificados.' },
    { num: '06', title: 'Formação empresarial', desc: 'Capacitação in-company e online das equipas operacionais, gestores de processo e auditores internos.' },
    { num: '07', title: 'Gestão de riscos', desc: 'Identificação, análise, avaliação e tratamento de riscos estratégicos, operacionais, ambientais e ocupacionais.' },
    { num: '08', title: 'Mapeamento de processos', desc: 'Modelação de fluxos operacionais, matrizes SIPOC, definição de responsabilidades e indicadores KPI.' },
    { num: '09', title: 'Gestão documental', desc: 'Elaboração e controlo de políticas, manuais, procedimentos, instruções de trabalho, formulários e registos.' },
    { num: '10', title: 'Compliance', desc: 'Programas de conformidade, integridade corporativa, código de conduta e gestão antissuborno (ISO 37001).' },
    { num: '11', title: 'Consultoria ambiental', desc: 'Diagnósticos ambientais, planos de gestão ambiental (PGA), monitorização e boas práticas de sustentabilidade.' },
    { num: '12', title: 'Preparação para certificação', desc: 'Pré-auditorias de verificação e apoio técnico na preparação para a auditoria do organismo certificador independente.' },
  ];

  return (
    <div className="py-14 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-[#0077C8]">Consultoria Especializada · Secção 14</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#061A2D] mt-2">
            Consultoria e Implementação de Sistemas de Gestão ISO
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Apoiamos a sua organização desde o diagnóstico inicial até à preparação completa para a auditoria de certificação, garantindo processos sólidos e alinhados à realidade do mercado angolano.
          </p>
        </div>
        <Link
          to="/solicitar-diagnostico"
          className="px-5 py-3 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-sm font-semibold whitespace-nowrap shrink-0"
        >
          Solicitar Diagnóstico Empresarial
        </Link>
      </div>

      {/* 12 Consulting Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {consultingServices.map((srv) => (
          <div key={srv.num} className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-xs font-mono-tabular font-bold text-[#0077C8]">{srv.num}. Serviço Especializado</p>
            <h2 className="text-base font-bold text-[#061A2D] mt-1">{srv.title}</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{srv.desc}</p>
          </div>
        ))}
      </div>

      {/* 14-Step Implementation Methodology */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-[#0077C8]">Roteiro Estruturado de Projecto</p>
          <h2 className="text-2xl font-bold text-[#061A2D] mt-1">
            As 14 Etapas da Metodologia de Implementação ALHAN
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Cada etapa produz entregáveis verificáveis que ficam disponíveis em tempo real na Área de Clientes Empresariais da nossa plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {ISO_IMPLEMENTATION_METHODOLOGY.map((m) => (
            <div key={m.step} className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 flex items-start gap-4">
              <span className="font-mono-tabular text-sm font-extrabold text-[#0077C8] bg-white border border-slate-200 rounded-lg px-2.5 py-1 shrink-0">
                {m.step}
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#061A2D]">{m.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive ISO Recommendation Questionnaire */}
      <IsoRecommendationQuiz />
    </div>
  );
};

export const NormasIsoPage: React.FC = () => {
  const { isoStandards } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = isoStandards.filter(
    (s) =>
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sectorsInAngola.some((sec) => sec.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="py-14 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-[#0077C8]">Catálogo Técnico · Secção 15</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#061A2D] mt-2">
            Principais Normas ISO Aplicáveis a Diferentes Sectores em Angola
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Este catálogo apresenta as principais normas internacionais de Sistemas de Gestão aplicáveis às organizações em Angola (não constituindo uma lista exaustiva de todas as normas publicadas pela ISO). A adopção de normas ISO é, por regra, de carácter voluntário e estratégico, salvo quando expressamente exigida por regulamentação sectorial ou contratual específica.
          </p>
        </div>

        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar norma ou sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm focus:border-[#0077C8] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((std) => (
          <div key={std.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-mono-tabular font-extrabold text-[#0077C8]">{std.code}</span>
                <span className="text-xs text-slate-500">Aplicabilidade: Multi-sectorial</span>
              </div>
              <h2 className="text-xl font-bold text-[#061A2D] mt-1">{std.name}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{std.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-[#061A2D]">Objectivo Principal:</p>
                <p className="text-xs text-slate-600 mt-1">{std.objective}</p>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold text-[#061A2D]">Benefícios para a Organização:</p>
                <ul className="mt-1.5 space-y-1">
                  {std.benefits.map((b) => (
                    <li key={b} className="text-xs text-slate-600 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0077C8] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                <strong className="text-[#061A2D]">Sectores relevantes:</strong> {std.sectorsInAngola.join(' · ')}
              </div>
              <Link
                to={`/solicitar-diagnostico?norma=${encodeURIComponent(std.code)}`}
                className="text-xs font-semibold text-[#0077C8] hover:underline whitespace-nowrap shrink-0"
              >
                Solicitar Implementação →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="py-14 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold text-[#0077C8]">Guia Operacional da Plataforma ALHAN</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#061A2D] mt-2">
          Como Funciona a Plataforma Integrada ALHAN – SGI
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          A nossa plataforma reúne num único ambiente seguro a Academia de Formação Profissional (LMS) e o Sistema de Gestão de Projectos de Consultoria ISO para empresas clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-[#0077C8]" />
            <h2 className="text-xl font-bold text-[#061A2D]">1. Para Formandos e Profissionais (LMS)</h2>
          </div>
          <ol className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <li><strong>Passo 01 · Escolha da Formação:</strong> Consulte o catálogo de cursos Online, Presenciais ou Híbridos com preços em Kwanzas (Kz).</li>
            <li><strong>Passo 02 · Inscrição e Pagamento Local:</strong> Seleccione o método (Express Angola, Unitel Money, Africell Money ou KWiK) e envie o comprovativo para validação, ou preencha a ficha de inscrição presencial.</li>
            <li><strong>Passo 03 · Aprendizagem Estruturada:</strong> Após validação pelo Administrador, aceda aos módulos, vídeo-aulas protegidas com marca de água, materiais técnicos e avaliações.</li>
            <li><strong>Passo 04 · Certificado com QR Code:</strong> Concluídos os requisitos, o sistema emite o certificado com código único verificável em <Link to="/consultar-certificado" className="text-[#0077C8] underline">/consultar-certificado</Link>.</li>
          </ol>
          <div className="pt-2">
            <Link to="/formacoes" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0077C8] hover:underline">
              Ir para o Catálogo de Formações →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-[#0077C8]" />
            <h2 className="text-xl font-bold text-[#061A2D]">2. Para Empresas Clientes (Consultoria ISO)</h2>
          </div>
          <ol className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <li><strong>Passo 01 · Pedido de Diagnóstico:</strong> Preencha o formulário de diagnóstico empresarial ou utilize o questionário interactivo de recomendação ISO.</li>
            <li><strong>Passo 02 · Abertura do Projecto ISO:</strong> A equipa técnica Alhan estrutura o cronograma nas 14 etapas de implementação e disponibiliza o acesso ao Portal da Empresa.</li>
            <li><strong>Passo 03 · Gestão Documental e Auditorias:</strong> Consulte políticas, manuais, procedimentos, relatórios de auditoria interna, não conformidades e acções correctivas do seu projecto.</li>
            <li><strong>Passo 04 · Preparação para Certificação:</strong> Acompanhamos a revisão pela gestão e a preparação para a auditoria externa pelo organismo de certificação independente.</li>
          </ol>
          <div className="pt-2">
            <Link to="/solicitar-diagnostico" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0077C8] hover:underline">
              Solicitar Diagnóstico para a minha Empresa →
            </Link>
          </div>
        </div>
      </div>

      {/* Accordion FAQ Section */}
      <FaqSection className="pt-8 border-t border-slate-200" />
    </div>
  );
};

export const CompaniesCasesPage: React.FC = () => {
  const { isoProjects } = useApp();

  return (
    <div className="py-14 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold text-[#0077C8]">Portfólio e Transparência Institucional · Secção 24</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#061A2D] mt-2">
          Empresas que Confiaram na Alhan e Cases de Projecto
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Em cumprimento rigoroso da nossa política de confidencialidade e ética corporativa (Secções 24 e 32), apenas publicamos cases, logotipos e testemunhos quando formalmente autorizados pelos respectivos clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isoProjects.map((proj) => (
          <div key={proj.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-[#0077C8]">
                  Projecto de Consultoria SGI Verificado
                </span>
                <span className="font-mono-tabular">Execução: {proj.executionPercent}%</span>
              </div>
              <h2 className="text-lg font-bold text-[#061A2D] mt-2">{proj.companyName}</h2>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Normas em implementação:</strong> {proj.standards}
              </p>
              <p className="text-xs text-slate-600 mt-2">
                <strong>Fase actual:</strong> {proj.status} · {proj.nextActivity}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Acompanhamento no Portal Empresarial</span>
              <Link to="/empresa" className="text-xs font-semibold text-[#0077C8] hover:underline">
                Ver no Painel da Empresa →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PartnersPage: React.FC = () => {
  return (
    <div className="py-14 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold text-[#0077C8]">Ecossistema Institucional · Secção 24</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#061A2D] mt-2">
          Parceiros de Certificação e Entidades Verificadas
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          A Alhan Consultoria actua na preparação, consultoria e formação. Quando o cliente conclui a implementação do seu Sistema de Gestão, articulamos o processo com organismos de certificação independentes acreditados internacionalmente.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-start gap-4">
          <ShieldCheck className="w-7 h-7 text-[#0077C8] shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#061A2D]">
              Política de Publicação de Parceiros e Acreditações Verificadas
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              De acordo com os princípios de transparência da ALHAN (Secção 24 e Secção 32), não exibimos logotipos nem acreditações não verificadas. Os organismos de certificação parceiros são registados e publicados pela Administração no <strong>Painel Administrativo Central → Parceiros</strong> mediante validação documental das respectivas acreditações e escopos normativos.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/solicitar-diagnostico"
                className="px-4 py-2 rounded-lg bg-[#0077C8] text-white text-xs font-semibold hover:bg-[#008FEA]"
              >
                Solicitar Orientação para Certificação
              </Link>
              <Link
                to="/contactos"
                className="px-4 py-2 rounded-lg border border-slate-300 text-[#061A2D] text-xs font-semibold hover:bg-slate-50"
              >
                Propor Parceria Institucional
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LegalPage: React.FC<{ section: 'termos' | 'privacidade' | 'pagamentos' | 'formacao' | 'certificacao' }> = ({
  section,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const titles = {
    termos: 'Termos e Condições de Utilização',
    privacidade: 'Política de Privacidade e Protecção de Dados',
    pagamentos: 'Política de Pagamentos e Reembolsos',
    formacao: 'Política Pedagógica e de Formação Profissional',
    certificacao: 'Aviso Oficial sobre Consultoria, Certificação e Acreditação ISO',
  };

  return (
    <div className="py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
        <div>
          <p className="text-xs font-semibold text-[#0077C8]">Informação Legal e Institucional · Secção 31</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#061A2D] mt-1">{titles[section]}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Entidade Responsável: {COMPANY_INFO.legalName} · NIF {COMPANY_INFO.nif} · {COMPANY_INFO.location}
          </p>
        </div>

        <div className="space-y-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
          {section === 'certificacao' && (
            <>
              <div className="p-5 rounded-xl bg-[#061A2D] text-white">
                <p className="font-semibold text-[#19B5FE] text-xs">Declaração Obrigatória (Secção 16)</p>
                <p className="mt-2 text-sm leading-relaxed">{COMPANY_INFO.certificationDisclaimer}</p>
              </div>
              <p>
                <strong>1. Distinção entre Consultoria, Certificação e Acreditação:</strong> A consultoria e implementação (realizada pela ALHAN) consiste no apoio técnico para organizar processos, elaborar documentação, formar equipas e realizar auditorias internas. A certificação ISO é o acto pelo qual um organismo de certificação independente atesta, após auditoria externa (Fase 1 e Fase 2), que o sistema cumpre a norma. A acreditação é o reconhecimento formal da competência do organismo de certificação por uma entidade acreditadora internacional.
              </p>
              <p>
                <strong>2. Certificados Emitidos na Plataforma ALHAN:</strong> Os certificados emitidos directamente nesta plataforma e consultáveis em <code>/consultar-certificado</code> referem-se exclusivamente à conclusão de acções de <strong>Formação Profissional</strong> ministradas pela Academia ALHAN.
              </p>
            </>
          )}

          {section === 'termos' && (
            <>
              <p>
                <strong>1. Objecto:</strong> Os presentes Termos regulam o acesso ao website institucional, à plataforma de formação online (LMS) e à área de clientes empresariais da {COMPANY_INFO.legalName}.
              </p>
              <p>
                <strong>2. Perfis e Responsabilidades:</strong> O acesso às áreas reservadas (Aluno, Professor, Cliente Empresarial e Administração) é pessoal e intransmissível. Cada utilizador compromete-se a manter a confidencialidade das suas credenciais.
              </p>
              <p>
                <strong>3. Propriedade Intelectual e Protecção de Conteúdos:</strong> Todos os vídeos, manuais, matrizes, procedimentos e materiais disponibilizados nos cursos possuem marca de água identificadora e destinam-se exclusivamente ao uso pedagógico individual do formando inscrito.
              </p>
            </>
          )}

          {section === 'privacidade' && (
            <>
              <p>
                <strong>1. Recolha e Isolamento de Dados:</strong> Os dados pessoais recolhidos no registo (nome, email, telefone) e nos pedidos de diagnóstico empresarial destinam-se exclusivamente à gestão académica, emissão de certificados e prestação de serviços de consultoria pela ALHAN.
              </p>
              <p>
                <strong>2. Separação de Dados por Utilizador e Empresa:</strong> A arquitectura de segurança da plataforma garante que cada aluno consulta apenas os seus cursos e certificados, e cada empresa cliente acede unicamente ao seu próprio projecto ISO.
              </p>
            </>
          )}

          {section === 'pagamentos' && (
            <div className="space-y-6">
              {/* Regra Obrigatória: Inscrição Prévia */}
              <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3.5">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-amber-950">
                    Regra Obrigatória no Acto de Pagamento: Primeiro Inscrever-se na Plataforma
                  </p>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Antes de efectuar qualquer transferência ou pagamento, <strong>o aluno deve primeiro realizar a sua inscrição na formação pretendida</strong> no catálogo da plataforma (<Link to="/formacoes" className="underline font-bold text-[#0077C8]">/formacoes</Link>), preenchendo o seu nome completo, número de WhatsApp e e-mail para que o pagamento fique devidamente vinculado ao seu registo.
                  </p>
                </div>
              </div>

              {/* Destaque dos Canais Oficiais de Pagamento */}
              <div className="p-6 rounded-2xl bg-[#061A2D] text-white space-y-5 border border-[#0077C8]/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-[#19B5FE]" />
                    <h2 className="text-base sm:text-lg font-extrabold text-white">
                      Canais Oficiais de Pagamento das Formações ALHAN
                    </h2>
                  </div>
                  <span className="text-xs font-mono-tabular text-emerald-400">
                    Pagamentos em Kwanzas (AOA / Kz)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Canal 1: Multicaixa Express */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-[#19B5FE]">Canal 1 · Pagamento Instantâneo Móvel</p>
                      <h3 className="text-sm font-bold text-white mt-0.5">Multicaixa Express</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/10">
                        <div>
                          <p className="text-[11px] text-slate-400">Terminal Express 1</p>
                          <p className="font-mono-tabular text-sm font-extrabold text-white">927 496 287</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('927496287', 'exp1')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold transition-colors"
                        >
                          {copiedKey === 'exp1' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'exp1' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/10">
                        <div>
                          <p className="text-[11px] text-slate-400">Terminal Express 2</p>
                          <p className="font-mono-tabular text-sm font-extrabold text-white">927 099 484</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('927099484', 'exp2')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold transition-colors"
                        >
                          {copiedKey === 'exp2' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'exp2' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Canal 2: BANCO SOL IBAN */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-[#19B5FE]">Canal 2 · Coordenadas Bancárias Oficiais</p>
                        <h3 className="text-sm font-bold text-white mt-0.5">BANCO SOL — Transferência / Depósito</h3>
                      </div>

                      <div className="p-3 rounded-lg bg-black/30 border border-white/10 space-y-1.5">
                        <p className="text-[11px] text-slate-400">IBAN (BANCO SOL):</p>
                        <p className="font-mono-tabular text-sm font-extrabold text-[#19B5FE] tracking-wide break-all">
                          0044 0000 56903729141 08
                        </p>
                        <div className="pt-1.5 border-t border-white/10 text-xs text-slate-200">
                          <p>
                            <span className="text-slate-400">Banco:</span> <strong>BANCO SOL</strong>
                          </p>
                          <p>
                            <span className="text-slate-400">Titular da Conta:</span> <strong>Graciete Garcia</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy('004400005690372914108', 'iban')}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold transition-colors"
                    >
                      {copiedKey === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'iban' ? 'IBAN Copiado com Sucesso!' : 'Copiar IBAN BANCO SOL'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Prazos de Validação Bancária (Mesmo Dia vs 24h) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#F5F9FC] border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Validação no Mesmo Dia (Mesmo Banco / Express)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O pagamento é <strong>validado no mesmo dia</strong> sempre que a operação for realizada através do <strong>mesmo banco (BANCO SOL)</strong> ou directamente via <strong>Multicaixa Express (927496287 / 927099484)</strong>, libertando o acesso imediato do aluno.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#F5F9FC] border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-[#0077C8] font-bold text-xs">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Validação em 24 Horas (Bancos Diferentes)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Caso a transferência seja ordenada a partir de um <strong>banco diferente (transferência interbancária)</strong>, o pagamento leva <strong>24 horas (24h) para ser validado</strong> após confirmação de compensação bancária pela Administração.
                  </p>
                </div>
              </div>

              {/* Orientações Claras para Envio do Comprovativo */}
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#061A2D]">
                    Orientações para Envio do Comprovativo e Confirmação Administrativa
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Siga os 4 passos abaixo para garantir a validação célere da sua inscrição:
                  </p>
                </div>

                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 leading-relaxed">
                  <li>
                    <strong>1.º Passo (Inscrição Prévia):</strong> Aceda à página de <Link to="/formacoes" className="text-[#0077C8] font-bold underline">Formações</Link>, escolha o curso pretendido e preencha o formulário de inscrição com o seu Nome Completo, Telefone/WhatsApp e E-mail.
                  </li>
                  <li>
                    <strong>2.º Passo (Pagamento):</strong> Realize o pagamento do valor do curso através do <strong>Multicaixa Express (927496287 / 927099484)</strong> ou transferência para o <strong>BANCO SOL (IBAN 0044 0000 56903729141 08 — em nome de Graciete Garcia)</strong>.
                  </li>
                  <li>
                    <strong>3.º Passo (Envio do Comprovativo):</strong> Envie o comprovativo oficial em PDF ou fotografia legível para o nosso <strong>WhatsApp (+244 922 021 211)</strong> ou <strong>E-mail (geral@alhan.pro)</strong>, indicando o seu nome e a formação em que se inscreveu.
                  </li>
                  <li>
                    <strong>4.º Passo (Validação e Retorno ao Aluno):</strong> Assim que o comprovativo é validado no Painel Administrativo (no mesmo dia para Banco Sol/Express ou em 24h para outros bancos), <strong>a Administração notifica o formando de volta pelo número de WhatsApp ou E-mail</strong> informado na inscrição.
                  </li>
                </ol>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={`https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
                      'Olá ALHAN, já realizei a minha inscrição na plataforma e envio em anexo o comprovativo de pagamento da formação para validação.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar Comprovativo por WhatsApp (+244 922 021 211)</span>
                  </a>

                  <a
                    href={`mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent(
                      'Envio de Comprovativo de Inscrição - Formação ALHAN'
                    )}&body=${encodeURIComponent(
                      'Olá Equipa ALHAN,\n\nSegue em anexo o comprovativo de pagamento referente à minha inscrição.\n\nNome Completo:\nFormação Inscrita:\nTelefone / WhatsApp:\nBanco Utilizado:'
                    )}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Enviar Comprovativo por E-mail (geral@alhan.pro)</span>
                  </a>

                  <Link
                    to="/formacoes"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[#061A2D] text-xs font-bold transition-colors"
                  >
                    <span>Inscrever-me numa Formação Agora</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {section === 'formacao' && (
            <>
              <p>
                <strong>1. Modalidades:</strong> A Academia ALHAN ministra cursos nas modalidades Online (assíncrona e sessões ao vivo via Teams/Zoom/Meet/Jitsi), Presencial (em Luanda e noutras províncias) e Híbrida.
              </p>
              <p>
                <strong>2. Requisitos para Emissão de Certificado:</strong> A emissão do certificado de formação com QR Code depende do cumprimento da frequência mínima, realização das aulas e aprovação nas avaliações definidas para cada curso.
              </p>
            </>
          )}

          <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
            Nota: Este texto institucional encontra-se estruturado e disponível para revisão e personalização jurídica no Painel Administrativo da ALHAN.
          </p>
        </div>
      </div>
    </div>
  );
};
