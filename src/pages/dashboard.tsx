import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { formatCurrency, formatNumber } from "../lib/formatting";
import Select from "../components/Select";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardData {
  sales: {
    today: { vehicles: number; revenue: number; target: number };
    month: { vehicles: number; revenue: number; target: number };
  };
  stock: {
    total: number;
    new: number;
    used: number;
    consignment: number;
  };
  financial: {
    revenue: number;
    expenses: number;
    profit: number;
    pending: number;
  };
  workshop: {
    active: number;
    completed: number;
    pending: number;
    revenue: number;
  };
  crm: {
    leads: number;
    opportunities: number;
    proposals: number;
    conversions: number;
    customers: number;
    users: number;
    suppliers: number;
  };
  integrator: {
    totalAds: number;
    activeAds: number;
    totalViews: number;
    totalContacts: number;
  };
  accounts: {
    toReceive: number;
    toPay: number;
    overdue: number;
    paid: number;
  };
  parts: {
    total: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("hoje");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

  // Função para buscar dados do dashboard
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const userData = localStorage.getItem('user_data');
      if (!userData) {
        router.push('/');
        return;
      }

      const user = JSON.parse(userData);
      const accessToken = localStorage.getItem('supabase_access_token');

      if (!accessToken) {
        router.push('/');
        return;
      }

      // Buscar dados de vendas
      const salesResponse = await fetch(`${SUPABASE_URL}/rest/v1/sales?company_id=eq.${user.company_id}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Buscar dados de veículos
      const vehiclesResponse = await fetch(`${SUPABASE_URL}/rest/v1/vehicles?company_id=eq.${user.company_id}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Buscar dados de leads
      const leadsResponse = await fetch(`${SUPABASE_URL}/rest/v1/leads?company_id=eq.${user.company_id}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Buscar dados de clientes
      const customersResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers?company_id=eq.${user.company_id}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Buscar dados de propostas
      const proposalsResponse = await fetch(`${SUPABASE_URL}/rest/v1/proposals?company_id=eq.${user.company_id}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Buscar dados de anúncios
      const adsResponse = await fetch(`${SUPABASE_URL}/rest/v1/ads?company_id=eq.${user.company_id}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Buscar dados de contas
      const accountsResponse = await fetch(`${SUPABASE_URL}/rest/v1/accounts?company_id=eq.${user.company_id}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Buscar dados de peças
      const partsResponse = await fetch(`${SUPABASE_URL}/rest/v1/parts?company_id=eq.${user.company_id}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (salesResponse.ok && vehiclesResponse.ok && leadsResponse.ok && customersResponse.ok && proposalsResponse.ok && adsResponse.ok && accountsResponse.ok && partsResponse.ok) {
        const sales = await salesResponse.json();
        const vehicles = await vehiclesResponse.json();
        const leads = await leadsResponse.json();
        const customers = await customersResponse.json();
        const proposals = await proposalsResponse.json();
        const ads = await adsResponse.json();
        const accounts = await accountsResponse.json();
        const parts = await partsResponse.json();

        // Calcular dados do dashboard
        const totalRevenue = sales.reduce((sum: number, sale: any) => sum + (sale.sale_price || 0), 0);
        const todaySales = sales.filter((sale: any) => {
          const saleDate = new Date(sale.sale_date);
          const today = new Date();
          return saleDate.toDateString() === today.toDateString();
        });

        const todayRevenue = todaySales.reduce((sum: number, sale: any) => sum + (sale.sale_price || 0), 0);

        // Calcular dados de contas
        const totalPagar = accounts
          .filter((account: any) => account.type.toLowerCase() === 'despesa' || account.type.toLowerCase() === 'passivo')
          .reduce((sum: number, account: any) => sum + (account.balance || 0), 0);
        
        const totalReceber = accounts
          .filter((account: any) => account.type.toLowerCase() === 'receita' || account.type.toLowerCase() === 'ativo')
          .reduce((sum: number, account: any) => sum + (account.balance || 0), 0);

        // Calcular dados de peças
        const totalPartsValue = parts.reduce((sum: number, part: any) => sum + ((part.sale_price || 0) * (part.stock_quantity || 0)), 0);
        const lowStockParts = parts.filter((part: any) => (part.stock_quantity || 0) <= (part.minimum_stock || 0) && (part.stock_quantity || 0) > 0).length;
        const outOfStockParts = parts.filter((part: any) => (part.stock_quantity || 0) === 0).length;

        const data: DashboardData = {
          sales: {
            today: { vehicles: todaySales.length, revenue: todayRevenue, target: 400000 },
            month: { vehicles: sales.length, revenue: totalRevenue, target: 5000000 }
          },
          stock: {
            total: vehicles.length,
            new: vehicles.filter((v: any) => v.year >= 2023).length,
            used: vehicles.filter((v: any) => v.year < 2023).length,
            consignment: vehicles.filter((v: any) => v.status === 'consignment').length
          },
          financial: {
            revenue: totalRevenue,
            expenses: totalRevenue * 0.6, // Estimativa
            profit: totalRevenue * 0.4, // Estimativa
            pending: proposals.reduce((sum: number, p: any) => sum + (p.proposal_price || 0), 0)
          },
          workshop: {
            active: 12,
            completed: 8,
            pending: 4,
            revenue: 45000
          },
          crm: {
            leads: leads.length,
            opportunities: leads.filter((l: any) => l.status === 'qualified').length,
            proposals: proposals.length,
            conversions: sales.length,
            customers: customers.length,
            users: 3,
            suppliers: 8
          },
          integrator: {
            totalAds: ads.length,
            activeAds: ads.filter((a: any) => a.status === 'active').length,
            totalViews: 15420,
            totalContacts: 342
          },
          accounts: {
            toReceive: Math.abs(totalReceber),
            toPay: Math.abs(totalPagar),
            overdue: 0, // TODO: Implementar cálculo de vencidas
            paid: 0 // TODO: Implementar cálculo de pagas
          },
          parts: {
            total: parts.length,
            lowStock: lowStockParts,
            outOfStock: outOfStockParts,
            totalValue: totalPartsValue
          }
        };

        setDashboardData(data);
      } else {
        setError('Erro ao carregar dados do dashboard');
      }

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Dados do dashboard (sem fallback mockado)
  const salesData = dashboardData?.sales || {
    today: { vehicles: 0, revenue: 0, target: 0 },
    month: { vehicles: 0, revenue: 0, target: 0 }
  };

  const stockData = dashboardData?.stock || {
    total: 0,
    new: 0,
    used: 0,
    consignment: 0
  };

  const financialData = dashboardData?.financial || {
    revenue: 0,
    expenses: 0,
    profit: 0,
    pending: 0
  };

  const workshopData = dashboardData?.workshop || {
    active: 0,
    completed: 0,
    pending: 0,
    revenue: 0
  };

  const crmData = dashboardData?.crm || {
    leads: 0,
    opportunities: 0,
    proposals: 0,
    conversions: 0,
    customers: 0,
    users: 0,
    suppliers: 0
  };

  // Novos dados para funcionalidades adicionadas
  const integratorData = dashboardData?.integrator || {
    totalAds: 0,
    activeAds: 0,
    totalViews: 0,
    totalContacts: 0
  };

  const partsData = dashboardData?.parts || {
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  };

  const partsCategories = {
    motor: 0,
    suspensao: 0,
    freios: 0,
    eletrica: 0,
    outros: 0
  };

  const serviceOrdersData = {
    active: 0,
    completed: 0,
    pending: 0,
    revenue: 0,
    averageTime: 0
  };

  const scheduleData = {
    today: 0,
    thisWeek: 0,
    pending: 0,
    completed: 0
  };

  const accountsData = dashboardData?.accounts || {
    toReceive: 0,
    toPay: 0,
    overdue: 0,
    paid: 0
  };

  const dreData = {
    revenue: 0,
    expenses: 0,
    profit: 0,
    margin: 0
  };

  // Dados para gráficos
  const serviceOrdersChartData = [
    { name: 'Ativas', value: serviceOrdersData.active, color: '#3B82F6' },
    { name: 'Concluídas', value: serviceOrdersData.completed, color: '#10B981' },
    { name: 'Pendentes', value: serviceOrdersData.pending, color: '#F59E0B' }
  ];

  const scheduleChartData = [
    { name: 'Hoje', value: scheduleData.today, color: '#3B82F6' },
    { name: 'Esta Semana', value: scheduleData.thisWeek, color: '#6366F1' },
    { name: 'Pendentes', value: scheduleData.pending, color: '#F59E0B' },
    { name: 'Concluídos', value: scheduleData.completed, color: '#10B981' }
  ];

  const accountsChartData = [
    { name: 'A Receber', value: accountsData.toReceive, color: '#10B981' },
    { name: 'A Pagar', value: accountsData.toPay, color: '#EF4444' },
    { name: 'Vencidas', value: accountsData.overdue, color: '#DC2626' },
    { name: 'Pagas', value: accountsData.paid, color: '#059669' }
  ];

  const dreChartData = [
    { name: 'Receita', value: dreData.revenue, color: '#10B981' },
    { name: 'Despesas', value: dreData.expenses, color: '#EF4444' },
    { name: 'Lucro', value: dreData.profit, color: '#3B82F6' }
  ];

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Carregando dashboard...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          {/* Título e Resumo */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Dashboard Executivo
                </h2>
                <p className="text-gray-600">
                  Visão geral da operação - {selectedPeriod === "hoje" ? "Hoje" : selectedPeriod === "mes" ? "Este Mês" : "Este Trimestre"}
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="hoje">Hoje</option>
                  <option value="mes">Este Mês</option>
                  <option value="trimestre">Este Trimestre</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Vendas */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vendas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedPeriod === "hoje" ? salesData.today.vehicles : salesData.month.vehicles}
                  </p>
                  <p className="text-sm text-gray-600">veículos</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Meta: {selectedPeriod === "hoje" ? "5" : "50"}</span>
                  <span className="text-green-600">
                    {selectedPeriod === "hoje" ? "60%" : "94%"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: selectedPeriod === "hoje" ? "60%" : "94%" }}></div>
                </div>
              </div>
            </div>

            {/* Receita */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedPeriod === "hoje" ? salesData.today.revenue : salesData.month.revenue)}
                  </p>
                  <p className="text-sm text-gray-600">total</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Meta: {formatCurrency(selectedPeriod === "hoje" ? salesData.today.target : salesData.month.target)}</span>
                  <span className="text-blue-600">
                    {selectedPeriod === "hoje" ? "71%" : "84%"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: selectedPeriod === "hoje" ? "71%" : "84%" }}></div>
                </div>
              </div>
            </div>

            {/* Estoque */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Estoque</p>
                  <p className="text-2xl font-bold text-gray-900">{stockData.total}</p>
                  <p className="text-sm text-gray-600">veículos</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Novos: {stockData.new}</span>
                  <span className="text-gray-600">Usados: {stockData.used}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Consignação: {stockData.consignment}</span>
                </div>
              </div>
            </div>

            {/* Lucro */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lucro</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(financialData.profit)}
                  </p>
                  <p className="text-sm text-gray-600">margem: 33%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Receita: {formatCurrency(financialData.revenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Despesas: {formatCurrency(financialData.expenses)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos e Seções Detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Gráfico de Vendas por Categoria */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Categoria</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-600">Novos</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">18</span>
                    <span className="text-xs text-gray-600 ml-1">(38%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "38%" }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-600">Usados</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">22</span>
                    <span className="text-xs text-gray-600 ml-1">(47%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "47%" }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-600">Seminovos</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">7</span>
                    <span className="text-xs text-gray-600 ml-1">(15%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>
            </div>

            {/* Oficina e Serviços */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Oficina e Serviços</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{workshopData.active}</p>
                  <p className="text-sm text-gray-600">OS Ativas</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{workshopData.completed}</p>
                  <p className="text-sm text-gray-600">Concluídas</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{workshopData.pending}</p>
                  <p className="text-sm text-gray-600">Pendentes</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">R$ {workshopData.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Receita</p>
                </div>
              </div>
            </div>
          </div>

          {/* CRM e Leads */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline de Vendas</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Leads</span>
                  <span className="text-lg font-bold text-gray-900">{crmData.leads}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Oportunidades</span>
                  <span className="text-lg font-bold text-gray-900">{crmData.opportunities}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Propostas</span>
                  <span className="text-lg font-bold text-gray-900">{crmData.proposals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Conversões</span>
                  <span className="text-lg font-bold text-green-600">{crmData.conversions}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financeiro</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Contas a Receber</span>
                  <span className="text-lg font-bold text-green-600">R$ {financialData.pending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vencidas</span>
                  <span className="text-lg font-bold text-red-600">R$ 45.000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">A vencer (7 dias)</span>
                  <span className="text-lg font-bold text-yellow-600">R$ 78.000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fluxo de Caixa</span>
                  <span className="text-lg font-bold text-blue-600">R$ 125.000</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ticket Médio</span>
                  <span className="text-lg font-bold text-gray-900">R$ 89.362</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de Conversão</span>
                  <span className="text-lg font-bold text-green-600">13%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tempo Médio Venda</span>
                  <span className="text-lg font-bold text-gray-900">18 dias</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Satisfação Cliente</span>
                  <span className="text-lg font-bold text-green-600">4.8/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Novas Seções - Funcionalidades Adicionadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Integrador de Anúncios */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrador de Anúncios</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Anúncios</span>
                  <span className="text-lg font-bold text-gray-900">{integratorData.totalAds}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Anúncios Ativos</span>
                  <span className="text-lg font-bold text-green-600">{integratorData.activeAds}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Visualizações</span>
                  <span className="text-lg font-bold text-blue-600">{integratorData.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Contatos</span>
                  <span className="text-lg font-bold text-purple-600">{integratorData.totalContacts}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Por Canal</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">OLX: 12</span>
                      <span className="text-gray-600">Webmotors: 8</span>
                      <span className="text-gray-600">Mercado Livre: 4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estoque de Peças */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estoque de Peças</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Peças</span>
                  <span className="text-lg font-bold text-gray-900">{partsData.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estoque Baixo</span>
                  <span className="text-lg font-bold text-yellow-600">{partsData.lowStock}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sem Estoque</span>
                  <span className="text-lg font-bold text-red-600">{partsData.outOfStock}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valor Total</span>
                  <span className="text-lg font-bold text-green-600">R$ {partsData.totalValue.toLocaleString()}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Por Categoria</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Motor: {partsCategories.motor}</span>
                      <span className="text-gray-600">Suspensão: {partsCategories.suspensao}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Freios: {partsCategories.freios}</span>
                      <span className="text-gray-600">Elétrica: {partsCategories.eletrica}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Oficina e Agendamentos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Ordens de Serviço */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ordens de Serviço</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Gráfico de Pizza */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceOrdersChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {serviceOrdersChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Ordens']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Dados */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Ativas</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{serviceOrdersData.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Concluídas</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{serviceOrdersData.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Pendentes</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">{serviceOrdersData.pending}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Receita</span>
                      <span className="text-lg font-bold text-green-600">R$ {serviceOrdersData.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">Tempo Médio</span>
                      <span className="text-sm font-medium text-gray-900">{serviceOrdersData.averageTime} dias</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agendamentos */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agendamentos</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Gráfico de Barras */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scheduleChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(value) => [value, 'Agendamentos']} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {scheduleChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Dados */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Hoje</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{scheduleData.today}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-indigo-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Esta Semana</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{scheduleData.thisWeek}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Pendentes</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">{scheduleData.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Concluídos</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{scheduleData.completed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Financeira Expandida */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Contas a Pagar/Receber */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contas a Pagar/Receber</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Gráfico de Donut */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={accountsChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {accountsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Valor']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Dados */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">A Receber</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">R$ {accountsData.toReceive.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">A Pagar</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">R$ {accountsData.toPay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-600 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Vencidas</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">R$ {accountsData.overdue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Pagas</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">R$ {accountsData.paid.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DRE - Demonstração do Resultado */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">DRE - Resultado do Exercício</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Gráfico de Área */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dreChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Valor']} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Dados */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Receita Total</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">R$ {dreData.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Despesas</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">R$ {dreData.expenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Lucro Líquido</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">R$ {dreData.profit.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Margem de Lucro</span>
                      <span className="text-lg font-bold text-blue-600">{dreData.margin}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção CRM Expandida */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* CRM - Gestão de Relacionamento */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">CRM - Gestão de Relacionamento</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Clientes</span>
                  <span className="text-lg font-bold text-gray-900">{crmData.customers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Usuários Ativos</span>
                  <span className="text-lg font-bold text-blue-600">{crmData.users}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fornecedores</span>
                  <span className="text-lg font-bold text-purple-600">{crmData.suppliers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de Conversão</span>
                  <span className="text-lg font-bold text-green-600">13%</span>
                </div>
              </div>
            </div>

            {/* Resumo Executivo */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Executivo</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Meta Mensal</span>
                  <span className="text-lg font-bold text-gray-900">R$ 5.000.000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Realizado</span>
                  <span className="text-lg font-bold text-green-600">R$ 4.200.000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">% da Meta</span>
                  <span className="text-lg font-bold text-blue-600">84%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "84%" }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
    </main>
  );
}
