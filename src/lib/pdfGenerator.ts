import { jsPDF } from 'jspdf';
import { XmlDocument } from './xmlParser';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Estender o tipo jsPDF para incluir o método autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

export function generatePdf(document: XmlDocument): jsPDF {
  // Criar nova instância do PDF
  const pdf = new jsPDF();
  
  // Configurações de estilo
  const titleFontSize = 12;
  const headerFontSize = 10;
  const normalFontSize = 8;
  const smallFontSize = 7;
  
  // Adicionar título
  pdf.setFontSize(titleFontSize);
  pdf.setFont('helvetica', 'bold');
  
  if (document.tipo === 'NFe') {
    pdf.text('DANFE - DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA', 105, 15, { align: 'center' });
  } else {
    pdf.text('DACTE - DOCUMENTO AUXILIAR DO CONHECIMENTO DE TRANSPORTE ELETRÔNICO', 105, 15, { align: 'center' });
  }
  
  // Adicionar informações do documento
  pdf.setFontSize(headerFontSize);
  pdf.setFont('helvetica', 'bold');
  pdf.text('IDENTIFICAÇÃO DO DOCUMENTO', 14, 25);
  
  pdf.setFontSize(normalFontSize);
  pdf.setFont('helvetica', 'normal');
  
  // Desenhar retângulo para informações principais
  pdf.rect(10, 30, 190, 25);
  
  // Adicionar informações básicas
  pdf.setFont('helvetica', 'bold');
  pdf.text('Chave de Acesso:', 14, 35);
  pdf.setFont('helvetica', 'normal');
  pdf.text(document.chave || 'N/A', 50, 35);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Número:', 14, 40);
  pdf.setFont('helvetica', 'normal');
  pdf.text(document.numero || 'N/A', 50, 40);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Data de Emissão:', 14, 45);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDate(document.data || ''), 50, 45);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Valor Total:', 14, 50);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatCurrency(document.valorTotal || 0), 50, 50);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Status:', 120, 35);
  pdf.setFont('helvetica', 'normal');
  pdf.text(document.status || 'Normal', 140, 35);
  
  if (document.status !== 'Normal' && document.motivo) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Motivo:', 120, 40);
    pdf.setFont('helvetica', 'normal');
    pdf.text(document.motivo, 140, 40, { maxWidth: 55 });
  }
  
  // Adicionar informações do emitente/destinatário
  pdf.setFontSize(headerFontSize);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EMITENTE / DESTINATÁRIO', 14, 65);
  
  // Desenhar retângulo para emitente/destinatário
  pdf.rect(10, 70, 190, 30);
  
  // Adicionar informações do cliente
  if (document.cliente) {
    pdf.setFontSize(normalFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.text(document.tipo === 'NFe' ? 'DESTINATÁRIO:' : 'TOMADOR:', 14, 75);
    pdf.setFont('helvetica', 'normal');
    pdf.text(document.cliente.nome || 'N/A', 50, 75);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('CNPJ/CPF:', 14, 80);
    pdf.setFont('helvetica', 'normal');
    pdf.text(document.cliente.cnpjCpf || 'N/A', 50, 80);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Endereço:', 14, 85);
    pdf.setFont('helvetica', 'normal');
    pdf.text(document.cliente.endereco || 'N/A', 50, 85, { maxWidth: 145 });
  }
  
  // Adicionar informações da transportadora
  pdf.setFontSize(headerFontSize);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TRANSPORTADORA', 14, 110);
  
  // Desenhar retângulo para transportadora
  pdf.rect(10, 115, 190, 20);
  
  // Adicionar informações da transportadora
  if (document.transportadora) {
    pdf.setFontSize(normalFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Nome:', 14, 120);
    pdf.setFont('helvetica', 'normal');
    pdf.text(document.transportadora.nome || 'N/A', 50, 120);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('CNPJ/CPF:', 14, 125);
    pdf.setFont('helvetica', 'normal');
    pdf.text(document.transportadora.cnpjCpf || 'N/A', 50, 125);
  }
  
  // Adicionar tabela de itens (apenas para NFe)
  if (document.tipo === 'NFe' && document.itens && document.itens.length > 0) {
    pdf.setFontSize(headerFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRODUTOS / SERVIÇOS', 14, 145);
    
    const tableColumn = [
      'Código', 'Descrição', 'Qtd', 'Un', 'Valor Unit.', 'Valor Total', 'ICMS'
    ];
    
    const tableRows = document.itens.map(item => [
      item.codigo || '',
      item.nome || '',
      formatNumber(item.quantidade || 0),
      item.unidade || '',
      formatCurrency(item.valorUnitario || 0),
      formatCurrency(item.valorTotal || 0),
      formatCurrency(item.impostos?.icms || 0)
    ]);
    
    autoTable(pdf, {
      head: [tableColumn],
      body: tableRows,
      startY: 150,
      theme: 'grid',
      styles: {
        fontSize: smallFontSize,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 15, halign: 'right' },
        3: { cellWidth: 15 },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 25, halign: 'right' },
      },
      didDrawPage: (data) => {
        if (data.cursor) {
          pdf.lastAutoTable = { finalY: data.cursor.y };
        }
      }
    });
  }
  
  // Adicionar totais de impostos
  const finalY = pdf.lastAutoTable?.finalY || 200;
  
  if (document.impostos) {
    pdf.setFontSize(headerFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAIS DE IMPOSTOS', 14, finalY + 10);
    
    // Desenhar retângulo para impostos
    pdf.rect(10, finalY + 15, 190, 25);
    
    pdf.setFontSize(normalFontSize);
    
    // Primeira coluna
    pdf.setFont('helvetica', 'bold');
    pdf.text('ICMS Total:', 14, finalY + 20);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatCurrency(document.impostos.icmsTotal || 0), 50, finalY + 20);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('IPI Total:', 14, finalY + 25);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatCurrency(document.impostos.ipiTotal || 0), 50, finalY + 25);
    
    // Segunda coluna
    pdf.setFont('helvetica', 'bold');
    pdf.text('PIS Total:', 110, finalY + 20);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatCurrency(document.impostos.pisTotal || 0), 140, finalY + 20);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('COFINS Total:', 110, finalY + 25);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatCurrency(document.impostos.cofinsTotal || 0), 140, finalY + 25);
    
    // Total geral
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL IMPOSTOS:', 14, finalY + 35);
    pdf.setFont('helvetica', 'normal');
    const totalImpostos = (
      (document.impostos.icmsTotal || 0) +
      (document.impostos.ipiTotal || 0) +
      (document.impostos.pisTotal || 0) +
      (document.impostos.cofinsTotal || 0)
    );
    pdf.text(formatCurrency(totalImpostos), 50, finalY + 35);
  }
  
  // Adicionar rodapé
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(smallFontSize);
    pdf.setFont('helvetica', 'italic');
    pdf.text(
      `Documento gerado por XML Converter - Página ${i} de ${pageCount}`,
      105,
      pdf.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  return pdf;
}

// Funções auxiliares de formatação
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateStr;
  }
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
