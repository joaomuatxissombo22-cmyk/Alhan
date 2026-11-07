import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  X,
  ShieldCheck,
  MessageCircle,
  LogOut,
  ChevronRight,
  Lock,
  UserPlus,
  Home,
  BookOpen,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COMPANY_INFO, UserRole } from '../data/initialData';
import { PWAInstallButton, OfflineIndicator } from './PWAInstallBanner';
import { SgiAnnouncementModal } from './SgiAnnouncementModal';

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin Operacional',
  PROFESSOR: 'Professor / Formador',
  ALUNO: 'Aluno (LMS)',
  CLIENTE_EMPRESARIAL: 'Cliente Empresarial ISO',
};

const ROLE_PORTAL_PATHS: Record<UserRole, string> = {
  SUPER_ADMIN: '/gestao-alhan-sgi',
  ADMIN: '/gestao-alhan-sgi',
  PROFESSOR: '/professor',
  ALUNO: '/aluno',
  CLIENTE_EMPRESARIAL: '/empresa',
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    notifications,
    markNotificationRead,
    logout,
    pushPermission,
    requestPushPermission,
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isHostingerAdminSubdomain =
    typeof window !== 'undefined' &&
    (window.location.hostname.startsWith('admin.') ||
      window.location.hostname.startsWith('gestao.'));

  const isSeparateAdminRoute =
    isHostingerAdminSubdomain ||
    location.pathname.startsWith('/gestao-alhan-sgi') ||
    location.pathname.startsWith('/painel-admin') ||
    location.pathname.startsWith('/admin');

  const isPortalRoute =
    location.pathname.startsWith('/aluno') ||
    location.pathname.startsWith('/professor') ||
    location.pathname.startsWith('/empresa') ||
    isSeparateAdminRoute;

  const whatsappUrl = `https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
    COMPANY_INFO.whatsappDefaultMessage
  )}`;

  // Standalone Private Administrative Backoffice Layout (completely separated from the public website)
  if (isSeparateAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F9FC] text-[#061A2D]">
        <header className="sticky top-0 z-40 bg-[#061A2D] text-[#F5F9FC] border-b border-white/10">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <img
                src={COMPANY_INFO.logoPath}
                alt="Logotipo ALHAN"
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-md bg-white p-0.5 object-contain shrink-0"
              />
              <div>
                <p className="text-sm sm:text-base font-extrabold text-white leading-tight">
                  ALHAN – SGI · Painel Administrativo Central
                </p>
                <p className="text-[11px] text-[#19B5FE] font-mono-tabular">
                  Ambiente Backoffice Separado do Site Público · Acesso Restrito
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#F5F9FC] transition-colors whitespace-nowrap"
              >
                Ver Site Público →
              </Link>
              {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <button
                  onClick={() => {
                    logout();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair do Admin</span>
                </button>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <OfflineIndicator />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F9FC] text-[#061A2D]">
      {/* Primary Top Bar following strict 3-zone contract */}
      <header className="sticky top-0 z-40 bg-[#061A2D] text-[#F5F9FC] border-b border-white/10">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
          {/* Zone 1: Brand title, one line */}
          <Link
            to="/"
            className="flex items-center gap-3 text-base sm:text-lg font-bold tracking-tight text-[#F5F9FC] whitespace-nowrap shrink-0"
          >
            <img
              src={COMPANY_INFO.logoPath}
              alt="Logotipo ALHAN – Sistema de Gestão Integrado"
              referrerPolicy="no-referrer"
              className="h-9 w-9 rounded-md bg-white p-0.5 object-contain shrink-0"
            />
            <span>ALHAN – SGI</span>
          </Link>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#F5F9FC]/85">
            <Link
              to="/quem-somos"
              className={`hover:text-[#19B5FE] transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/quem-somos' ? 'text-[#19B5FE] underline underline-offset-8' : ''
              }`}
            >
              Quem Somos
            </Link>
            <Link
              to="/formacoes"
              className={`hover:text-[#19B5FE] transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/formacoes' ? 'text-[#19B5FE] underline underline-offset-8' : ''
              }`}
            >
              Formações
            </Link>
            <Link
              to="/consultoria-iso"
              className={`hover:text-[#19B5FE] transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/consultoria-iso' ? 'text-[#19B5FE] underline underline-offset-8' : ''
              }`}
            >
              Consultoria ISO
            </Link>
            <Link
              to="/normas-iso"
              className={`hover:text-[#19B5FE] transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/normas-iso' ? 'text-[#19B5FE] underline underline-offset-8' : ''
              }`}
            >
              Normas ISO
            </Link>
            <Link
              to="/consultar-certificado"
              className={`hover:text-[#19B5FE] transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/consultar-certificado' ? 'text-[#19B5FE] underline underline-offset-8' : ''
              }`}
            >
              Validar Certificado
            </Link>
          </nav>

          {/* Zone 3: Primary Action + Mobile Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/solicitar-diagnostico"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0077C8] hover:bg-[#008FEA] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Solicitar Diagnóstico
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menu de navegação"
              className="lg:hidden p-2 rounded-lg text-[#F5F9FC] hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Workspace & Institutional Utility Bar (below top bar) */}
      <div className="bg-[#071B2F] text-[#F5F9FC]/90 border-b border-white/10 text-xs">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
          {/* Secondary public links & WhatsApp */}
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/como-funciona" className="hover:text-[#19B5FE] transition-colors whitespace-nowrap">
              Como Funciona
            </Link>
            <span aria-hidden="true" className="text-white/25">·</span>
            <Link to="/empresas" className="hover:text-[#19B5FE] transition-colors whitespace-nowrap">
              Empresas e Cases
            </Link>
            <span aria-hidden="true" className="text-white/25">·</span>
            <Link to="/parceiros" className="hover:text-[#19B5FE] transition-colors whitespace-nowrap">
              Parceiros
            </Link>
            <span aria-hidden="true" className="text-white/25">·</span>
            <Link to="/contactos" className="hover:text-[#19B5FE] transition-colors whitespace-nowrap">
              Contactos
            </Link>
            <span aria-hidden="true" className="text-white/25">·</span>
            <Link to="/politica-pagamentos" className="hover:text-[#19B5FE] font-semibold text-[#19B5FE] transition-colors whitespace-nowrap">
              Política de Pagamentos
            </Link>
            <span aria-hidden="true" className="text-white/25">·</span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Falar no WhatsApp
            </a>
            <span aria-hidden="true" className="text-white/25 hidden sm:inline">·</span>
            <a
              href={COMPANY_INFO.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-[#19B5FE] hover:underline font-medium whitespace-nowrap"
            >
              Facebook Oficial
            </a>
            <span aria-hidden="true" className="text-white/25 hidden sm:inline">·</span>
            <a
              href={COMPANY_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-[#19B5FE] hover:underline font-medium whitespace-nowrap"
            >
              Instagram @{COMPANY_INFO.instagram}
            </a>
          </div>

          {/* Right side: Private Portal Access, Auth, Notifications & PWA */}
          <div className="flex flex-wrap items-center gap-2.5">
            <PWAInstallButton />

            {user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' ? (
              <div className="flex items-center gap-2">
                <Link
                  to={ROLE_PORTAL_PATHS[user.role]}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0077C8] border border-[#19B5FE]/40 text-white hover:bg-[#008FEA] transition-colors font-semibold whitespace-nowrap"
                >
                  <Lock className="w-3 h-3" />
                  <span>Meu Painel ({ROLE_LABELS[user.role]})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Terminar Sessão"
                  className="p-1.5 rounded-md hover:bg-white/10 text-[#9AA6AE] hover:text-white transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/professor"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[#19B5FE] font-semibold transition-colors whitespace-nowrap"
                >
                  <span>Painel do Professor</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[#F5F9FC] font-semibold transition-colors whitespace-nowrap"
                >
                  <Lock className="w-3 h-3 text-[#19B5FE]" />
                  <span>Iniciar Sessão</span>
                </Link>
                <Link
                  to="/registo"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0077C8] hover:bg-[#008FEA] text-white font-semibold transition-colors whitespace-nowrap"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Cadastrar (Aluno / Professor / Empresa)</span>
                </Link>
              </div>
            )}

            {/* Notifications button */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notificações da plataforma"
                className="relative p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#F5F9FC] transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="-top-1 -right-1 absolute px-1 min-w-[16px] h-4 rounded-full bg-[#008FEA] text-[10px] font-mono-tabular font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white text-[#061A2D] shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-[#061A2D] text-white flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold">Centro de Notificações ALHAN</h3>
                      <p className="text-[11px] text-[#9AA6AE]">Alertas em tempo real de cursos e projectos ISO</p>
                    </div>
                    <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {pushPermission === 'default' && (
                    <div className="px-4 py-2.5 bg-[#F5F9FC] border-b border-slate-200 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-600">Receber notificações push no navegador?</span>
                      <button
                        onClick={requestPushPermission}
                        className="px-2.5 py-1 rounded bg-[#0077C8] text-white text-[11px] font-semibold hover:bg-[#008FEA] whitespace-nowrap"
                      >
                        Activar Push
                      </button>
                    </div>
                  )}

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3.5 text-left cursor-pointer hover:bg-slate-50 transition-colors ${
                          !n.read ? 'bg-[#F5F9FC]' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-[#0077C8]">{n.category}</span>
                          <span className="font-mono-tabular">{new Date(n.createdAt).toLocaleDateString('pt-AO')}</span>
                        </div>
                        <p className="text-xs font-bold text-[#061A2D] mt-0.5">{n.title}</p>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer (Full Navigation on Mobile Devices) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#061A2D] text-[#F5F9FC] border-b border-white/15 px-4 py-4 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-extrabold text-[#19B5FE] uppercase tracking-wider">
              Menu Principal ALHAN – SGI (alhan.pro)
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg bg-white/10 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 min-h-[42px] flex items-center">Início</Link>
            <Link to="/formacoes" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-[#0077C8]/30 border border-[#19B5FE]/30 text-white min-h-[42px] flex items-center">Formações SGI & HSE</Link>
            <Link to="/quem-somos" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 min-h-[42px] flex items-center">Quem Somos</Link>
            <Link to="/consultoria-iso" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 min-h-[42px] flex items-center">Consultoria ISO</Link>
            <Link to="/normas-iso" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 min-h-[42px] flex items-center">Normas ISO</Link>
            <Link to="/consultar-certificado" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 min-h-[42px] flex items-center">Validar Certificado</Link>
            <Link to="/aluno" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-white/5 text-[#19B5FE] min-h-[42px] flex items-center">Painel do Aluno</Link>
            <Link to="/professor" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-white/5 text-amber-300 min-h-[42px] flex items-center">Painel do Professor</Link>
            <Link to="/empresa" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-white/5 text-[#19B5FE] min-h-[42px] flex items-center">Painel Empresa ISO</Link>
            <Link to="/politica-pagamentos" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-white/5 text-emerald-300 min-h-[42px] flex items-center">Política de Pagamentos</Link>
            <Link to="/como-funciona" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 min-h-[42px] flex items-center">Como Funciona & FAQ</Link>
            <Link to="/empresas" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 min-h-[42px] flex items-center">Empresas e Cases</Link>
            <Link to="/solicitar-diagnostico" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 min-h-[42px] flex items-center">Solicitar Diagnóstico</Link>
            <Link to="/contactos" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 min-h-[42px] flex items-center">Contactos</Link>
          </div>
          <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
            {user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' ? (
              <Link
                to={ROLE_PORTAL_PATHS[user.role]}
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#0077C8] text-white text-xs font-bold min-h-[44px]"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Aceder ao Meu Painel ({ROLE_LABELS[user.role]})</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-white/10 text-white text-xs font-bold min-h-[44px]"
                >
                  <Lock className="w-3.5 h-3.5 text-[#19B5FE]" />
                  <span>Iniciar Sessão</span>
                </Link>
                <Link
                  to="/registo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#0077C8] text-white text-xs font-bold min-h-[44px]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Cadastrar Conta</span>
                </Link>
              </>
            )}
          </div>
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <a
              href={COMPANY_INFO.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/10 text-[#19B5FE] font-semibold"
            >
              Facebook Oficial Alhan
            </a>
            <a
              href={COMPANY_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/10 text-[#19B5FE] font-semibold"
            >
              Instagram @{COMPANY_INFO.instagram}
            </a>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Mandatory ISO Certification Notice Bar */}
      <section className="bg-[#071B2F] text-[#F5F9FC] border-t border-white/10 py-6">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 max-w-4xl">
            <ShieldCheck className="w-6 h-6 text-[#19B5FE] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#19B5FE] tracking-wide">
                Aviso Institucional sobre Consultoria, Certificação e Acreditação
              </p>
              <p className="text-xs text-[#F5F9FC]/85 mt-1 leading-relaxed">
                {COMPANY_INFO.certificationDisclaimer}
              </p>
            </div>
          </div>
          <Link
            to="/aviso-certificacao"
            className="text-xs font-semibold text-[#19B5FE] hover:underline whitespace-nowrap shrink-0"
          >
            Ler Aviso Completo →
          </Link>
        </div>
      </section>

      {/* Corporate Footer */}
      <footer className="bg-[#061A2D] text-[#F5F9FC] border-t border-white/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1: Company Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={COMPANY_INFO.logoPath}
                  alt="Logotipo ALHAN"
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-lg bg-white p-1 object-contain"
                />
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{COMPANY_INFO.brandName}</p>
                  <p className="text-[11px] text-[#9AA6AE] mt-0.5">NIF: {COMPANY_INFO.nif}</p>
                </div>
              </div>
              <p className="text-xs text-[#9AA6AE] leading-relaxed">
                {COMPANY_INFO.legalName}
              </p>
              <div className="text-xs text-[#F5F9FC]/85 space-y-1 pt-1">
                <p>Endereço: {COMPANY_INFO.address}</p>
                <p>Email: <a href={`mailto:${COMPANY_INFO.email}`} className="text-[#19B5FE] hover:underline">{COMPANY_INFO.email}</a></p>
                <p>Telefone / WhatsApp: <span className="font-mono-tabular">{COMPANY_INFO.phone}</span></p>
                <p>Website: {COMPANY_INFO.website}</p>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h3 className="text-xs font-bold text-white mb-3">Navegação Institucional</h3>
              <ul className="space-y-2 text-xs text-[#9AA6AE]">
                <li><Link to="/" className="hover:text-white transition-colors">Início</Link></li>
                <li><Link to="/quem-somos" className="hover:text-white transition-colors">Quem Somos</Link></li>
                <li><Link to="/formacoes" className="hover:text-white transition-colors">Nossas Formações</Link></li>
                <li><Link to="/consultoria-iso" className="hover:text-white transition-colors">Consultoria ISO</Link></li>
                <li><Link to="/normas-iso" className="hover:text-white transition-colors">Normas ISO</Link></li>
                <li><Link to="/como-funciona" className="hover:text-white transition-colors">Como Funciona</Link></li>
                <li><Link to="/empresas" className="hover:text-white transition-colors">Empresas e Cases</Link></li>
                <li><Link to="/parceiros" className="hover:text-white transition-colors">Parceiros</Link></li>
              </ul>
            </div>

            {/* Col 3: Portals & Certificates */}
            <div>
              <h3 className="text-xs font-bold text-white mb-3">Plataforma & Painéis de Acesso</h3>
              <ul className="space-y-2 text-xs text-[#9AA6AE]">
                <li><Link to="/consultar-certificado" className="hover:text-white transition-colors">Consultar Certificado (QR / B.I.)</Link></li>
                <li><Link to="/aluno" className="hover:text-white transition-colors">Painel do Aluno (Academia LMS)</Link></li>
                <li><Link to="/professor" className="hover:text-white transition-colors">Painel do Professor / Formador (Inscrição & Acesso)</Link></li>
                <li><Link to="/empresa" className="hover:text-white transition-colors">Painel do Cliente Empresarial (Consultoria ISO)</Link></li>
                <li><Link to="/registo" className="hover:text-white transition-colors">Criar Conta (Aluno / Professor / Empresa)</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Iniciar Sessão</Link></li>
              </ul>
            </div>

            {/* Col 4: Legal & Social */}
            <div>
              <h3 className="text-xs font-bold text-white mb-3">Páginas Legais e Redes Sociais</h3>
              <ul className="space-y-2 text-xs text-[#9AA6AE]">
                <li><Link to="/termos" className="hover:text-white transition-colors">Termos e Condições</Link></li>
                <li><Link to="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
                <li><Link to="/politica-pagamentos" className="hover:text-white transition-colors">Política de Pagamentos e Reembolsos</Link></li>
                <li><Link to="/politica-formacao" className="hover:text-white transition-colors">Política de Formação</Link></li>
                <li><Link to="/aviso-certificacao" className="hover:text-white transition-colors">Aviso sobre Certificação ISO</Link></li>
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5 text-xs">
                <p className="text-white font-semibold">Canais Oficiais:</p>
                <p className="text-[#9AA6AE]">
                  Instagram:{' '}
                  <a
                    href={COMPANY_INFO.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#19B5FE] hover:underline font-medium"
                  >
                    @{COMPANY_INFO.instagram}
                  </a>
                </p>
                <p className="text-[#9AA6AE]">
                  Facebook:{' '}
                  <a
                    href={COMPANY_INFO.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#19B5FE] hover:underline font-medium"
                  >
                    {COMPANY_INFO.facebookLabel}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 pb-16 lg:pb-0 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9AA6AE]">
            <p>© {new Date().getFullYear()} {COMPANY_INFO.legalName} · Todos os direitos reservados.</p>
            <p>Luanda – Angola · NIF {COMPANY_INFO.nif} · {COMPANY_INFO.website}</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button on all public pages */}
      {!isPortalRoute && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar a Alhan no WhatsApp"
          className="fixed bottom-20 lg:bottom-5 right-4 lg:right-5 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 text-xs font-bold shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">WhatsApp Alhan</span>
        </a>
      )}

      {/* Fixed Mobile Bottom Navigation Bar (Thumb-Zone Ergonomics for Smartphones) */}
      <nav
        aria-label="Menu rápido para dispositivos móveis"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#061A2D]/95 backdrop-blur-md border-t border-white/15 text-[#F5F9FC]"
      >
        <div className="grid grid-cols-5 items-center h-14 px-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex flex-col items-center justify-center h-full text-[10px] font-semibold transition-colors ${
              location.pathname === '/' ? 'text-[#19B5FE]' : 'text-[#9AA6AE] hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="mt-0.5 truncate">Início</span>
          </Link>
          <Link
            to="/formacoes"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex flex-col items-center justify-center h-full text-[10px] font-semibold transition-colors ${
              location.pathname.startsWith('/formacoes') ? 'text-[#19B5FE]' : 'text-[#9AA6AE] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="mt-0.5 truncate">Formações</span>
          </Link>
          <Link
            to="/consultar-certificado"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex flex-col items-center justify-center h-full text-[10px] font-semibold transition-colors ${
              location.pathname.startsWith('/consultar-certificado') || location.pathname.startsWith('/certificados')
                ? 'text-[#19B5FE]'
                : 'text-[#9AA6AE] hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span className="mt-0.5 truncate">Certificado</span>
          </Link>
          <Link
            to={
              user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN'
                ? ROLE_PORTAL_PATHS[user.role]
                : '/aluno'
            }
            onClick={() => setMobileMenuOpen(false)}
            className={`flex flex-col items-center justify-center h-full text-[10px] font-semibold transition-colors ${
              location.pathname.startsWith('/aluno') ||
              location.pathname.startsWith('/professor') ||
              location.pathname.startsWith('/empresa')
                ? 'text-[#19B5FE]'
                : 'text-[#9AA6AE] hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span className="mt-0.5 truncate">Painéis</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((prev) => !prev);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center h-full text-[10px] font-semibold transition-colors ${
              mobileMenuOpen ? 'text-[#19B5FE]' : 'text-[#9AA6AE] hover:text-white'
            }`}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="mt-0.5 truncate">Menu</span>
          </button>
        </div>
      </nav>

      {/* Official Announcement Modal for HSE Training */}
      <SgiAnnouncementModal />

      <OfflineIndicator />
    </div>
  );
};
