import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import ResponsivePage from "../components/ResponsivePage";
import ResponsiveCard from "../components/ResponsiveCard";
import ResponsiveTable, { 
  ResponsiveTableHeader, 
  ResponsiveTableHeaderCell, 
  ResponsiveTableBody, 
  ResponsiveTableRow, 
  ResponsiveTableCell 
} from "../components/ResponsiveTable";
import AIInsightCard from "../components/AIInsightCard";
import { translateSalesStatus, getStatusColor } from "../lib/statusTranslations";
import { formatCurrency, formatNumber, parseCurrencyInput, formatPercent, applyCurrencyMask, removeCurrencyMask } from "../lib/formatting";

interface Sale {
  id: string;
  customer_name: string;
  vehicle_id: string;
  vehicle_description: string;
  sale_price: number;
  status: string;
  user_id: string;
  user_name?: string; // Nome do vendedor
  sale_date: string;
  sale_type: string;
  commission: number;
  margin: number;
  source: string;
  notes: string;
  next_contact_date: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export default function Sales() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("vendas");
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Referência para o card de edição
  const editFormRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({
    status: "",
    seller: "",
    source: "",
    priority: "",
    dataInicio: "",
    dataFim: ""
  });
  const [formData, setFormData] = useState({
    customer_name: "",
    vehicle_id: "",
    vehicle_description: "",
    sale_price: "",
    status: "pending",
    sale_date: "",
    sale_type: "",
    commission: "",
    margin: "",
    source: "",
    notes: "",
    next_contact_date: "",
    priority: "medium",
    user_id: ""
  });

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

  // Função para buscar usuários
  const fetchUsers = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?company_id=eq.${user.company_id}&select=id,name&order=name.asc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
      
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  // Função para buscar vehicles
  const fetchVehicles = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/vehicles?company_id=eq.${user.company_id}&status=eq.available&order=brand.asc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
      
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    }
  };

  // Função para buscar sales
  const fetchSales = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/sales?company_id=eq.${user.company_id}&select=*,users(name)&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Processar dados para incluir nome do vendedor
        const processedData = data.map((sale: any) => ({
          ...sale,
          user_name: sale.users?.name || 'N/A'
        }));
        setSales(processedData);
      } else {
        setError('Erro ao carregar vendas');
      }
      
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar sale (criar ou editar)
  const saveSale = async () => {
    try {
      setError("");
      setSuccessMessage("");
      
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      const dataToSave = {
        ...formData,
        company_id: user.company_id,
        user_id: user.id,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price.toString()) : null,
        commission: formData.commission ? parseFloat(formData.commission.toString()) : null,
        margin: formData.margin ? parseFloat(formData.margin.toString()) : null,
        sale_date: formData.sale_date || new Date().toISOString().split('T')[0]
      };
      
      let response;
      
      if (isEditing && selectedSale) {
        // Editar sale existente
        response = await fetch(`${SUPABASE_URL}/rest/v1/sales?id=eq.${selectedSale}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSave)
        });
      } else {
        // Criar nova sale
        response = await fetch(`${SUPABASE_URL}/rest/v1/sales`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSave)
        });
      }
      
      if (!response.ok) {
        throw new Error('Erro ao salvar venda');
      }
      
      setSuccessMessage(isEditing ? 'Venda atualizada com sucesso!' : 'Venda criada com sucesso!');
      setIsCreatingNew(false);
      setIsEditing(false);
      setSelectedSale(null);
      resetForm();
      fetchSales();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    }
  };

  // Função para editar sale
  const editSale = (sale: Sale) => {
    setFormData({
      customer_name: sale.customer_name,
      vehicle_id: sale.vehicle_id,
      vehicle_description: sale.vehicle_description,
      sale_price: sale.sale_price.toString(),
      status: sale.status,
      sale_date: sale.sale_date,
      sale_type: sale.sale_type,
      commission: sale.commission.toString(),
      margin: sale.margin.toString(),
      source: sale.source,
      notes: sale.notes,
      next_contact_date: sale.next_contact_date,
      priority: sale.priority,
      user_id: sale.user_id
    });
    setSelectedSale(sale.id);
    setIsEditing(true);
    setIsCreatingNew(true);
    
    // Scroll para o card de edição
    setTimeout(() => {
      if (editFormRef.current) {
        editFormRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  // Função para deletar sale
  const deleteSale = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta venda?')) {
      return;
    }
    
    try {
      setError("");
      
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!accessToken) {
        router.push('/');
        return;
      }
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/sales?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir venda');
      }
      
      setSuccessMessage('Venda excluída com sucesso!');
      fetchSales();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir dados');
    }
  };

  // Função para resetar formulário
  const resetForm = () => {
    setFormData({
      customer_name: "",
      vehicle_id: "",
      vehicle_description: "",
      sale_price: "",
      status: "pending",
      sale_date: "",
      sale_type: "",
      commission: "",
      margin: "",
      source: "",
      notes: "",
      next_contact_date: "",
      priority: "medium",
      user_id: ""
    });
  };

  // Função para cancelar edição/criação
  const cancelForm = () => {
    setIsCreatingNew(false);
    setIsEditing(false);
    setSelectedSale(null);
    resetForm();
    setError("");
    setSuccessMessage("");
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchSales();
    fetchVehicles();
    fetchUsers();
  }, []);


  const handleSaleClick = (saleId: string) => {
    setSelectedSale(selectedSale === saleId ? null : saleId);
  };

  const handleSaleDoubleClick = (saleId: string) => {
    router.push(`/sale-details?id=${saleId}`);
  };

  const handleGoToProposal = () => {
    if (selectedSale) {
      router.push(`/proposals?id=${selectedSale}`);
    }
  };

  // Funções para estatísticas
  const getSalesStats = () => {
    const total = sales.length;
    const concluidas = sales.filter(s => s.status === "completed").length;
    const emAndamento = sales.filter(s => s.status === "in_progress").length;
    const pendentes = sales.filter(s => ["pending", "negotiation", "proposal_sent"].includes(s.status)).length;
    const valorTotal = sales.reduce((acc, sale) => {
      return acc + sale.sale_price;
    }, 0);
    const comissaoTotal = sales.reduce((acc, sale) => {
      return acc + (sale.commission || 0);
    }, 0);

    return {
      total,
      concluidas,
      emAndamento,
      pendentes,
      valorTotal,
      comissaoTotal,
      taxaConversao: total > 0 ? (concluidas / total * 100) : 0
    };
  };

  // Função para filtrar vendas
  const getFilteredSales = () => {
    return sales.filter(sale => {
      if (filters.status && sale.status !== filters.status) return false;
      if (filters.seller && sale.user_id !== filters.seller) return false;
      if (filters.source && sale.source !== filters.source) return false;
      if (filters.priority && sale.priority !== filters.priority) return false;
      return true;
    });
  };

  const stats = getSalesStats();
  const filteredSales = getFilteredSales();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria a lógica para salvar a venda
    console.log("Dados da venda:", formData);
    setIsCreatingNew(false);
    setFormData({
      customer_name: "",
      vehicle_id: "",
      vehicle_description: "",
      sale_price: "",
      status: "pending",
      sale_date: "",
      sale_type: "",
      commission: "",
      margin: "",
      source: "",
      notes: "",
      next_contact_date: "",
      priority: "",
      user_id: ""
    });
  };

  const renderSalesTable = () => {
    return (
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Veículo
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendedor
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr
                key={sale.id}
                onClick={() => handleSaleClick(sale.id)}
                onDoubleClick={() => handleSaleDoubleClick(sale.id)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedSale === sale.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                }`}
              >
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {sale.customer_name}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sale.vehicle_description}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(sale.sale_price)}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    sale.status === 'Concluída' ? 'bg-green-100 text-green-800' :
                    sale.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {sale.status}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sale.user_name || sale.user_id}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sale.sale_date}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sale.sale_type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderNewSaleForm = () => {
    return (
      <div ref={editFormRef} className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Nova Venda
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Cliente"
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              placeholder="Nome do cliente"
              required
            />
            <Input
              label="Veículo"
              type="text"
              name="vehicle_description"
              value={formData.vehicle_description}
              onChange={(e) => setFormData({...formData, vehicle_description: e.target.value})}
              placeholder="Modelo do veículo"
              required
            />
            <Input
              label="Valor"
              type="text"
              name="sale_price"
              value={formData.sale_price}
              onChange={(e) => {
                const maskedValue = applyCurrencyMask(e.target.value);
                setFormData({...formData, sale_price: maskedValue});
              }}
              onBlur={(e) => {
                const numericValue = removeCurrencyMask(e.target.value);
                setFormData({...formData, sale_price: numericValue});
              }}
              placeholder="0,00"
              required
            />
            <Select
              label="Vendedor"
              name="user_id"
              value={formData.user_id}
              onChange={(e) => setFormData({...formData, user_id: e.target.value})}
              required
            >
              <option value="">Selecione o vendedor</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
            <Select
              label="Tipo de Venda"
              name="sale_type"
              value={formData.sale_type}
              onChange={(e) => setFormData({...formData, sale_type: e.target.value})}
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="vista">À Vista</option>
              <option value="financiamento">Financiamento</option>
              <option value="consorcio">Consórcio</option>
              <option value="trocas">Trocas</option>
            </Select>
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              required
            >
              <option value="pending">Primeiro Contato</option>
              <option value="qualified">Qualificação</option>
              <option value="presentation">Apresentação</option>
              <option value="proposal_sent">Proposta Enviada</option>
              <option value="negotiation">Negociação</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
              <option value="lost">Perdida</option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Observações sobre a venda..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreatingNew(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Salvar Venda
            </Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <ResponsivePage
      title="Vendas"
      subtitle="Gestão de vendas e negociações"
      actions={
        <>
          {selectedSale && (
            <Button
              variant="success"
              onClick={handleGoToProposal}
            >
              Ir para Proposta
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Ocultar Filtros" : "Filtros"}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setIsCreatingNew(true);
              // Scroll para o card de criação
              setTimeout(() => {
                if (editFormRef.current) {
                  editFormRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  });
                }
              }, 100);
            }}
          >
            Nova Venda
          </Button>
        </>
      }
    >
      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <ResponsiveCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.valorTotal)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-purple-600">{formatPercent(stats.taxaConversao)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>
      </div>

      {/* Insights da IA */}
      <div className="mb-6 sm:mb-8">
        <AIInsightCard 
          pageData={sales} 
          pageType="sales" 
          className="w-full"
        />
      </div>

      {/* Filtros */}
      {showFilters && (
        <ResponsiveCard className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">Todos os Status</option>
              <option value="pending">Primeiro Contato</option>
              <option value="qualified">Qualificação</option>
              <option value="presentation">Apresentação</option>
              <option value="proposal_sent">Proposta Enviada</option>
              <option value="negotiation">Negociação</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
              <option value="lost">Perdida</option>
            </Select>
            <Select
              label="Vendedor"
              value={filters.seller}
              onChange={(e) => setFilters({...filters, seller: e.target.value})}
            >
              <option value="">Todos os Vendedores</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
            <Select
              label="Origem"
              value={filters.source}
              onChange={(e) => setFilters({...filters, source: e.target.value})}
            >
              <option value="">Todas as Origens</option>
              <option value="Site">Site</option>
              <option value="Indicação">Indicação</option>
              <option value="Facebook">Facebook</option>
              <option value="Google Ads">Google Ads</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
            </Select>
            <Select
              label="Prioridade"
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
            >
              <option value="">Todas as Prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </Select>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setFilters({ status: "", seller: "", source: "", priority: "", dataInicio: "", dataFim: "" })}
            >
              Limpar Filtros
            </Button>
          </div>
        </ResponsiveCard>
      )}

      {/* Conteúdo */}
      {isCreatingNew ? (
        renderNewSaleForm()
      ) : (
        <ResponsiveCard>
          <ResponsiveTable>
            <ResponsiveTableHeader>
              <tr>
                <ResponsiveTableHeaderCell>Cliente</ResponsiveTableHeaderCell>
                <ResponsiveTableHeaderCell>Veículo</ResponsiveTableHeaderCell>
                <ResponsiveTableHeaderCell>Valor</ResponsiveTableHeaderCell>
                <ResponsiveTableHeaderCell>Status</ResponsiveTableHeaderCell>
                <ResponsiveTableHeaderCell>Vendedor</ResponsiveTableHeaderCell>
                <ResponsiveTableHeaderCell>Origem</ResponsiveTableHeaderCell>
                <ResponsiveTableHeaderCell>Prioridade</ResponsiveTableHeaderCell>
                <ResponsiveTableHeaderCell>Data</ResponsiveTableHeaderCell>
              </tr>
            </ResponsiveTableHeader>
            <ResponsiveTableBody>
              {filteredSales.map((sale) => (
                <ResponsiveTableRow
                  key={sale.id}
                  onClick={() => handleSaleClick(sale.id)}
                  onDoubleClick={() => handleSaleDoubleClick(sale.id)}
                  className={selectedSale === sale.id ? 'bg-blue-50 border-l-4 border-primary' : ''}
                >
                  <ResponsiveTableCell isHeader>{sale.customer_name}</ResponsiveTableCell>
                  <ResponsiveTableCell>{sale.vehicle_description}</ResponsiveTableCell>
                  <ResponsiveTableCell className="font-medium text-green-600">{formatCurrency(sale.sale_price)}</ResponsiveTableCell>
                  <ResponsiveTableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status, 'sales')}`}>
                      {translateSalesStatus(sale.status)}
                    </span>
                  </ResponsiveTableCell>
                  <ResponsiveTableCell>{sale.user_name || sale.user_id}</ResponsiveTableCell>
                  <ResponsiveTableCell>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {sale.source}
                    </span>
                  </ResponsiveTableCell>
                  <ResponsiveTableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      sale.priority === 'high' ? 'bg-red-100 text-red-800' :
                      sale.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {sale.priority}
                    </span>
                  </ResponsiveTableCell>
                  <ResponsiveTableCell>{sale.sale_date}</ResponsiveTableCell>
                </ResponsiveTableRow>
              ))}
            </ResponsiveTableBody>
          </ResponsiveTable>
        </ResponsiveCard>
      )}
    </ResponsivePage>
  );
}
