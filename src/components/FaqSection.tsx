import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  Search,
  HelpCircle,
  ShieldCheck,
  BookOpen,
  Building2,
  CreditCard,
  MessageCircle,
  FileCheck2,
  X,
  ExternalLink
} from 'lucide-react';

export interface FaqItem {
  id: string;
  category: 'consultoria' | 'formacoes' | 'certificados' | 'pagamentos';
  categoryLabel: string;
  question: string;
  answer: string;
  highlights?: string[];
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'consultoria',
    categoryLabel: 'Consultoria ISO & SGI',
    question: 'A ALHAN emite directamente o certificado ISO da minha empresa?',
    answer:
      'Não. Em conformidade com as directrizes internacionais da ISO e as regras de imparcialidade, a ALHAN actua exclusivamente como consultoria especializada na preparação, diagnóstico, elaboração documental, formação de equipas e realização de auditorias internas. A certificação final é sempre concedida por um organismo de certificação independente e acreditado (como AENOR, SGS, Bureau Veritas, TÜV, APCER ou equivalente), assegurando a máxima credibilidade e reconhecimento global à sua organização.',
    highlights: [
      'Garantia de conformidade técnica em 100% dos requisitos normativos',
      'Acompanhamento presencial durante as auditorias externas de certificação',
      'Isenção ética e cumprimento rigoroso das directrizes de imparcialidade'
    ]
  },
  {
    id: 'faq-2',
    category: 'consultoria',
    categoryLabel: 'Consultoria ISO & SGI',
    question: 'Quanto tempo demora a implementação de um Sistema de Gestão Integrado (SGI)?',
    answer:
      'O tempo médio varia entre 4 a 8 meses, dependendo do porte da empresa, complexidade das operações e normas abrangidas (ex.: ISO 9001 Qualidade, ISO 14001 Ambiente e ISO 45001 SST). A ALHAN estrutura o projecto num método rigoroso de 14 etapas — desde o Diagnóstico Inicial e Análise de Riscos até à Auditoria Interna e Revisão pela Gestão.',
    highlights: [
      'PME e empresas de serviços: em média 3 a 5 meses',
      'Indústria, construção e operações logísticas: em média 5 a 8 meses',
      'Cronograma detalhado e entregáveis acompanhados em tempo real no Portal do Cliente'
    ]
  },
  {
    id: 'faq-3',
    category: 'consultoria',
    categoryLabel: 'Consultoria ISO & SGI',
    question: 'A ALHAN presta consultoria e auditorias fora da província de Luanda?',
    answer:
      'Sim. Desenvolvemos projectos em todo o território nacional (Cabinda, Benguela, Huambo, Zaire, Huíla, etc.) e em operações offshore do sector de petróleo e gás. O modelo híbrido da ALHAN combina deslocações técnicas para diagnósticos e auditorias presenciais com acompanhamento remoto contínuo através da nossa plataforma digital.',
    highlights: [
      'Cobertura nacional em todas as 18 províncias de Angola',
      'Consultores seniores com experiência no sector petrolífero, mineiro e bancário',
      'Redução de custos logísticos através da centralização documental na plataforma'
    ]
  },
  {
    id: 'faq-4',
    category: 'formacoes',
    categoryLabel: 'Formações & Academia LMS',
    question: 'Como funcionam as modalidades de formação (Online, Presencial e Híbrida)?',
    answer:
      'A Academia ALHAN oferece total flexibilidade aos formandos: a modalidade Online permite estudar ao seu ritmo 24/7 com vídeo-aulas protegidas por marca de água anti-pirataria e exercícios interactivos; a modalidade Presencial decorre no centro de formações no Kilamba (Luanda) ou em salas corporativas; a modalidade Híbrida combina aulas virtuais ao vivo com workshops práticos e simulações de auditoria.',
    highlights: [
      'Acesso garantido a materiais técnicos em PDF, minutas e checklists',
      'Contacto directo com professores e especialistas certificados',
      'Avaliações formativas com feedback imediato'
    ]
  },
  {
    id: 'faq-5',
    category: 'certificados',
    categoryLabel: 'Certificados & Validação',
    question: 'Como funciona a verificação e autenticidade dos certificados emitidos pela ALHAN?',
    answer:
      'Todos os certificados emitidos pela Academia ALHAN contêm um código alfanumérico único e um QR Code criptográfico. Qualquer entidade empregadora, cliente ou instituição pública pode verificar a autenticidade instantaneamente apontando a câmara do telemóvel ao QR Code ou digitando o código na nossa página pública de validação em /consultar-certificado.',
    highlights: [
      'Código de autenticação rastreável e inviolável',
      'Registo do formando, carga horária, nota final e data de conclusão',
      'Conformidade com os padrões de formação profissional de Angola'
    ]
  },
  {
    id: 'faq-6',
    category: 'pagamentos',
    categoryLabel: 'Pagamentos & Faturação',
    question: 'Quais são os métodos de pagamento aceites em Angola?',
    answer:
      'Aceitamos todos os principais métodos de pagamento nacionais em Kwanzas (Kz): Multicaixa Express (com referência ou número de telemóvel), Unitel Money, Africell Money, KWiK (pagamento instantâneo interbancário) e Transferência Bancária directa (BFA, BAI, Millennium Atlântico, etc.). Emitimos fatura/recibo oficial com NIF (5003128261) para empresas e particulares.',
    highlights: [
      'Validação célere com upload do comprovativo no portal',
      'Emissão automática de fatura pró-forma para aprovação empresarial',
      'Possibilidade de pagamento parcelado para pacotes de consultoria empresarial'
    ]
  },
  {
    id: 'faq-7',
    category: 'formacoes',
    categoryLabel: 'Formações & Academia LMS',
    question: 'As formações da ALHAN qualificam profissionais como Auditores Internos de ISO?',
    answer:
      'Sim. Os nossos cursos de "Auditor Interno de Sistemas de Gestão" (ISO 9001, ISO 14001 e ISO 45001) seguem integralmente as directrizes da norma ISO 19011 (Directrizes para auditorias de sistemas de gestão). Os formandos aprovados recebem certificados que atestam a competência técnica para planear, conduzir e reportar auditorias internas na sua organização.',
    highlights: [
      'Módulos práticos com simulação de casos reais e redacção de Não Conformidades',
      'Corpo docente experiente com actuação activa como auditores líderes',
      'Certificado com especificação da norma de auditoria e número de horas'
    ]
  },
  {
    id: 'faq-8',
    category: 'consultoria',
    categoryLabel: 'Consultoria ISO & SGI',
    question: 'Como é garantida a segurança e confidencialidade dos documentos da minha empresa?',
    answer:
      'A ALHAN opera sob rigorosos protocolos de cibersegurança e confidencialidade institucional (Non-Disclosure Agreement - NDA). No Portal do Cliente, cada organização dispõe de um ambiente isolado com permissões de acesso baseadas em funções (RBAC), histórico de revisões e cópias de segurança automáticas. A informação dos seus processos de negócio permanece sempre protegida.',
    highlights: [
      'Assinatura de Acordo de Confidencialidade (NDA) antes do arranque dos trabalhos',
      'Ambiente dedicado e seguro sem partilha de dados entre clientes',
      'Controlo de versões para procedimentos, políticas e evidências de auditoria'
    ]
  },
  {
    id: 'faq-9',
    category: 'consultoria',
    categoryLabel: 'Consultoria ISO & SGI',
    question: 'O que acontece se a nossa empresa não for aprovada na auditoria de certificação?',
    answer:
      'A nossa metodologia possui uma taxa de aprovação de 100% à primeira tentativa nas empresas que cumpriram todas as recomendações do plano de acção ALHAN. Caso o organismo auditor identifique Não Conformidades Menores, os nossos consultores acompanham a sua equipa sem custos adicionais de consultoria na elaboração do plano de acções correctivas até ao encerramento formal dos apontamentos.',
    highlights: [
      'Compromisso contratual com a eficácia do sistema implementado',
      'Simulação de auditoria externa (pré-auditoria) antes da visita do organismo certificador',
      'Suporte técnico contínuo durante a fase de análise de causa-raiz'
    ]
  },
  {
    id: 'faq-10',
    category: 'pagamentos',
    categoryLabel: 'Pagamentos & Faturação',
    question: 'Como posso solicitar uma proposta formal ou diagnóstico para a minha empresa?',
    answer:
      'Pode solicitar imediatamente através da nossa ferramenta de diagnóstico em /solicitar-diagnostico ou contactando a nossa equipa comercial pelo WhatsApp (+244 922 021 211) ou e-mail (geral@alhan.pro). O diagnóstico inicial é gratuito e permite mapear a maturidade da sua organização e receber uma estimativa transparente de prazos e investimento.',
    highlights: [
      'Diagnóstico inicial gratuito e sem compromisso',
      'Apresentação de proposta técnico-financeira em até 48 horas úteis',
      'Reunião técnica de alinhamento com a administração e responsáveis de qualidade'
    ]
  }
];

interface FaqSectionProps {
  className?: string;
  initialCategory?: string;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ className = '', initialCategory = 'all' }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true // First question open by default for immediate engagement
  });

  const categories = [
    { id: 'all', label: 'Todas as Perguntas', icon: HelpCircle },
    { id: 'consultoria', label: 'Consultoria ISO & SGI', icon: Building2 },
    { id: 'formacoes', label: 'Formações & LMS', icon: BookOpen },
    { id: 'certificados', label: 'Certificados & QR Code', icon: ShieldCheck },
    { id: 'pagamentos', label: 'Pagamentos & Faturação', icon: CreditCard }
  ];

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inQuestion = item.question.toLowerCase().includes(q);
      const inAnswer = item.answer.toLowerCase().includes(q);
      const inCategory = item.categoryLabel.toLowerCase().includes(q);
      const inHighlights = item.highlights?.some((h) => h.toLowerCase().includes(q));

      return inQuestion || inAnswer || inCategory || inHighlights;
    });
  }, [selectedCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    filteredFaqs.forEach((item) => {
      next[item.id] = true;
    });
    setOpenIds(next);
  };

  const collapseAll = () => {
    setOpenIds({});
  };

  return (
    <section aria-labelledby="faq-heading" className={`space-y-8 ${className}`}>
      {/* Header zone with clear hierarchy */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0077C8] uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Perguntas Frequentes & Esclarecimentos</span>
          </div>
          <h2 id="faq-heading" className="text-2xl sm:text-3xl font-extrabold text-[#061A2D] mt-1">
            Dúvidas Frequentes sobre Consultoria e Formação
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            Respostas claras e transparentes sobre a metodologia de implementação ISO da ALHAN, o funcionamento da nossa Academia de Formação e os procedimentos administrativos em Angola.
          </p>
        </div>

        {/* Global accordion expand/collapse quick toggles */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-semibold text-[#0077C8] bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
          >
            Expandir Todas
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Recolher
          </button>
        </div>
      </div>

      {/* Search Bar & Category Tabs */}
      <div className="space-y-4">
        {/* Search input with clean styling */}
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquise por tema, norma ISO, certificado, pagamentos..."
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:border-transparent transition-all placeholder:text-slate-400 text-slate-900"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              title="Limpar pesquisa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Tabs (Segmented interactive buttons complying with Frontend Design constitution) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Categorias de FAQ">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#061A2D] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#19B5FE]' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Nenhuma pergunta encontrada para "{searchQuery}"</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Tente pesquisar por termos diferentes ou fale directamente com os nossos consultores especializados no WhatsApp.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-lg transition-colors"
              >
                Limpar Filtros e Ver Todas
              </button>
            </div>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isOpen = !!openIds[faq.id];
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-xl border transition-all duration-200 ${
                  isOpen ? 'border-[#0077C8]/40 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Accordion Trigger Button */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full flex items-start justify-between gap-4 p-4 sm:p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0077C8] rounded-xl"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#0077C8]">
                      <span>{faq.categoryLabel}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-400">Questão {String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#061A2D] leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  <div
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isOpen ? 'bg-[#0077C8] text-white rotate-180' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                  </div>
                </button>

                {/* Collapsible Content */}
                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 space-y-4"
                  >
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {faq.answer}
                    </p>

                    {faq.highlights && faq.highlights.length > 0 && (
                      <div className="bg-slate-50 rounded-lg p-3.5 space-y-2 border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                          Destaques Operacionais:
                        </span>
                        <ul className="space-y-1.5">
                          {faq.highlights.map((h, hIdx) => (
                            <li key={hIdx} className="flex items-start gap-2 text-xs text-slate-600">
                              <FileCheck2 className="w-3.5 h-3.5 text-[#0077C8] shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Helpful Support Footer Card (CTA) */}
      <div className="bg-gradient-to-r from-[#061A2D] to-[#071B2F] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#19B5FE]">
            <MessageCircle className="w-4 h-4" />
            <span>Ainda tem dúvidas técnicas ou institucionais?</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            Fale directamente com a equipa técnica da ALHAN
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Os nossos consultores seniores em Luanda estão prontos para analisar as necessidades específicas da sua empresa ou carreira profissional.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
          <a
            href="https://wa.me/244922021211?text=Ol%C3%A1%2C%20gostaria%20de%20esclarecer%20algumas%20d%C3%BAvidas%20sobre%20as%20solu%C3%A7%C3%B5es%20da%20ALHAN."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp (+244 922 021 211)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <Link
            to="/solicitar-diagnostico"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold transition-all shadow-sm whitespace-nowrap"
          >
            <span>Pedir Diagnóstico Gratuito</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
