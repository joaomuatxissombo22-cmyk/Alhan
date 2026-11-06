import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Bell,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle2,
  Award,
  ArrowRight,
  MessageCircle,
  CreditCard,
  Building2
} from 'lucide-react';
import { COMPANY_INFO } from '../data/initialData';

export const SgiAnnouncementModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Show automatically with a brief delay when entering the site
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('alhan_sgi_announced_dismissed');
      if (!dismissed) {
        setIsOpen(true);
      }
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    setHasInteracted(true);
    sessionStorage.setItem('alhan_sgi_announced_dismissed', 'true');
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Pill Trigger to reopen announcement at any time */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Abrir anúncio de formação SGI"
          className="fixed bottom-20 left-4 sm:left-6 z-40 inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[#061A2D] hover:bg-[#0077C8] text-white border border-[#19B5FE]/40 shadow-xl transition-all duration-300 hover:scale-105 group text-xs font-bold"
        >
          <div className="relative">
            <Bell className="w-4 h-4 text-[#19B5FE] animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="hidden sm:inline">Nova Turma Aberta: Formação SGI 2026</span>
          <span className="sm:hidden">Turma SGI</span>
          <span className="text-[#19B5FE] text-[10px] font-mono-tabular bg-white/10 px-1.5 py-0.5 rounded">
            Vagas Abertas
          </span>
        </button>
      )}

      {/* Full Modal Announcement */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sgi-announcement-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative w-full max-w-2xl bg-[#061A2D] text-white rounded-2xl border border-[#0077C8]/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Top decorative gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0077C8] via-[#19B5FE] to-emerald-400" />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Fechar anúncio"
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Modal Content */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0077C8]/30 border border-[#19B5FE]/50 text-xs font-bold text-[#19B5FE]">
                  <Sparkles className="w-3.5 h-3.5" />
                  ANÚNCIO OFICIAL · ACADEMIA ALHAN
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                  Inscrições Abertas · Luanda & Online
                </span>
              </div>

              {/* Title & Core Pitch */}
              <div>
                <h2
                  id="sgi-announcement-title"
                  className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight"
                >
                  Formação Executiva em Sistema de Gestão Integrado (SGI)
                </h2>
                <p className="text-sm font-semibold text-[#19B5FE] mt-1">
                  ISO 9001:2015 (Qualidade) · ISO 14001:2015 (Ambiente) · ISO 45001:2018 (SST)
                </p>
                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                  Prepare-se para liderar a implementação, auditoria interna e melhoria contínua dos Sistemas de Gestão mais exigidos pelo mercado empresarial e sector petrolífero em Angola.
                </p>
              </div>

              {/* Key Features Bento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#19B5FE]">
                    <MapPin className="w-4 h-4" />
                    <span>Modalidades Flexíveis</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Presencial:</strong> Centro de Formação no Kilamba, Luanda.<br />
                    <strong>Online:</strong> Aulas 24/7 com materiais e exercícios no LMS.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#19B5FE]">
                    <Award className="w-4 h-4" />
                    <span>Certificado com QR Code</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Certificado profissional verificável publicamente na plataforma com código único para apresentação curricular e empresarial.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#19B5FE]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Qualificação Prática</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Módulos práticos de auditoria interna ISO 19011, matrizes de riscos QSMS e simulação de Não Conformidades reais.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CreditCard className="w-4 h-4" />
                    <span>Canais de Pagamento Oficiais</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Express (<strong>927496287</strong> / <strong>927099484</strong>) ou <strong>BANCO SOL</strong> IBAN <strong>0044 0000 56903729141 08</strong> (Em nome de <strong>Graciete Garcia</strong>).
                  </p>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                <Link
                  to="/formacoes"
                  onClick={handleDismiss}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-bold transition-all shadow-md text-center"
                >
                  <span>Garantir Vaga na Formação</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsappNumber}?text=Ol%C3%A1%20ALHAN%2C%20vi%20o%20an%C3%BAncio%20no%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20Forma%C3%A7%C3%A3o%20de%20SGI.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Falar no WhatsApp (+244 922 021 211)</span>
                </a>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full sm:w-auto px-4 py-3 text-xs text-slate-400 hover:text-white transition-colors text-center"
                >
                  Lembrar mais tarde
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SgiAnnouncementModal;
