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
  ShieldCheck,
  Leaf,
  Settings,
  FileCheck2,
  Sparkles,
  Upload,
} from 'lucide-react';
import { COMPANY_INFO, HERO_SLIDES } from '../data/initialData';

interface Cartoon3DScene {
  id: string;
  durationSec: number;
  badge: string;
  title: string;
  subtitle: string;
  narration: string;
  image: string;
  highlightPillar: 'ISO 9001' | 'ISO 14001' | 'ISO 45001' | 'CERTIFICADO SGI';
  pillars: string[];
}

// 20-second loop (4 chapters x 5 seconds = 20s, matching 15–25s requirement in Module 6.3)
const SGI_CARTOON_3D_SCENES: Cartoon3DScene[] = [
  {
    id: 'cartoon-scene-1',
    durationSec: 5,
    badge: 'CENA 01 · FORMAÇÃO CORPORATIVA EM CARTOON 3D (SGI)',
    title: 'Formador e Profissionais em Sala de Formação Executiva SGI',
    subtitle: 'Integração Estratégica das Normas ISO 9001, ISO 14001 e ISO 45001',
    narration:
      'Transformamos conhecimento em competência. Desenvolvemos profissionais e organizações através de formações especializadas em Sistemas de Gestão Integrados.',
    image: '/assets/aistudio/hero_sgi_cartoon_3d.jpg',
    highlightPillar: 'ISO 9001',
    pillars: ['ISO 9001 — Qualidade', 'Liderança Executiva', 'Processos Auditáveis'],
  },
  {
    id: 'cartoon-scene-2',
    durationSec: 5,
    badge: 'CENA 02 · GESTÃO AMBIENTAL E SUSTENTABILIDADE (ISO 14001)',
    title: 'Controlo Ambiental e Desempenho Sustentável nas Organizações',
    subtitle: 'Formação Prática para Indústria, Energia, Logística e Serviços em Angola',
    narration:
      'Com a ISO 14001, capacitamos equipas para gerir aspectos ambientais, cumprir requisitos legais e promover a sustentabilidade empresarial.',
    image: '/assets/aistudio/hero_sgi_cartoon_3d.jpg',
    highlightPillar: 'ISO 14001',
    pillars: ['ISO 14001 — Ambiente', 'Conformidade Legal', 'Gestão de Riscos'],
  },
  {
    id: 'cartoon-scene-3',
    durationSec: 5,
    badge: 'CENA 03 · SEGURANÇA E SAÚDE NO TRABALHO (ISO 45001 & HSE)',
    title: 'Prevenção de Riscos Laborais e Cultura de Zero Acidentes',
    subtitle: 'Ambientes de Trabalho Seguros, Saudáveis e de Alta Performance',
    narration:
      'A norma ISO 45001 protege o capital humano da organização através do controlo operacional e prevenção activa de incidentes.',
    image: '/assets/aistudio/Forma__o_HSE__Turma_de_Novembro_eeeafbbb.png',
    highlightPillar: 'ISO 45001',
    pillars: ['ISO 45001 — SST', 'Prevenção HSE', 'Cultura de Segurança'],
  },
  {
    id: 'cartoon-scene-4',
    durationSec: 5,
    badge: 'CENA 04 · DOCUMENTOS ISO E CERTIFICADO OFICIAL ALHAN',
    title: 'Certificação Profissional Validada na Plataforma ALHAN',
    subtitle: 'Emissão e Entrega Digital de Certificados em PDF no Painel do Formando',
    narration:
      'Ao concluir a formação na ALHAN, o formando solicita e recebe o seu certificado oficial em PDF directamente no seu painel.',
    image: '/assets/aistudio/hero_sgi_cartoon_3d.jpg',
    highlightPillar: 'CERTIFICADO SGI',
    pillars: ['Documentos ISO', 'Certificado Oficial PDF', 'Validação QR ALHAN'],
  },
];

export const Hero: React.FC = () => {
  // Respect prefers-reduced-motion accessibility setting (Module 6.3)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.('change', listener);
    return () => mq.removeEventListener?.('change', listener);
  }, []);

  // Default to Animated Cartoon 3D SGI Hero mode (Module 6)
  const [mediaMode, setMediaMode] = useState<'cartoon3d' | 'gallery'>('cartoon3d');
  const [videoPlaying, setVideoPlaying] = useState(true);
  // Module 6.3: Sem som activo por defeito
  const [videoMuted, setVideoMuted] = useState(true);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneElapsed, setSceneElapsed] = useState(0);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [nativeVideoAvailable, setNativeVideoAvailable] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isGalleryPaused, setIsGalleryPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSpokenSceneRef = useRef<number | null>(null);

  const slideCount = HERO_SLIDES.length;
  const currentSlide = HERO_SLIDES[activeIndex] || HERO_SLIDES[0];
  const currentScene = SGI_CARTOON_3D_SCENES[sceneIndex] || SGI_CARTOON_3D_SCENES[0];
  const totalLoopDuration = SGI_CARTOON_3D_SCENES.reduce((acc, s) => acc + s.durationSec, 0); // 20s
  const elapsedBeforeCurrent = SGI_CARTOON_3D_SCENES.slice(0, sceneIndex).reduce(
    (acc, s) => acc + s.durationSec,
    0
  );
  const overallProgressPct = Math.min(
    100,
    Math.round(((elapsedBeforeCurrent + sceneElapsed) / totalLoopDuration) * 100)
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      setVideoPlaying(false);
    }
  }, [prefersReducedMotion]);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (isGalleryPaused || mediaMode !== 'gallery' || prefersReducedMotion) return;
    const timer = setInterval(nextSlide, 6500);
    return () => clearInterval(timer);
  }, [isGalleryPaused, mediaMode, prefersReducedMotion, nextSlide]);

  // Continuous 20-second loop for Cartoon 3D SGI animation (Module 6.3)
  useEffect(() => {
    if (mediaMode !== 'cartoon3d' || !videoPlaying || customVideoUrl) return;
    const interval = setInterval(() => {
      setSceneElapsed((prev) => {
        if (prev + 0.25 >= currentScene.durationSec) {
          setSceneIndex((s) => (s + 1) % SGI_CARTOON_3D_SCENES.length);
          return 0;
        }
        return prev + 0.25;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [mediaMode, videoPlaying, customVideoUrl, currentScene.durationSec]);

  // Optional Portuguese narration ONLY when user explicitly unmutes (Muted by default per 6.3)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (mediaMode !== 'cartoon3d' || !videoPlaying || videoMuted || customVideoUrl) {
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
  }, [mediaMode, videoPlaying, videoMuted, customVideoUrl, sceneIndex, currentScene.narration]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 45) {
      if (mediaMode === 'gallery') {
        if (deltaX < 0) nextSlide();
        else prevSlide();
      } else {
        setSceneIndex((prev) =>
          deltaX < 0
            ? (prev + 1) % SGI_CARTOON_3D_SCENES.length
            : (prev - 1 + SGI_CARTOON_3D_SCENES.length) % SGI_CARTOON_3D_SCENES.length
        );
        setSceneElapsed(0);
      }
    }
    setTouchStartX(null);
  };

  const togglePlayPause = () => {
    if (videoRef.current && (customVideoUrl || nativeVideoAvailable)) {
      if (videoPlaying) {
        videoRef.current.pause();
        setVideoPlaying(false);
      } else {
        videoRef.current.play().catch(() => null);
        setVideoPlaying(true);
      }
      return;
    }
    setVideoPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoMuted;
    }
    setVideoMuted((prev) => !prev);
  };

  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomVideoUrl(url);
    setMediaMode('cartoon3d');
    setVideoPlaying(true);
  };

  const whatsappUrl = `https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
    COMPANY_INFO.whatsappDefaultMessage
  )}`;

  return (
    <section
      aria-label="Hero Principal Animado SGI — ALHAN Consultoria e Prestação de Serviços"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative bg-gradient-to-b from-[#051525] via-[#061A2D] to-[#071D33] text-[#F5F9FC] py-8 sm:py-12 lg:py-16 border-b border-white/10 overflow-hidden"
    >
      {/* Subtle Ambient Corporate Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-1/4 w-[480px] h-[480px] rounded-full bg-[#0077C8]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-10 w-[400px] h-[400px] rounded-full bg-[#19B5FE]/10 blur-3xl"
      />

      <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Exact Module 6.2 Copy, Three ISO Pillars & Official CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Kicker Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-[#19B5FE]/30 text-xs font-bold text-[#19B5FE] tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>SISTEMA DE GESTÃO INTEGRADO (SGI) · FORMAÇÃO & CONSULTORIA ISO</span>
              </div>

              {/* Exact Headline required by Module 6.2 */}
              <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white mt-4 leading-[1.14]">
                TRANSFORMAMOS CONHECIMENTO EM{' '}
                <span className="text-[#19B5FE] underline decoration-[#0077C8]/70 decoration-2 underline-offset-8">
                  COMPETÊNCIA.
                </span>
              </h1>

              {/* Exact Subtitle required by Module 6.2 */}
              <p className="text-sm sm:text-base text-[#F5F9FC]/90 mt-4 leading-relaxed max-w-2xl">
                Desenvolvemos profissionais e organizações através de formações especializadas e implementação de Sistemas de Gestão Integrados, alinhados com as normas internacionais ISO.
              </p>

              {/* Three Highlighted Pillars required by Module 6.2 */}
              <div className="mt-6 space-y-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#9AA6AE]">
                  Os Três Pilares do Sistema de Gestão Integrado (SGI):
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  <div
                    className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all ${
                      mediaMode === 'cartoon3d' && currentScene.highlightPillar === 'ISO 9001'
                        ? 'bg-[#0077C8]/25 border-[#19B5FE] shadow-md'
                        : 'bg-white/[0.04] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-white">
                        ISO 9001 — Gestão da Qualidade.
                      </p>
                      <p className="text-[11px] text-[#9AA6AE]">
                        Excelência nos processos, satisfação do cliente e melhoria contínua.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all ${
                      mediaMode === 'cartoon3d' && currentScene.highlightPillar === 'ISO 14001'
                        ? 'bg-emerald-900/30 border-emerald-400 shadow-md'
                        : 'bg-white/[0.04] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-white">
                        ISO 14001 — Gestão Ambiental.
                      </p>
                      <p className="text-[11px] text-[#9AA6AE]">
                        Sustentabilidade operacional, controlo de impactos e conformidade ambiental.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all ${
                      mediaMode === 'cartoon3d' && currentScene.highlightPillar === 'ISO 45001'
                        ? 'bg-[#0077C8]/25 border-[#19B5FE] shadow-md'
                        : 'bg-white/[0.04] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#19B5FE]/20 border border-[#19B5FE]/40 flex items-center justify-center text-[#19B5FE] shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-white">
                        ISO 45001 — Segurança e Saúde no Trabalho.
                      </p>
                      <p className="text-[11px] text-[#9AA6AE]">
                        Prevenção de riscos ocupacionais, ambientes seguros e protecção da vida.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exact Primary & Secondary Buttons required by Module 6.2 */}
              <div className="flex flex-wrap items-center gap-3 mt-7">
                <Link
                  to="/formacoes"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0077C8] hover:bg-[#008FEA] text-white font-extrabold text-xs sm:text-sm shadow-lg transition-colors whitespace-nowrap min-h-[46px]"
                >
                  <span>EXPLORAR FORMAÇÕES</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/quem-somos"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs sm:text-sm transition-colors whitespace-nowrap min-h-[46px]"
                >
                  <span>CONHECER A ALHAN</span>
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-[#19B5FE]/40 text-[#19B5FE] hover:bg-[#19B5FE]/10 font-bold text-xs sm:text-sm transition-colors whitespace-nowrap min-h-[46px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Directo</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Cartoon 3D SGI Animated Stage & Video Loop (Module 6.1 & 6.3) */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-3.5">
            {/* Mode Switcher: Animação Cartoon 3D SGI vs Galeria Institucional */}
            <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/15 p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMediaMode('cartoon3d');
                  if (!prefersReducedMotion) setVideoPlaying(true);
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-extrabold transition-colors min-h-[40px] ${
                  mediaMode === 'cartoon3d'
                    ? 'bg-[#0077C8] text-white shadow-sm'
                    : 'text-[#F5F9FC]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <Video className="w-4 h-4 text-[#19B5FE]" />
                <span>Animação Cartoon 3D · Formação SGI</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaMode('gallery');
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-extrabold transition-colors min-h-[40px] ${
                  mediaMode === 'gallery'
                    ? 'bg-[#0077C8] text-white shadow-sm'
                    : 'text-[#F5F9FC]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Galeria de Turmas & Destaques ({slideCount})</span>
              </button>
            </div>

            {mediaMode === 'cartoon3d' ? (
              /* Cartoon 3D Animated Video / Interactive Stage (15-25s Loop, Muted by default, Accessible Controls) */
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#19B5FE]/40 bg-[#041220] aspect-[4/3] sm:aspect-[16/10] shadow-2xl flex flex-col justify-between group">
                {/* Native HTML5 Video Loop supporting .mp4 and .webm with fallback to Animated 3D Cartoon Stage */}
                <video
                  ref={videoRef}
                  autoPlay={!prefersReducedMotion}
                  loop
                  muted={videoMuted}
                  playsInline
                  poster="/assets/aistudio/hero_sgi_cartoon_3d.jpg"
                  onCanPlay={() => setNativeVideoAvailable(true)}
                  onError={() => setNativeVideoAvailable(false)}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    customVideoUrl || nativeVideoAvailable ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {customVideoUrl ? (
                    <source src={customVideoUrl} />
                  ) : (
                    <>
                      <source src="/assets/video/hero-sgi-cartoon-3d.webm" type="video/webm" />
                      <source src="/assets/video/hero-sgi-cartoon-3d.mp4" type="video/mp4" />
                    </>
                  )}
                </video>

                {/* High-Resolution 3D Cartoon Corporate Illustration with Ken-Burns & Interactive Holographic SGI Elements */}
                {!customVideoUrl && !nativeVideoAvailable && (
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      key={currentScene.id}
                      src={currentScene.image}
                      alt="Formação Corporativa em Sistema de Gestão Integrado (SGI) — Estilo Cartoon 3D ALHAN"
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover object-center transition-transform duration-[5000ms] ease-out ${
                        videoPlaying && !prefersReducedMotion ? 'scale-110' : 'scale-100'
                      }`}
                    />
                  </div>
                )}

                {/* Elegant Dark Readability Overlay (Module 6.3) */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#04101E] via-[#04101E]/55 to-[#04101E]/25 pointer-events-none" />

                {/* Floating Animated 3D Cartoon SGI Badges inside Stage */}
                <div className="relative z-10 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 bg-[#061A2D]/90 backdrop-blur-md border border-[#19B5FE]/40 text-white px-3 py-1.5 rounded-lg shadow-lg">
                    <img
                      src={COMPANY_INFO.logoPath}
                      alt="Logotipo ALHAN"
                      referrerPolicy="no-referrer"
                      className="h-5 w-5 rounded bg-white p-0.5 object-contain"
                    />
                    <span className="text-[11px] font-extrabold tracking-wide text-[#19B5FE]">
                      CARTOON 3D · FORMAÇÃO SGI ALHAN
                    </span>
                  </div>

                  {/* Accessibility Audio & Video File Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={videoMuted ? 'Activar som da animação' : 'Silenciar animação'}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#061A2D]/90 hover:bg-[#061A2D] text-white text-[11px] font-bold border border-white/20 transition-colors"
                    >
                      {videoMuted ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                          <span>Sem Som (Padrão)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Som Activo</span>
                        </>
                      )}
                    </button>

                    <label
                      title="Carregar ficheiro de vídeo .mp4 ou .webm personalizado"
                      className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold border border-white/15 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#19B5FE]" />
                      <span className="hidden sm:inline">.MP4 / .WEBM</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={handleLocalVideoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Animated SGI Floating Nodes Overlay */}
                <div className="relative z-10 px-4 sm:px-5 my-auto flex flex-col justify-end">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    <div
                      className={`p-2 rounded-lg backdrop-blur-md border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                        currentScene.highlightPillar === 'ISO 9001'
                          ? 'bg-amber-500/90 text-[#061A2D] border-amber-300 scale-[1.03]'
                          : 'bg-[#061A2D]/80 text-white border-white/15'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Qualidade 9001</span>
                    </div>
                    <div
                      className={`p-2 rounded-lg backdrop-blur-md border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                        currentScene.highlightPillar === 'ISO 14001'
                          ? 'bg-emerald-500/90 text-[#061A2D] border-emerald-300 scale-[1.03]'
                          : 'bg-[#061A2D]/80 text-white border-white/15'
                      }`}
                    >
                      <Leaf className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Ambiente 14001</span>
                    </div>
                    <div
                      className={`p-2 rounded-lg backdrop-blur-md border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                        currentScene.highlightPillar === 'ISO 45001'
                          ? 'bg-[#19B5FE] text-[#061A2D] border-white scale-[1.03]'
                          : 'bg-[#061A2D]/80 text-white border-white/15'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">SST 45001</span>
                    </div>
                    <div
                      className={`p-2 rounded-lg backdrop-blur-md border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                        currentScene.highlightPillar === 'CERTIFICADO SGI'
                          ? 'bg-amber-400 text-[#061A2D] border-white scale-[1.03]'
                          : 'bg-[#061A2D]/80 text-white border-white/15'
                      }`}
                    >
                      <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Certificado PDF</span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl bg-[#061A2D]/85 border border-white/15 backdrop-blur-md">
                    <p className="text-[10px] font-mono-tabular font-extrabold text-[#19B5FE] uppercase tracking-wider">
                      {currentScene.badge}
                    </p>
                    <h2 className="text-sm sm:text-base font-extrabold text-white mt-0.5 leading-snug">
                      {currentScene.title}
                    </h2>
                    <p className="text-xs text-[#F5F9FC]/85 mt-1 leading-relaxed">
                      {currentScene.narration}
                    </p>
                  </div>
                </div>

                {/* Bottom Accessibility Control Bar & 20s Loop Timeline */}
                <div className="relative z-10 p-3 sm:p-3.5 bg-[#04101E]/95 border-t border-white/15 space-y-2">
                  <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#19B5FE] transition-all duration-300"
                      style={{ width: `${overallProgressPct}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={togglePlayPause}
                        aria-label={videoPlaying ? 'Pausar animação SGI' : 'Reproduzir animação SGI'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-xs font-extrabold transition-colors"
                      >
                        {videoPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pausar</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Reproduzir</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSceneIndex(0);
                          setSceneElapsed(0);
                          setVideoPlaying(true);
                        }}
                        aria-label="Reiniciar loop de animação"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reiniciar (20s Loop)</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {SGI_CARTOON_3D_SCENES.map((sc, idx) => (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            setSceneIndex(idx);
                            setSceneElapsed(0);
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-mono-tabular font-bold transition-colors ${
                            sceneIndex === idx
                              ? 'bg-[#19B5FE] text-[#061A2D]'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                        >
                          0{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Secondary Institutional Image Gallery Stage */
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#061A2D] aspect-[4/3] sm:aspect-[16/10] shadow-2xl">
                <img
                  key={currentSlide.image}
                  src={currentSlide.image}
                  alt={currentSlide.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061A2D] via-[#061A2D]/25 to-transparent" />

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
                    onClick={() => {
                      setMediaMode('cartoon3d');
                      setVideoPlaying(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0077C8] hover:bg-[#008FEA] text-white text-[11px] font-extrabold shadow-lg"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Voltar ao Cartoon 3D SGI</span>
                  </button>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {currentSlide.caption}
                    </p>
                    <p className="text-[11px] text-[#F5F9FC]/80 mt-0.5">
                      {COMPANY_INFO.address} · {COMPANY_INFO.website}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsGalleryPaused((p) => !p)}
                      aria-label={isGalleryPaused ? 'Retomar galeria' : 'Pausar galeria'}
                      className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white border border-white/15"
                    >
                      {isGalleryPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={prevSlide}
                      aria-label="Imagem anterior"
                      className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white border border-white/15"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Próxima imagem"
                      className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white border border-white/15"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Scene / Gallery Strip */}
            <div className="grid grid-cols-4 gap-2">
              {SGI_CARTOON_3D_SCENES.map((sc, idx) => {
                const active = mediaMode === 'cartoon3d' && sceneIndex === idx;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setMediaMode('cartoon3d');
                      setSceneIndex(idx);
                      setSceneElapsed(0);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      active
                        ? 'bg-[#0077C8]/30 border-[#19B5FE] ring-1 ring-[#19B5FE]/50'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07]'
                    }`}
                  >
                    <p className="text-[10px] font-mono-tabular font-extrabold text-[#19B5FE]">
                      CENA 0{idx + 1}
                    </p>
                    <p className="text-[11px] font-bold text-white truncate mt-0.5">
                      {sc.highlightPillar}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Full-width KPI Strip below Hero split */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono-tabular text-[#19B5FE]">
              ISO 9001
            </p>
            <p className="text-xs text-[#9AA6AE] mt-1">Sistema de Gestão da Qualidade</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono-tabular text-emerald-400">
              ISO 14001
            </p>
            <p className="text-xs text-[#9AA6AE] mt-1">Sistema de Gestão Ambiental</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono-tabular text-amber-400">
              ISO 45001
            </p>
            <p className="text-xs text-[#9AA6AE] mt-1">Segurança e Saúde no Trabalho</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono-tabular text-[#19B5FE]">
              100% Digital
            </p>
            <p className="text-xs text-[#9AA6AE] mt-1">Certificados PDF no Painel do Formando</p>
          </div>
        </div>
      </div>
    </section>
  );
};
