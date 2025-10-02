import React, { useState, useEffect } from 'react';

interface AIInsightCardProps {
  pageData: any;
  pageType: 'sales' | 'leads' | 'customers' | 'vehicles' | 'parts' | 'service-orders' | 'schedule' | 'accounts' | 'transactions' | 'dre' | 'revenue-evolution' | 'integrator';
  className?: string;
}

export default function AIInsightCard({ pageData, pageType, className = '' }: AIInsightCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [insight, setInsight] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Simular carregamento da IA
    const timer = setTimeout(() => {
      generateInsight();
      setIsLoading(false);
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [pageData, pageType]);

  useEffect(() => {
    // Atualizar o tempo apenas no cliente para evitar erro de hidratação
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const generateInsight = () => {
    let insightText = '';

    switch (pageType) {
      case 'sales':
        insightText = generateSalesInsight(pageData);
        break;
      case 'leads':
        insightText = generateLeadsInsight(pageData);
        break;
      case 'customers':
        insightText = generateCustomersInsight(pageData);
        break;
      case 'vehicles':
        insightText = generateVehiclesInsight(pageData);
        break;
      case 'parts':
        insightText = generatePartsInsight(pageData);
        break;
      case 'service-orders':
        insightText = generateServiceOrdersInsight(pageData);
        break;
      case 'schedule':
        insightText = generateScheduleInsight(pageData);
        break;
      case 'accounts':
        insightText = generateAccountsInsight(pageData);
        break;
      case 'transactions':
        insightText = generateTransactionsInsight(pageData);
        break;
      case 'dre':
        insightText = generateDREInsight(pageData);
        break;
      case 'revenue-evolution':
        insightText = generateRevenueEvolutionInsight(pageData);
        break;
      case 'integrator':
        insightText = generateIntegratorInsight(pageData);
        break;
      default:
        insightText = 'Analisando dados da página...';
    }

    setInsight(insightText);
  };

  const generateSalesInsight = (data: any) => {
    const total = data?.length || 0;
    const concluidas = data?.filter((s: any) => s.status === 'Concluída').length || 0;
    const taxaConversao = total > 0 ? (concluidas / total * 100) : 0;
    const taxaConversaoFormatada = taxaConversao.toFixed(1);
    
    if (taxaConversao < 20) {
      return `📊 Análise de Vendas: Sua taxa de conversão está em ${taxaConversaoFormatada}%, abaixo da média do mercado (25-30%). Recomendo focar na qualificação de leads e acompanhamento mais próximo dos prospects.`;
    } else if (taxaConversao > 40) {
      return `🎉 Excelente performance! Taxa de conversão de ${taxaConversaoFormatada}% está acima da média. Continue com essa estratégia e considere expandir a equipe de vendas.`;
    } else {
      return `📈 Performance sólida com ${taxaConversaoFormatada}% de conversão. Para melhorar ainda mais, foque em leads de alta prioridade e reduza o tempo de resposta.`;
    }
  };

  const generateLeadsInsight = (data: any) => {
    const total = data?.length || 0;
    const scoreMedio = data?.reduce((acc: number, lead: any) => acc + (lead.score || 0), 0) / total || 0;
    const novos = data?.filter((l: any) => l.status === 'new' || l.status === 'Novo').length || 0;
    
    if (scoreMedio < 70) {
      return `🎯 Análise de Leads: Score médio de ${scoreMedio.toFixed(1)} indica necessidade de melhor qualificação. ${novos} leads novos aguardando primeiro contato - priorize o follow-up imediato.`;
    } else if (scoreMedio > 85) {
      return `⭐ Leads de alta qualidade! Score médio de ${scoreMedio.toFixed(1)} mostra excelente qualificação. Foque na conversão dos leads de alta prioridade.`;
    } else {
      return `📊 Score médio de ${scoreMedio.toFixed(1)} indica boa qualidade dos leads. ${novos} leads novos precisam de atenção imediata para maximizar conversões.`;
    }
  };

  const generateCustomersInsight = (data: any) => {
    const total = data?.length || 0;
    const ativos = data?.filter((c: any) => c.status === 'Ativo' || c.status === 'active').length || 0;
    const percentualAtivos = total > 0 ? (ativos / total * 100).toFixed(1) : 0;
    
    return `👥 Base de ${total} clientes com ${percentualAtivos}% ativos. Recomendo implementar programa de fidelização e follow-up regular para aumentar retenção.`;
  };

  const generateVehiclesInsight = (data: any) => {
    const total = data?.length || 0;
    const disponiveis = data?.filter((v: any) => v.status === 'Disponível').length || 0;
    const percentualDisponivel = total > 0 ? (disponiveis / total * 100).toFixed(1) : 0;
    
    return `🚗 ${total} veículos no estoque com ${percentualDisponivel}% disponíveis. Considere estratégias de marketing para veículos parados há mais tempo.`;
  };

  const generatePartsInsight = (data: any) => {
    const total = data?.length || 0;
    const baixoEstoque = data?.filter((p: any) => p.estoque < 10).length || 0;
    
    return `🔧 ${total} peças cadastradas. ${baixoEstoque} itens com estoque baixo - recomendo reposição urgente para evitar rupturas.`;
  };

  const generateServiceOrdersInsight = (data: any) => {
    const ativas = data?.filter((so: any) => so.status === 'Ativa').length || 0;
    const concluidas = data?.filter((so: any) => so.status === 'Concluída').length || 0;
    
    return `🛠️ ${ativas} ordens ativas e ${concluidas} concluídas. Para otimizar, foque em reduzir tempo médio de conclusão e melhorar comunicação com clientes.`;
  };

  const generateScheduleInsight = (data: any) => {
    const hoje = data?.filter((s: any) => s.data === new Date().toLocaleDateString()).length || 0;
    const estaSemana = data?.filter((s: any) => {
      const dataAgendamento = new Date(s.data);
      const hoje = new Date();
      const diffTime = dataAgendamento.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length || 0;
    
    return `📅 ${hoje} agendamentos hoje e ${estaSemana} esta semana. Mantenha comunicação proativa com clientes para reduzir faltas.`;
  };

  const generateAccountsInsight = (data: any) => {
    const aReceber = data?.filter((a: any) => a.tipo === 'Receber').reduce((acc: number, a: any) => acc + a.valor, 0) || 0;
    const aPagar = data?.filter((a: any) => a.tipo === 'Pagar').reduce((acc: number, a: any) => acc + a.valor, 0) || 0;
    
    return `💰 R$ ${aReceber.toLocaleString()} a receber vs R$ ${aPagar.toLocaleString()} a pagar. Fluxo de caixa ${aReceber > aPagar ? 'positivo' : 'negativo'} - monitore de perto.`;
  };

  const generateTransactionsInsight = (data: any) => {
    const total = data?.length || 0;
    const receitas = data?.filter((t: any) => t.tipo === 'Receita').reduce((acc: number, t: any) => acc + t.valor, 0) || 0;
    const despesas = data?.filter((t: any) => t.tipo === 'Despesa').reduce((acc: number, t: any) => acc + t.valor, 0) || 0;
    
    return `💳 ${total} transações registradas. Receitas de R$ ${receitas.toLocaleString()} vs despesas de R$ ${despesas.toLocaleString()}. Saldo ${receitas > despesas ? 'positivo' : 'negativo'}.`;
  };

  const generateDREInsight = (data: any) => {
    const receita = data?.receita || 0;
    const despesas = data?.despesas || 0;
    const lucro = data?.lucro || 0;
    const margem = data?.margem || 0;
    
    return `📊 DRE mostra margem de ${margem}% com lucro de R$ ${lucro.toLocaleString()}. ${margem > 30 ? 'Excelente' : margem > 20 ? 'Boa' : 'Atenção'} rentabilidade - ${margem < 20 ? 'revisar custos' : 'manter estratégia'}.`;
  };

  const generateRevenueEvolutionInsight = (data: any) => {
    const crescimento = data?.crescimento || 0;
    
    return `📈 Evolução do faturamento mostra ${crescimento > 0 ? 'crescimento' : 'queda'} de ${Math.abs(crescimento)}%. ${crescimento > 10 ? 'Excelente' : crescimento > 0 ? 'Bom' : 'Revisar'} desempenho comercial.`;
  };

  const generateIntegratorInsight = (data: any) => {
    const totalAds = data?.totalAds || 0;
    const ativos = data?.activeAds || 0;
    const visualizacoes = data?.totalViews || 0;
    const contatos = data?.totalContacts || 0;
    const taxaConversao = visualizacoes > 0 ? (contatos / visualizacoes * 100) : 0;
    const taxaConversaoFormatada = taxaConversao.toFixed(2);
    
    return `🎯 ${totalAds} anúncios (${ativos} ativos) geraram ${visualizacoes.toLocaleString()} visualizações e ${contatos} contatos. Taxa de conversão de ${taxaConversaoFormatada}% - ${taxaConversao > 2 ? 'excelente' : 'pode melhorar'}.`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Card principal com gradiente e animação */}
      <div className={`
        relative overflow-hidden rounded-xl shadow-lg
        bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700
        transform transition-all duration-500 ease-in-out
        ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        hover:scale-105 hover:shadow-2xl
      `}>
        {/* Efeito de brilho pulsante */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
        
        {/* Sombra pulsante */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-75 animate-pulse"></div>
        
        {/* Conteúdo do card */}
        <div className="relative p-6 text-white">
          {/* Header com ícone da IA */}
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-full mr-4">
              <svg className="w-6 h-6 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">Insights da IA</h3>
              <p className="text-sm text-blue-100">Análise inteligente dos seus dados</p>
            </div>
          </div>

          {/* Conteúdo da análise */}
          <div className="min-h-[80px] flex items-center">
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="text-blue-100">Analisando dados...</span>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-blue-50">
                {insight}
              </p>
            )}
          </div>

          {/* Footer com timestamp */}
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <div className="flex items-center justify-between text-xs text-blue-200">
              <span>Última análise: {currentTime || 'Carregando...'}</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>IA Ativa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Efeito de partículas flutuantes */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute bottom-6 left-8 w-1 h-1 bg-white rounded-full opacity-40 animate-ping"></div>
        <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-white rounded-full opacity-50 animate-pulse"></div>
      </div>
    </div>
  );
}
