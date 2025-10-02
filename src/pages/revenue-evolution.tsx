import { useState, useEffect } from "react";
import Select from "../components/Select";
import Button from "../components/Button";
import { formatPercent, formatCurrency } from "../lib/formatting";

interface RevenueData {
  mes: string;
  vendasVeiculos: number;
  vendasPecas: number;
  servicosOficina: number;
  outrasReceitas: number;
  total: number;
  crescimento: number;
}

interface RevenueByCategory {
  categoria: string;
  valor: number;
  percentual: number;
  cor: string;
}

export default function RevenueEvolution() {
  const [periodo, setPeriodo] = useState("2025");
  const [tipoGrafico, setTipoGrafico] = useState("linha");
  const [categoria, setCategoria] = useState("todas");
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<RevenueByCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuração do Supabase
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

  // Função para buscar dados reais do banco
  const fetchRevenueData = async (ano: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Obter dados de autenticação
      const userData = localStorage.getItem('user_data');
      const supabaseToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !supabaseToken) {
        throw new Error('Usuário não autenticado');
      }

      const user = JSON.parse(userData);
      const companyId = user.company_id;

      // Buscar dados de todas as tabelas relevantes
      const requests = [
        // Vendas de veículos
        fetch(`${SUPABASE_URL}/rest/v1/sales?company_id=eq.${companyId}&select=*`, {
          headers: {
            'Authorization': `Bearer ${supabaseToken}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        }),
        // Transações (receitas)
        fetch(`${SUPABASE_URL}/rest/v1/transactions?company_id=eq.${companyId}&type=eq.receita&select=*`, {
          headers: {
            'Authorization': `Bearer ${supabaseToken}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        }),
        // Ordens de serviço
        fetch(`${SUPABASE_URL}/rest/v1/service_orders?company_id=eq.${companyId}&select=*`, {
          headers: {
            'Authorization': `Bearer ${supabaseToken}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        }),
        // Peças
        fetch(`${SUPABASE_URL}/rest/v1/parts?company_id=eq.${companyId}&select=*`, {
          headers: {
            'Authorization': `Bearer ${supabaseToken}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        }),
        // Propostas aceitas
        fetch(`${SUPABASE_URL}/rest/v1/proposals?company_id=eq.${companyId}&status=eq.accepted&select=*`, {
          headers: {
            'Authorization': `Bearer ${supabaseToken}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        })
      ];

      const responses = await Promise.allSettled(requests);
      
      const salesData = responses[0].status === 'fulfilled' && responses[0].value.ok 
        ? await responses[0].value.json() : [];
      const transactionsData = responses[1].status === 'fulfilled' && responses[1].value.ok 
        ? await responses[1].value.json() : [];
      const serviceOrdersData = responses[2].status === 'fulfilled' && responses[2].value.ok 
        ? await responses[2].value.json() : [];
      const partsData = responses[3].status === 'fulfilled' && responses[3].value.ok 
        ? await responses[3].value.json() : [];
      const proposalsData = responses[4].status === 'fulfilled' && responses[4].value.ok 
        ? await responses[4].value.json() : [];

      // Garantir que são arrays
      const salesArray = Array.isArray(salesData) ? salesData : [];
      const transactionsArray = Array.isArray(transactionsData) ? transactionsData : [];
      const serviceOrdersArray = Array.isArray(serviceOrdersData) ? serviceOrdersData : [];
      const partsArray = Array.isArray(partsData) ? partsData : [];
      const proposalsArray = Array.isArray(proposalsData) ? proposalsData : [];

      // Processar dados por mês
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const revenueByMonth: RevenueData[] = [];

      for (let mes = 1; mes <= 12; mes++) {
        const mesStr = mes.toString().padStart(2, '0');
        const dataInicio = `${ano}-${mesStr}-01`;
        const ultimoDiaDoMes = new Date(parseInt(ano), mes, 0).getDate();
        const dataFim = `${ano}-${mesStr}-${ultimoDiaDoMes.toString().padStart(2, '0')}`;

        // Filtrar dados do mês
        const salesDoMes = salesArray.filter((sale: any) => {
          if (!sale.sale_date) return false;
          const saleDate = new Date(sale.sale_date);
          const inicio = new Date(dataInicio);
          const fim = new Date(dataFim);
          return saleDate >= inicio && saleDate <= fim;
        });

        const transactionsDoMes = transactionsArray.filter((transaction: any) => {
          if (!transaction.transaction_date) return false;
          const transactionDate = new Date(transaction.transaction_date);
          const inicio = new Date(dataInicio);
          const fim = new Date(dataFim);
          return transactionDate >= inicio && transactionDate <= fim;
        });

        const serviceOrdersDoMes = serviceOrdersArray.filter((order: any) => {
          if (!order.created_at) return false;
          const orderDate = new Date(order.created_at);
          const inicio = new Date(dataInicio);
          const fim = new Date(dataFim);
          return orderDate >= inicio && orderDate <= fim;
        });

        const partsDoMes = partsArray.filter((part: any) => {
          if (!part.created_at) return false;
          const partDate = new Date(part.created_at);
          const inicio = new Date(dataInicio);
          const fim = new Date(dataFim);
          return partDate >= inicio && partDate <= fim;
        });

        const proposalsDoMes = proposalsArray.filter((proposal: any) => {
          if (!proposal.proposal_date) return false;
          const proposalDate = new Date(proposal.proposal_date);
          const inicio = new Date(dataInicio);
          const fim = new Date(dataFim);
          return proposalDate >= inicio && proposalDate <= fim;
        });

        // Calcular valores
        const vendasVeiculos = salesDoMes.reduce((total: number, sale: any) => 
          total + (parseFloat(sale.sale_price) || 0), 0);
        
        const vendasPecas = partsDoMes.reduce((total: number, part: any) => 
          total + (parseFloat(part.price) || 0), 0);
        
        const servicosOficina = serviceOrdersDoMes.reduce((total: number, order: any) => 
          total + (parseFloat(order.total_cost) || 0), 0);
        
        const outrasReceitas = transactionsDoMes.reduce((total: number, transaction: any) => 
          total + (parseFloat(transaction.amount) || 0), 0) +
          proposalsDoMes.reduce((total: number, proposal: any) => 
            total + (parseFloat(proposal.vehicle_price) || 0), 0);

        const total = vendasVeiculos + vendasPecas + servicosOficina + outrasReceitas;

        // Calcular crescimento
        let crescimento = 0;
        if (revenueByMonth.length > 0) {
          const mesAnterior = revenueByMonth[revenueByMonth.length - 1];
          if (mesAnterior.total > 0) {
            crescimento = ((total - mesAnterior.total) / mesAnterior.total) * 100;
          }
        }

        revenueByMonth.push({
          mes: meses[mes - 1],
          vendasVeiculos,
          vendasPecas,
          servicosOficina,
          outrasReceitas,
          total,
          crescimento
        });
      }

      // Calcular dados por categoria (usando o total do ano)
      const totalVendasVeiculos = revenueByMonth.reduce((sum, month) => sum + month.vendasVeiculos, 0);
      const totalVendasPecas = revenueByMonth.reduce((sum, month) => sum + month.vendasPecas, 0);
      const totalServicosOficina = revenueByMonth.reduce((sum, month) => sum + month.servicosOficina, 0);
      const totalOutrasReceitas = revenueByMonth.reduce((sum, month) => sum + month.outrasReceitas, 0);
      const totalGeral = totalVendasVeiculos + totalVendasPecas + totalServicosOficina + totalOutrasReceitas;

      const categoryData: RevenueByCategory[] = [
        { 
          categoria: "Vendas de Veículos", 
          valor: totalVendasVeiculos, 
          percentual: totalGeral > 0 ? (totalVendasVeiculos / totalGeral) * 100 : 0, 
          cor: "bg-blue-500" 
        },
        { 
          categoria: "Serviços de Oficina", 
          valor: totalServicosOficina, 
          percentual: totalGeral > 0 ? (totalServicosOficina / totalGeral) * 100 : 0, 
          cor: "bg-green-500" 
        },
        { 
          categoria: "Vendas de Peças", 
          valor: totalVendasPecas, 
          percentual: totalGeral > 0 ? (totalVendasPecas / totalGeral) * 100 : 0, 
          cor: "bg-yellow-500" 
        },
        { 
          categoria: "Outras Receitas", 
          valor: totalOutrasReceitas, 
          percentual: totalGeral > 0 ? (totalOutrasReceitas / totalGeral) * 100 : 0, 
          cor: "bg-purple-500" 
        }
      ];

      setRevenueData(revenueByMonth);
      setRevenueByCategory(categoryData);

    } catch (error) {
      console.error('Erro ao buscar dados de evolução de faturamento:', error);
      setError('Erro ao carregar dados de evolução de faturamento');
      setRevenueData([]);
      setRevenueByCategory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect para carregar dados iniciais
  useEffect(() => {
    fetchRevenueData(periodo);
  }, [periodo]);

  useEffect(() => {
    fetchRevenueData(periodo);
  }, []);

  // Função para formatação de percentual com sinal
  const formatPercentWithSign = (value: number) => {
    return `${value >= 0 ? '+' : ''}${formatPercent(value).replace('%', '')}%`;
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getMaxValue = () => {
    const filteredData = getFilteredDataWithGrowth();
    if (filteredData.length === 0) return 0;
    return Math.max(...filteredData.map(item => item.total));
  };

  const getBarHeight = (value: number) => {
    const maxValue = getMaxValue();
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  };

  const getTotalRevenue = () => {
    const filteredData = getFilteredDataWithGrowth();
    return filteredData.reduce((total, item) => total + item.total, 0);
  };

  const getAverageGrowth = () => {
    const filteredData = getFilteredDataWithGrowth();
    if (filteredData.length <= 1) return 0;
    const growthValues = filteredData.slice(1).map(item => item.crescimento);
    return growthValues.reduce((sum, value) => sum + value, 0) / growthValues.length;
  };

  const getBestMonth = () => {
    const filteredData = getFilteredDataWithGrowth();
    if (filteredData.length === 0) return { mes: 'N/A', total: 0 };
    return filteredData.reduce((best, current) => 
      current.total > best.total ? current : best
    );
  };

  const getWorstMonth = () => {
    const filteredData = getFilteredDataWithGrowth();
    if (filteredData.length === 0) return { mes: 'N/A', total: 0 };
    return filteredData.reduce((worst, current) => 
      current.total < worst.total ? current : worst
    );
  };

  // Função para filtrar dados baseado na categoria selecionada
  const getFilteredData = () => {
    if (categoria === "todas") {
      return revenueData;
    }

    return revenueData.map(item => {
      let filteredItem = { ...item };
      
      switch (categoria) {
        case "veiculos":
          filteredItem = {
            ...item,
            vendasPecas: 0,
            servicosOficina: 0,
            outrasReceitas: 0,
            total: item.vendasVeiculos,
            crescimento: 0 // Recalcular crescimento baseado apenas em veículos
          };
          break;
        case "pecas":
          filteredItem = {
            ...item,
            vendasVeiculos: 0,
            servicosOficina: 0,
            outrasReceitas: 0,
            total: item.vendasPecas,
            crescimento: 0
          };
          break;
        case "oficina":
          filteredItem = {
            ...item,
            vendasVeiculos: 0,
            vendasPecas: 0,
            outrasReceitas: 0,
            total: item.servicosOficina,
            crescimento: 0
          };
          break;
        case "outras":
          filteredItem = {
            ...item,
            vendasVeiculos: 0,
            vendasPecas: 0,
            servicosOficina: 0,
            total: item.outrasReceitas,
            crescimento: 0
          };
          break;
      }
      
      return filteredItem;
    });
  };

  // Recalcular crescimento para dados filtrados
  const getFilteredDataWithGrowth = () => {
    const filtered = getFilteredData();
    
    return filtered.map((item, index) => {
      if (index === 0) {
        return { ...item, crescimento: 0 };
      }
      
      const itemAnterior = filtered[index - 1];
      const crescimento = itemAnterior.total > 0 
        ? ((item.total - itemAnterior.total) / itemAnterior.total) * 100 
        : 0;
      
      return { ...item, crescimento };
    });
  };

  // Função para exportar dados
  const handleExport = () => {
    const filteredData = getFilteredDataWithGrowth();
    if (filteredData.length === 0) return;

    const categoriaLabel = categoria === "todas" ? "Todas" : 
                          categoria === "veiculos" ? "Veiculos" :
                          categoria === "pecas" ? "Pecas" :
                          categoria === "oficina" ? "Oficina" : "Outras";

    const csvContent = [
      ['Mês', 'Vendas de Veículos', 'Vendas de Peças', 'Serviços de Oficina', 'Outras Receitas', 'Total', 'Crescimento (%)'],
      ...filteredData.map(item => [
        item.mes,
        item.vendasVeiculos.toString(),
        item.vendasPecas.toString(),
        item.servicosOficina.toString(),
        item.outrasReceitas.toString(),
        item.total.toString(),
        item.crescimento.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Evolucao_Faturamento_${categoriaLabel}_${periodo}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Evolução de Faturamento</h1>
              <p className="text-gray-600 mt-2">Análise da evolução das receitas da empresa</p>
            </div>
            <div className="flex space-x-3">
              <Select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </Select>
              <Select
                value={tipoGrafico}
                onChange={(e) => setTipoGrafico(e.target.value)}
              >
                <option value="linha">Gráfico de Linha</option>
                <option value="barra">Gráfico de Barras</option>
                <option value="area">Gráfico de Área</option>
              </Select>
              <Select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="todas">Todas as Categorias</option>
                <option value="veiculos">Vendas de Veículos</option>
                <option value="pecas">Vendas de Peças</option>
                <option value="oficina">Serviços de Oficina</option>
                <option value="outras">Outras Receitas</option>
              </Select>
              <Button
                variant="primary"
                onClick={handleExport}
                disabled={isLoading || revenueData.length === 0}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                {isLoading ? 'Carregando...' : 'Exportar'}
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64 mb-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando dados de evolução de faturamento para {periodo}...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro ao carregar dados</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Faturamento Total</p>
                <p className="text-2xl font-semibold text-green-600">{formatCurrency(getTotalRevenue())}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Crescimento Médio</p>
                <p className={`text-2xl font-semibold ${getGrowthColor(getAverageGrowth())}`}>
                  {formatPercentWithSign(getAverageGrowth())}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Melhor Mês</p>
                <p className="text-2xl font-semibold text-yellow-600">{getBestMonth().mes}</p>
                <p className="text-sm text-gray-500">{formatCurrency(getBestMonth().total)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pior Mês</p>
                <p className="text-2xl font-semibold text-red-600">{getWorstMonth().mes}</p>
                <p className="text-sm text-gray-500">{formatCurrency(getWorstMonth().total)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Evolução */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Evolução Mensal do Faturamento</h3>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Vendas de Veículos</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Serviços de Oficina</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Vendas de Peças</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Outras Receitas</span>
              </div>
            </div>
          </div>
          
          {/* Gráfico Dinâmico */}
          {tipoGrafico === "linha" && (
            <div className="h-80 relative">
              {(() => {
                const filteredData = getFilteredDataWithGrowth();
                const hasData = filteredData.some(item => item.total > 0);
                
                if (!hasData) {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">Nenhum dado disponível</p>
                        <p className="text-gray-400 text-sm">Não há dados para a categoria selecionada neste período</p>
                      </div>
                    </div>
                  );
                }
                
                return (
              <svg className="w-full h-full" viewBox="0 0 800 320">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="80" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 80 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Linha do total */}
                {(() => {
                  const filteredData = getFilteredDataWithGrowth();
                  return filteredData.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                      points={filteredData.map((item, index) => 
                        `${(index * 800) / (filteredData.length - 1)},${320 - (item.total / getMaxValue()) * 280}`
                  ).join(' ')}
                />
                  );
                })()}
                
                {/* Pontos */}
                {(() => {
                  const filteredData = getFilteredDataWithGrowth();
                  return filteredData.map((item, index) => {
                    // Só mostra o ponto se houver dados (total > 0)
                    if (item.total <= 0) return null;
                    
                    return (
                  <circle
                    key={index}
                        cx={(index * 800) / (filteredData.length - 1)}
                    cy={320 - (item.total / getMaxValue()) * 280}
                    r="6"
                    fill="#3b82f6"
                    className="hover:r-8 transition-all cursor-pointer"
                  >
                    <title>{`${item.mes}: ${formatCurrency(item.total)}`}</title>
                  </circle>
                    );
                  }).filter(Boolean); // Remove os nulls
                })()}
                
                {/* Labels dos meses */}
                {(() => {
                  const filteredData = getFilteredDataWithGrowth();
                  return filteredData.map((item, index) => (
                  <text
                    key={index}
                      x={(index * 800) / (filteredData.length - 1)}
                    y="310"
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {item.mes}
                  </text>
                  ));
                })()}
              </svg>
                );
              })()}
            </div>
          )}

          {tipoGrafico === "area" && (
            <div className="h-80 relative">
              {(() => {
                const filteredData = getFilteredDataWithGrowth();
                const hasData = filteredData.some(item => item.total > 0);
                
                if (!hasData) {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">Nenhum dado disponível</p>
                        <p className="text-gray-400 text-sm">Não há dados para a categoria selecionada neste período</p>
                      </div>
                    </div>
                  );
                }
                
                return (
              <svg className="w-full h-full" viewBox="0 0 800 320">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid-area" width="80" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 80 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-area)" />
                
                {/* Área do total */}
                {(() => {
                  const filteredData = getFilteredDataWithGrowth();
                  return filteredData.length > 0 && (
                <polygon
                  fill="url(#gradient)"
                      points={`0,320 ${filteredData.map((item, index) => 
                        `${(index * 800) / (filteredData.length - 1)},${320 - (item.total / getMaxValue()) * 280}`
                  ).join(' ')} 800,320`}
                />
                  );
                })()}
                
                {/* Gradiente para a área */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                
                {/* Linha do total */}
                {(() => {
                  const filteredData = getFilteredDataWithGrowth();
                  return filteredData.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                      points={filteredData.map((item, index) => 
                        `${(index * 800) / (filteredData.length - 1)},${320 - (item.total / getMaxValue()) * 280}`
                  ).join(' ')}
                />
                  );
                })()}
                
                {/* Pontos */}
                {(() => {
                  const filteredData = getFilteredDataWithGrowth();
                  return filteredData.map((item, index) => {
                    // Só mostra o ponto se houver dados (total > 0)
                    if (item.total <= 0) return null;
                    
                    return (
                  <circle
                    key={index}
                        cx={(index * 800) / (filteredData.length - 1)}
                    cy={320 - (item.total / getMaxValue()) * 280}
                    r="6"
                    fill="#3b82f6"
                    className="hover:r-8 transition-all cursor-pointer"
                  >
                    <title>{`${item.mes}: ${formatCurrency(item.total)}`}</title>
                  </circle>
                    );
                  }).filter(Boolean); // Remove os nulls
                })()}
                
                {/* Labels dos meses */}
                {(() => {
                  const filteredData = getFilteredDataWithGrowth();
                  return filteredData.map((item, index) => (
                  <text
                    key={index}
                      x={(index * 800) / (filteredData.length - 1)}
                    y="310"
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {item.mes}
                  </text>
                  ));
                })()}
              </svg>
                );
              })()}
            </div>
          )}

          {tipoGrafico === "barra" && (
            <div className="h-80 flex items-end justify-between space-x-2">
              {(() => {
                const filteredData = getFilteredDataWithGrowth();
                const hasData = filteredData.some(item => item.total > 0);
                
                if (!hasData) {
                  return (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">Nenhum dado disponível</p>
                        <p className="text-gray-400 text-sm">Não há dados para a categoria selecionada neste período</p>
                      </div>
                    </div>
                  );
                }
                
                return filteredData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full flex flex-col items-center space-y-1 mb-2">
                    <div className="text-xs text-gray-500">{formatCurrency(item.total)}</div>
                    <div className="text-xs text-gray-500">{formatPercentWithSign(item.crescimento)}</div>
                  </div>
                  <div className="w-full flex flex-col justify-end h-64 space-y-1">
                    <div 
                      className="bg-purple-500 rounded-t"
                      style={{ height: `${getBarHeight(item.outrasReceitas)}%` }}
                      title={`Outras Receitas: ${formatCurrency(item.outrasReceitas)}`}
                    ></div>
                    <div 
                      className="bg-yellow-500"
                      style={{ height: `${getBarHeight(item.vendasPecas)}%` }}
                      title={`Vendas de Peças: ${formatCurrency(item.vendasPecas)}`}
                    ></div>
                    <div 
                      className="bg-green-500"
                      style={{ height: `${getBarHeight(item.servicosOficina)}%` }}
                      title={`Serviços de Oficina: ${formatCurrency(item.servicosOficina)}`}
                    ></div>
                    <div 
                      className="bg-blue-500 rounded-b"
                      style={{ height: `${getBarHeight(item.vendasVeiculos)}%` }}
                      title={`Vendas de Veículos: ${formatCurrency(item.vendasVeiculos)}`}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2 font-medium">{item.mes}</div>
                </div>
                ));
              })()}
            </div>
          )}
        </div>

        {/* Tabela de Dados */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Dados Detalhados por Mês</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mês
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendas de Veículos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviços de Oficina
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendas de Peças
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outras Receitas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crescimento
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredDataWithGrowth().map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.mes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.vendasVeiculos)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.servicosOficina)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.vendasPecas)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.outrasReceitas)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-medium ${getGrowthColor(item.crescimento)}`}>
                        {formatPercentWithSign(item.crescimento)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Análise por Categoria */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Distribuição por Categoria */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribuição por Categoria</h3>
            <div className="space-y-4">
              {(() => {
                if (categoria === "todas") {
                  return revenueByCategory.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${item.cor} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.categoria}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(item.valor)}</div>
                    <div className="text-xs text-gray-500">{formatPercent(item.percentual)}</div>
                  </div>
                </div>
                  ));
                } else {
                  // Mostrar apenas a categoria selecionada
                  const categoriaSelecionada = revenueByCategory.find(cat => 
                    (categoria === "veiculos" && cat.categoria === "Vendas de Veículos") ||
                    (categoria === "pecas" && cat.categoria === "Vendas de Peças") ||
                    (categoria === "oficina" && cat.categoria === "Serviços de Oficina") ||
                    (categoria === "outras" && cat.categoria === "Outras Receitas")
                  );
                  
                  if (categoriaSelecionada) {
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full ${categoriaSelecionada.cor} mr-3`}></div>
                          <span className="text-sm font-medium text-gray-700">{categoriaSelecionada.categoria}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(categoriaSelecionada.valor)}</div>
                          <div className="text-xs text-gray-500">{formatPercent(categoriaSelecionada.percentual)}</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }
              })()}
            </div>
          </div>

          {/* Gráfico de Pizza Simulado */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Participação por Categoria</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64">
                {/* Círculo de pizza simulado */}
                <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 67.1% 0%)' }}></div>
                <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: 'polygon(50% 50%, 67.1% 0%, 83.9% 0%)' }}></div>
                <div className="absolute inset-0 rounded-full border-8 border-yellow-500" style={{ clipPath: 'polygon(50% 50%, 83.9% 0%, 96.1% 0%)' }}></div>
                <div className="absolute inset-0 rounded-full border-8 border-purple-500" style={{ clipPath: 'polygon(50% 50%, 96.1% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)' }}></div>
                
                {/* Centro do gráfico */}
                <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalRevenue())}</div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
