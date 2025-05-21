import { xml2js } from 'xml-js';

export interface XmlDocument {
  id: string;
  fileName: string;
  tipo: 'NFe' | 'CTe' | 'Desconhecido';
  chave?: string;
  numero?: string;
  data?: string;
  valorTotal?: number;
  cliente?: {
    nome?: string;
    cnpjCpf?: string;
    endereco?: string;
  };
  transportadora?: {
    nome?: string;
    cnpjCpf?: string;
  };
  itens?: Array<{
    codigo?: string;
    nome?: string;
    quantidade?: number;
    unidade?: string;
    valorUnitario?: number;
    valorTotal?: number;
    impostos?: {
      icms?: number;
      ipi?: number;
      pis?: number;
      cofins?: number;
    };
  }>;
  impostos?: {
    icmsTotal?: number;
    ipiTotal?: number;
    pisTotal?: number;
    cofinsTotal?: number;
  };
  status?: 'Normal' | 'Cancelada' | 'Inutilizada';
  motivo?: string;
}

export function parseXmlFile(xmlContent: string, fileName: string): XmlDocument {
  try {
    // Converter XML para objeto JavaScript
    const result = xml2js(xmlContent, { compact: true }) as any;
    
    // Identificar tipo de documento
    let tipo: 'NFe' | 'CTe' | 'Desconhecido' = 'Desconhecido';
    let documento: any = null;
    
    if (result.nfeProc) {
      tipo = 'NFe';
      documento = result.nfeProc.NFe;
    } else if (result.NFe) {
      tipo = 'NFe';
      documento = result.NFe;
    } else if (result.cteProc) {
      tipo = 'CTe';
      documento = result.cteProc.CTe;
    } else if (result.CTe) {
      tipo = 'CTe';
      documento = result.CTe;
    }
    
    if (!documento) {
      return {
        id: generateId(),
        fileName,
        tipo: 'Desconhecido'
      };
    }
    
    // Extrair dados comuns
    const infDoc = tipo === 'NFe' ? documento.infNFe : documento.infCte;
    const ide = infDoc?.ide;
    const chave = infDoc?._attributes?.Id?.replace(/[^0-9]/g, '') || '';
    const numero = ide?.nNF?._text || ide?.nCT?._text || '';
    const data = ide?.dhEmi?._text || ide?.dhCT?._text || '';
    
    // Extrair valor total
    let valorTotal = 0;
    if (tipo === 'NFe') {
      valorTotal = parseFloat(infDoc?.total?.ICMSTot?.vNF?._text || '0');
    } else if (tipo === 'CTe') {
      valorTotal = parseFloat(infDoc?.vPrest?.vTPrest?._text || '0');
    }
    
    // Extrair dados do cliente/destinatário
    const dest = infDoc?.dest;
    const cliente = {
      nome: dest?.xNome?._text || '',
      cnpjCpf: dest?.CNPJ?._text || dest?.CPF?._text || '',
      endereco: [
        dest?.enderDest?.xLgr?._text,
        dest?.enderDest?.nro?._text,
        dest?.enderDest?.xBairro?._text,
        dest?.enderDest?.xMun?._text,
        dest?.enderDest?.UF?._text
      ].filter(Boolean).join(', ')
    };
    
    // Extrair dados da transportadora
    const transp = tipo === 'NFe' ? infDoc?.transp?.transporta : infDoc?.emit;
    const transportadora = {
      nome: transp?.xNome?._text || '',
      cnpjCpf: transp?.CNPJ?._text || transp?.CPF?._text || ''
    };
    
    // Extrair itens (apenas para NFe)
    const itens: Array<any> = [];
    if (tipo === 'NFe' && infDoc?.det) {
      const detalhes = Array.isArray(infDoc.det) ? infDoc.det : [infDoc.det];
      
      detalhes.forEach((det: any) => {
        const prod = det.prod;
        const imposto = det.imposto;
        
        const icms = getImpostoValor(imposto?.ICMS);
        const ipi = getImpostoValor(imposto?.IPI);
        const pis = getImpostoValor(imposto?.PIS);
        const cofins = getImpostoValor(imposto?.COFINS);
        
        itens.push({
          codigo: prod?.cProd?._text || '',
          nome: prod?.xProd?._text || '',
          quantidade: parseFloat(prod?.qCom?._text || '0'),
          unidade: prod?.uCom?._text || '',
          valorUnitario: parseFloat(prod?.vUnCom?._text || '0'),
          valorTotal: parseFloat(prod?.vProd?._text || '0'),
          impostos: {
            icms,
            ipi,
            pis,
            cofins
          }
        });
      });
    }
    
    // Calcular totais de impostos
    const impostos = {
      icmsTotal: tipo === 'NFe' ? parseFloat(infDoc?.total?.ICMSTot?.vICMS?._text || '0') : 0,
      ipiTotal: tipo === 'NFe' ? parseFloat(infDoc?.total?.ICMSTot?.vIPI?._text || '0') : 0,
      pisTotal: tipo === 'NFe' ? parseFloat(infDoc?.total?.ICMSTot?.vPIS?._text || '0') : 0,
      cofinsTotal: tipo === 'NFe' ? parseFloat(infDoc?.total?.ICMSTot?.vCOFINS?._text || '0') : 0
    };
    
    // Verificar status (cancelamento)
    let status: 'Normal' | 'Cancelada' | 'Inutilizada' = 'Normal';
    let motivo = '';
    
    if (result.procEventoNFe || result.procEventoCTe) {
      const evento = result.procEventoNFe || result.procEventoCTe;
      if (evento?.evento?.infEvento?.tpEvento?._text === '110111') {
        status = 'Cancelada';
        motivo = evento?.evento?.infEvento?.detEvento?.xJust?._text || 'Cancelada';
      }
    }
    
    return {
      id: generateId(),
      fileName,
      tipo,
      chave,
      numero,
      data,
      valorTotal,
      cliente,
      transportadora,
      itens,
      impostos,
      status,
      motivo
    };
  } catch (error) {
    console.error('Erro ao analisar XML:', error);
    return {
      id: generateId(),
      fileName,
      tipo: 'Desconhecido',
      status: 'Normal',
      motivo: `Erro ao processar: ${(error as Error).message}`
    };
  }
}

// Função auxiliar para extrair valor de imposto
function getImpostoValor(impostoGroup: any): number {
  if (!impostoGroup) return 0;
  
  // Tentar encontrar o valor em qualquer grupo de imposto (ICMS00, ICMS10, etc.)
  for (const key in impostoGroup) {
    if (impostoGroup[key]?.vICMS?._text) {
      return parseFloat(impostoGroup[key].vICMS._text);
    }
    if (impostoGroup[key]?.vIPI?._text) {
      return parseFloat(impostoGroup[key].vIPI._text);
    }
    if (impostoGroup[key]?.vPIS?._text) {
      return parseFloat(impostoGroup[key].vPIS._text);
    }
    if (impostoGroup[key]?.vCOFINS?._text) {
      return parseFloat(impostoGroup[key].vCOFINS._text);
    }
  }
  
  return 0;
}

// Gerar ID único para cada documento
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
