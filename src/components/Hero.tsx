import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Leaf,
  HardHat,
  Sparkles,
  GraduationCap,
  Images,
  Volume2,
  VolumeX,
  BarChart3,
  Building2,
  BookOpen,
} from 'lucide-react';
import { HERO_SLIDES } from '../data/initialData';
import { useApp } from '../context/AppContext';

interface CartoonScene {
  id: string;
  step: string;
  badge: string;
  title: string;
  narration: string;
  accentColor: string;
  bgGlow: string;
  isoPillars: { code: string; label: string; color: string }[];
}

const CARTOON_3D_SCENES: CartoonScene[] = [
  {
    id: 'scene-1',
    step: 'CENA 01 / 05',
    badge: 'ACADEMIA ALHAN · FORMAÇÃO PROFISSIONAL SGI',
    title: 'Formador e Turma em Sala Moderna de Formação SGI',
    narration:
      'Formação prática e interactiva em Sistema de Gestão Integrado para qualificar quadros técnicos, gestores e auditores em Angola.',
    accentColor: '#00E5FF',
    bgGlow: 'from-[#0B4F6C] via-[#072A40] to-[#041523]',
    isoPillars: [
      { code: 'ISO 9001', label: 'Qualidade', color: '#38BDF8' },
      { code: 'ISO 14001', label: 'Ambiente', color: '#34D399' },
      { code: 'ISO 45001', label: 'SST', color: '#FBBF24' },
    ],
  },
  {
    id: 'scene-2',
    step: 'CENA 02 / 05',
    badge: 'OS 3 PILARES DO SGI · INTEGRAÇÃO ANEXO SL',
    title: 'Qualidade (ISO 9001), Ambiente (ISO 14001) e SST (ISO 45001)',
    narration:
      'Domine de forma integrada o controlo documental, matrizes de aspectos e impactos ambientais (LAIA) e análise preliminar de risco (APR).',
    accentColor: '#34D399',
    bgGlow: 'from-[#064E3B] via-[#072A40] to-[#041523]',
    isoPillars: [
      { code: 'ISO 9001', label: 'Processos & Cliente', color: '#38BDF8' },
      { code: 'ISO 14001', label: 'Sustentabilidade', color: '#34D399' },
      { code: 'ISO 45001', label: 'Zero Acidentes', color: '#FBBF24' },
    ],
  },
  {
    id: 'scene-3',
    step: 'CENA 03 / 05',
    badge: 'APLICAÇÃO PRÁTICA · EMPRESAS E INDÚSTRIA',
    title: 'Auditoria Interna ISO 19011, Segurança e Melhoria Contínua',
    narration:
      'Simulações reais de auditoria no terreno, uso correcto de EPIs, mapeamento SIPOC e indicadores KPI para excelência operacional.',
    accentColor: '#FBBF24',
    bgGlow: 'from-[#1E3A8A] via-[#0B2742] to-[#041523]',
    isoPillars: [
      { code: 'ISO 19011', label: 'Auditoria Interna', color: '#A78BFA' },
      { code: 'PDCA', label: 'Melhoria Contínua', color: '#38BDF8' },
      { code: 'SST / EPI', label: 'Operação Segura', color: '#FBBF24' },
    ],
  },
  {
    id: 'scene-4',
    step: 'CENA 04 / 05',
    badge: 'CERTIFICAÇÃO OFICIAL · EMISSÃO PELO ADMINISTRADOR',
    title: 'Conclusão da Formação e Entrega de Certificado Oficial em PDF',
    narration:
      'Após concluir a formação, solicite o seu certificado no painel do formando e receba o documento oficial em PDF enviado pela Administração da ALHAN.',
    accentColor: '#C8A951',
    bgGlow: 'from-[#3B2F13] via-[#0A2540] to-[#041523]',
    isoPillars: [
      { code: 'PDF OFICIAL', label: 'Enviado pelo ADM', color: '#C8A951' },
      { code: 'QR CODE', label: 'Validação Pública', color: '#34D399' },
      { code: 'CARREIRA', label: 'Reconhecimento', color: '#38BDF8' },
    ],
  },
  {
    id: 'scene-5',
    step: 'CENA 05 / 05',
    badge: 'INSCRIÇÕES ABERTAS · LUANDA E ONLINE',
    title: 'Inscreva-se na Formação em Sistema de Gestão Integrado (SGI)',
    narration:
      'Eleve a sua carreira e a competitividade da sua organização com a ALHAN Consultoria e Prestação de Serviços, Lda.',
    accentColor: '#38BDF8',
    bgGlow: 'from-[#0E4D92] via-[#07233B] to-[#03111E]',
    isoPillars: [
      { code: 'PRESENCIAL', label: 'Luanda · Kilamba', color: '#38BDF8' },
      { code: 'ONLINE / HÍBRIDA', label: 'Todo o País', color: '#34D399' },
      { code: 'ALHAN SGI', label: 'Excelência ISO', color: '#C8A951' },
    ],
  },
];

const AnimatedCounterNumber: React.FC<{
  target: number | null;
  validated: boolean;
  suffix?: string;
}> = ({ target, validated, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    if (!validated || target === null || target === undefined) {
      setDisplayValue(0);
      return;
    }
    let start = 0;
    const end = Math.max(0, Number(target));
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const durationMs = 1100;
    const stepTime = Math.max(20, Math.floor(durationMs / Math.max(1, end)));
    const timer = window.setInterval(() => {
      start += Math.max(1, Math.ceil(end / 28));
      if (start >= end) {
        setDisplayValue(end);
        window.clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);

    return () => window.clearInterval(timer);
  }, [target, validated]);

  if (!validated || target === null || target === undefined) {
    return (
      <span className="inline-block text-sm sm:text-base font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2.5 py-1 rounded-lg">
        Dados em actualização
      </span>
    );
  }

  return (
    <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight tabular-nums">
      {displayValue.toLocaleString('pt-AO')}
      {suffix}
    </span>
  );
};

export const Hero: React.FC = () => {
  const { dynamicCounters, courses } = useApp();
  const [viewMode, setViewMode] = useState<'cartoon3d' | 'gallery'>('cartoon3d');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleVideoSound = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      videoRef.current.volume = 1;
      videoRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (viewMode !== 'cartoon3d' || !isPlaying) return;
    const timer = window.setInterval(() => {
      setSceneIndex((prev) => (prev + 1) % CARTOON_3D_SCENES.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [viewMode, isPlaying]);

  useEffect(() => {
    if (viewMode !== 'gallery') return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [viewMode]);

  const currentScene = CARTOON_3D_SCENES[sceneIndex];
  const currentSlide = HERO_SLIDES[slideIndex];

  const prevItem = () => {
    if (viewMode === 'cartoon3d') {
      setSceneIndex((prev) => (prev - 1 + CARTOON_3D_SCENES.length) % CARTOON_3D_SCENES.length);
    } else {
      setSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    }
  };

  const nextItem = () => {
    if (viewMode === 'cartoon3d') {
      setSceneIndex((prev) => (prev + 1) % CARTOON_3D_SCENES.length);
    } else {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }
  };

  return (
    <section
      aria-label="Destaque Principal — Formação em Sistema de Gestão Integrado (SGI)"
      className="relative overflow-hidden bg-[#041525] text-white border-b border-white/10"
    >
      {/* Ambient Background Lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-[#0E7490]/25 blur-[110px]" />
        <div className="absolute top-1/4 right-0 w-[32rem] h-[32rem] rounded-full bg-[#C8A951]/15 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 sm:py-12 lg:py-14">
        {/* Main Split Layout: ALL TEXT ON LEFT COLUMN | CLEAN ANIMATION & GALLERY IMAGES ON RIGHT COLUMN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT COLUMN (5 cols): Institutional Copy + Active Scene / Gallery Text Description */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            <div>
              {/* Kicker Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-[#C8A951]/40 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#C8A951] shrink-0" />
                <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#E5C97B]">
                  ACADEMIA & CONSULTORIA ALHAN · LUANDA, ANGOLA
                </span>
              </div>

              {/* Primary Headline */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.35rem] font-extrabold tracking-tight leading-[1.14] text-white mb-3.5">
                Formação em{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#34D399] to-[#C8A951]">
                  Sistema de Gestão Integrado (SGI)
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed mb-5 font-normal">
                Qualidade, Ambiente e Segurança e Saúde no Trabalho para profissionais e empresas que procuram excelência, conformidade normativa e evolução profissional em Angola.
              </p>

              {/* 3 ISO Pillar Cards */}
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="rounded-xl bg-white/[0.05] border border-sky-400/25 p-2.5">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs mb-0.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>ISO 9001</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">Gestão da Qualidade</p>
                </div>
                <div className="rounded-xl bg-white/[0.05] border border-emerald-400/25 p-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-0.5">
                    <Leaf className="w-4 h-4 shrink-0" />
                    <span>ISO 14001</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">Gestão Ambiental</p>
                </div>
                <div className="rounded-xl bg-white/[0.05] border border-amber-400/25 p-2.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-0.5">
                    <HardHat className="w-4 h-4 shrink-0" />
                    <span>ISO 45001</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">Segurança e SST</p>
                </div>
              </div>

              {/* Dedicated Side Info Box for Current Animation Scene or Current Class Gallery Photo (Moved OFF the image/animation!) */}
              <div className="rounded-2xl bg-[#07223B]/90 border border-white/15 p-4 sm:p-5 shadow-lg mb-5">
                {viewMode === 'cartoon3d' ? (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30">
                        <Sparkles className="w-3 h-3" />
                        {currentScene.step} · {currentScene.badge}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-white leading-snug mb-1.5">
                      {currentScene.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                      {currentScene.narration}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentScene.isoPillars.map((pillar) => (
                        <span
                          key={pillar.code}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] font-bold text-white"
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: pillar.color }}
                          />
                          <span>{pillar.code}:</span>
                          <span className="text-slate-300 font-medium">{pillar.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#C8A951]/20 text-[#E5C97B] border border-[#C8A951]/40">
                        <Images className="w-3 h-3" />
                        GALERIA DE TURMAS ({slideIndex + 1}/{HERO_SLIDES.length}) · {currentSlide.thumbnailLabel}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-white leading-snug mb-1.5">
                      {currentSlide.caption}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                      {currentSlide.description}
                    </p>
                    <div className="space-y-1">
                      {currentSlide.highlights.slice(0, 2).map((hl, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Primary & Secondary CTAs */}
            <div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                <Link
                  to="/academia"
                  className="inline-flex items-center justify-center gap-2.5 bg-[#C8A951] hover:bg-[#d8b960] text-[#041525] font-extrabold px-5 py-3.5 rounded-xl text-sm shadow-lg shadow-[#C8A951]/20 transition-all"
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>Inscrever-se na Formação SGI</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>
                <Link
                  to="/portefolio-impacto"
                  className="inline-flex items-center justify-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold px-4 py-3.5 rounded-xl text-sm border border-white/15 transition-all"
                >
                  <BarChart3 className="w-4 h-4 text-[#38BDF8]" />
                  <span>Portefólio & Impacto</span>
                </Link>
              </div>

              {/* Trust Strip */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 border-t border-white/10 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Certificado PDF enviado pelo ADM
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  Pagamento em 2 Parcelas
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 cols): CLEAN VISUAL STAGE (NO TEXT OVERLAYS ON TOP OF ANIMATION OR PHOTOS) */}
          <div className="lg:col-span-7">
            {/* Mode Switcher Bar (Above Stage) */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-[#072038] border border-white/10 rounded-2xl p-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode('cartoon3d')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    viewMode === 'cartoon3d'
                      ? 'bg-[#C8A951] text-[#041525] shadow-sm'
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Animação Cartoon 3D SGI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('gallery')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    viewMode === 'gallery'
                      ? 'bg-[#C8A951] text-[#041525] shadow-sm'
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <Images className="w-3.5 h-3.5" />
                  <span>Galeria de Turmas</span>
                </button>
              </div>

              {viewMode === 'cartoon3d' && (
                <button
                  type="button"
                  onClick={toggleVideoSound}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all"
                  title={isMuted ? 'Activar Som do Vídeo' : 'Silenciar Vídeo'}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                      <span>Activar Som</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Som Activo</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Clean Visual Stage Frame — Zero Text Overlays Covering the Media */}
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#0A2742] to-[#041322] shadow-2xl">
              {viewMode === 'cartoon3d' ? (
                <div
                  className={`relative aspect-[16/10] sm:aspect-[16/9] w-full bg-gradient-to-br ${currentScene.bgGlow} transition-colors duration-700 overflow-hidden`}
                >
                  {/* Official Cartoon 3D SGI Training Video */}
                  <video
                    ref={videoRef}
                    src="/assets/aistudio/video_de_sistema_de_gest_o_integrado_e5ec4131.mp4"
                    poster="/assets/aistudio/Forma__o_HSE__Turma_de_Novembro_eeeafbbb.png"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Subtle 3D Vector Stage Accent (Non-textual) */}
                  <svg
                    viewBox="0 0 800 500"
                    className="w-full h-full object-cover opacity-20 mix-blend-screen pointer-events-none"
                    role="img"
                    aria-label={currentScene.title}
                  >
                    <defs>
                      <radialGradient id="floorGlow" cx="50%" cy="78%" r="48%">
                        <stop offset="0%" stopColor={currentScene.accentColor} stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#041525" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <ellipse cx="400" cy="405" rx="340" ry="65" fill="url(#floorGlow)" />
                  </svg>
                </div>
              ) : (
                /* Clean Class Gallery Mode — Full Image With ZERO Text Overlays On Top */
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#041525]">
                  <img
                    src={currentSlide.image}
                    alt={currentSlide.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Clean Playback & Scene/Slide Controls Bar BELOW the Visual Stage */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 bg-[#072038] border border-white/10 rounded-2xl px-4 py-2.5">
              {/* Scene / Slide Dots & Thumbnails */}
              {viewMode === 'cartoon3d' ? (
                <div className="flex items-center gap-2">
                  {CARTOON_3D_SCENES.map((sc, idx) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setSceneIndex(idx)}
                      aria-label={`Cena ${idx + 1}`}
                      className={`h-2.5 rounded-full transition-all ${
                        idx === sceneIndex
                          ? 'w-8 bg-[#C8A951]'
                          : 'w-2.5 bg-white/25 hover:bg-white/50'
                      }`}
                    />
                  ))}
                  <span className="text-[11px] font-bold text-slate-300 ml-2">
                    Cena {sceneIndex + 1} de {CARTOON_3D_SCENES.length}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {HERO_SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSlideIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        idx === slideIndex
                          ? 'bg-[#C8A951] text-[#041525]'
                          : 'bg-white/5 text-slate-300 hover:bg-white/15'
                      }`}
                    >
                      {s.thumbnailLabel}
                    </button>
                  ))}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1.5 ml-auto">
                {viewMode === 'cartoon3d' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsPlaying((p) => !p)}
                      aria-label={isPlaying ? 'Pausar animação' : 'Reproduzir animação'}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSceneIndex(0);
                        setIsPlaying(true);
                      }}
                      aria-label="Reiniciar animação"
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={prevItem}
                  aria-label="Anterior"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextItem}
                  aria-label="Seguinte"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC COUNTER BAR (CONTADOR DINÂMICO DE FORMAÇÃO E IMPLEMENTAÇÕES SGI) */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#E5C97B]">
                Contador Dinâmico de Impacto & Execução Técnica ({dynamicCounters.referencePeriod})
              </span>
            </div>
            <Link
              to="/relatorio-impacto"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-sky-200 transition-colors"
            >
              <span>Ver Relatório Público de Impacto e Fontes Documentais</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Counter 1: Formandos Formados / Certificados */}
            <div className="rounded-2xl bg-[#072038]/90 border border-white/10 p-4 sm:p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Formandos Formados
                </p>
                <AnimatedCounterNumber
                  target={dynamicCounters.trainedStudentsCount}
                  validated={dynamicCounters.trainedStudentsValidated}
                />
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2" title={dynamicCounters.trainedStudentsSource}>
                  {dynamicCounters.trainedStudentsValidated
                    ? 'Certificados validados pela Administração'
                    : 'Em validação documental'}
                </p>
              </div>
            </div>

            {/* Counter 2: Implementações SGI Feitas */}
            <div className="rounded-2xl bg-[#072038]/90 border border-white/10 p-4 sm:p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Implementações Feitas
                </p>
                <AnimatedCounterNumber
                  target={dynamicCounters.sgiImplementationsCount}
                  validated={dynamicCounters.sgiImplementationsValidated}
                />
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2" title={dynamicCounters.sgiImplementationsSource}>
                  {dynamicCounters.sgiImplementationsValidated
                    ? 'Projectos ISO / SGI executados'
                    : 'Em validação documental'}
                </p>
              </div>
            </div>

            {/* Counter 3: Cursos & Especialidades Ministrados */}
            <div className="rounded-2xl bg-[#072038]/90 border border-white/10 p-4 sm:p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#C8A951]/15 border border-[#C8A951]/30 flex items-center justify-center text-[#E5C97B] shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Cursos & Especialidades
                </p>
                <AnimatedCounterNumber
                  target={dynamicCounters.coursesDeliveredCount ?? courses.length}
                  validated={dynamicCounters.coursesDeliveredValidated}
                />
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Programas activos na Academia ALHAN
                </p>
              </div>
            </div>

            {/* Counter 4: Empresas & Parcerias */}
            <div className="rounded-2xl bg-[#072038]/90 border border-white/10 p-4 sm:p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Empresas & Parceiros
                </p>
                <AnimatedCounterNumber
                  target={dynamicCounters.partnerCompaniesCount}
                  validated={dynamicCounters.partnerCompaniesValidated}
                />
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Entidades corporativas e parceiras
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
