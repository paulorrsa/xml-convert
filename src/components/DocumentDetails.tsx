import { useState } from 'react';
import { XmlDocument } from '../lib/xmlParser';
import { Download, FileSpreadsheet, FileBarChart2 } from 'lucide-react';

interface DocumentDetailsProps {
  document: XmlDocument | null;
  onDownloadPdf?: () => void;
  onDownloadExcel?: () => void;
}

export default function DocumentDetails({ document }: DocumentDetailsProps) {
  const [activeTab, setActiveTab] = useState<'geral' | 'itens' | 'impostos'>('geral');

  if (!document) {
    return null;
  }

  return (
    <div className="card-container mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Detalhes do Documento</h2>
        
        <div className="flex gap-2">
          <button className="btn-outline p-2" title="Gerar PDF">
            <Download size={18} />
          </button>
          <button className="btn-outline p-2" title="Exportar Excel">
            <FileSpreadsheet size={18} />
          </button>
          <button className="btn-outline p-2" title="Ver Relatório">
            <FileBarChart2 size={18} />
          </button>
        </div>
      </div>
      
      {/* Abas */}
      <div className="flex border-b border-border mb-4">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'geral' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('geral')}
        >
          Geral
        </button>
        {document.tipo === 'NFe' && (
          <>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'itens' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTab('itens')}
            >
              Itens
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'impostos' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTab('impostos')}
            >
              Impostos
            </button>
          </>
        )}
      </div>
      
      {/* Conteúdo da aba */}
      <div className="space-y-4">
        {activeTab === 'geral' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Informações do Documento</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-secondary rounded-lg">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium">{document.tipo}</span>
                  </div>
                  {document.numero && (
                    <div className="flex justify-between p-2 bg-secondary rounded-lg">
                      <span className="text-muted-foreground">Número:</span>
                      <span className="font-medium">{document.numero}</span>
                    </div>
                  )}
                  {document.chave && (
                    <div className="flex justify-between p-2 bg-secondary rounded-lg">
                      <span className="text-muted-foreground">Chave:</span>
                      <span className="font-medium">{document.chave}</span>
                    </div>
                  )}
                  {document.data && (
                    <div className="flex justify-between p-2 bg-secondary rounded-lg">
                      <span className="text-muted-foreground">Data:</span>
                      <span className="font-medium">{formatDate(document.data)}</span>
                    </div>
                  )}
                  {document.valorTotal !== undefined && (
                    <div className="flex justify-between p-2 bg-secondary rounded-lg">
                      <span className="text-muted-foreground">Valor Total:</span>
                      <span className="font-medium">{formatCurrency(document.valorTotal)}</span>
                    </div>
                  )}
                  {document.status && (
                    <div className="flex justify-between p-2 bg-secondary rounded-lg">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${document.status !== 'Normal' ? 'text-red-500' : ''}`}>
                        {document.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {document.tipo === 'NFe' ? 'Cliente' : 'Destinatário'}
                </h3>
                {document.cliente && (
                  <div className="space-y-2">
                    {document.cliente.nome && (
                      <div className="flex justify-between p-2 bg-secondary rounded-lg">
                        <span className="text-muted-foreground">Nome:</span>
                        <span className="font-medium">{document.cliente.nome}</span>
                      </div>
                    )}
                    {document.cliente.cnpjCpf && (
                      <div className="flex justify-between p-2 bg-secondary rounded-lg">
                        <span className="text-muted-foreground">CNPJ/CPF:</span>
                        <span className="font-medium">{document.cliente.cnpjCpf}</span>
                      </div>
                    )}
                    {document.cliente.endereco && (
                      <div className="flex justify-between p-2 bg-secondary rounded-lg">
                        <span className="text-muted-foreground">Endereço:</span>
                        <span className="font-medium">{document.cliente.endereco}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <h3 className="text-lg font-medium mt-4 mb-2">Transportadora</h3>
                {document.transportadora && (
                  <div className="space-y-2">
                    {document.transportadora.nome && (
                      <div className="flex justify-between p-2 bg-secondary rounded-lg">
                        <span className="text-muted-foreground">Nome:</span>
                        <span className="font-medium">{document.transportadora.nome}</span>
                      </div>
                    )}
                    {document.transportadora.cnpjCpf && (
                      <div className="flex justify-between p-2 bg-secondary rounded-lg">
                        <span className="text-muted-foreground">CNPJ/CPF:</span>
                        <span className="font-medium">{document.transportadora.cnpjCpf}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'itens' && document.itens && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary">
                  <th className="p-2 text-left">Código</th>
                  <th className="p-2 text-left">Produto</th>
                  <th className="p-2 text-right">Qtd</th>
                  <th className="p-2 text-left">Un</th>
                  <th className="p-2 text-right">Valor Un.</th>
                  <th className="p-2 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {document.itens.map((item, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="p-2">{item.codigo}</td>
                    <td className="p-2">{item.nome}</td>
                    <td className="p-2 text-right">{item.quantidade?.toLocaleString('pt-BR')}</td>
                    <td className="p-2">{item.unidade}</td>
                    <td className="p-2 text-right">{formatCurrency(item.valorUnitario || 0)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.valorTotal || 0)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-secondary">
                  <td colSpan={5} className="p-2 text-right font-medium">Total:</td>
                  <td className="p-2 text-right font-medium">
                    {formatCurrency(
                      document.itens.reduce((sum, item) => sum + (item.valorTotal || 0), 0)
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        
        {activeTab === 'impostos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Resumo de Impostos</h3>
              <div className="space-y-2">
                {document.impostos?.icmsTotal !== undefined && (
                  <div className="flex justify-between p-2 bg-secondary rounded-lg">
                    <span className="text-muted-foreground">ICMS Total:</span>
                    <span className="font-medium">{formatCurrency(document.impostos.icmsTotal)}</span>
                  </div>
                )}
                {document.impostos?.ipiTotal !== undefined && (
                  <div className="flex justify-between p-2 bg-secondary rounded-lg">
                    <span className="text-muted-foreground">IPI Total:</span>
                    <span className="font-medium">{formatCurrency(document.impostos.ipiTotal)}</span>
                  </div>
                )}
                {document.impostos?.pisTotal !== undefined && (
                  <div className="flex justify-between p-2 bg-secondary rounded-lg">
                    <span className="text-muted-foreground">PIS Total:</span>
                    <span className="font-medium">{formatCurrency(document.impostos.pisTotal)}</span>
                  </div>
                )}
                {document.impostos?.cofinsTotal !== undefined && (
                  <div className="flex justify-between p-2 bg-secondary rounded-lg">
                    <span className="text-muted-foreground">COFINS Total:</span>
                    <span className="font-medium">{formatCurrency(document.impostos.cofinsTotal)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {document.valorTotal !== undefined && document.impostos && (
              <div>
                <h3 className="text-lg font-medium mb-2">Percentual sobre Valor Total</h3>
                <div className="space-y-2">
                  {document.impostos.icmsTotal !== undefined && (
                    <div className="flex justify-between p-2 bg-secondary rounded-lg">
                      <span className="text-muted-foreground">ICMS:</span>
                      <span className="font-medium">
                        {formatPercentage(document.impostos.icmsTotal / document.valorTotal)}
                      </span>
                    </div>
                  )}
                  {document.impostos.ipiTotal !== undefined && (
                    <div className="flex justify-between p-2 bg-secondary rounded-lg">
                      <span className="text-muted-foreground">IPI:</span>
                      <span className="font-medium">
                        {formatPercentage(document.impostos.ipiTotal / document.valorTotal)}
                      </span>
                    </div>
                  )}
                  {document.impostos.pisTotal !== undefined && (
                    <div className="flex justify-between p-2 bg-secondary rounded-lg">
                      <span className="text-muted-foreground">PIS:</span>
                      <span className="font-medium">
                        {formatPercentage(document.impostos.pisTotal / document.valorTotal)}
                      </span>
                    </div>
                  )}
                  {document.impostos.cofinsTotal !== undefined && (
                    <div className="flex justify-between p-2 bg-secondary rounded-lg">
                      <span className="text-muted-foreground">COFINS:</span>
                      <span className="font-medium">
                        {formatPercentage(document.impostos.cofinsTotal / document.valorTotal)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between p-2 bg-secondary rounded-lg">
                    <span className="text-muted-foreground">Total Impostos:</span>
                    <span className="font-medium">
                      {formatPercentage(
                        (
                          (document.impostos.icmsTotal || 0) +
                          (document.impostos.ipiTotal || 0) +
                          (document.impostos.pisTotal || 0) +
                          (document.impostos.cofinsTotal || 0)
                        ) / document.valorTotal
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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

function formatPercentage(value: number): string {
  return (value * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + '%';
}
