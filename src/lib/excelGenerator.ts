import * as XLSX from 'xlsx';
import { XmlDocument } from './xmlParser';

export function generateExcel(document: XmlDocument): XLSX.WorkBook {
  // Criar novo workbook
  const wb = XLSX.utils.book_new();
  
  // Criar planilha de informações gerais
  const infoData = [
    ['INFORMAÇÕES DO DOCUMENTO', ''],
    ['Tipo', document.tipo],
    ['Número', document.numero || 'N/A'],
    ['Chave', document.chave || 'N/A'],
    ['Data de Emissão', document.data ? formatDate(document.data) : 'N/A'],
    ['Valor Total', formatCurrency(document.valorTotal || 0)],
    ['Status', document.status || 'Normal'],
    ['Motivo', document.motivo || ''],
    ['', ''],
    ['CLIENTE/DESTINATÁRIO', ''],
    ['Nome', document.cliente?.nome || 'N/A'],
    ['CNPJ/CPF', document.cliente?.cnpjCpf || 'N/A'],
    ['Endereço', document.cliente?.endereco || 'N/A'],
    ['', ''],
    ['TRANSPORTADORA', ''],
    ['Nome', document.transportadora?.nome || 'N/A'],
    ['CNPJ/CPF', document.transportadora?.cnpjCpf || 'N/A'],
    ['', ''],
    ['IMPOSTOS', ''],
    ['ICMS Total', formatCurrency(document.impostos?.icmsTotal || 0)],
    ['IPI Total', formatCurrency(document.impostos?.ipiTotal || 0)],
    ['PIS Total', formatCurrency(document.impostos?.pisTotal || 0)],
    ['COFINS Total', formatCurrency(document.impostos?.cofinsTotal || 0)],
    ['Total de Impostos', formatCurrency(
      (document.impostos?.icmsTotal || 0) +
      (document.impostos?.ipiTotal || 0) +
      (document.impostos?.pisTotal || 0) +
      (document.impostos?.cofinsTotal || 0)
    )]
  ];
  
  const infoWs = XLSX.utils.aoa_to_sheet(infoData);
  XLSX.utils.book_append_sheet(wb, infoWs, 'Informações');
  
  // Criar planilha de itens (apenas para NFe)
  if (document.tipo === 'NFe' && document.itens && document.itens.length > 0) {
    // Cabeçalho
    const itemsHeader = [
      'Código', 
      'Nome do Produto', 
      'Quantidade', 
      'Unidade', 
      'Valor Unitário', 
      'Valor Total',
      'ICMS',
      'IPI',
      'PIS',
      'COFINS'
    ];
    
    // Dados dos itens
    const itemsData = document.itens.map(item => [
      item.codigo || '',
      item.nome || '',
      item.quantidade || 0,
      item.unidade || '',
      item.valorUnitario || 0,
      item.valorTotal || 0,
      item.impostos?.icms || 0,
      item.impostos?.ipi || 0,
      item.impostos?.pis || 0,
      item.impostos?.cofins || 0
    ]);
    
    // Adicionar cabeçalho aos dados
    const allItemsData = [itemsHeader, ...itemsData];
    
    // Criar planilha de itens
    const itemsWs = XLSX.utils.aoa_to_sheet(allItemsData);
    
    // Configurar formatação para colunas numéricas
    const numericCols = ['C', 'E', 'F', 'G', 'H', 'I', 'J'];
    const currencyCols = ['E', 'F', 'G', 'H', 'I', 'J'];
    
    // Aplicar formatação para cada coluna
    for (let i = 2; i <= itemsData.length + 1; i++) {
      for (const col of numericCols) {
        const cellRef = `${col}${i}`;
        if (!itemsWs[cellRef]) continue;
        
        // Definir tipo numérico
        itemsWs[cellRef].t = 'n';
        
        // Adicionar formatação de moeda para colunas específicas
        if (currencyCols.includes(col)) {
          itemsWs[cellRef].z = '"R$"#,##0.00';
        }
      }
    }
    
    // Adicionar planilha ao workbook
    XLSX.utils.book_append_sheet(wb, itemsWs, 'Itens');
  }
  
  return wb;
}

// Função para salvar o Excel como arquivo
export function saveExcelFile(wb: XLSX.WorkBook): Blob {
  // Converter workbook para array buffer
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Criar blob a partir do array buffer
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
  return blob;
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
