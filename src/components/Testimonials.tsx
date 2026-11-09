import React, { useState, useEffect, useCallback } from 'react';
import {
  Quote,
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Pause,
  Play,
  ArrowRight,
  MessageSquarePlus,
  X,
  Send,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TestimonialItem } from '../data/initialData';
import { useApp } from '../context/AppContext';

export const Testimonials: React.FC = () => {
  const { testimonials, addTestimonial } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Modal for new testimonial submission
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Form fields
  const [clientName, setClientName] = useState('');
  const [role, setRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceType, setServiceType] = useState('Implementação de Sistema de Gestão Integrado (SGI)');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [projectOutcome, setProjectOutcome] = useState('');

  const approvedTestimonials = testimonials.filter(
    (t) =>
      t.approvalStatus !== 'pendente' &&
      t.approvalStatus !== 'rejeitado' &&
      t.authorizedForPublication !== false
  );
  const count = Math.max(1, approvedTestimonials.length);
  const current: TestimonialItem = approvedTestimonials[currentIndex] || approvedTestimonials[0];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (isPaused || isModalOpen) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [isPaused, isModalOpen, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) nextSlide();
      else prevSlide();
    }
    setTouchStartX(null);
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !companyName.trim() || !feedback.trim()) return;

    setSubmitting(true);
    try {
      await addTestimonial({
        clientName: clientName.trim(),
        role: role.trim() || 'Gestor / Profissional',
        companyName: companyName.trim(),
        serviceType: serviceType || 'Consultoria ISO & SGI',
        rating,
        feedback: feedback.trim(),
        projectOutcome: projectOutcome.trim() || 'Conformidade normativa alcançada com sucesso.',
      });

      setSuccessMessage(true);
      setCurrentIndex(0); // Move carousel to the newly submitted testimonial
      setTimeout(() => {
        setSuccessMessage(false);
        setIsModalOpen(false);
        // Reset form
        setClientName('');
        setRole('');
        setCompanyName('');
        setFeedback('');
        setProjectOutcome('');
      }, 1800);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-label="Depoimentos de Clientes e Testemunhos de Confiança"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="py-16 lg:py-24 bg-[#071B2F] text-[#F5F9FC] relative overflow-hidden border-t border-b border-white/10"
    >
      {/* Subtle ambient gradient highlights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0077C8]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#19B5FE]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#19B5FE] tracking-wide mb-2">
              <ShieldCheck className="w-4 h-4 text-[#19B5FE]" />
              <span>Resultados Comprovados no Mercado Angolano</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              A Confiança de Quem Implementou com a Alhan
            </h2>
            <p className="text-sm sm:text-base text-[#9AA6AE] mt-2 max-w-2xl leading-relaxed">
              Descubra como os nossos serviços de consultoria em Sistemas de Gestão Integrados (SGI),
              auditorias internas e formação corporativa geram conformidade e valor mensurável.
            </p>
          </div>

          {/* Action buttons & Carousel controls */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0">
            {/* New Testimonial Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold transition-all shadow-md hover:scale-105"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Deixar o Seu Testemunho</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? 'Retomar rotação de testemunhos' : 'Pausar rotação de testemunhos'}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#9AA6AE] hover:text-white transition-colors"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-[#19B5FE]" /> : <Pause className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline font-medium">{isPaused ? 'Em pausa' : 'Automático'}</span>
            </button>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Depoimento anterior"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white hover:border-[#19B5FE]/40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Próximo depoimento"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white hover:border-[#19B5FE]/40 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Testimonial Card */}
        {current && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Main Feedback Card */}
            <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10 flex flex-col justify-between shadow-2xl relative">
              <Quote className="w-14 h-14 text-[#0077C8]/20 absolute top-6 right-6 pointer-events-none" />

              <div>
                {/* Star Rating & Verified Label */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(current.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-2 text-xs font-mono-tabular font-bold text-white">
                      {current.rating}.0 / 5.0
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Testemunho Verificado & Autorizado</span>
                  </div>
                </div>

                {/* Quote text */}
                <blockquote className="text-base sm:text-xl lg:text-2xl text-white font-medium leading-relaxed italic">
                  "{current.feedback}"
                </blockquote>

                {/* Key project outcome box */}
                <div className="mt-6 p-4 rounded-xl bg-[#061A2D]/80 border border-white/10 flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-[#19B5FE] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[#19B5FE] uppercase tracking-wider">
                      Resultado Obtido com a Alhan:
                    </p>
                    <p className="text-xs sm:text-sm text-[#F5F9FC]/90 mt-0.5 font-medium leading-snug">
                      {current.projectOutcome}
                    </p>
                  </div>
                </div>
              </div>

              {/* Author info & Company metadata */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Clean initials avatar */}
                  <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-[#0077C8] to-[#19B5FE] text-white font-bold flex items-center justify-center text-base shrink-0 shadow-md">
                    {current.clientName
                      .replace('Eng.º ', '')
                      .replace('Dra. ', '')
                      .replace('Dr. ', '')
                      .replace('Eng.ª ', '')
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                      {current.clientName}
                    </h3>
                    <p className="text-xs text-[#19B5FE] font-medium mt-0.5">
                      {current.role}
                    </p>
                    <p className="text-xs text-[#9AA6AE] mt-0.5">
                      {current.companyName} {current.companySector && <>· <span className="text-white/60">{current.companySector}</span></>}
                    </p>
                  </div>
                </div>

                {/* Service Type badge */}
                <div className="self-start sm:self-auto text-left sm:text-right">
                  <p className="text-[11px] text-[#9AA6AE]">Tipo de Serviço Prestado</p>
                  <p className="text-xs font-mono-tabular font-bold text-white mt-0.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg inline-block">
                    {current.serviceType || current.standardImplemented}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Company Logos & Quick Selectors */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-full">
                <div>
                  <p className="text-xs font-semibold text-[#19B5FE] uppercase tracking-wider">
                    Organizações & Formandos em Destaque ({approvedTestimonials.length})
                  </p>
                  <p className="text-xs text-[#9AA6AE] mt-1 mb-4">
                    Clique para visualizar o depoimento autorizado:
                  </p>

                  {/* Company list */}
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {approvedTestimonials.map((item, idx) => {
                      const isActive = currentIndex === idx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            isActive
                              ? 'bg-[#0077C8]/20 border-[#19B5FE] ring-1 ring-[#19B5FE]/40 text-white'
                              : 'bg-white/[0.02] border-white/10 hover:bg-white/10 text-[#9AA6AE] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Stylized Logo Monogram */}
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-xs tracking-wider shrink-0 transition-colors ${
                                isActive
                                  ? 'bg-[#0077C8] text-white'
                                  : 'bg-white/10 text-white/80 group-hover:bg-white/20'
                              }`}
                            >
                              {item.companyLogoText || item.companyName.slice(0, 3).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">
                                {item.companyName}
                              </p>
                              <p className="text-[11px] text-[#9AA6AE] truncate">
                                {item.serviceType || item.companySector || 'Consultoria ALHAN'}
                              </p>
                            </div>
                          </div>

                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-[#19B5FE] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom CTA to start a project */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  <Link
                    to="/solicitar-diagnostico"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold transition-colors text-center"
                  >
                    <span>Solicitar Diagnóstico para a Sua Empresa</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Carousel Slide Dots Indicator */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {approvedTestimonials.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir para depoimento de ${item.companyName}`}
              className={`h-2 rounded-full transition-all ${
                currentIndex === idx
                  ? 'w-8 bg-[#19B5FE]'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Modal: Deixar Testemunho */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="testimonial-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative w-full max-w-xl bg-[#061A2D] text-white rounded-2xl border border-white/20 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#19B5FE]">
                  <Sparkles className="w-4 h-4" />
                  <span>Avaliação de Clientes e Formandos</span>
                </div>
                <h3 id="testimonial-modal-title" className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  Deixe o Seu Testemunho sobre a ALHAN
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  A sua opinião é fundamental para demonstrar o impacto dos nossos serviços em Angola.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success State */}
            {successMessage ? (
              <div className="p-8 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">Muito Obrigado pelo Seu Testemunho!</h4>
                <p className="text-xs text-slate-300">
                  O seu depoimento foi enviado para validação e aprovação da Administração da ALHAN antes da publicação oficial.
                </p>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmitTestimonial} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      O Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Eng.º Carlos Manuel Silva"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/20 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#19B5FE]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Cargo / Função
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Responsável de Qualidade / Auditor"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/20 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#19B5FE]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Empresa ou Instituição *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sonangol / Empresa ABC, Lda"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/20 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#19B5FE]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Tipo de Serviço Prestado *
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#061A2D] border border-white/20 text-xs sm:text-sm text-white focus:outline-none focus:border-[#19B5FE]"
                    >
                      <option value="Implementação de Sistema de Gestão Integrado (SGI)">
                        Implementação de SGI (ISO 9001, 14001 e 45001)
                      </option>
                      <option value="Consultoria ISO 9001 (Qualidade)">
                        Consultoria ISO 9001:2015 (Qualidade)
                      </option>
                      <option value="Consultoria ISO 14001 (Ambiente)">
                        Consultoria ISO 14001:2015 (Ambiente)
                      </option>
                      <option value="Consultoria ISO 45001 (Segurança e Saúde no Trabalho)">
                        Consultoria ISO 45001:2018 (SST)
                      </option>
                      <option value="Auditoria Interna de Diagnóstico ISO">
                        Auditoria Interna de Diagnóstico ISO
                      </option>
                      <option value="Formação Auditor Líder / Interno SGI">
                        Formação Auditor Interno / Líder SGI
                      </option>
                      <option value="Formação Profissional LMS Online">
                        Formação Profissional LMS Online
                      </option>
                      <option value="Formação Presencial (Luanda Kilamba)">
                        Formação Presencial (Luanda Kilamba)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Rating Stars Picker */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Classificação Geral (Estrelas):
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                        title={`${star} Estrelas`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono-tabular font-bold text-amber-400 ml-2">
                      {rating}.0 de 5.0
                    </span>
                  </div>
                </div>

                {/* Testimonial text */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    O Seu Comentário / Testemunho *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Descreva a sua experiência com a consultoria ou formação da ALHAN, o suporte da equipa e o valor que gerou para a sua organização..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/20 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#19B5FE]"
                  />
                </div>

                {/* Outcome */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Resultado / Impacto Obtido
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Redução de 50% de Não Conformidades e aprovação na auditoria externa"
                    value={projectOutcome}
                    onChange={(e) => setProjectOutcome(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/20 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#19B5FE]"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077C8] hover:bg-[#008FEA] text-xs font-bold text-white transition-all shadow-md disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'A submeter...' : 'Publicar Testemunho'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;
