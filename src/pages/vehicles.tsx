import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { formatCurrency, formatMileage, applyCurrencyMask, removeCurrencyMask, applyCpfMask, removeCpfMask, applyCepMask, removeCepMask, applyPhoneMask, removePhoneMask } from "../lib/formatting";
import { translateStatus, getStatusColor } from "../lib/statusTranslations";
import Input from "../components/Input";
import Select from "../components/Select";
import ResponsivePage from "../components/ResponsivePage";
import ResponsiveCard from "../components/ResponsiveCard";
import ResponsiveTable, { 
  ResponsiveTableHeader, 
  ResponsiveTableHeaderCell, 
  ResponsiveTableBody, 
  ResponsiveTableRow, 
  ResponsiveTableCell 
} from "../components/ResponsiveTable";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  chassis: string;
  renavam: string;
  mileage: number;
  price: number;
  status: string;
  description: string;
  customer_name?: string;
  customer_cpf?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_birth_date?: string;
  customer_zip_code?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  legal_customer_name?: string;
  legal_customer_cnpj?: string;
  legal_customer_email?: string;
  legal_customer_phone?: string;
  legal_customer_zip_code?: string;
  legal_customer_address?: string;
  legal_customer_city?: string;
  legal_customer_state?: string;
  created_at: string;
  updated_at: string;
}

export default function Vehicles() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("estoque");
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Referência para o card de edição
  const editFormRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    color: "",
    plate: "",
    chassis: "",
    renavam: "",
    mileage: "",
    price: "",
    status: "available",
    description: "",
    customer_name: "",
    customer_cpf: "",
    customer_email: "",
    customer_phone: "",
    customer_birth_date: "",
    customer_zip_code: "",
    customer_address: "",
    customer_city: "",
    customer_state: "",
    legal_customer_name: "",
    legal_customer_cnpj: "",
    legal_customer_email: "",
    legal_customer_phone: "",
    legal_customer_zip_code: "",
    legal_customer_address: "",
    legal_customer_city: "",
    legal_customer_state: ""
  });

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

  // Função para buscar vehicles
  const fetchVehicles = async () => {
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
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/vehicles?company_id=eq.${user.company_id}&order=created_at.desc`, {
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
      } else {
        setError('Erro ao carregar veículos');
      }
      
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar vehicle (criar ou editar)
  const saveVehicle = async () => {
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
        year: formData.year ? parseInt(formData.year.toString()) : null,
        mileage: formData.mileage ? parseInt(formData.mileage.toString()) : null,
        price: formData.price ? parseFloat(removeCurrencyMask(formData.price.toString())) : null,
        customer_cpf: formData.customer_cpf ? removeCpfMask(formData.customer_cpf) : null,
        customer_phone: formData.customer_phone ? removePhoneMask(formData.customer_phone) : null,
        customer_zip_code: formData.customer_zip_code ? removeCepMask(formData.customer_zip_code) : null,
        legal_customer_phone: formData.legal_customer_phone ? removePhoneMask(formData.legal_customer_phone) : null,
        legal_customer_zip_code: formData.legal_customer_zip_code ? removeCepMask(formData.legal_customer_zip_code) : null
      };
      
      let response;
      
      if (isEditing && selectedVehicle) {
        // Editar vehicle existente
        response = await fetch(`${SUPABASE_URL}/rest/v1/vehicles?id=eq.${selectedVehicle}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSave)
        });
      } else {
        // Criar novo vehicle
        response = await fetch(`${SUPABASE_URL}/rest/v1/vehicles`, {
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
        throw new Error('Erro ao salvar veículo');
      }
      
      setSuccessMessage(isEditing ? 'Veículo atualizado com sucesso!' : 'Veículo criado com sucesso!');
      setIsCreatingNew(false);
      setIsEditing(false);
      setSelectedVehicle(null);
      resetForm();
      fetchVehicles();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    }
  };

  // Função para editar vehicle
  const editVehicle = (vehicle: Vehicle) => {
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year.toString(),
      color: vehicle.color,
      plate: vehicle.plate,
      chassis: vehicle.chassis,
      renavam: vehicle.renavam || "",
      mileage: vehicle.mileage.toString(),
      price: vehicle.price.toString(),
      status: vehicle.status,
      description: vehicle.description,
      customer_name: vehicle.customer_name || "",
      customer_cpf: vehicle.customer_cpf ? applyCpfMask(vehicle.customer_cpf) : "",
      customer_email: vehicle.customer_email || "",
      customer_phone: vehicle.customer_phone ? applyPhoneMask(vehicle.customer_phone) : "",
      customer_birth_date: vehicle.customer_birth_date || "",
      customer_zip_code: vehicle.customer_zip_code ? applyCepMask(vehicle.customer_zip_code) : "",
      customer_address: vehicle.customer_address || "",
      customer_city: vehicle.customer_city || "",
      customer_state: vehicle.customer_state || "",
      legal_customer_name: vehicle.legal_customer_name || "",
      legal_customer_cnpj: vehicle.legal_customer_cnpj || "",
      legal_customer_email: vehicle.legal_customer_email || "",
      legal_customer_phone: vehicle.legal_customer_phone ? applyPhoneMask(vehicle.legal_customer_phone) : "",
      legal_customer_zip_code: vehicle.legal_customer_zip_code ? applyCepMask(vehicle.legal_customer_zip_code) : "",
      legal_customer_address: vehicle.legal_customer_address || "",
      legal_customer_city: vehicle.legal_customer_city || "",
      legal_customer_state: vehicle.legal_customer_state || ""
    });
    setSelectedVehicle(vehicle.id);
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

  // Função para deletar vehicle
  const deleteVehicle = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) {
      return;
    }
    
    try {
      setError("");
      
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!accessToken) {
        router.push('/');
        return;
      }
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/vehicles?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir veículo');
      }
      
      setSuccessMessage('Veículo excluído com sucesso!');
      fetchVehicles();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir dados');
    }
  };

  // Função para resetar formulário
  const resetForm = () => {
    setFormData({
      brand: "",
      model: "",
      year: "",
      color: "",
      plate: "",
      chassis: "",
      renavam: "",
      mileage: "",
      price: "",
      status: "available",
      description: "",
      customer_name: "",
      customer_cpf: "",
      customer_email: "",
      customer_phone: "",
      customer_birth_date: "",
      customer_zip_code: "",
      customer_address: "",
      customer_city: "",
      customer_state: "",
      legal_customer_name: "",
      legal_customer_cnpj: "",
      legal_customer_email: "",
      legal_customer_phone: "",
      legal_customer_zip_code: "",
      legal_customer_address: "",
      legal_customer_city: "",
      legal_customer_state: ""
    });
  };

  // Função para cancelar edição/criação
  const cancelForm = () => {
    setIsCreatingNew(false);
    setIsEditing(false);
    setSelectedVehicle(null);
    resetForm();
    setError("");
    setSuccessMessage("");
  };

  // Carregar vehicles quando o componente montar
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Mock data para veículos
  const vehiclesData: Vehicle[] = [
    {
      id: "1",
      plate: "ABC-1234",
      brand: "Toyota",
      model: "Corolla",
      year: 2023,
      color: "Prata",
      mileage: 15000,
      price: 95000,
      status: "Disponível",
      description: "Seminovo",
      chassis: "9BWZZZZZZZZ123456",
      renavam: "",
      created_at: "2025-09-15",
      updated_at: "2025-09-15"
    },
    {
      id: "2",
      plate: "DEF-5678",
      brand: "Honda",
      model: "Civic",
      year: 2024,
      color: "Branco",
      mileage: 5000,
      price: 120000,
      status: "Vendido",
      description: "Novo",
      chassis: "9BWZZZZZZZZ789012",
      renavam: "",
      created_at: "2025-09-10",
      updated_at: "2025-09-10"
    },
    {
      id: "3",
      plate: "GHI-9012",
      brand: "Volkswagen",
      model: "Golf",
      year: 2022,
      color: "Azul",
      mileage: 25000,
      price: 85000,
      status: "Reservado",
      description: "Seminovo",
      chassis: "9BWZZZZZZZZ345678",
      renavam: "",
      created_at: "2025-09-20",
      updated_at: "2025-09-20"
    },
    {
      id: "4",
      plate: "JKL-3456",
      brand: "Ford",
      model: "Focus",
      year: 2021,
      color: "Preto",
      mileage: 35000,
      price: 75000,
      status: "Manutenção",
      description: "Usado",
      renavam: "",
      chassis: "9BWZZZZZZZZ901234",
      created_at: "2025-09-25",
      updated_at: "2025-09-25"
    }
  ];

  const handleVehicleClick = (vehicleId: string) => {
    setSelectedVehicle(selectedVehicle === vehicleId ? null : vehicleId);
  };

  const handleVehicleDoubleClick = (vehicleId: string) => {
    router.push(`/vehicle-details?id=${vehicleId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria a lógica para salvar o veículo
    console.log("Dados do veículo:", formData);
    setIsCreatingNew(false);
    setFormData({
      brand: "",
      model: "",
      year: "",
      color: "",
      plate: "",
      chassis: "",
      renavam: "",
      mileage: "",
      price: "",
      status: "available",
      description: "",
      customer_name: "",
      customer_cpf: "",
      customer_email: "",
      customer_phone: "",
      customer_birth_date: "",
      customer_zip_code: "",
      customer_address: "",
      customer_city: "",
      customer_state: "",
      legal_customer_name: "",
      legal_customer_cnpj: "",
      legal_customer_email: "",
      legal_customer_phone: "",
      legal_customer_zip_code: "",
      legal_customer_address: "",
      legal_customer_city: "",
      legal_customer_state: ""
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disponível":
        return "bg-green-100 text-green-800";
      case "Vendido":
        return "bg-blue-100 text-blue-800";
      case "Reservado":
        return "bg-yellow-100 text-yellow-800";
      case "Manutenção":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderVehiclesTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Placa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Veículo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ano
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                KM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Entrada
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                onClick={() => handleVehicleClick(vehicle.id)}
                onDoubleClick={() => handleVehicleDoubleClick(vehicle.id)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedVehicle === vehicle.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {vehicle.plate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div className="font-medium text-gray-900">{vehicle.brand} {vehicle.model}</div>
                    <div className="text-xs text-gray-400">{vehicle.color}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.mileage} km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(vehicle.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status || '')}`}>
                    {translateStatus(vehicle.status || '', 'vehicles')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(vehicle.created_at).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderNewVehicleForm = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Novo Veículo
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Placa"
              type="text"
              name="plate"
              value={formData.plate}
              onChange={(e) => setFormData({...formData, plate: e.target.value})}
              placeholder="ABC-1234"
              required
            />
            <Input
              label="Marca"
              type="text"
              name="brand"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              placeholder="Toyota"
              required
            />
            <Input
              label="Modelo"
              type="text"
              name="model"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              placeholder="Corolla"
              required
            />
            <Input
              label="Ano"
              type="text"
              name="year"
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: e.target.value})}
              placeholder="2023"
              required
            />
            <Input
              label="Cor"
              type="text"
              name="color"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
              placeholder="Prata"
              required
            />
            <Input
              label="Quilometragem"
              type="text"
              name="mileage"
              value={formData.mileage}
              onChange={(e) => setFormData({...formData, mileage: e.target.value})}
              placeholder="15.000"
              required
            />
          </div>

          {/* Dados Comerciais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Preço"
              type="text"
              name="price"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              placeholder="R$ 95.000,00"
              required
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              required
            >
              <option value="">Selecione o status</option>
              <option value="disponivel">Disponível</option>
              <option value="vendido">Vendido</option>
              <option value="reservado">Reservado</option>
              <option value="manutencao">Manutenção</option>
            </Select>
            <Select
              label="Tipo"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="novo">Novo</option>
              <option value="seminovo">Seminovo</option>
              <option value="usado">Usado</option>
            </Select>
            <Input
              label="Chassi"
              type="text"
              name="chassis"
              value={formData.chassis}
              onChange={(e) => setFormData({...formData, chassis: e.target.value})}
              placeholder="9BWZZZZZZZZ123456"
              required
            />
          </div>

          {/* Observações */}
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Observações"
              type="text"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Observações adicionais"
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
              Salvar Veículo
            </button>
          </div>
        </form>
      </div>
    );
  };

  const calculateTotals = () => {
    const total = vehicles.length;
    const disponiveis = vehicles.filter(v => v.status === "available").length;
    const vendidos = vehicles.filter(v => v.status === "sold").length;
    const reservados = vehicles.filter(v => v.status === "reserved").length;
    const manutencao = vehicles.filter(v => v.status === "maintenance").length;

    const valorTotal = vehicles
      .filter(v => v.status === "available")
      .reduce((sum, v) => {
        return sum + v.price;
      }, 0);

    return { total, disponiveis, vendidos, reservados, manutencao, valorTotal };
  };

  const totals = calculateTotals();

  return (
    <ResponsivePage
      title="Estoque de Veículos"
      subtitle="Gestão do estoque de veículos"
      actions={
        <button
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
          className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
        >
          Novo Veículo
        </button>
      }
    >
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
        <ResponsiveCard className="mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isEditing ? 'Editar Veículo' : 'Novo Veículo'}
            </h3>
            <p className="text-sm text-gray-600">
              {isEditing ? 'Atualize as informações do veículo' : 'Preencha as informações do novo veículo'}
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); saveVehicle(); }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="Marca"
                name="brand"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                placeholder="Ex: Toyota"
                required
              />
              <Input
                label="Modelo"
                name="model"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                placeholder="Ex: Corolla"
                required
              />
              <Input
                label="Ano"
                name="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                placeholder="2023"
                required
              />
              <Input
                label="Cor"
                name="color"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                placeholder="Ex: Prata"
                required
              />
              <Input
                label="Placa"
                name="plate"
                value={formData.plate}
                onChange={(e) => setFormData({...formData, plate: e.target.value})}
                placeholder="ABC-1234"
                required
              />
              <Input
                label="Chassi"
                name="chassis"
                value={formData.chassis}
                onChange={(e) => setFormData({...formData, chassis: e.target.value})}
                placeholder="Número do chassi"
              />
              <Input
                label="Renavam"
                name="renavam"
                value={formData.renavam}
                onChange={(e) => setFormData({...formData, renavam: e.target.value})}
                placeholder="Número do Renavam"
              />
              <Input
                label="Quilometragem"
                name="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                placeholder="15000"
              />
              <Input
                label="Preço"
                name="price"
                type="text"
                value={formData.price}
                onChange={(e) => {
                  const maskedValue = applyCurrencyMask(e.target.value);
                  setFormData({...formData, price: maskedValue});
                }}
                onBlur={(e) => {
                  const numericValue = removeCurrencyMask(e.target.value);
                  setFormData({...formData, price: numericValue});
                }}
                placeholder="95.000,00"
                required
              />
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
              >
                <option value="available">Disponível</option>
                <option value="sold">Vendido</option>
                <option value="reserved">Reservado</option>
                <option value="maintenance">Em Manutenção</option>
                <option value="unavailable">Indisponível</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descrição do veículo..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="pt-6 border-t">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Dados de Cliente</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Nome"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  placeholder="Nome do cliente"
                />
                <Input
                  label="CPF"
                  name="customer_cpf"
                  value={formData.customer_cpf}
                  onChange={(e) => {
                    const maskedValue = applyCpfMask(e.target.value);
                    setFormData({...formData, customer_cpf: maskedValue});
                  }}
                  placeholder="000.000.000-00"
                />
                <Input
                  label="E-mail"
                  name="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                  placeholder="email@exemplo.com"
                />
                <Input
                  label="Telefone"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => {
                    const maskedValue = applyPhoneMask(e.target.value);
                    setFormData({...formData, customer_phone: maskedValue});
                  }}
                  onBlur={(e) => {
                    const numericValue = removePhoneMask(e.target.value);
                    setFormData({...formData, customer_phone: numericValue});
                  }}
                  placeholder="(00) 00000-0000"
                />
                <Input
                  label="Data de Nascimento"
                  name="customer_birth_date"
                  type="date"
                  value={formData.customer_birth_date}
                  onChange={(e) => setFormData({...formData, customer_birth_date: e.target.value})}
                />
                <Input
                  label="CEP"
                  name="customer_zip_code"
                  value={formData.customer_zip_code}
                  onChange={(e) => {
                    const maskedValue = applyCepMask(e.target.value);
                    setFormData({...formData, customer_zip_code: maskedValue});
                  }}
                  onBlur={(e) => {
                    const numericValue = removeCepMask(e.target.value);
                    setFormData({...formData, customer_zip_code: numericValue});
                  }}
                  placeholder="00000-000"
                />
                <Input
                  label="Endereço"
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={(e) => setFormData({...formData, customer_address: e.target.value})}
                  placeholder="Endereço completo"
                />
                <Input
                  label="Cidade"
                  name="customer_city"
                  value={formData.customer_city}
                  onChange={(e) => setFormData({...formData, customer_city: e.target.value})}
                  placeholder="Cidade"
                />
                <Input
                  label="Estado"
                  name="customer_state"
                  value={formData.customer_state}
                  onChange={(e) => setFormData({...formData, customer_state: e.target.value})}
                  placeholder="Estado"
                />
              </div>
            </div>

            <div className="pt-6 border-t">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Dados do Cliente Legal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Razão Social"
                  name="legal_customer_name"
                  value={formData.legal_customer_name}
                  onChange={(e) => setFormData({...formData, legal_customer_name: e.target.value})}
                  placeholder="Razão social"
                />
                <Input
                  label="CNPJ"
                  name="legal_customer_cnpj"
                  value={formData.legal_customer_cnpj}
                  onChange={(e) => setFormData({...formData, legal_customer_cnpj: e.target.value})}
                  placeholder="00.000.000/0000-00"
                />
                <Input
                  label="E-mail"
                  name="legal_customer_email"
                  type="email"
                  value={formData.legal_customer_email}
                  onChange={(e) => setFormData({...formData, legal_customer_email: e.target.value})}
                  placeholder="email@exemplo.com"
                />
                <Input
                  label="Telefone"
                  name="legal_customer_phone"
                  value={formData.legal_customer_phone}
                  onChange={(e) => {
                    const maskedValue = applyPhoneMask(e.target.value);
                    setFormData({...formData, legal_customer_phone: maskedValue});
                  }}
                  onBlur={(e) => {
                    const numericValue = removePhoneMask(e.target.value);
                    setFormData({...formData, legal_customer_phone: numericValue});
                  }}
                  placeholder="(00) 00000-0000"
                />
                <Input
                  label="CEP"
                  name="legal_customer_zip_code"
                  value={formData.legal_customer_zip_code}
                  onChange={(e) => {
                    const maskedValue = applyCepMask(e.target.value);
                    setFormData({...formData, legal_customer_zip_code: maskedValue});
                  }}
                  onBlur={(e) => {
                    const numericValue = removeCepMask(e.target.value);
                    setFormData({...formData, legal_customer_zip_code: numericValue});
                  }}
                  placeholder="00000-000"
                />
                <Input
                  label="Endereço"
                  name="legal_customer_address"
                  value={formData.legal_customer_address}
                  onChange={(e) => setFormData({...formData, legal_customer_address: e.target.value})}
                  placeholder="Endereço completo"
                />
                <Input
                  label="Cidade"
                  name="legal_customer_city"
                  value={formData.legal_customer_city}
                  onChange={(e) => setFormData({...formData, legal_customer_city: e.target.value})}
                  placeholder="Cidade"
                />
                <Input
                  label="Estado"
                  name="legal_customer_state"
                  value={formData.legal_customer_state}
                  onChange={(e) => setFormData({...formData, legal_customer_state: e.target.value})}
                  placeholder="Estado"
                />
              </div>
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
                {isEditing ? 'Atualizar' : 'Criar'} Veículo
              </button>
            </div>
          </form>
        </ResponsiveCard>
      )}

        {/* Resumo do Estoque */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Disponíveis</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.disponiveis}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vendidos</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.vendidos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Reservados</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.reservados}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Manutenção</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.manutencao}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Valor Total do Estoque */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Valor Total do Estoque Disponível</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totals.valorTotal)}</p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        {isCreatingNew ? (
          renderNewVehicleForm()
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {renderVehiclesTable()}
            </div>
          </div>
        )}
    </ResponsivePage>
  );
}
