import { CertificateItem } from '../data/initialData';

/**
 * Generates a real, standards-compliant PDF document (application/pdf) as a base64 Data URL
 * for an ALHAN – Sistema de Gestão Integrado certificate when no external PDF file was uploaded,
 * ensuring the student can ALWAYS download a valid .pdf file (< 2MB) directly in their Student Portal.
 */
function sanitizePdfText(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[()\\]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ');
}

export function generateOfficialCertificatePdfDataUrl(cert: {
  code: string;
  studentName: string;
  studentBI?: string;
  courseTitle: string;
  modality?: string;
  workloadHours: number;
  grade?: string;
  issuedDate: string;
  responsibleName?: string;
}): string {
  const name = sanitizePdfText(cert.studentName.toUpperCase());
  const bi = sanitizePdfText(cert.studentBI || 'REGISTADO NO SISTEMA ALHAN');
  const course = sanitizePdfText(cert.courseTitle);
  const modality = sanitizePdfText(cert.modality || 'Online / Presencial');
  const hours = `${cert.workloadHours || 40} Horas`;
  const grade = sanitizePdfText(cert.grade || 'Aprovado com Distincao');
  const dateStr = sanitizePdfText(cert.issuedDate || new Date().toISOString().split('T')[0]);
  const code = sanitizePdfText(cert.code);
  const resp = sanitizePdfText(cert.responsibleName || 'Direccao Pedagogica - ALHAN SGI');

  // Split long course titles across 2 lines if needed
  const courseLine1 = course.slice(0, 68);
  const courseLine2 = course.length > 68 ? course.slice(68, 136) : '';

  const contentStream = [
    'q',
    // Dark Navy Outer Border (#061A2D)
    '0.024 0.102 0.176 rg',
    '20 20 802 555 re f',
    // Inner White Certificate Canvas
    '0.97 0.98 0.99 rg',
    '32 32 778 531 re f',
    // Gold/Cyan Accent Frame (#0077C8)
    '0.0 0.467 0.784 RG',
    '2 w',
    '42 42 758 511 re S',
    // Top Header Banner
    '0.024 0.102 0.176 rg',
    '42 475 758 78 re f',
    'BT',
    '/F1 18 Tf',
    '1 1 1 rg',
    '210 522 Td',
    '(ALHAN - SISTEMA DE GESTAO INTEGRADO) Tj',
    '/F2 10 Tf',
    '0.6 0.85 1 rg',
    '-25 -18 Td',
    '(ALHAN CONSULTORIA E PRESTACAO DE SERVICOS, LDA  |  NIF: 5003128261  |  LUANDA - ANGOLA) Tj',
    'ET',
    // Main Title
    'BT',
    '/F1 26 Tf',
    '0.024 0.102 0.176 rg',
    '215 425 Td',
    '(CERTIFICADO DE CONCLUSAO) Tj',
    'ET',
    // Subtitle
    'BT',
    '/F2 12 Tf',
    '0.25 0.32 0.38 rg',
    '245 395 Td',
    '(Certifica-se, para os devidos efeitos profissionais e institucionais, que:) Tj',
    'ET',
    // Student Name
    'BT',
    '/F1 22 Tf',
    '0.0 0.467 0.784 rg',
    '140 355 Td',
    `(${name}) Tj`,
    'ET',
    // BI & Details
    'BT',
    '/F2 11 Tf',
    '0.2 0.25 0.3 rg',
    '140 328 Td',
    `(Portador(a) de Identificacao / B.I.: ${bi}) Tj`,
    '0 -22 Td',
    '(Concluiu com aproveitamento a formacao profissional especializada em:) Tj',
    'ET',
    // Course Title
    'BT',
    '/F1 15 Tf',
    '0.024 0.102 0.176 rg',
    '140 278 Td',
    `(${courseLine1}) Tj`,
    courseLine2 ? `0 -18 Td (${courseLine2}) Tj` : '',
    'ET',
    // Metadata row
    'BT',
    '/F1 11 Tf',
    '0.1 0.15 0.2 rg',
    '140 228 Td',
    `(Carga Horaria: ${hours}   |   Modalidade: ${modality}   |   Classificacao: ${grade}) Tj`,
    '0 -20 Td',
    `(Data de Emissao: ${dateStr}   |   Codigo Oficial QR: ${code}) Tj`,
    'ET',
    // Signatures & Verification Footer
    '0.0 0.467 0.784 RG',
    '1 w',
    '140 130 m 360 130 l S',
    '480 130 m 700 130 l S',
    'BT',
    '/F1 10 Tf',
    '0.024 0.102 0.176 rg',
    '160 114 Td',
    `(${resp}) Tj`,
    '335 0 Td',
    '(Validacao Publica: https://alhan.pro/consultar-certificado) Tj',
    '/F2 9 Tf',
    '0.35 0.4 0.45 rg',
    '-335 -35 Td',
    `(Documento Oficial Emitido pelo Painel Administrativo ALHAN SGI - Codigo de Autenticidade: ${code}) Tj`,
    'ET',
    'Q',
  ]
    .filter(Boolean)
    .join('\n');

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj'
  );
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
  objects.push(
    `6 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj`
  );

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const base64 = btoa(pdf);
  return `data:application/pdf;base64,${base64}`;
}

export function downloadCertificatePdf(cert: CertificateItem): void {
  const fileUrl =
    cert.certificateFileUrl && cert.certificateFileUrl.trim().length > 0
      ? cert.certificateFileUrl
      : generateOfficialCertificatePdfDataUrl(cert);
  const fileName =
    cert.certificateFileName && cert.certificateFileName.trim().length > 0
      ? cert.certificateFileName.endsWith('.pdf')
        ? cert.certificateFileName
        : `${cert.certificateFileName}.pdf`
      : `Certificado_ALHAN_${cert.code}_${cert.studentName.replace(/\s+/g, '_')}.pdf`;

  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
