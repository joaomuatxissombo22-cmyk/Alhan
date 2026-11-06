import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Bell,
  Sparkles,
  MapPin,
  CheckCircle2,
  Award,
  ArrowRight,
  MessageCircle,
  CreditCard,
  BookOpen,
  Users,
  Video,
} from 'lucide-react';
import { COMPANY_INFO } from '../data/initialData';

export const SgiAnnouncementModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('alhan_hse_announced_dismissed');
      if (!dismissed) {
        setIsOpen(true);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('alhan_hse_announced_dismissed', 'true');
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Trigger to reopen official announcement at any time */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Abrir anúncio oficial Formação em HSE Turma de Novembro"
          className="fixed bottom-20 left-4 sm:left-6 z-40 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#061A2D] hover:bg-[#0077C8] text-white border border-[#19B5FE]/40 shadow-xl transition-all duration-300 hover:scale-105 group text-xs font-bold"
        >
          <div className="relative">
            <Bell className="w-4 h-4 text-[#19B5FE] animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="hidden sm:inline">Anúncio Oficial: Formação em HSE (Turma de Novembro)</span>
          <span className="sm:hidden">Formação HSE · Nov</span>
          <span className="text-amber-300 text-[10px] font-mono-tabular bg-white/10 px-2 py-0.5 rounded">
            Vagas Limitadas
          </span>
        </button>
      )}

      {/* Official Announcement Modal with Official HSE Flyer Image */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hse-announcement-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative w-full max-w-4xl bg-[#061A2D] text-white rounded-2xl border border-[#0077C8]/50 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Top decorative gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0077C8] via-[#19B5FE] to-emerald-400 shrink-0" />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Fechar anúncio oficial"
              className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white border border-white/15 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Modal Content: Split Layout (Official Flyer Image + Details) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
              {/* Left Column: Official Announcement Flyer Image */}
              <div className="lg:col-span-5 bg-[#041220] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 p-4 sm:p-5">
                <div className="rounded-xl overflow-hidden border border-white/15 shadow-lg bg-[#061A2D]">
                  <img
                    src={COMPANY_INFO.hseFlyerImage}
                    alt="Anúncio Oficial ALHAN – Formação em HSE: Saúde, Segurança e Meio Ambiente (Turma de Novembro)"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-contain"
                  />
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-semibold text-[#19B5FE]">ALHAN – Sistema de Gestão Integrado</span>
                  <span className="font-mono-tabular">Turma de Novembro</span>
                </div>
              </div>

              {/* Right Column: Course Highlights, Channels & Direct Enrollment */}
              <div className="lg:col-span-7 p-5 sm:p-7 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#19B5FE]">
                      <Sparkles className="w-3.5 h-3.5" />
                      ANÚNCIO OFICIAL · FORMAÇÃO EM DESTAQUE
                    </span>
                    <span aria-hidden="true" className="text-white/30">·</span>
                    <span className="font-bold text-amber-300">
                      Turma de Novembro · Vagas Limitadas
                    </span>
                  </div>

                  <div>
                    <h2
                      id="hse-announcement-title"
                      className="text-xl sm:text-2xl font-extrabold text-white leading-tight tracking-tight"
                    >
                      Formação em HSE — Saúde, Segurança e Meio Ambiente
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-[#19B5FE] mt-1">
                      «Invista em conhecimento, transforme o futuro da sua empresa! Promova um ambiente de trabalho seguro, saudável e sustentável.»
                    </p>
                  </div>

                  {/* 4 Official Flyer Pillars */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                      <Award className="w-4 h-4 text-[#19B5FE] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">Certificado Reconhecido</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">Verificável por QR Code e Nº de B.I.</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                      <BookOpen className="w-4 h-4 text-[#19B5FE] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">Material Didático</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">Manuais HSE, matrizes e checklists</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                      <Users className="w-4 h-4 text-[#19B5FE] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">Professores Experientes</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">Especialistas SGI e Auditores ISO</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#19B5FE] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">Aplicação Prática</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">Simulações reais ISO 45001 & 14001</p>
                      </div>
                    </div>
                  </div>

                  {/* Modalities: Online via Teams | Presencial (Vagas Limitadas) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-[#0077C8]/20 border border-[#19B5FE]/40 flex items-center gap-3">
                      <Video className="w-5 h-5 text-[#19B5FE] shrink-0" />
                      <div>
                        <p className="text-xs font-extrabold text-white uppercase">Online via Teams</p>
                        <p className="text-[11px] text-slate-200">Aulas em directo + Plataforma LMS</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-extrabold text-white uppercase">Presencial (Luanda)</p>
                        <p className="text-[11px] text-emerald-200">Vagas Limitadas · Kilamba</p>
                      </div>
                    </div>
                  </div>

                  {/* Official Payment Channels Summary */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs">
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <CreditCard className="w-4 h-4" />
                      <span>Canais de Pagamento Oficiais (Inscrição prévia obrigatória)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Express: <strong className="text-white font-mono-tabular">927496287</strong> / <strong className="text-white font-mono-tabular">927099484</strong> ·{' '}
                      <strong>BANCO SOL</strong> IBAN: <strong className="text-white font-mono-tabular">0044 0000 56903729141 08</strong> (Titular: <strong>Graciete Garcia</strong>).
                    </p>
                  </div>
                </div>

                {/* Direct Actions */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-white/10">
                  <Link
                    to="/formacoes?curso=curso-hse-novembro"
                    onClick={handleDismiss}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold transition-all shadow-md text-center"
                  >
                    <span>Inscreva-se Já na Turma de Novembro</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href={`https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
                      'Olá ALHAN, vi o anúncio oficial da Formação em HSE – Saúde, Segurança e Meio Ambiente (Turma de Novembro) e gostaria de garantir a minha inscrição.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all text-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp (+244 922 021 211)</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full sm:w-auto px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors text-center"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SgiAnnouncementModal;
