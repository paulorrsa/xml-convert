import { XmlDocument } from '../lib/xmlParser';
import { generatePdf } from '../lib/pdfGenerator';
import { generateExcel, saveExcelFile } from '../lib/excelGenerator';
import JSZip from 'jszip';

// Função para gerar e baixar PDF
export function downloadPdf(document: XmlDocument): void {
  try {
    // Gerar PDF
    const pdf = generatePdf(document);
    
    // Definir nome do arquivo
    const fileName = `${document.tipo}_${document.numero || 'sem_numero'}.pdf`;
    
    // Salvar PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
  }
}

// Função para gerar e baixar Excel
export function downloadExcel(document: XmlDocument): void {
  try {
    // Gerar Excel
    const wb = generateExcel(document);
    
    // Definir nome do arquivo
    const fileName = `${document.tipo}_${document.numero || 'sem_numero'}.xlsx`;
    
    // Salvar Excel como blob
    const blob = saveExcelFile(wb);
    
    // Criar URL para download
    const url = window.URL.createObjectURL(blob);
    
    // Criar elemento de link para download
    const a = window.document.createElement('a');
    a.href = url;
    a.download = fileName;
    
    // Simular clique para iniciar download
    window.document.body.appendChild(a);
    a.click();
    
    // Limpar
    window.URL.revokeObjectURL(url);
    window.document.body.removeChild(a);
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    alert('Ocorreu um erro ao gerar o Excel. Por favor, tente novamente.');
  }
}

// Função para gerar e baixar todos os documentos como ZIP
export async function downloadAllAsZip(documents: XmlDocument[]): Promise<void> {
  try {
    // Criar nova instância de ZIP
    const zip = new JSZip();
    
    // Adicionar cada documento como PDF e Excel
    for (const doc of documents) {
      // Definir nomes de arquivos
      const pdfFileName = `${doc.tipo}_${doc.numero || 'sem_numero'}.pdf`;
      const excelFileName = `${doc.tipo}_${doc.numero || 'sem_numero'}.xlsx`;
      
      // Gerar PDF
      const pdf = generatePdf(doc);
      const pdfBlob = pdf.output('blob');
      
      // Gerar Excel
      const wb = generateExcel(doc);
      const excelBlob = saveExcelFile(wb);
      
      // Adicionar ao ZIP
      zip.file(`pdf/${pdfFileName}`, pdfBlob);
      zip.file(`excel/${excelFileName}`, excelBlob);
    }
    
    // Gerar ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Criar URL para download
    const url = window.URL.createObjectURL(zipBlob);
    
    // Criar elemento de link para download
    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'documentos_xml.zip';
    
    // Simular clique para iniciar download
    window.document.body.appendChild(a);
    a.click();
    
    // Limpar
    window.URL.revokeObjectURL(url);
    window.document.body.removeChild(a);
  } catch (error) {
    console.error('Erro ao gerar ZIP:', error);
    alert('Ocorreu um erro ao gerar o arquivo ZIP. Por favor, tente novamente.');
  }
}
