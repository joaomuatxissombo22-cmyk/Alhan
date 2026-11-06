/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import {
  HomePage,
  AboutPage,
  ConsultoriaIsoPage,
  NormasIsoPage,
  HowItWorksPage,
  CompaniesCasesPage,
  PartnersPage,
  LegalPage,
} from './pages/PublicPages';
import {
  CoursesCatalogPage,
  VerifyCertificatePage,
  DiagnosticAndContactPage,
  AuthPages,
} from './pages/CoursesAndCertificatesPages';
import {
  StudentPortal,
  ProfessorPortal,
  CompanyPortal,
  AdminPortal,
} from './pages/PortalsPages';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quem-somos" element={<AboutPage />} />
            <Route path="/formacoes" element={<CoursesCatalogPage />} />
            <Route path="/consultoria-iso" element={<ConsultoriaIsoPage />} />
            <Route path="/normas-iso" element={<NormasIsoPage />} />
            <Route path="/empresas" element={<CompaniesCasesPage />} />
            <Route path="/cases" element={<CompaniesCasesPage />} />
            <Route path="/parceiros" element={<PartnersPage />} />
            <Route path="/certificados" element={<VerifyCertificatePage />} />
            <Route path="/consultar-certificado" element={<VerifyCertificatePage />} />
            <Route path="/como-funciona" element={<HowItWorksPage />} />
            <Route path="/solicitar-diagnostico" element={<DiagnosticAndContactPage mode="diagnostico" />} />
            <Route path="/contactos" element={<DiagnosticAndContactPage mode="contactos" />} />
            <Route path="/login" element={<AuthPages initialMode="login" />} />
            <Route path="/registo" element={<AuthPages initialMode="registo" />} />
            <Route path="/aluno" element={<StudentPortal />} />
            <Route path="/professor" element={<ProfessorPortal />} />
            <Route path="/empresa" element={<CompanyPortal />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/termos" element={<LegalPage section="termos" />} />
            <Route path="/privacidade" element={<LegalPage section="privacidade" />} />
            <Route path="/politica-pagamentos" element={<LegalPage section="pagamentos" />} />
            <Route path="/politica-formacao" element={<LegalPage section="formacao" />} />
            <Route path="/aviso-certificacao" element={<LegalPage section="certificacao" />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
