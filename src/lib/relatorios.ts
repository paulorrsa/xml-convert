import { XmlDocument } from './xmlParser';

// Interfaces para os relatórios
export interface ResumoNotas {
  totalNotas: number;
  totalValor: number;
  porTipo: {
    venda: number;
    devolucao: number;
    complementar: number;
    cancelada: number;
  };
  mediaValor: number;
}

export interface ResumoImpostos {
  icmsTotal: number;
  ipiTotal: number;
  pisTotal: number;
  cofinsTotal: number;
  totalImpostos: number;
  percentualSobreReceita: number;
}

export interface ClienteRanking {
  nome: string;
  cnpjCpf: string;
  totalNotas: number;
  totalValor: number;
  ticketMedio: number;
}

export interface ProdutoRanking {
  codigo: string;
  nome: string;
  totalQuantidade: number;
  totalValor: number;
  precoMedio: number;
}

export interface FreteResumo {
  totalFrete: number;
  totalServicos: number;
  custoMedio: number;
  transportadoras: {
    nome: string;
    totalServicos: number;
    totalValor: number;
  }[];
}

export interface NotasCanceladas {
  total: number;
  percentual: number;
  notas: {
    numero: string;
    data: string;
    valor: number;
    motivo: string;
  }[];
}

// Função para gerar relatório de resumo de notas
export function gerarResumoNotas(documentos: XmlDocument[]): ResumoNotas {
  const notasValidas = documentos.filter(doc => doc.tipo === 'NFe' || doc.tipo === 'CTe');
  
  const totalNotas = notasValidas.length;
  const totalValor = notasValidas.reduce((sum, doc) => sum + (doc.valorTotal || 0), 0);
  
  const porTipo = {
    venda: notasValidas.filter(doc => doc.tipo === 'NFe' && doc.status === 'Normal').length,
    devolucao: 0, // Precisaria de mais informações no XML para identificar devoluções
    complementar: 0, // Precisaria de mais informações no XML para identificar complementares
    cancelada: notasValidas.filter(doc => doc.status === 'Cancelada' || doc.status === 'Inutilizada').length
  };
  
  const mediaValor = totalNotas > 0 ? totalValor / totalNotas : 0;
  
  return {
    totalNotas,
    totalValor,
    porTipo,
    mediaValor
  };
}

// Função para gerar relatório de impostos
export function gerarResumoImpostos(documentos: XmlDocument[]): ResumoImpostos {
  const notasValidas = documentos.filter(doc => doc.tipo === 'NFe' && doc.status === 'Normal');
  
  const icmsTotal = notasValidas.reduce((sum, doc) => sum + (doc.impostos?.icmsTotal || 0), 0);
  const ipiTotal = notasValidas.reduce((sum, doc) => sum + (doc.impostos?.ipiTotal || 0), 0);
  const pisTotal = notasValidas.reduce((sum, doc) => sum + (doc.impostos?.pisTotal || 0), 0);
  const cofinsTotal = notasValidas.reduce((sum, doc) => sum + (doc.impostos?.cofinsTotal || 0), 0);
  
  const totalImpostos = icmsTotal + ipiTotal + pisTotal + cofinsTotal;
  const totalReceita = notasValidas.reduce((sum, doc) => sum + (doc.valorTotal || 0), 0);
  
  const percentualSobreReceita = totalReceita > 0 ? (totalImpostos / totalReceita) : 0;
  
  return {
    icmsTotal,
    ipiTotal,
    pisTotal,
    cofinsTotal,
    totalImpostos,
    percentualSobreReceita
  };
}

// Função para gerar ranking de clientes
export function gerarRankingClientes(documentos: XmlDocument[]): ClienteRanking[] {
  const notasValidas = documentos.filter(doc => doc.status === 'Normal');
  
  // Agrupar por cliente
  const clientesMap = new Map<string, ClienteRanking>();
  
  notasValidas.forEach(doc => {
    if (!doc.cliente?.cnpjCpf) return;
    
    const cnpjCpf = doc.cliente.cnpjCpf;
    const nome = doc.cliente.nome || 'Cliente sem nome';
    const valor = doc.valorTotal || 0;
    
    if (clientesMap.has(cnpjCpf)) {
      const cliente = clientesMap.get(cnpjCpf)!;
      cliente.totalNotas += 1;
      cliente.totalValor += valor;
      cliente.ticketMedio = cliente.totalValor / cliente.totalNotas;
    } else {
      clientesMap.set(cnpjCpf, {
        nome,
        cnpjCpf,
        totalNotas: 1,
        totalValor: valor,
        ticketMedio: valor
      });
    }
  });
  
  // Converter para array e ordenar por valor total
  return Array.from(clientesMap.values())
    .sort((a, b) => b.totalValor - a.totalValor);
}

// Função para gerar ranking de produtos
export function gerarRankingProdutos(documentos: XmlDocument[]): ProdutoRanking[] {
  const notasValidas = documentos.filter(doc => doc.tipo === 'NFe' && doc.status === 'Normal');
  
  // Agrupar por produto
  const produtosMap = new Map<string, ProdutoRanking>();
  
  notasValidas.forEach(doc => {
    if (!doc.itens) return;
    
    doc.itens.forEach(item => {
      if (!item.codigo) return;
      
      const codigo = item.codigo;
      const nome = item.nome || 'Produto sem nome';
      const quantidade = item.quantidade || 0;
      const valor = item.valorTotal || 0;
      
      if (produtosMap.has(codigo)) {
        const produto = produtosMap.get(codigo)!;
        produto.totalQuantidade += quantidade;
        produto.totalValor += valor;
        produto.precoMedio = produto.totalValor / produto.totalQuantidade;
      } else {
        produtosMap.set(codigo, {
          codigo,
          nome,
          totalQuantidade: quantidade,
          totalValor: valor,
          precoMedio: quantidade > 0 ? valor / quantidade : 0
        });
      }
    });
  });
  
  // Converter para array e ordenar por valor total
  return Array.from(produtosMap.values())
    .sort((a, b) => b.totalValor - a.totalValor);
}

// Função para gerar resumo de fretes
export function gerarResumoFretes(documentos: XmlDocument[]): FreteResumo {
  const notasValidas = documentos.filter(doc => doc.status === 'Normal');
  const ctes = notasValidas.filter(doc => doc.tipo === 'CTe');
  
  // Calcular totais
  const totalFrete = ctes.reduce((sum, doc) => sum + (doc.valorTotal || 0), 0);
  const totalServicos = ctes.length;
  const custoMedio = totalServicos > 0 ? totalFrete / totalServicos : 0;
  
  // Agrupar por transportadora
  const transportadorasMap = new Map<string, { nome: string, totalServicos: number, totalValor: number }>();
  
  notasValidas.forEach(doc => {
    if (!doc.transportadora?.cnpjCpf) return;
    
    const cnpjCpf = doc.transportadora.cnpjCpf;
    const nome = doc.transportadora.nome || 'Transportadora sem nome';
    const valor = doc.tipo === 'CTe' ? (doc.valorTotal || 0) : 0;
    
    if (transportadorasMap.has(cnpjCpf)) {
      const transportadora = transportadorasMap.get(cnpjCpf)!;
      transportadora.totalServicos += 1;
      transportadora.totalValor += valor;
    } else {
      transportadorasMap.set(cnpjCpf, {
        nome,
        totalServicos: 1,
        totalValor: valor
      });
    }
  });
  
  // Converter para array e ordenar por valor total
  const transportadoras = Array.from(transportadorasMap.values())
    .sort((a, b) => b.totalValor - a.totalValor);
  
  return {
    totalFrete,
    totalServicos,
    custoMedio,
    transportadoras
  };
}

// Função para gerar relatório de notas canceladas
export function gerarNotasCanceladas(documentos: XmlDocument[]): NotasCanceladas {
  const todasNotas = documentos.length;
  const notasCanceladas = documentos.filter(doc => 
    doc.status === 'Cancelada' || doc.status === 'Inutilizada'
  );
  
  const total = notasCanceladas.length;
  const percentual = todasNotas > 0 ? total / todasNotas : 0;
  
  const notas = notasCanceladas.map(doc => ({
    numero: doc.numero || 'Sem número',
    data: doc.data ? formatDate(doc.data) : 'Sem data',
    valor: doc.valorTotal || 0,
    motivo: doc.motivo || 'Motivo não informado'
  }));
  
  return {
    total,
    percentual,
    notas
  };
}

// Função para filtrar documentos por período
export function filtrarPorPeriodo(
  documentos: XmlDocument[], 
  periodo: 'hoje' | '7dias' | 'mes' | 'todos'
): XmlDocument[] {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const seteDiasAtras = new Date(hoje);
  seteDiasAtras.setDate(hoje.getDate() - 7);
  
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  
  return documentos.filter(doc => {
    if (!doc.data) return false;
    
    try {
      const dataDoc = new Date(doc.data);
      
      switch (periodo) {
        case 'hoje':
          return dataDoc >= hoje;
        case '7dias':
          return dataDoc >= seteDiasAtras;
        case 'mes':
          return dataDoc >= inicioMes;
        case 'todos':
        default:
          return true;
      }
    } catch (e) {
      return false;
    }
  });
}

// Função auxiliar para formatar data
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateStr;
  }
}
