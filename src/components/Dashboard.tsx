import { useState } from 'react';
import { XmlDocument } from '../lib/xmlParser';
import { 
  gerarResumoNotas, 
  gerarResumoImpostos, 
  gerarRankingClientes,
  gerarRankingProdutos,
  gerarResumoFretes,
  gerarNotasCanceladas,
  filtrarPorPeriodo
} from '../lib/relatorios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Download, Filter } from 'lucide-react';

interface DashboardProps {
  documents: XmlDocument[];
}

export default function Dashboard({ documents }: DashboardProps) {
  const [periodo, setPeriodo] = useState<'hoje' | '7dias' | 'mes' | 'todos'>('todos');
  const [activeTab, setActiveTab] = useState<'resumo' | 'impostos' | 'clientes' | 'produtos' | 'fretes' | 'canceladas'>('resumo');
  
  // Filtrar documentos pelo período selecionado
  const documentosFiltrados = filtrarPorPeriodo(documents, periodo);
  
  // Gerar relatórios com base nos documentos filtrados
  const resumoNotas = gerarResumoNotas(documentosFiltrados);
  const resumoImpostos = gerarResumoImpostos(documentosFiltrados);
  const rankingClientes = gerarRankingClientes(documentosFiltrados);
  const rankingProdutos = gerarRankingProdutos(documentosFiltrados);
  const resumoFretes = gerarResumoFretes(documentosFiltrados);
  const notasCanceladas = gerarNotasCanceladas(documentosFiltrados);
  
  // Verificar se há documentos para exibir
  if (documents.length === 0) {
    return null;
  }
  
  // Preparar dados para gráficos
  const dadosGraficoTipos = [
    { name: 'Venda', value: resumoNotas.porTipo.venda },
    { name: 'Devolução', value: resumoNotas.porTipo.devolucao },
    { name: 'Complementar', value: resumoNotas.porTipo.complementar },
    { name: 'Cancelada', value: resumoNotas.porTipo.cancelada }
  ].filter(item => item.value > 0);
  
  const dadosGraficoImpostos = [
    { name: 'ICMS', value: resumoImpostos.icmsTotal },
    { name: 'IPI', value: resumoImpostos.ipiTotal },
    { name: 'PIS', value: resumoImpostos.pisTotal },
    { name: 'COFINS', value: resumoImpostos.cofinsTotal }
  ];
  
  const dadosGraficoClientes = rankingClientes
    .slice(0, 5)
    .map(cliente => ({
      name: cliente.nome.length > 15 ? cliente.nome.substring(0, 15) + '...' : cliente.nome,
      value: cliente.totalValor
    }));
  
  const dadosGraficoProdutos = rankingProdutos
    .slice(0, 5)
    .map(produto => ({
      name: produto.nome.length > 15 ? produto.nome.substring(0, 15) + '...' : produto.nome,
      value: produto.totalValor
    }));
  
  const CORES = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
  
  return (
    <div className="card-container mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Dashboard e Relatórios</h2>
        
        <div className="flex gap-2">
          <div className="relative">
            <button 
              className="btn-outline flex items-center"
              onClick={() => {
                const menu = document.getElementById('periodo-menu');
                if (menu) {
                  menu.classList.toggle('hidden');
                }
              }}
            >
              <Filter size={18} className="mr-2" />
              {periodo === 'hoje' ? 'Hoje' : 
               periodo === '7dias' ? 'Últimos 7 dias' : 
               periodo === 'mes' ? 'Mês atual' : 'Todos os períodos'}
            </button>
            
            <div 
              id="periodo-menu" 
              className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg z-10 hidden"
            >
              <div className="py-1">
                <button 
                  className={`block w-full text-left px-4 py-2 hover:bg-accent ${periodo === 'hoje' ? 'bg-accent' : ''}`}
                  onClick={() => {
                    setPeriodo('hoje');
                    document.getElementById('periodo-menu')?.classList.add('hidden');
                  }}
                >
                  Hoje
                </button>
                <button 
                  className={`block w-full text-left px-4 py-2 hover:bg-accent ${periodo === '7dias' ? 'bg-accent' : ''}`}
                  onClick={() => {
                    setPeriodo('7dias');
                    document.getElementById('periodo-menu')?.classList.add('hidden');
                  }}
                >
                  Últimos 7 dias
                </button>
                <button 
                  className={`block w-full text-left px-4 py-2 hover:bg-accent ${periodo === 'mes' ? 'bg-accent' : ''}`}
                  onClick={() => {
                    setPeriodo('mes');
                    document.getElementById('periodo-menu')?.classList.add('hidden');
                  }}
                >
                  Mês atual
                </button>
                <button 
                  className={`block w-full text-left px-4 py-2 hover:bg-accent ${periodo === 'todos' ? 'bg-accent' : ''}`}
                  onClick={() => {
                    setPeriodo('todos');
                    document.getElementById('periodo-menu')?.classList.add('hidden');
                  }}
                >
                  Todos os períodos
                </button>
              </div>
            </div>
          </div>
          
          <button className="btn-outline flex items-center">
            <Download size={18} className="mr-2" />
            Exportar Relatório
          </button>
        </div>
      </div>
      
      {/* Abas */}
      <div className="flex border-b border-border mb-4 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'resumo' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('resumo')}
        >
          Resumo de Notas
        </button>
        <button
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'impostos' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('impostos')}
        >
          Impostos
        </button>
        <button
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'clientes' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('clientes')}
        >
          Top Clientes
        </button>
        <button
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'produtos' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('produtos')}
        >
          Top Produtos
        </button>
        <button
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'fretes' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('fretes')}
        >
          Fretes
        </button>
        <button
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'canceladas' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('canceladas')}
        >
          Notas Canceladas
        </button>
      </div>
      
      {/* Conteúdo da aba */}
      <div>
        {activeTab === 'resumo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-secondary p-4 rounded-xl">
                <h3 className="text-lg font-medium mb-2">Total de Notas</h3>
                <p className="text-3xl font-bold">{resumoNotas.totalNotas}</p>
              </div>
              <div className="bg-secondary p-4 rounded-xl">
                <h3 className="text-lg font-medium mb-2">Valor Total</h3>
                <p className="text-3xl font-bold">{formatCurrency(resumoNotas.totalValor)}</p>
              </div>
              <div className="bg-secondary p-4 rounded-xl">
                <h3 className="text-lg font-medium mb-2">Ticket Médio</h3>
                <p className="text-3xl font-bold">{formatCurrency(resumoNotas.mediaValor)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Distribuição por Tipo</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosGraficoTipos}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dadosGraficoTipos.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Quantidade']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Resumo por Status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Normal', value: resumoNotas.porTipo.venda },
                        { name: 'Cancelada', value: resumoNotas.porTipo.cancelada }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="name" stroke="#e0e0e0" />
                      <YAxis stroke="#e0e0e0" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#333', border: '1px solid #444' }}
                        formatter={(value) => [value, 'Quantidade']}
                      />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'impostos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-secondary p-4 rounded-xl">
                <h3 className="text-lg font-medium mb-2">ICMS Total</h3>
                <p className="text-3xl font-bold">{formatCurrency(resumoImpostos.icmsTotal)}</p>
              </div>
              <div className="bg-secondary p-4 rounded-xl">
                <h3 className="text-lg font-medium mb-2">IPI Total</h3>
                <p className="text-3xl font-bold">{formatCurrency(resumoImpostos.ipiTotal)}</p>
              </div>
              <div className="bg-secondary p-4 rounded-xl">
                <h3 className="text-lg font-medium mb-2">PIS Total</h3>
                <p className="text-3xl font-bold">{formatCurrency(resumoImpostos.pisTotal)}</p>
              </div>
              <div className="bg-secondary p-4 rounded-xl">
                <h3 className="text-lg font-medium mb-2">COFINS Total</h3>
                <p className="text-3xl font-bold">{formatCurrency(resumoImpostos.cofinsTotal)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Distribuição de Impostos</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosGraficoImpostos}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dadosGraficoImpostos.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Valor']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Percentual sobre Receita</h3>
                <div className="bg-secondary p-4 rounded-xl mb-4">
                  <h4 className="text-base font-medium mb-2">Total de Impostos</h4>
                  <p className="text-2xl font-bold">{formatCurrency(resumoImpostos.totalImpostos)}</p>
                </div>
                <div className="bg-secondary p-4 rounded-xl">
                  <h4 className="text-base font-medium mb-2">Percentual sobre Receita</h4>
                  <p className="text-2xl font-bold">{formatPercentage(resumoImpostos.percentualSobreReceita)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'clientes' && (
          <div className="space-y-6">
            <div className="h-80">
              <h3 className="text-lg font-medium mb-4">Top 5 Clientes por Faturamento</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dadosGraficoClientes}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis type="number" stroke="#e0e0e0" />
                  <YAxis dataKey="name" type="category" stroke="#e0e0e0" width={150} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', border: '1px solid #444' }}
                    formatter={(value) => [formatCurrency(value as number), 'Valor']}
                  />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Ranking de Clientes</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="p-2 text-left">Cliente</th>
                      <th className="p-2 text-left">CNPJ/CPF</th>
                      <th className="p-2 text-right">Qtd. Notas</th>
                      <th className="p-2 text-right">Valor Total</th>
                      <th className="p-2 text-right">Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingClientes.slice(0, 10).map((cliente, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="p-2">{cliente.nome}</td>
                        <td className="p-2">{cliente.cnpjCpf}</td>
                        <td className="p-2 text-right">{cliente.totalNotas}</td>
                        <td className="p-2 text-right">{formatCurrency(cliente.totalValor)}</td>
                        <td className="p-2 text-right">{formatCurrency(cliente.ticketMedio)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'produtos' && (
          <div className="space-y-6">
            <div className="h-80">
              <h3 className="text-lg font-medium mb-4">Top 5 Produtos por Valor</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dadosGraficoProdutos}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis type="number" stroke="#e0e0e0" />
                  <YAxis dataKey="name" type="category" stroke="#e0e0e0" width={150} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', border: '1px solid #444' }}
                    formatter={(value) => [formatCurrency(value as number), 'Valor']}
                  />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Ranking de Produtos</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="p-2 text-left">Código</th>
                      <th className="p-2 text-left">Produto</th>
                      <th className="p-2 text-right">Quantidade</th>
                      <th className="p-2 text-right">Valor Total</th>
                      <th className="p-2 text-right">Preço Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingProdutos.slice(0, 10).map((produto, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="p-2">{produto.codigo}</td>
                        <td className="p-2">{produto.nome}</td>
                        <td className="p-2 text-right">{produto.totalQuantidade.toLocaleString('pt-BR')}</td>
                        <td className="p-2 text-right">{formatCurrency(produto.totalValor)}</td>
                        <td className="p-2 text-right">{formatCurrency(produto.precoMedio)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'fretes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-secondary p-4 rounded-xl">
                <h3 className="text-lg font-medium mb-2">Total de Frete</h3>
                <p className="text-3xl font-bold">{formatCurrency(resumoFretes.totalFrete)}</p>
              </div>
              <div className="bg-secondary p-4 rounded-xl">
                <h3 className="text-lg font-medium mb-2">Total de Serviços</h3>
                <p className="text-3xl font-bold">{resumoFretes.totalServicos}</p>
              </div>
              <div className="bg-secondary p-4 rounded-xl">
                <h3 className="text-lg font-medium mb-2">Custo Médio</h3>
                <p className="text-3xl font-bold">{formatCurrency(resumoFretes.custoMedio)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Transportadoras</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="p-2 text-left">Transportadora</th>
                      <th className="p-2 text-right">Qtd. Serviços</th>
                      <th className="p-2 text-right">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumoFretes.transportadoras.map((transportadora, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="p-2">{transportadora.nome}</td>
                        <td className="p-2 text-right">{transportadora.totalServicos}</td>
                        <td className="p-2 text-right">{formatCurrency(transportadora.totalValor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'canceladas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-secondary p-4 rounded-xl">
                <h3 className="text-lg font-medium mb-2">Total de Notas Canceladas</h3>
                <p className="text-3xl font-bold">{notasCanceladas.total}</p>
              </div>
              <div className="bg-secondary p-4 rounded-xl">
                <h3 className="text-lg font-medium mb-2">Percentual sobre Total</h3>
                <p className="text-3xl font-bold">{formatPercentage(notasCanceladas.percentual)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Notas Canceladas</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="p-2 text-left">Número</th>
                      <th className="p-2 text-left">Data</th>
                      <th className="p-2 text-right">Valor</th>
                      <th className="p-2 text-left">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notasCanceladas.notas.map((nota, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="p-2">{nota.numero}</td>
                        <td className="p-2">{nota.data}</td>
                        <td className="p-2 text-right">{formatCurrency(nota.valor)}</td>
                        <td className="p-2">{nota.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Função para renderizar labels no gráfico de pizza
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Funções auxiliares de formatação
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
