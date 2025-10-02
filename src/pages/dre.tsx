import { useState, useEffect } from "react";
import { formatPercent, formatCurrency, formatDateBR } from "../lib/formatting";
import Select from "../components/Select";
import Button from "../components/Button";

// Configuração do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

interface DREItem {
  descricao: string;
  valor: number;
  percentual: number;
  tipo: 'receita' | 'despesa' | 'resultado';
}

interface DRE {
  periodo: string;
  receitas: DREItem[];
  despesas: DREItem[];
  resultado: DREItem[];
  totalReceitas: number;
  totalDespesas: number;
  resultadoLiquido: number;
  margemBruta: number;
  margemLiquida: number;
}

export default function DRE() {
  const [periodo, setPeriodo] = useState("2025-09");
  const [tipoVisualizacao, setTipoVisualizacao] = useState("tabela");
  const [dreData, setDreData] = useState<DRE | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para converter período YYYY-MM para formato brasileiro
  const formatPeriodoBR = (periodo: string) => {
    const [ano, mes] = periodo.split('-');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mesNome = meses[parseInt(mes) - 1] || mes;
    return `${mesNome} de ${ano}`;
  };

  // Função auxiliar para criar datas de forma segura
  const createSafeDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Data inválida:', dateString);
        return null;
      }
      return date;
    } catch (error) {
      console.warn('Erro ao criar data:', dateString, error);
      return null;
    }
  };

  // Função para buscar dados do DRE do banco
  const fetchDREData = async (periodoSelecionado: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        setError('Usuário não autenticado');
        return;
      }
      
      const user = JSON.parse(userData);
      const companyId = user.company_id;
      
      if (!companyId) {
        setError('ID da empresa não encontrado');
        return;
      }

      // Parse do período (formato: YYYY-MM)
      const [ano, mes] = periodoSelecionado.split('-');
      
      // Validar formato do período
      if (!ano || !mes || isNaN(parseInt(ano)) || isNaN(parseInt(mes))) {
        throw new Error(`Período inválido: ${periodoSelecionado}. Formato esperado: YYYY-MM`);
      }
      
      // Validar mês (1-12)
      const mesNum = parseInt(mes);
      if (mesNum < 1 || mesNum > 12) {
        throw new Error(`Mês inválido: ${mes}. Deve estar entre 01 e 12`);
      }
      
      const dataInicio = `${ano}-${mes.padStart(2, '0')}-01`;
      
      // Calcular o último dia do mês corretamente
      const ultimoDiaDoMes = new Date(parseInt(ano), parseInt(mes), 0).getDate();
      const dataFim = `${ano}-${mes.padStart(2, '0')}-${ultimoDiaDoMes.toString().padStart(2, '0')}`;

      // Buscar dados de todas as tabelas relevantes para o DRE
      const requests = [
        // Vendas de veículos (tabela sales) - consulta simplificada
        {
          name: 'sales',
          url: `${SUPABASE_URL}/rest/v1/sales?company_id=eq.${companyId}`,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': SUPABASE_ANON_KEY
          }
        },
        
        // Transações financeiras (tabela transactions) - consulta simplificada
        {
          name: 'transactions',
          url: `${SUPABASE_URL}/rest/v1/transactions?company_id=eq.${companyId}`,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': SUPABASE_ANON_KEY
          }
        },
        
        // Ordens de serviço (tabela service_orders) - consulta simplificada
        {
          name: 'service_orders',
          url: `${SUPABASE_URL}/rest/v1/service_orders?company_id=eq.${companyId}`,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': SUPABASE_ANON_KEY
          }
        },

        // Vendas de peças (tabela parts) - consulta simplificada
        {
          name: 'parts',
          url: `${SUPABASE_URL}/rest/v1/parts?company_id=eq.${companyId}`,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': SUPABASE_ANON_KEY
          }
        },

        // Propostas (tabela proposals) - consulta simplificada
        {
          name: 'proposals',
          url: `${SUPABASE_URL}/rest/v1/proposals?company_id=eq.${companyId}`,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': SUPABASE_ANON_KEY
          }
        }
      ];

      // Fazer requisições com tratamento individual de erro
      const results = await Promise.allSettled(
        requests.map(async (req) => {
          try {
            const response = await fetch(req.url, { headers: req.headers });
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Erro na tabela ${req.name}:`, response.status, errorText);
              return { name: req.name, data: [], error: `Erro ${response.status}: ${errorText}` };
            }
            const data = await response.json();
            return { name: req.name, data: Array.isArray(data) ? data : [], error: null };
          } catch (error) {
            console.error(`Erro na requisição ${req.name}:`, error);
            return { name: req.name, data: [], error: error instanceof Error ? error.message : 'Erro desconhecido' };
          }
        })
      );

      // Processar resultados
      const salesData = results[0].status === 'fulfilled' ? results[0].value.data : [];
      const transactionsData = results[1].status === 'fulfilled' ? results[1].value.data : [];
      const serviceOrdersData = results[2].status === 'fulfilled' ? results[2].value.data : [];
      const partsData = results[3].status === 'fulfilled' ? results[3].value.data : [];
      const proposalsData = results[4].status === 'fulfilled' ? results[4].value.data : [];

      // Log de erros para debug
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.error) {
          console.warn(`Aviso na tabela ${requests[index].name}:`, result.value.error);
        } else if (result.status === 'rejected') {
          console.error(`Erro na tabela ${requests[index].name}:`, result.reason);
        }
      });

      // Verificar se os dados são arrays válidos
      const salesArray = Array.isArray(salesData) ? salesData : [];
      const transactionsArray = Array.isArray(transactionsData) ? transactionsData : [];
      const serviceOrdersArray = Array.isArray(serviceOrdersData) ? serviceOrdersData : [];
      const partsArray = Array.isArray(partsData) ? partsData : [];
      const proposalsArray = Array.isArray(proposalsData) ? proposalsData : [];

      // Filtrar dados por período no lado do cliente
      const dataInicioObj = new Date(dataInicio);
      const dataFimObj = new Date(dataFim);
      
      // Validar se as datas são válidas
      if (isNaN(dataInicioObj.getTime()) || isNaN(dataFimObj.getTime())) {
        throw new Error(`Datas inválidas: início=${dataInicio}, fim=${dataFim}`);
      }
      
      // Adicionar um dia ao final para incluir o último dia do mês
      dataFimObj.setDate(dataFimObj.getDate() + 1);

      console.log('Filtros de data:', {
        periodo: periodoSelecionado,
        dataInicio: dataInicio,
        dataFim: dataFim,
        ultimoDiaDoMes: ultimoDiaDoMes,
        dataInicioObj: dataInicioObj.toISOString(),
        dataFimObj: dataFimObj.toISOString()
      });

      const salesFiltrados = salesArray.filter((sale: any) => {
        if (!sale.sale_date) return false;
        const saleDate = createSafeDate(sale.sale_date);
        if (!saleDate) return false;
        const isInRange = saleDate >= dataInicioObj && saleDate < dataFimObj;
        if (isInRange) {
          console.log('Venda incluída:', sale.sale_date, sale.sale_price);
        }
        return isInRange;
      });

      const transactionsFiltrados = transactionsArray.filter((transaction: any) => {
        if (!transaction.transaction_date) return false;
        const transactionDate = createSafeDate(transaction.transaction_date);
        if (!transactionDate) return false;
        const isInRange = transactionDate >= dataInicioObj && transactionDate < dataFimObj;
        if (isInRange) {
          console.log('Transação incluída:', transaction.transaction_date, transaction.amount, transaction.type);
        }
        return isInRange;
      });

      const serviceOrdersFiltrados = serviceOrdersArray.filter((order: any) => {
        if (!order.start_date) return false;
        const startDate = createSafeDate(order.start_date);
        if (!startDate) return false;
        const isInRange = startDate >= dataInicioObj && startDate < dataFimObj;
        if (isInRange) {
          console.log('Serviço incluído:', order.start_date, order.total_amount);
        }
        return isInRange;
      });

      const proposalsFiltrados = proposalsArray.filter((proposal: any) => {
        if (!proposal.proposal_date) return false;
        const proposalDate = createSafeDate(proposal.proposal_date);
        if (!proposalDate) return false;
        const isInRange = proposalDate >= dataInicioObj && proposalDate < dataFimObj;
        if (isInRange) {
          console.log('Proposta incluída:', proposal.proposal_date, proposal.vehicle_price);
        }
        return isInRange;
      });

      // Log para debug
      console.log('Dados recebidos do banco:', {
        vendas: salesArray.length,
        vendasFiltradas: salesFiltrados.length,
        transacoes: transactionsArray.length,
        transacoesFiltradas: transactionsFiltrados.length,
        servicos: serviceOrdersArray.length,
        servicosFiltrados: serviceOrdersFiltrados.length,
        pecas: partsArray.length,
        propostas: proposalsArray.length,
        propostasFiltradas: proposalsFiltrados.length
      });

      // === CALCULAR RECEITAS ===
      
      // 1. Vendas de veículos (tabela sales) - dados filtrados por período
      const totalVendasVeiculos = salesFiltrados.reduce((sum: number, sale: any) => sum + (sale.sale_price || 0), 0);
      const totalComissoes = salesFiltrados.reduce((sum: number, sale: any) => sum + (sale.commission || 0), 0);
      
      // 2. Vendas de peças (tabela parts) - estimativa baseada em estoque e preço
      const totalVendasPecas = partsArray.reduce((sum: number, part: any) => {
        const quantidadeVendida = (part.stock_quantity || 0) * 0.1; // Estimativa: 10% do estoque vendido
        return sum + (quantidadeVendida * (part.unit_price || 0));
      }, 0);
      
      // 3. Serviços de oficina (tabela service_orders) - dados filtrados por período
      const totalServicos = serviceOrdersFiltrados.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
      
      // 4. Propostas aceitas (tabela proposals) - dados filtrados por período
      const totalPropostasAceitas = proposalsFiltrados.reduce((sum: number, proposal: any) => sum + (proposal.vehicle_price || 0), 0);
      
      // 5. Transações de receita (tabela transactions) - dados filtrados por período
      const receitasTransacoes = transactionsFiltrados.filter((t: any) => t.type === 'receita');
      const totalReceitasTransacoes = receitasTransacoes.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      // === CALCULAR DESPESAS ===
      
      // 1. Transações de despesa (tabela transactions) - dados filtrados por período
      const despesasTransacoes = transactionsFiltrados.filter((t: any) => t.type === 'despesa');
      const totalDespesasTransacoes = despesasTransacoes.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      
      // 2. Custo das peças (tabela parts)
      const custoPecas = partsArray.reduce((sum: number, part: any) => {
        const quantidadeVendida = (part.stock_quantity || 0) * 0.1; // Estimativa: 10% do estoque vendido
        const custoUnitario = (part.unit_price || 0) * 0.7; // Estimativa: 70% do preço é custo
        return sum + (quantidadeVendida * custoUnitario);
      }, 0);

      // === CALCULAR TOTAIS ===
      const totalReceitas = totalVendasVeiculos + totalVendasPecas + totalServicos + totalPropostasAceitas + totalReceitasTransacoes;
      const totalDespesas = totalDespesasTransacoes + custoPecas;
      const resultadoLiquido = totalReceitas - totalDespesas;
      
      // Calcular margens
      const margemBruta = totalReceitas > 0 ? ((totalReceitas - custoPecas) / totalReceitas) * 100 : 0;
      const margemLiquida = totalReceitas > 0 ? (resultadoLiquido / totalReceitas) * 100 : 0;

      // === CONSTRUIR DRE COM DADOS REAIS ===
      const dreDataReal: DRE = {
        periodo: periodoSelecionado,
    receitas: [
          { 
            descricao: "Vendas de Veículos", 
            valor: totalVendasVeiculos, 
            percentual: totalReceitas > 0 ? (totalVendasVeiculos / totalReceitas) * 100 : 0, 
            tipo: 'receita' 
          },
          { 
            descricao: "Vendas de Peças", 
            valor: totalVendasPecas, 
            percentual: totalReceitas > 0 ? (totalVendasPecas / totalReceitas) * 100 : 0, 
            tipo: 'receita' 
          },
          { 
            descricao: "Serviços de Oficina", 
            valor: totalServicos, 
            percentual: totalReceitas > 0 ? (totalServicos / totalReceitas) * 100 : 0, 
            tipo: 'receita' 
          },
          { 
            descricao: "Propostas Aceitas", 
            valor: totalPropostasAceitas, 
            percentual: totalReceitas > 0 ? (totalPropostasAceitas / totalReceitas) * 100 : 0, 
            tipo: 'receita' 
          },
          { 
            descricao: "Comissões", 
            valor: totalComissoes, 
            percentual: totalReceitas > 0 ? (totalComissoes / totalReceitas) * 100 : 0, 
            tipo: 'receita' 
          },
          { 
            descricao: "Outras Receitas", 
            valor: totalReceitasTransacoes, 
            percentual: totalReceitas > 0 ? (totalReceitasTransacoes / totalReceitas) * 100 : 0, 
            tipo: 'receita' 
          }
    ],
    despesas: [
          // Despesas das transações
          ...despesasTransacoes.map((despesa: any) => ({
            descricao: despesa.description || 'Despesa não identificada',
            valor: despesa.amount || 0,
            percentual: totalReceitas > 0 ? ((despesa.amount || 0) / totalReceitas) * 100 : 0,
            tipo: 'despesa' as const
          })),
          // Custo das peças
          {
            descricao: "Custo das Peças",
            valor: custoPecas,
            percentual: totalReceitas > 0 ? (custoPecas / totalReceitas) * 100 : 0,
            tipo: 'despesa' as const
          }
    ],
    resultado: [
          { descricao: "Receita Bruta", valor: totalReceitas, percentual: 100, tipo: 'resultado' },
          { descricao: "(-) Custo dos Produtos/Serviços", valor: custoPecas, percentual: totalReceitas > 0 ? (custoPecas / totalReceitas) * 100 : 0, tipo: 'resultado' },
          { descricao: "= Lucro Bruto", valor: totalReceitas - custoPecas, percentual: margemBruta, tipo: 'resultado' },
          { descricao: "(-) Despesas Operacionais", valor: totalDespesasTransacoes, percentual: totalReceitas > 0 ? (totalDespesasTransacoes / totalReceitas) * 100 : 0, tipo: 'resultado' },
          { descricao: "= Resultado Operacional", valor: totalReceitas - totalDespesas, percentual: totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0, tipo: 'resultado' },
          { descricao: "(-) Despesas Financeiras", valor: 0, percentual: 0, tipo: 'resultado' },
          { descricao: "(+) Receitas Financeiras", valor: 0, percentual: 0, tipo: 'resultado' },
          { descricao: "= Resultado Antes do IR", valor: resultadoLiquido, percentual: totalReceitas > 0 ? (resultadoLiquido / totalReceitas) * 100 : 0, tipo: 'resultado' },
          { descricao: "(-) Imposto de Renda", valor: resultadoLiquido * 0.15, percentual: totalReceitas > 0 ? ((resultadoLiquido * 0.15) / totalReceitas) * 100 : 0, tipo: 'resultado' },
          { descricao: "= Resultado Líquido", valor: resultadoLiquido * 0.85, percentual: margemLiquida, tipo: 'resultado' }
        ],
        totalReceitas,
        totalDespesas,
        resultadoLiquido: resultadoLiquido * 0.85,
        margemBruta,
        margemLiquida
      };

      setDreData(dreDataReal);
      
    } catch (error) {
      console.error('Erro ao buscar dados do DRE:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao carregar dados do DRE: ${errorMessage}`);
      // Em caso de erro, não usar dados mock - deixar vazio
      setDreData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para exportar DRE
  const handleExport = () => {
    if (!dreData) return;

    try {
      // Criar dados para exportação
      const exportData = {
        periodo: formatPeriodoBR(dreData.periodo),
        receitas: dreData.receitas,
        despesas: dreData.despesas,
        resultado: dreData.resultado,
        totais: {
          receitaTotal: dreData.totalReceitas,
          despesaTotal: dreData.totalDespesas,
          resultadoLiquido: dreData.resultadoLiquido,
          margemBruta: dreData.margemBruta,
          margemLiquida: dreData.margemLiquida
        }
      };

      // Converter para CSV
      const csvContent = generateCSV(exportData);
      
      // Criar e baixar arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `DRE_${formatPeriodoBR(dreData.periodo).replace(' ', '_')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('DRE exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar DRE:', error);
      alert('Erro ao exportar DRE. Tente novamente.');
    }
  };

  // Função para gerar CSV
  const generateCSV = (data: any) => {
    let csv = 'DRE - Demonstração do Resultado do Exercício\n';
    csv += `Período: ${data.periodo}\n\n`;
    
    csv += 'RECEITAS\n';
    csv += 'Descrição,Valor,Percentual\n';
    data.receitas.forEach((item: any) => {
      csv += `"${item.descricao}",${item.valor},${item.percentual}%\n`;
    });
    
    csv += '\nDESPESAS\n';
    csv += 'Descrição,Valor,Percentual\n';
    data.despesas.forEach((item: any) => {
      csv += `"${item.descricao}",${item.valor},${item.percentual}%\n`;
    });
    
    csv += '\nRESULTADO\n';
    csv += 'Descrição,Valor,Percentual\n';
    data.resultado.forEach((item: any) => {
      csv += `"${item.descricao}",${item.valor},${item.percentual}%\n`;
    });
    
    csv += '\nTOTAIS\n';
    csv += `Receita Total,${data.totais.receitaTotal}\n`;
    csv += `Despesa Total,${data.totais.despesaTotal}\n`;
    csv += `Resultado Líquido,${data.totais.resultadoLiquido}\n`;
    csv += `Margem Bruta,${data.totais.margemBruta}%\n`;
    csv += `Margem Líquida,${data.totais.margemLiquida}%\n`;
    
    return csv;
  };

  // Função para imprimir DRE
  const handlePrint = () => {
    window.print();
  };

  // Carregar dados quando o período mudar
  useEffect(() => {
    console.log('Período mudou para:', periodo);
    fetchDREData(periodo);
  }, [periodo]);

  // Carregar dados iniciais
  useEffect(() => {
    console.log('Carregando dados iniciais para período:', periodo);
    fetchDREData(periodo);
  }, []);


  // Usar a função centralizada de formatação

  const getValueColor = (tipo: string, valor: number) => {
    if (tipo === 'receita') return 'text-green-600';
    if (tipo === 'despesa') return 'text-red-600';
    if (tipo === 'resultado') {
      return valor >= 0 ? 'text-green-600' : 'text-red-600';
    }
    return 'text-gray-900';
  };

  const getBarWidth = (percentual: number) => {
    return Math.min(Math.abs(percentual), 100);
  };

  const getBarColor = (tipo: string) => {
    if (tipo === 'receita') return 'bg-green-500';
    if (tipo === 'despesa') return 'bg-red-500';
    if (tipo === 'resultado') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 print-full-width">
      <div className="px-4 py-6 sm:px-0 print-no-margin">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DRE - Demonstração do Resultado do Exercício</h1>
              <p className="text-gray-600 mt-2">Análise financeira detalhada da empresa</p>
            </div>
            <div className="flex items-end space-x-3 no-print">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Período</label>
              <Select
                value={periodo}
                  onChange={(e) => {
                    console.log('Select mudou para:', e.target.value);
                    setPeriodo(e.target.value);
                  }}
              >
                <option value="2025-09">Setembro 2025</option>
                <option value="2025-08">Agosto 2025</option>
                <option value="2025-07">Julho 2025</option>
                <option value="2025-06">Junho 2025</option>
                  <option value="2025-05">Maio 2025</option>
                  <option value="2025-04">Abril 2025</option>
                  <option value="2025-03">Março 2025</option>
                  <option value="2025-02">Fevereiro 2025</option>
                  <option value="2025-01">Janeiro 2025</option>
              </Select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Visualização</label>
              <Select
                value={tipoVisualizacao}
                onChange={(e) => setTipoVisualizacao(e.target.value)}
              >
                <option value="tabela">Visualização em Tabela</option>
                <option value="grafico">Visualização em Gráfico</option>
              </Select>
              </div>
              <Button
                variant="outline"
                onClick={handlePrint}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                }
              >
                Imprimir
              </Button>
              <Button
                variant="primary"
                onClick={handleExport}
                disabled={isLoading || !dreData}
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
              <p className="mt-4 text-gray-600">Carregando dados do DRE para {formatPeriodoBR(periodo)}...</p>
            </div>
          </div>
        )}

        {/* Período Atual */}
        {dreData && !isLoading && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Período selecionado:</span> {formatPeriodoBR(periodo)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Dados filtrados automaticamente para o período selecionado
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resumo Financeiro */}
        {dreData && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-semibold text-green-600">{formatCurrency(dreData.totalReceitas)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Despesas Total</p>
                  <p className="text-2xl font-semibold text-red-600">{formatCurrency(dreData.totalDespesas)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resultado Líquido</p>
                  <p className="text-2xl font-semibold text-blue-600">{formatCurrency(dreData.resultadoLiquido)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Margem Líquida</p>
                  <p className="text-2xl font-semibold text-purple-600">{formatPercent(dreData.margemLiquida)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DRE Detalhada */}
        {dreData && !isLoading && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">DRE Detalhada - {formatPeriodoBR(dreData.periodo)}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    %
                  </th>
                  {tipoVisualizacao === 'grafico' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gráfico
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Receitas */}
                <tr className="bg-green-50">
                  <td colSpan={tipoVisualizacao === 'grafico' ? 4 : 3} className="px-6 py-3">
                    <h4 className="text-lg font-semibold text-green-800">RECEITAS</h4>
                  </td>
                </tr>
                {dreData.receitas.map((item, index) => (
                  <tr key={`receita-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 pl-4">{item.descricao}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${getValueColor(item.tipo, item.valor)}`}>
                        {formatCurrency(item.valor)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-500">{formatPercent(item.percentual)}</div>
                    </td>
                    {tipoVisualizacao === 'grafico' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getBarColor(item.tipo)}`}
                            style={{ width: `${getBarWidth(item.percentual)}%` }}
                          ></div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {/* Despesas */}
                <tr className="bg-red-50">
                  <td colSpan={tipoVisualizacao === 'grafico' ? 4 : 3} className="px-6 py-3">
                    <h4 className="text-lg font-semibold text-red-800">DESPESAS</h4>
                  </td>
                </tr>
                {dreData.despesas.map((item, index) => (
                  <tr key={`despesa-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 pl-4">{item.descricao}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${getValueColor(item.tipo, item.valor)}`}>
                        {formatCurrency(item.valor)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-500">{formatPercent(item.percentual)}</div>
                    </td>
                    {tipoVisualizacao === 'grafico' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getBarColor(item.tipo)}`}
                            style={{ width: `${getBarWidth(item.percentual)}%` }}
                          ></div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {/* Resultado */}
                <tr className="bg-blue-50">
                  <td colSpan={tipoVisualizacao === 'grafico' ? 4 : 3} className="px-6 py-3">
                    <h4 className="text-lg font-semibold text-blue-800">RESULTADO</h4>
                  </td>
                </tr>
                {dreData.resultado.map((item, index) => (
                  <tr key={`resultado-${index}`} className={`hover:bg-gray-50 ${index === dreData.resultado.length - 1 ? 'bg-yellow-50 border-t-2 border-yellow-300' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${index === dreData.resultado.length - 1 ? 'font-bold' : ''} ${index === dreData.resultado.length - 1 ? 'text-yellow-800' : 'text-gray-900'} pl-4`}>
                        {item.descricao}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm ${index === dreData.resultado.length - 1 ? 'font-bold text-lg' : 'font-medium'} ${getValueColor(item.tipo, item.valor)}`}>
                        {formatCurrency(item.valor)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm ${index === dreData.resultado.length - 1 ? 'font-bold' : ''} ${index === dreData.resultado.length - 1 ? 'text-yellow-800' : 'text-gray-500'}`}>
                        {formatPercent(item.percentual)}
                      </div>
                    </td>
                    {tipoVisualizacao === 'grafico' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${index === dreData.resultado.length - 1 ? 'bg-yellow-500' : getBarColor(item.tipo)}`}
                            style={{ width: `${getBarWidth(item.percentual)}%` }}
                          ></div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Análise de Indicadores */}
        {dreData && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Indicadores de Rentabilidade */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Indicadores de Rentabilidade</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Margem Bruta</span>
                  <span className="text-lg font-bold text-green-600">{formatPercent(dreData.margemBruta)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Margem Operacional</span>
                <span className="text-lg font-bold text-blue-600">25.2%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Margem Líquida</span>
                  <span className="text-lg font-bold text-purple-600">{formatPercent(dreData.margemLiquida)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">ROI (Retorno sobre Investimento)</span>
                <span className="text-lg font-bold text-yellow-600">18.5%</span>
              </div>
            </div>
          </div>

          {/* Análise de Custos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Análise de Custos</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Custo dos Produtos/Serviços</span>
                <span className="text-lg font-bold text-red-600">{formatPercent(62.6)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Despesas Operacionais</span>
                <span className="text-lg font-bold text-orange-600">{formatPercent(12.2)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Despesas Financeiras</span>
                <span className="text-lg font-bold text-gray-600">{formatPercent(0.7)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Impostos</span>
                <span className="text-lg font-bold text-indigo-600">{formatPercent(3.7)}</span>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </main>
  );
}
