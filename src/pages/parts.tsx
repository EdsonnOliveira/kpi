import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { formatCurrency, applyCurrencyMask, removeCurrencyMask } from "../lib/formatting";
import Input from "../components/Input";
import Select from "../components/Select";

interface Part {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  quantity: number;
  minimum_quantity: number;
  cost_price: number;
  sale_price: number;
  supplier_id: string;
  supplier_name: string;
  location: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function Parts() {
  const router = useRouter();
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Referência para o card de edição
  const editFormRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    category: "",
    brand: "",
    model: "",
    quantity: "",
    minimum_quantity: "",
    cost_price: "",
    sale_price: "",
    supplier_id: "",
    location: "",
    status: "active",
    notes: ""
  });

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

  // Função para buscar suppliers
  const fetchSuppliers = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/suppliers?company_id=eq.${user.company_id}&order=name.asc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
      
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    }
  };

  // Função para buscar parts
  const fetchParts = async () => {
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
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/parts?company_id=eq.${user.company_id}&order=name.asc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setParts(data);
      } else {
        setError('Erro ao carregar peças');
      }
      
    } catch (error) {
      console.error('Erro ao buscar peças:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar part (criar ou editar)
  const savePart = async () => {
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
        quantity: formData.quantity ? parseInt(formData.quantity.toString()) : 0,
        minimum_quantity: formData.minimum_quantity ? parseInt(formData.minimum_quantity.toString()) : 0,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price.toString()) : 0,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price.toString()) : 0
      };
      
      let response;
      
      if (isEditing && selectedPart) {
        // Editar part existente
        response = await fetch(`${SUPABASE_URL}/rest/v1/parts?id=eq.${selectedPart}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSave)
        });
      } else {
        // Criar nova part
        response = await fetch(`${SUPABASE_URL}/rest/v1/parts`, {
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
        throw new Error('Erro ao salvar peça');
      }
      
      setSuccessMessage(isEditing ? 'Peça atualizada com sucesso!' : 'Peça criada com sucesso!');
      setIsCreatingNew(false);
      setIsEditing(false);
      setSelectedPart(null);
      resetForm();
      fetchParts();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    }
  };

  // Função para editar part
  const editPart = (part: Part) => {
    setFormData({
      code: part.code,
      name: part.name,
      description: part.description,
      category: part.category,
      brand: part.brand,
      model: part.model,
      quantity: part.quantity.toString(),
      minimum_quantity: part.minimum_quantity.toString(),
      cost_price: part.cost_price.toString(),
      sale_price: part.sale_price.toString(),
      supplier_id: part.supplier_id,
      location: part.location,
      status: part.status,
      notes: part.notes || ""
    });
    setSelectedPart(part.id);
    setIsEditing(true);
    setIsCreatingNew(true);
  };

  // Função para deletar part
  const deletePart = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta peça?')) {
      return;
    }
    
    try {
      setError("");
      
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!accessToken) {
        router.push('/');
        return;
      }
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/parts?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir peça');
      }
      
      setSuccessMessage('Peça excluída com sucesso!');
      fetchParts();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir dados');
    }
  };

  // Função para resetar formulário
  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      category: "",
      brand: "",
      model: "",
      quantity: "",
      minimum_quantity: "",
      cost_price: "",
      sale_price: "",
      supplier_id: "",
      location: "",
      status: "active",
      notes: ""
    });
  };

  // Função para cancelar edição/criação
  const cancelForm = () => {
    setIsCreatingNew(false);
    setIsEditing(false);
    setSelectedPart(null);
    resetForm();
    setError("");
    setSuccessMessage("");
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchParts();
    fetchSuppliers();
  }, []);

  // Mock data para peças
  const partsData: Part[] = [
    {
      id: "1",
      code: "P001",
      name: "Filtro de Óleo",
      description: "Filtro de óleo para motor 1.6",
      category: "Filtros",
      brand: "Mann",
      model: "W712/75",
      quantity: 25,
      minimum_quantity: 5,
      cost_price: 15.00,
      sale_price: 25.00,
      supplier_id: "1",
      supplier_name: "Auto Peças XYZ",
      location: "A-01-15",
      status: "Disponível",
      created_at: "2025-09-15T00:00:00Z",
      updated_at: "2025-09-15T00:00:00Z"
    },
    {
      id: "2",
      code: "P002",
      name: "Pastilha de Freio",
      description: "Pastilha de freio dianteira",
      category: "Freios",
      brand: "Bosch",
      model: "0986AB1234",
      quantity: 8,
      minimum_quantity: 10,
      cost_price: 45.00,
      sale_price: 75.00,
      supplier_id: "2",
      supplier_name: "Auto Peças ABC",
      location: "B-02-08",
      status: "Estoque Baixo",
      created_at: "2025-09-10T00:00:00Z",
      updated_at: "2025-09-10T00:00:00Z"
    },
    {
      id: "3",
      code: "P003",
      name: "Bateria 60Ah",
      description: "Bateria automotiva 60Ah",
      category: "Elétrica",
      brand: "Moura",
      model: "M60B",
      quantity: 12,
      minimum_quantity: 3,
      cost_price: 180.00,
      sale_price: 280.00,
      supplier_id: "3",
      supplier_name: "Baterias Silva",
      location: "C-01-12",
      status: "Disponível",
      created_at: "2025-09-20T00:00:00Z",
      updated_at: "2025-09-20T00:00:00Z"
    },
    {
      id: "4",
      code: "P004",
      name: "Amortecedor Dianteiro",
      description: "Amortecedor dianteiro esquerdo",
      category: "Suspensão",
      brand: "Monroe",
      model: "G7350",
      quantity: 0,
      minimum_quantity: 2,
      cost_price: 120.00,
      sale_price: 200.00,
      supplier_id: "4",
      supplier_name: "Suspensão Total",
      location: "D-03-01",
      status: "Sem Estoque",
      created_at: "2025-09-05T00:00:00Z",
      updated_at: "2025-09-05T00:00:00Z"
    },
    {
      id: "5",
      code: "P005",
      name: "Óleo Motor 5W30",
      description: "Óleo sintético 5W30 1L",
      category: "Lubrificantes",
      brand: "Castrol",
      model: "GTX 5W30",
      quantity: 50,
      minimum_quantity: 20,
      cost_price: 25.00,
      sale_price: 40.00,
      supplier_id: "5",
      supplier_name: "Lubrificantes Brasil",
      location: "E-01-50",
      status: "Disponível",
      created_at: "2025-09-25T00:00:00Z",
      updated_at: "2025-09-25T00:00:00Z"
    }
  ];

  const handlePartClick = (partId: string) => {
    setSelectedPart(selectedPart === partId ? null : partId);
  };

  const handlePartDoubleClick = (partId: string) => {
    router.push(`/part-details?id=${partId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria a lógica para salvar a peça
    console.log("Dados da peça:", formData);
    setIsCreatingNew(false);
    setFormData({
      code: "",
      name: "",
      description: "",
      category: "",
      brand: "",
      model: "",
      quantity: "",
      minimum_quantity: "",
      cost_price: "",
      sale_price: "",
      supplier_id: "",
      location: "",
      status: "",
      notes: ""
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disponível":
        return "bg-green-100 text-green-800";
      case "Estoque Baixo":
        return "bg-yellow-100 text-yellow-800";
      case "Sem Estoque":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQuantityColor = (quantidade: number, quantidadeMinima: number) => {
    if (quantidade === 0) return "text-red-600 font-bold";
    if (quantidade <= quantidadeMinima) return "text-yellow-600 font-medium";
    return "text-green-600";
  };

  const renderPartsTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca/Modelo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço Venda
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localização
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parts.map((part) => (
              <tr
                key={part.id}
                onClick={() => handlePartClick(part.id)}
                onDoubleClick={() => handlePartDoubleClick(part.id)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedPart === part.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {part.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div className="font-medium text-gray-900">{part.name}</div>
                    <div className="text-xs text-gray-400">{part.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {part.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div>{part.brand}</div>
                    <div className="text-xs text-gray-400">{part.model}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getQuantityColor(part.quantity, part.minimum_quantity)}>
                    {part.quantity}
                  </span>
                  <div className="text-xs text-gray-400">Min: {part.minimum_quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(part.sale_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(part.status)}`}>
                    {part.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {part.location}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderNewPartForm = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Nova Peça
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Código"
              type="text"
              name="code"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              placeholder="P001"
              required
            />
            <Input
              label="Nome"
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nome da peça"
              required
            />
            <Input
              label="Descrição"
              type="text"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição detalhada"
              required
            />
            <Select
              label="Categoria"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="">Selecione a categoria</option>
              <option value="filtros">Filtros</option>
              <option value="freios">Freios</option>
              <option value="eletrica">Elétrica</option>
              <option value="suspensao">Suspensão</option>
              <option value="lubrificantes">Lubrificantes</option>
              <option value="motor">Motor</option>
              <option value="transmissao">Transmissão</option>
              <option value="arrefecimento">Arrefecimento</option>
            </Select>
            <Input
              label="Marca"
              type="text"
              name="brand"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              placeholder="Marca da peça"
              required
            />
            <Input
              label="Modelo"
              type="text"
              name="model"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              placeholder="Modelo/Referência"
              required
            />
          </div>

          {/* Estoque e Preços */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Input
              label="Quantidade Atual"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              placeholder="0"
              required
            />
            <Input
              label="Quantidade Mínima"
              type="number"
              name="minimum_quantity"
              value={formData.minimum_quantity}
              onChange={(e) => setFormData({...formData, minimum_quantity: e.target.value})}
              placeholder="0"
              required
            />
            <Input
              label="Preço de Custo"
              type="text"
              name="cost_price"
              value={formData.cost_price}
              onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
              placeholder="R$ 0,00"
              required
            />
            <Input
              label="Preço de Venda"
              type="text"
              name="sale_price"
              value={formData.sale_price}
              onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
              placeholder="R$ 0,00"
              required
            />
          </div>

          {/* Fornecedor e Localização */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Fornecedor"
              type="text"
              name="supplier_id"
              value={formData.supplier_id}
              onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
              placeholder="Nome do fornecedor"
              required
            />
            <Input
              label="Localização"
              type="text"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="A-01-15"
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
              <option value="estoque-baixo">Estoque Baixo</option>
              <option value="sem-estoque">Sem Estoque</option>
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
              value={formData.notes || ""}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Observações sobre a peça..."
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
              Salvar Peça
            </button>
          </div>
        </form>
      </div>
    );
  };

  const calculateTotals = () => {
    const total = parts.length;
    const disponiveis = parts.filter(p => p.status === "Disponível").length;
    const estoqueBaixo = parts.filter(p => p.status === "Estoque Baixo").length;
    const semEstoque = parts.filter(p => p.status === "Sem Estoque").length;

    const valorTotal = parts.reduce((sum, part) => {
      return sum + (part.cost_price * part.quantity);
    }, 0);

    return { total, disponiveis, estoqueBaixo, semEstoque, valorTotal };
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
                Estoque de Peças
              </h2>
              <p className="text-gray-600">
                Controle de peças e insumos
              </p>
            </div>
            <div className="flex space-x-3">
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
                Nova Peça
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
          <div ref={editFormRef} className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isEditing ? 'Editar Peça' : 'Nova Peça'}
              </h3>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Atualize as informações da peça' : 'Preencha as informações da nova peça'}
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); savePart(); }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Código"
                  name="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="P001"
                  required
                />
                <Input
                  label="Nome"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome da peça"
                  required
                />
                <Input
                  label="Categoria"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Ex: Motor, Freio, etc."
                  required
                />
                <Input
                  label="Marca"
                  name="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  placeholder="Ex: Bosch, Valeo, etc."
                  required
                />
                <Input
                  label="Modelo"
                  name="model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="Modelo da peça"
                />
                <Input
                  label="Quantidade"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  placeholder="0"
                  required
                />
                <Input
                  label="Quantidade Mínima"
                  name="minimum_quantity"
                  type="number"
                  value={formData.minimum_quantity}
                  onChange={(e) => setFormData({...formData, minimum_quantity: e.target.value})}
                  placeholder="0"
                  required
                />
                <Input
                  label="Preço de Custo"
                  name="cost_price"
                  type="text"
                  value={formData.cost_price}
                  onChange={(e) => {
                    const maskedValue = applyCurrencyMask(e.target.value);
                    setFormData({...formData, cost_price: maskedValue});
                  }}
                  onBlur={(e) => {
                    const numericValue = removeCurrencyMask(e.target.value);
                    setFormData({...formData, cost_price: numericValue});
                  }}
                  placeholder="0,00"
                  required
                />
                <Input
                  label="Preço de Venda"
                  name="sale_price"
                  type="text"
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
                  label="Fornecedor"
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                  required
                >
                  <option value="">Selecione um fornecedor</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Localização"
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Ex: Estante A, Gaveta 1"
                />
                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="discontinued">Descontinuado</option>
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
                  placeholder="Descrição da peça..."
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
                  {isEditing ? 'Atualizar' : 'Criar'} Peça
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resumo do Estoque */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Peças</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.total}</p>
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
                <p className="text-sm font-medium text-gray-500">Disponíveis</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.disponiveis}</p>
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
                <p className="text-sm font-medium text-gray-500">Estoque Baixo</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.estoqueBaixo}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sem Estoque</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.semEstoque}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Valor Total do Estoque */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Valor Total do Estoque de Peças</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totals.valorTotal)}</p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        {isCreatingNew ? (
          renderNewPartForm()
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {renderPartsTable()}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
