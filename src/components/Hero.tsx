import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Video,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  RotateCcw,
  Award,
} from 'lucide-react';
import { COMPANY_INFO, HERO_SLIDES } from '../data/initialData';

interface MotivationalScene {
  id: string;
  durationSec: number;
  badge: string;
  title: string;
  subtitle: string;
  narration: string;
  image: string;
  pillars: string[];
}

const SGI_MOTIVATIONAL_SCENES: MotivationalScene[] = [
  {
    id: 'scene-1',
    durationSec: 9,
    badge: 'CAPÍTULO 01 · VISÃO E LIDERANÇA EM SGI',
    title: 'Transforme o Seu Futuro Profissional com a Formação em SGI',
    subtitle: 'ISO 9001 (Qualidade) · ISO 14001 (Ambiente) · ISO 45001 (Segurança e Saúde no Trabalho)',
    narration:
      'Em Angola e no mundo, as empresas líderes procuram profissionais capazes de integrar Qualidade, Ambiente e Segurança num único Sistema de Gestão Integrado.',
    image: '/assets/aistudio/sgi_764c3f34.jpg',
    pillars: ['Qualidade ISO 9001', 'Ambiente ISO 14001', 'Segurança ISO 45001'],
  },
  {
    id: 'scene-2',
    durationSec: 9,
    badge: 'CAPÍTULO 02 · CULTURA DE SEGURANÇA E EXCELÊNCIA (HSE)',
    title: 'Promova Ambientes de Trabalho Seguros, Saudáveis e Sustentáveis',
    subtitle: 'Formação Prática em HSE e Sistemas Integrados para Indústria, Petróleo & Gás, Construção e Serviços',
    narration:
      'Invista em conhecimento e transforme o futuro da sua empresa! Com a formação prática da ALHAN, domina a gestão de riscos, auditorias internas ISO 19011 e conformidade legal.',
    image: '/assets/aistudio/Forma__o_HSE__Turma_de_Novembro_eeeafbbb.png',
    pillars: ['Zero Acidentes', 'Controlo Operacional', 'Sustentabilidade'],
  },
  {
    id: 'scene-3',
    durationSec: 9,
    badge: 'CAPÍTULO 03 · APLICAÇÃO PRÁTICA NO TERRENO EM ANGOLA',
    title: 'Metodologia Prática com Professores Experientes e Material Didático Completo',
    subtitle: 'Aulas Online via Microsoft Teams, Videoaulas Gravadas e Turmas Presenciais em Luanda',
    narration:
      'Aprenda com consultores e auditores seniores que actuam directamente no mercado angolano. Receba manuais, matrizes, procedimentos e acompanhamento passo a passo.',
    image: '/assets/aistudio/imagm_da_alha_2a7ca3f2.png',
    pillars: ['Aulas Online & Presenciais', 'Material Didático PDF', 'Casos Reais em Angola'],
  },
  {
    id: 'scene-4',
    durationSec: 9,
    badge: 'CAPÍTULO 04 · CERTIFICAÇÃO RECONHECIDA COM QR CODE',
    title: 'Destaque-se no Mercado com Certificado Oficial ALHAN Validado por QR Code',
    subtitle: 'Inscreva-se Hoje na Formação SGI e Faça Parte da Nova Geração de Gestores e Auditores',
    narration:
      'Ao concluir a sua formação na ALHAN, recebe o seu Certificado Oficial em PDF com validação pública por QR Code. Inscreva-se já e impulsione a sua carreira!',
    image: '/assets/aistudio/iso_a9fe34ed.jpg',
    pillars: ['Certificado PDF Oficial', 'Validação QR Pública', 'Inscrição Directa Activa'],
  },
];

export const Hero: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Hero Media Mode: 'image' (SGI Training Image Showcase) or 'video' (Motivational Video about SGI Training)
  const [mediaMode, setMediaMode] = useState<'image' | 'video'>('image');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneElapsed, setSceneElapsed] = useState(0);
  const lastSpokenSceneRef = useRef<number | null>(null);

  const slideCount = HERO_SLIDES.length;
  const currentSlide = HERO_SLIDES[activeIndex] || HERO_SLIDES[0];
  const currentScene = SGI_MOTIVATIONAL_SCENES[sceneIndex] || SGI_MOTIVATIONAL_SCENES[0];
  const totalVideoDuration = SGI_MOTIVATIONAL_SCENES.reduce((acc, s) => acc + s.durationSec, 0);
  const elapsedBeforeCurrent = SGI_MOTIVATIONAL_SCENES.slice(0, sceneIndex).reduce((acc, s) => acc + s.durationSec, 0);
  const overallProgressPct = Math.min(
    100,
    Math.round(((elapsedBeforeCurrent + sceneElapsed) / totalVideoDuration) * 100)
  );

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (isPaused || mediaMode === 'video') return;
    const timer = setInterval(nextSlide, 6500);
    return () => clearInterval(timer);
  }, [isPaused, mediaMode, nextSlide]);

  // Voice narration synthesis for motivational video when unmuted
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (mediaMode !== 'video' || !videoPlaying || videoMuted) {
      window.speechSynthesis.cancel();
      return;
    }

    if (lastSpokenSceneRef.current !== sceneIndex) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentScene.narration);
      utterance.lang = 'pt-PT';
      utterance.rate = 1.02;
      window.speechSynthesis.speak(utterance);
      lastSpokenSceneRef.current = sceneIndex;
    }
  }, [mediaMode, videoPlaying, videoMuted, sceneIndex, currentScene.narration]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Motivational Video timeline ticker
  useEffect(() => {
    if (mediaMode !== 'video' || !videoPlaying) return;
    const interval = setInterval(() => {
      setSceneElapsed((prev) => {
        if (prev + 0.25 >= currentScene.durationSec) {
          if (sceneIndex + 1 < SGI_MOTIVATIONAL_SCENES.length) {
            setSceneIndex((s) => s + 1);
            return 0;
          } else {
            setVideoPlaying(false);
            lastSpokenSceneRef.current = null;
            return currentScene.durationSec;
          }
        }
        return prev + 0.25;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [mediaMode, videoPlaying, sceneIndex, currentScene.durationSec]);

  // Keyboard navigation for accessibility on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mediaMode === 'image') {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mediaMode, nextSlide, prevSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || mediaMode === 'video') return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 45) {
      if (deltaX < 0) nextSlide();
      else prevSlide();
    }
    setTouchStartX(null);
  };

  const startMotivationalVideo = () => {
    setMediaMode('video');
    if (sceneIndex === SGI_MOTIVATIONAL_SCENES.length - 1 && sceneElapsed >= currentScene.durationSec) {
      setSceneIndex(0);
      setSceneElapsed(0);
    }
    lastSpokenSceneRef.current = null;
    setVideoPlaying(true);
  };

  const restartMotivationalVideo = () => {
    setSceneIndex(0);
    setSceneElapsed(0);
    lastSpokenSceneRef.current = null;
    setVideoPlaying(true);
  };

  const whatsappUrl = `https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
    COMPANY_INFO.whatsappDefaultMessage
  )}`;

  return (
    <section
      aria-label="Destaque Principal ALHAN – Formação SGI e Vídeo Motivacional"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative bg-gradient-to-b from-[#061A2D] via-[#071B2F] to-[#061A2D] text-[#F5F9FC] py-7 sm:py-12 lg:py-16 border-b border-white/10 overflow-hidden"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: Highlighted Typography, Key Value Points & CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-between">
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
              <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white mt-3 leading-[1.15]">
                <span>{currentSlide.headlinePrefix}</span>
                <span className="text-[#19B5FE] underline decoration-[#0077C8]/60 decoration-2 underline-offset-8">
                  {currentSlide.headlineHighlight}
                </span>
                <span>{currentSlide.headlineSuffix}</span>
              </h1>

              {/* Lead Paragraph */}
              <p className="text-sm sm:text-base text-[#F5F9FC]/85 mt-4 leading-relaxed max-w-2xl">
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

              {/* Primary, Video Motivational & Consultant CTAs */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Link
                  to={currentSlide.primaryCta.to}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors whitespace-nowrap min-h-[44px]"
                >
                  <span>{currentSlide.primaryCta.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (mediaMode === 'video' && videoPlaying) {
                      setVideoPlaying(false);
                    } else {
                      startMotivationalVideo();
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#061A2D] font-extrabold text-xs sm:text-sm shadow-sm transition-colors whitespace-nowrap min-h-[44px]"
                >
                  <Video className="w-4 h-4" />
                  <span>
                    {mediaMode === 'video' && videoPlaying
                      ? 'Pausar Vídeo Motivacional SGI'
                      : 'Assistir Vídeo Motivacional SGI'}
                  </span>
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#19B5FE]/40 text-[#19B5FE] hover:bg-[#19B5FE]/10 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Falar no WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Bottom Carousel Controls & Progress Indicators */}
            <div className="mt-7 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setMediaMode('image');
                      setVideoPlaying(false);
                      setActiveIndex(idx);
                    }}
                    aria-label={`Seleccionar destaque ${idx + 1}: ${s.thumbnailLabel}`}
                    className={`h-2.5 rounded-full transition-all ${
                      activeIndex === idx && mediaMode === 'image'
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-[#9AA6AE] hover:text-white transition-colors min-h-[38px]"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-[#19B5FE]" /> : <Pause className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isPaused ? 'Em pausa' : 'Automático'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaMode('image');
                    prevSlide();
                  }}
                  aria-label="Imagem anterior"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaMode('image');
                    nextSlide();
                  }}
                  aria-label="Próxima imagem"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: SGI Training Image & Motivational Video Stage */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-3.5">
            {/* Segmented Mode Switcher: Imagem de Formação SGI vs Vídeo Motivacional SGI */}
            <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/15 p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMediaMode('image');
                  setVideoPlaying(false);
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-colors min-h-[40px] ${
                  mediaMode === 'image'
                    ? 'bg-[#0077C8] text-white shadow-sm'
                    : 'text-[#F5F9FC]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Imagem Formação SGI & HSE</span>
              </button>
              <button
                type="button"
                onClick={startMotivationalVideo}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-colors min-h-[40px] ${
                  mediaMode === 'video'
                    ? 'bg-amber-500 text-[#061A2D] shadow-sm'
                    : 'text-amber-300 hover:bg-white/5'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Vídeo Motivacional Formação SGI</span>
              </button>
            </div>

            {mediaMode === 'image' ? (
              /* Active Image Gallery Stage with Quick Play Motivational Video Button */
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#061A2D] aspect-[4/3] sm:aspect-[16/10] shadow-2xl">
                <img
                  key={currentSlide.image}
                  src={currentSlide.image}
                  alt={currentSlide.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061A2D] via-[#061A2D]/25 to-transparent" />

                {/* Top Brand Lockup inside Stage */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 bg-white/95 text-[#061A2D] px-3 py-1.5 rounded-lg shadow-md">
                    <img
                      src={COMPANY_INFO.logoPath}
                      alt="Logotipo ALHAN"
                      referrerPolicy="no-referrer"
                      className="h-6 w-6 object-contain"
                    />
                    <span className="text-[11px] font-extrabold tracking-tight">ALHAN – FORMAÇÃO SGI</span>
                  </div>
                  <button
                    type="button"
                    onClick={startMotivationalVideo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#061A2D] text-[11px] font-extrabold shadow-lg transition-transform hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Ver Vídeo Motivacional SGI</span>
                  </button>
                </div>

                {/* Bottom Caption & Location Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
                  <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                    {currentSlide.caption}
                  </p>
                  <p className="text-[11px] text-[#F5F9FC]/80 mt-0.5">
                    {COMPANY_INFO.address} · Domínio Oficial: {COMPANY_INFO.website}
                  </p>
                </div>
              </div>
            ) : (
              /* Interactive Motivational SGI Training Video Player */
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/60 bg-[#041220] aspect-[4/3] sm:aspect-[16/10] shadow-2xl flex flex-col justify-between">
                {/* Animated Background Visual Frame */}
                <img
                  key={currentScene.image}
                  src={currentScene.image}
                  alt={currentScene.title}
                  referrerPolicy="no-referrer"
                  className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 ${
                    videoPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#041220] via-[#041220]/75 to-[#041220]/40" />

                {/* Video Header Bar */}
                <div className="relative z-10 p-3.5 sm:p-4 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500 text-[#061A2D] text-[11px] font-extrabold">
                    <Video className="w-3.5 h-3.5" />
                    <span>VÍDEO MOTIVACIONAL · FORMAÇÃO SGI ALHAN</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setVideoMuted((m) => !m)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[11px] font-semibold border border-white/15"
                    >
                      {videoMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{videoMuted ? 'Activar Voz' : 'Narração Activa'}</span>
                    </button>
                  </div>
                </div>

                {/* Center Motivational Message & Pillars */}
                <div className="relative z-10 px-4 sm:px-6 my-auto space-y-2.5">
                  <p className="text-[11px] font-mono-tabular font-bold text-amber-400 tracking-wider">
                    {currentScene.badge}
                  </p>
                  <h2 className="text-base sm:text-xl lg:text-2xl font-extrabold text-white leading-snug">
                    {currentScene.title}
                  </h2>
                  <p className="text-xs text-[#19B5FE] font-semibold">
                    {currentScene.subtitle}
                  </p>

                  {/* Subtitle / Narration Box */}
                  <div className="p-3 rounded-xl bg-black/65 border border-white/15 backdrop-blur-sm">
                    <p className="text-xs sm:text-sm text-[#F5F9FC] italic leading-relaxed">
                      “{currentScene.narration}”
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentScene.pillars.map((pillar) => (
                      <span
                        key={pillar}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-md"
                      >
                        <Award className="w-3 h-3" />
                        <span>{pillar}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Video Player Controls & Chapter Progress Bar */}
                <div className="relative z-10 p-3.5 sm:p-4 bg-[#041220]/95 border-t border-white/15 space-y-2.5">
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${overallProgressPct}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVideoPlaying((p) => !p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#061A2D] text-xs font-extrabold"
                      >
                        {videoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{videoPlaying ? 'Pausar' : 'Reproduzir'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={restartMotivationalVideo}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reiniciar</span>
                      </button>
                    </div>

                    {/* Chapter Selectors */}
                    <div className="flex items-center gap-1">
                      {SGI_MOTIVATIONAL_SCENES.map((sc, idx) => (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            setSceneIndex(idx);
                            setSceneElapsed(0);
                            lastSpokenSceneRef.current = null;
                            setVideoPlaying(true);
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-mono-tabular font-bold transition-colors ${
                            sceneIndex === idx
                              ? 'bg-[#0077C8] text-white'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                        >
                          Cap. {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Thumbnail Gallery Strip (Responsive corporate gallery + video trigger) */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-[#9AA6AE] mb-2">
                <span className="font-semibold text-[#F5F9FC]">
                   Destaques de Formação SGI & Vídeo Motivacional
                </span>
                <span className="font-mono-tabular">
                  {mediaMode === 'video'
                    ? `Vídeo Motivacional SGI (Cap. ${sceneIndex + 1}/4)`
                    : `${activeIndex + 1} de ${slideCount} imagens`}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {HERO_SLIDES.slice(0, 5).map((item, idx) => {
                  const isActive = mediaMode === 'image' && activeIndex === idx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setMediaMode('image');
                        setVideoPlaying(false);
                        setActiveIndex(idx);
                      }}
                      className={`group relative rounded-xl overflow-hidden border text-left transition-all focus:outline-none ${
                        isActive
                          ? 'border-[#19B5FE] ring-2 ring-[#19B5FE]/40 scale-[1.02]'
                          : 'border-white/15 opacity-75 hover:opacity-100'
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
                {/* 6th slot: Motivational Video Thumbnail */}
                <button
                  type="button"
                  onClick={startMotivationalVideo}
                  className={`group relative rounded-xl overflow-hidden border text-left transition-all focus:outline-none ${
                    mediaMode === 'video'
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[1.02]'
                      : 'border-amber-400/40 opacity-90 hover:opacity-100'
                  }`}
                >
                  <div className="aspect-[4/3] w-full bg-[#061A2D] relative flex items-center justify-center">
                    <img
                      src="/assets/aistudio/sgi_764c3f34.jpg"
                      alt="Vídeo Motivacional SGI"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-7 h-7 rounded-full bg-amber-500 text-[#061A2D] flex items-center justify-center shadow">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </span>
                    </div>
                  </div>
                  <div className="p-1.5 bg-amber-500 text-[#061A2D]">
                    <p className="text-[10px] font-extrabold truncate">Vídeo SGI</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width KPI Strip below Hero split */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono-tabular text-[#19B5FE]">10</p>
            <p className="text-xs text-[#9AA6AE] mt-1">Programas de Formação SGI & HSE</p>
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
            <p className="text-2xl sm:text-3xl font-extrabold font-mono-tabular text-[#19B5FE]">100% Online & Presencial</p>
            <p className="text-xs text-[#9AA6AE] mt-1">Certificados PDF com QR Code em Angola</p>
          </div>
        </div>
      </div>
    </section>
  );
};
