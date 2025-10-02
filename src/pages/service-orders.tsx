import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { formatCurrency } from "../lib/formatting";
import { translateServiceOrderStatus, getStatusColor } from "../lib/statusTranslations";
import Input from "../components/Input";
import Select from "../components/Select";

interface ServiceOrder {
  id: string;
  order_number: string;
  customer_name: string;
  vehicle_id: string;
  vehicle_description: string;
  entry_date: string;
  expected_date: string;
  status: string;
  service_type: string;
  mechanic: string;
  total_value: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_value: number;
  total_value: number;
  type: string;
}

export default function ServiceOrders() {
  const router = useRouter();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<string | null>(null);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    customer_name: "",
    vehicle_id: "",
    vehicle_description: "",
    expected_date: "",
    service_type: "",
    mechanic: "",
    notes: ""
  });

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

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
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/vehicles?company_id=eq.${user.company_id}&order=brand.asc`, {
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

  // Função para buscar service orders
  const fetchServiceOrders = async () => {
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
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/service_orders?company_id=eq.${user.company_id}&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setServiceOrders(data);
      } else {
        setError('Erro ao carregar ordens de serviço');
      }
      
    } catch (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar service order (criar ou editar)
  const saveServiceOrder = async () => {
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
        entry_date: new Date().toISOString().split('T')[0],
        expected_date: formData.expected_date || new Date().toISOString().split('T')[0],
        total_value: 0,
        status: 'pending'
      };
      
      let response;
      
      if (isEditing && selectedServiceOrder) {
        // Editar service order existente
        response = await fetch(`${SUPABASE_URL}/rest/v1/service_orders?id=eq.${selectedServiceOrder}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSave)
        });
      } else {
        // Criar nova service order
        response = await fetch(`${SUPABASE_URL}/rest/v1/service_orders`, {
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
        throw new Error('Erro ao salvar ordem de serviço');
      }
      
      setSuccessMessage(isEditing ? 'Ordem de serviço atualizada com sucesso!' : 'Ordem de serviço criada com sucesso!');
      setIsCreatingNew(false);
      setIsEditing(false);
      setSelectedServiceOrder(null);
      resetForm();
      fetchServiceOrders();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    }
  };

  // Função para editar service order
  const editServiceOrder = (serviceOrder: ServiceOrder) => {
    setFormData({
      customer_name: serviceOrder.customer_name,
      vehicle_id: serviceOrder.vehicle_id,
      vehicle_description: serviceOrder.vehicle_description,
      expected_date: serviceOrder.expected_date,
      service_type: serviceOrder.service_type,
      mechanic: serviceOrder.mechanic,
      notes: serviceOrder.notes
    });
    setSelectedServiceOrder(serviceOrder.id);
    setIsEditing(true);
    setIsCreatingNew(true);
  };

  // Função para deletar service order
  const deleteServiceOrder = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      return;
    }
    
    try {
      setError("");
      
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!accessToken) {
        router.push('/');
        return;
      }
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/service_orders?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir ordem de serviço');
      }
      
      setSuccessMessage('Ordem de serviço excluída com sucesso!');
      fetchServiceOrders();
      
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
      expected_date: "",
      service_type: "",
      mechanic: "",
      notes: ""
    });
  };

  // Função para cancelar edição/criação
  const cancelForm = () => {
    setIsCreatingNew(false);
    setIsEditing(false);
    setSelectedServiceOrder(null);
    resetForm();
    setError("");
    setSuccessMessage("");
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchServiceOrders();
    fetchVehicles();
  }, []);


  const handleOrderDoubleClick = (orderId: string) => {
    router.push(`/service-order-details?id=${orderId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria a lógica para salvar a ordem de serviço
    console.log("Dados da ordem de serviço:", formData);
    setIsCreatingNew(false);
    setFormData({
      customer_name: "",
      vehicle_id: "",
      vehicle_description: "",
      expected_date: "",
      service_type: "",
      mechanic: "",
      notes: ""
    });
  };

  // Função local para obter cor do status (mantida para compatibilidade)
  const getLocalStatusColor = (status: string) => {
    return getStatusColor(status, 'service_orders');
  };

  const renderServiceOrdersTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Veículo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Entrada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Previsão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mecânico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {serviceOrders.map((order) => (
              <tr
                key={order.id}
                onDoubleClick={() => handleOrderDoubleClick(order.id)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.order_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.customer_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div>{order.vehicle_description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.entry_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.expected_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLocalStatusColor(order.status)}`}>
                    {translateServiceOrderStatus(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.mechanic}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(order.total_value || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };


  const renderNewServiceOrderForm = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Nova Ordem de Serviço
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente e Veículo */}
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
              label="Data de Previsão"
              type="date"
              name="expected_date"
              value={formData.expected_date}
              onChange={(e) => setFormData({...formData, expected_date: e.target.value})}
              required
            />
          </div>

          {/* Dados do Serviço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Tipo de Serviço"
              name="service_type"
              value={formData.service_type}
              onChange={(e) => setFormData({...formData, service_type: e.target.value})}
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="revisao">Revisão</option>
              <option value="reparo">Reparo</option>
              <option value="manutencao">Manutenção</option>
              <option value="diagnostico">Diagnóstico</option>
              <option value="troca">Troca de Peças</option>
            </Select>
            <Select
              label="Mecânico Responsável"
              name="mechanic"
              value={formData.mechanic}
              onChange={(e) => setFormData({...formData, mechanic: e.target.value})}
              required
            >
              <option value="">Selecione o mecânico</option>
              <option value="carlos-santos">Carlos Santos</option>
              <option value="pedro-oliveira">Pedro Oliveira</option>
              <option value="maria-silva">Maria Silva</option>
              <option value="joao-costa">João Costa</option>
            </Select>
          </div>
          
          {/* Observações */}
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
              placeholder="Observações sobre o serviço..."
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
            >
              Criar Ordem de Serviço
            </button>
          </div>
        </form>
      </div>
    );
  };

  const calculateTotals = () => {
    const total = serviceOrders.length;
    const emAndamento = serviceOrders.filter(o => o.status === "in_progress").length;
    const concluidas = serviceOrders.filter(o => o.status === "completed").length;
    const aguardandoPecas = serviceOrders.filter(o => o.status === "waiting_parts").length;

    const valorTotal = serviceOrders.reduce((sum, order) => {
      return sum + (order.total_value || 0);
    }, 0);

    return { total, emAndamento, concluidas, aguardandoPecas, valorTotal };
  };

  const totals = calculateTotals();

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Ordens de Serviço
              </h2>
              <p className="text-gray-600">
                Gestão de ordens de serviço e controle de mão de obra
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsCreatingNew(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
              >
                Nova OS
              </button>
            </div>
          </div>
        </div>

        {/* Mensagens de Loading, Erro e Sucesso */}
        {isLoading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">Carregando dados...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Formulário de Criação/Edição */}
        {isCreatingNew && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isEditing ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
              </h3>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Atualize as informações da ordem de serviço' : 'Preencha as informações da nova ordem de serviço'}
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveServiceOrder(); }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Cliente"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  placeholder="Nome do cliente"
                  required
                />
                <Select
                  label="Veículo"
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={(e) => {
                    const selectedVehicle = vehicles.find(v => v.id === e.target.value);
                    setFormData({
                      ...formData, 
                      vehicle_id: e.target.value,
                      vehicle_description: selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year}` : ""
                    });
                  }}
                  required
                >
                  <option value="">Selecione um veículo</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} {vehicle.year} - {vehicle.plate}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Data de Previsão"
                  name="expected_date"
                  type="date"
                  value={formData.expected_date}
                  onChange={(e) => setFormData({...formData, expected_date: e.target.value})}
                  required
                />
                <Input
                  label="Tipo de Serviço"
                  name="service_type"
                  value={formData.service_type}
                  onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                  placeholder="Ex: Revisão, Reparo, etc."
                  required
                />
                <Input
                  label="Mecânico"
                  name="mechanic"
                  value={formData.mechanic}
                  onChange={(e) => setFormData({...formData, mechanic: e.target.value})}
                  placeholder="Nome do mecânico"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Observações sobre o serviço..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {isEditing ? 'Atualizar' : 'Criar'} Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resumo da Oficina */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de OS</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Em Andamento</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.emAndamento}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Concluídas</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.concluidas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aguardando Peças</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.aguardandoPecas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Valor Total */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Valor Total das Ordens de Serviço</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totals.valorTotal)}</p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        {isCreatingNew ? (
          renderNewServiceOrderForm()
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {renderServiceOrdersTable()}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
