import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Input from "../components/Input";
import Select from "../components/Select";

interface ScheduleItem {
  id: string;
  customer_name: string;
  vehicle_id: string;
  vehicle_description: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  mechanic: string;
  status: string;
  notes: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export default function Schedule() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<string | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    customer_name: "",
    vehicle_id: "",
    vehicle_description: "",
    appointment_date: "",
    appointment_time: "",
    service_type: "",
    mechanic: "",
    phone: "",
    email: "",
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

  // Função para buscar schedule items
  const fetchScheduleItems = async () => {
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
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/schedule?company_id=eq.${user.company_id}&order=appointment_date.asc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setScheduleItems(data);
      } else {
        setError('Erro ao carregar agendamentos');
      }
      
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar schedule item (criar ou editar)
  const saveScheduleItem = async () => {
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
        status: 'scheduled'
      };
      
      let response;
      
      if (isEditing && selectedScheduleItem) {
        // Editar schedule item existente
        response = await fetch(`${SUPABASE_URL}/rest/v1/schedule?id=eq.${selectedScheduleItem}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSave)
        });
      } else {
        // Criar novo schedule item
        response = await fetch(`${SUPABASE_URL}/rest/v1/schedule`, {
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
        throw new Error('Erro ao salvar agendamento');
      }
      
      setSuccessMessage(isEditing ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!');
      setIsCreatingNew(false);
      setIsEditing(false);
      setSelectedScheduleItem(null);
      resetForm();
      fetchScheduleItems();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    }
  };

  // Função para editar schedule item
  const editScheduleItem = (scheduleItem: ScheduleItem) => {
    setFormData({
      customer_name: scheduleItem.customer_name,
      vehicle_id: scheduleItem.vehicle_id,
      vehicle_description: scheduleItem.vehicle_description,
      appointment_date: scheduleItem.appointment_date,
      appointment_time: scheduleItem.appointment_time,
      service_type: scheduleItem.service_type,
      mechanic: scheduleItem.mechanic,
      phone: scheduleItem.phone,
      email: scheduleItem.email,
      notes: scheduleItem.notes
    });
    setSelectedScheduleItem(scheduleItem.id);
    setIsEditing(true);
    setIsCreatingNew(true);
  };

  // Função para deletar schedule item
  const deleteScheduleItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
      return;
    }
    
    try {
      setError("");
      
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!accessToken) {
        router.push('/');
        return;
      }
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/schedule?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir agendamento');
      }
      
      setSuccessMessage('Agendamento excluído com sucesso!');
      fetchScheduleItems();
      
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
      appointment_date: "",
      appointment_time: "",
      service_type: "",
      mechanic: "",
      phone: "",
      email: "",
      notes: ""
    });
  };

  // Função para cancelar edição/criação
  const cancelForm = () => {
    setIsCreatingNew(false);
    setIsEditing(false);
    setSelectedScheduleItem(null);
    resetForm();
    setError("");
    setSuccessMessage("");
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchScheduleItems();
    fetchVehicles();
  }, []);

  // Mock data para agenda
  const scheduleData: ScheduleItem[] = [
    {
      id: "1",
      customer_name: "João Silva",
      vehicle_id: "1",
      vehicle_description: "Toyota Corolla 2023",
      appointment_date: "2025-09-27",
      appointment_time: "09:00",
      service_type: "Revisão",
      mechanic: "Carlos Santos",
      status: "Agendado",
      notes: "Revisão de 15.000 km",
      phone: "(11) 99999-9999",
      email: "joao.silva@email.com",
      created_at: "2025-01-27T10:00:00Z",
      updated_at: "2025-01-27T10:00:00Z"
    },
    {
      id: "2",
      customer_name: "Ana Costa",
      vehicle_id: "2",
      vehicle_description: "Honda Civic 2024",
      appointment_date: "2025-09-27",
      appointment_time: "10:30",
      service_type: "Reparo",
      mechanic: "Pedro Oliveira",
      status: "Agendado",
      notes: "Troca de pastilhas de freio",
      phone: "(11) 88888-8888",
      email: "ana.costa@email.com",
      created_at: "2025-01-27T10:00:00Z",
      updated_at: "2025-01-27T10:00:00Z"
    },
    {
      id: "3",
      customer_name: "Carlos Mendes",
      vehicle_id: "3",
      vehicle_description: "Volkswagen Golf 2022",
      appointment_date: "2025-09-27",
      appointment_time: "14:00",
      service_type: "Diagnóstico",
      mechanic: "Carlos Santos",
      status: "Confirmado",
      notes: "Barulho no motor",
      phone: "(11) 77777-7777",
      email: "carlos.mendes@email.com",
      created_at: "2025-01-27T10:00:00Z",
      updated_at: "2025-01-27T10:00:00Z"
    },
    {
      id: "4",
      customer_name: "Fernanda Lima",
      vehicle_id: "4",
      vehicle_description: "Nissan Sentra 2021",
      appointment_date: "2025-09-28",
      appointment_time: "08:00",
      service_type: "Manutenção",
      mechanic: "Maria Silva",
      status: "Agendado",
      notes: "Troca de óleo e filtros",
      phone: "(11) 66666-6666",
      email: "fernanda.lima@email.com",
      created_at: "2025-01-27T10:00:00Z",
      updated_at: "2025-01-27T10:00:00Z"
    },
    {
      id: "5",
      customer_name: "Roberto Santos",
      vehicle_id: "5",
      vehicle_description: "Ford Focus 2020",
      appointment_date: "2025-09-28",
      appointment_time: "11:00",
      service_type: "Reparo",
      mechanic: "Pedro Oliveira",
      status: "Pendente",
      notes: "Problema no ar condicionado",
      phone: "(11) 55555-5555",
      email: "roberto.santos@email.com",
      created_at: "2025-01-27T10:00:00Z",
      updated_at: "2025-01-27T10:00:00Z"
    }
  ];

  const handleScheduleDoubleClick = (scheduleId: string) => {
    router.push(`/schedule-details?id=${scheduleId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria a lógica para salvar o agendamento
    console.log("Dados do agendamento:", formData);
    setIsCreatingNew(false);
    setFormData({
      customer_name: "",
      vehicle_id: "",
      vehicle_description: "",
      appointment_date: "",
      appointment_time: "",
      service_type: "",
      mechanic: "",
      phone: "",
      email: "",
      notes: ""
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Agendado":
        return "bg-blue-100 text-blue-800";
      case "Confirmado":
        return "bg-green-100 text-green-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelado":
        return "bg-red-100 text-red-800";
      case "Concluído":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFilteredSchedules = () => {
    return scheduleData.filter(schedule => schedule.appointment_date === selectedDate);
  };

  const renderScheduleTable = () => {
    const filteredSchedules = getFilteredSchedules();
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Veículo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo de Serviço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mecânico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSchedules.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum agendamento para esta data
                </td>
              </tr>
            ) : (
              filteredSchedules.map((schedule) => (
                <tr
                  key={schedule.id}
                  onDoubleClick={() => handleScheduleDoubleClick(schedule.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {schedule.appointment_time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium text-gray-900">{schedule.customer_name}</div>
                      <div className="text-xs text-gray-400">{schedule.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{schedule.vehicle_description}</div>
                      <div className="text-xs text-gray-400">{schedule.vehicle_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.service_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.mechanic}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                      {schedule.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };


  const renderNewScheduleForm = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Novo Agendamento
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente */}
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
              label="Telefone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="(11) 99999-9999"
              required
            />
            <Input
              label="E-mail"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="email@exemplo.com"
            />
          </div>

          {/* Dados do Veículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              label="ID do Veículo"
              type="text"
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
              placeholder="ID do veículo"
              required
            />
          </div>

          {/* Dados do Agendamento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Data"
              type="date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
              required
            />
            <Input
              label="Hora"
              type="time"
              name="appointment_time"
              value={formData.appointment_time}
              onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
              required
            />
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
          </div>

          {/* Mecânico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              placeholder="Observações sobre o agendamento..."
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
              Agendar
            </button>
          </div>
        </form>
      </div>
    );
  };

  const calculateTotals = () => {
    const total = scheduleData.length;
    const agendados = scheduleData.filter(s => s.status === "Agendado").length;
    const confirmados = scheduleData.filter(s => s.status === "Confirmado").length;
    const pendentes = scheduleData.filter(s => s.status === "Pendente").length;

    return { total, agendados, confirmados, pendentes };
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
                Agenda da Oficina
              </h2>
              <p className="text-gray-600">
                Agendamento de serviços e controle de horários
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsCreatingNew(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
              >
                Novo Agendamento
              </button>
            </div>
          </div>
        </div>

        {/* Resumo da Agenda */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Agendamentos</p>
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
                <p className="text-sm font-medium text-gray-500">Agendados</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.agendados}</p>
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
                <p className="text-sm font-medium text-gray-500">Confirmados</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.confirmados}</p>
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
                <p className="text-sm font-medium text-gray-500">Pendentes</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.pendentes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtro de Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Filtrar por data:
            </label>
            <Input
              type="date"
              name="selectedDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>

        {/* Conteúdo */}
        {isCreatingNew ? (
          renderNewScheduleForm()
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {renderScheduleTable()}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
