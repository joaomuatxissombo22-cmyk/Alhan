import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';
import { COMPANY_INFO, HERO_SLIDES } from '../data/initialData';

export const Hero: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const slideCount = HERO_SLIDES.length;
  const currentSlide = HERO_SLIDES[activeIndex] || HERO_SLIDES[0];

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 6500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Keyboard navigation for accessibility on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 45) {
      if (deltaX < 0) nextSlide();
      else prevSlide();
    }
    setTouchStartX(null);
  };

  const whatsappUrl = `https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
    COMPANY_INFO.whatsappDefaultMessage
  )}`;

  return (
    <section
      aria-label="Destaque Principal ALHAN – Sistema de Gestão Integrado"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative bg-gradient-to-b from-[#061A2D] via-[#071B2F] to-[#061A2D] text-[#F5F9FC] py-8 sm:py-14 lg:py-20 border-b border-white/10 overflow-hidden"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Highlighted Typography, Key Value Points & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Kicker & Slide Index */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#19B5FE] tracking-wide">
                <span>{currentSlide.kicker}</span>
                <span aria-hidden="true" className="text-white/30">·</span>
                <span className="font-mono-tabular text-[#9AA6AE]">
                  0{activeIndex + 1} / 0{slideCount}
                </span>
              </div>

              {/* Headline with Highlighted Corporate Text */}
              <h1 className="text-2xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-white mt-3 leading-[1.14]">
                <span>{currentSlide.headlinePrefix}</span>
                <span className="text-[#19B5FE] underline decoration-[#0077C8]/60 decoration-2 underline-offset-8">
                  {currentSlide.headlineHighlight}
                </span>
                <span>{currentSlide.headlineSuffix}</span>
              </h1>

              {/* Lead Paragraph */}
              <p className="text-sm sm:text-base lg:text-lg text-[#F5F9FC]/85 mt-4 sm:mt-5 leading-relaxed max-w-2xl">
                {currentSlide.description}
              </p>

              {/* Featured Highlights List */}
              <ul className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {currentSlide.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-[#F5F9FC]/90"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#19B5FE] shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Primary, Secondary & Consultant CTAs */}
              <div className="flex flex-wrap items-center gap-3 mt-6 sm:mt-8">
                <Link
                  to={currentSlide.primaryCta.to}
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors whitespace-nowrap"
                >
                  <span>{currentSlide.primaryCta.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to={currentSlide.secondaryCta.to}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-lg border border-white/25 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap"
                >
                  <span>{currentSlide.secondaryCta.label}</span>
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-lg border border-[#19B5FE]/40 text-[#19B5FE] hover:bg-[#19B5FE]/10 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Falar com um Consultor</span>
                </a>
              </div>
            </div>

            {/* Bottom Carousel Controls & Progress Indicators */}
            <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Seleccionar destaque ${idx + 1}: ${s.thumbnailLabel}`}
                    className={`h-2.5 rounded-full transition-all ${
                      activeIndex === idx
                        ? 'w-10 bg-[#19B5FE]'
                        : 'w-2.5 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  aria-label={isPaused ? 'Retomar rotação automática' : 'Pausar rotação automática'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-[#9AA6AE] hover:text-white transition-colors"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-[#19B5FE]" /> : <Pause className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isPaused ? 'Em pausa' : 'Automático'}</span>
                </button>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Imagem anterior"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Próxima imagem"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Corporate Image Gallery Showcase */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
            {/* Active Gallery Stage */}
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#061A2D] aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] shadow-2xl">
              <img
                key={currentSlide.image}
                src={currentSlide.image}
                alt={currentSlide.caption}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061A2D] via-[#061A2D]/20 to-transparent" />

              {/* Top Brand Lockup inside Stage */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 bg-white/95 text-[#061A2D] px-3 py-1.5 rounded-lg shadow-md">
                  <img
                    src={COMPANY_INFO.logoPath}
                    alt="Logotipo ALHAN"
                    referrerPolicy="no-referrer"
                    className="h-6 w-6 object-contain"
                  />
                  <span className="text-[11px] font-extrabold tracking-tight">ALHAN – SGI</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#061A2D]/85 border border-white/15 text-[11px] font-mono-tabular text-[#19B5FE]">
                  NIF {COMPANY_INFO.nif}
                </span>
              </div>

              {/* Bottom Caption & Location Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
                <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {currentSlide.caption}
                </p>
                <p className="text-[11px] text-[#F5F9FC]/80 mt-0.5">
                  {COMPANY_INFO.address}
                </p>
              </div>
            </div>

            {/* Interactive Thumbnail Gallery Strip (Responsive 5-item corporate gallery) */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-[#9AA6AE] mb-2">
                <span className="font-semibold text-[#F5F9FC]">Galeria Corporativa ALHAN (Clique para alternar)</span>
                <span className="font-mono-tabular">{activeIndex + 1} de {slideCount} fotos</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {HERO_SLIDES.map((item, idx) => {
                  const isActive = activeIndex === idx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`group relative rounded-xl overflow-hidden border text-left transition-all focus:outline-none ${
                        isActive
                          ? 'border-[#19B5FE] ring-2 ring-[#19B5FE]/40 scale-[1.02]'
                          : 'border-white/15 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="aspect-[4/3] w-full bg-[#061A2D]">
                        <img
                          src={item.image}
                          alt={item.thumbnailLabel}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="p-1.5 bg-[#061A2D]/90 border-t border-white/10">
                        <p className="text-[10px] font-bold text-white truncate">
                          {item.thumbnailLabel}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width KPI Strip below Hero split */}
        <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono-tabular text-[#19B5FE]">10</p>
            <p className="text-xs text-[#9AA6AE] mt-1">Programas de Formação Especializada</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono-tabular text-[#19B5FE]">12</p>
            <p className="text-xs text-[#9AA6AE] mt-1">Normas ISO no Catálogo Técnico</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono-tabular text-[#19B5FE]">14 Etapas</p>
            <p className="text-xs text-[#9AA6AE] mt-1">Metodologia de Implementação SGI</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono-tabular text-[#19B5FE]">5 Perfis</p>
            <p className="text-xs text-[#9AA6AE] mt-1">Plataforma Integrada Desktop & Mobile</p>
          </div>
        </div>
      </div>
    </section>
  );
};
