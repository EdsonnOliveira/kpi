import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency, applyCurrencyMask, removeCurrencyMask } from "../lib/formatting";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";
import Checkbox from "../components/Checkbox";

interface VehicleDetails {
  id: string;
  company_id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  chassis: string;
  mileage: number;
  price: number;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function VehicleDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, isLoading: authLoading, authenticatedFetch } = useAuth();
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    brand: "",
    model: "",
    year: "",
    color: "",
    plate: "",
    chassis: "",
    mileage: "",
    price: "",
    status: "",
    description: ""
  });

  // Função para buscar detalhes do veículo
  const fetchVehicleDetails = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (!user || !id) {
        return;
      }
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/vehicles?id=eq.${id}&company_id=eq.${user.company_id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados do veículo');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setVehicleDetails(data[0]);
      } else {
        setError('Veículo não encontrado');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && isAuthenticated && user) {
      fetchVehicleDetails();
    }
  }, [id, isAuthenticated, user]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    if (vehicleDetails) {
      setEditForm({
        brand: vehicleDetails.brand,
        model: vehicleDetails.model,
        year: vehicleDetails.year.toString(),
        color: vehicleDetails.color,
        plate: vehicleDetails.plate,
        chassis: vehicleDetails.chassis,
        mileage: vehicleDetails.mileage.toString(),
        price: applyCurrencyMask(vehicleDetails.price.toString()),
        status: vehicleDetails.status,
        description: vehicleDetails.description
      });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError("");
    setSuccessMessage("");
  };

  const handlePrint = () => {
    if (!vehicleDetails) return;
    
    // Criar conteúdo para impressão
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Detalhes do Veículo - ${vehicleDetails.brand} ${vehicleDetails.model}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin-bottom: 25px; }
            .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .info-item { margin-bottom: 10px; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .status-available { background-color: #d4edda; color: #155724; }
            .status-sold { background-color: #f8d7da; color: #721c24; }
            .status-reserved { background-color: #fff3cd; color: #856404; }
            .status-negotiating { background-color: #d1ecf1; color: #0c5460; }
            .status-maintenance { background-color: #e2e3f1; color: #383d41; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Detalhes do Veículo</h1>
            <p>Veículo #${vehicleDetails.id.slice(-8)} - ${vehicleDetails.brand} ${vehicleDetails.model} ${vehicleDetails.year}</p>
            <p>Impresso em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>

          <div class="section">
            <h3>Informações Básicas</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Placa:</span> <span class="value">${vehicleDetails.plate || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">Marca/Modelo:</span> <span class="value">${vehicleDetails.brand} ${vehicleDetails.model}</span>
              </div>
              <div class="info-item">
                <span class="label">Ano:</span> <span class="value">${vehicleDetails.year}</span>
              </div>
              <div class="info-item">
                <span class="label">Cor:</span> <span class="value">${vehicleDetails.color || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Valores e Status</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Preço:</span> <span class="value">${formatCurrency(vehicleDetails.price)}</span>
              </div>
              <div class="info-item">
                <span class="label">Quilometragem:</span> <span class="value">${vehicleDetails.mileage.toLocaleString('pt-BR')} km</span>
              </div>
              <div class="info-item">
                <span class="label">Chassi:</span> <span class="value">${vehicleDetails.chassis || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">Status:</span> 
                <span class="status status-${vehicleDetails.status}">${getStatusLabel(vehicleDetails.status)}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Informações Adicionais</h3>
            <div class="info-item">
              <span class="label">Descrição:</span>
              <p class="value">${vehicleDetails.description || 'Nenhuma descrição disponível'}</p>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Data de Criação:</span> <span class="value">${new Date(vehicleDetails.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div class="info-item">
                <span class="label">Última Atualização:</span> <span class="value">${new Date(vehicleDetails.updated_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Documento gerado automaticamente pelo Sistema KPI</p>
            <p>Para mais informações, acesse o sistema online</p>
          </div>
        </body>
      </html>
    `;

    // Abrir janela de impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Aguardar o conteúdo carregar e então imprimir
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    }
  };

  const handleSaveEdit = async () => {
    try {
      setError("");
      setSuccessMessage("");
      
      if (!user || !vehicleDetails) {
        return;
      }
      
      const dataToSave = {
        brand: editForm.brand,
        model: editForm.model,
        year: parseInt(editForm.year) || 0,
        color: editForm.color,
        plate: editForm.plate,
        chassis: editForm.chassis,
        mileage: parseInt(editForm.mileage) || 0,
        price: parseFloat(removeCurrencyMask(editForm.price)) || 0,
        status: editForm.status,
        description: editForm.description
      };
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/vehicles?id=eq.${vehicleDetails.id}`, {
        method: 'PATCH',
        body: JSON.stringify(dataToSave)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar veículo');
      }
      
      setSuccessMessage('Veículo atualizado com sucesso!');
    setIsEditing(false);
      fetchVehicleDetails();
      
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar dados');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'price') {
      const maskedValue = applyCurrencyMask(value);
      setEditForm(prev => ({
        ...prev,
        [name]: maskedValue
      }));
    } else {
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-red-100 text-red-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      case "negotiating":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Disponível";
      case "sold":
        return "Vendido";
      case "reserved":
        return "Reservado";
      case "negotiating":
        return "Em Negociação";
      case "maintenance":
        return "Em Revisão";
      default:
        return status;
    }
  };

  if (authLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Verificando autenticação...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
            <Button variant="primary" onClick={() => router.push('/')}>
              Ir para Login
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando detalhes do veículo...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar veículo</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="primary" onClick={handleBack}>
              Voltar
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!vehicleDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Veículo não encontrado</h2>
            <Button variant="primary" onClick={handleBack}>
              Voltar
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-4"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              >
                Voltar
              </Button>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Detalhes do Veículo
              </h2>
              <p className="text-gray-600">
                Veículo #{vehicleDetails.id.slice(-8)} - {vehicleDetails.brand} {vehicleDetails.model} {vehicleDetails.year}
              </p>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={handleEdit}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={handlePrint}
                  >
                    Imprimir
                  </Button>
                  <Button variant="success">
                    Vender
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="success"
                    onClick={handleSaveEdit}
                  >
                    Salvar
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mensagens de Sucesso e Erro */}
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

        {/* Resumo do Veículo */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Placa"
                    name="plate"
                    value={editForm.plate}
                    onChange={handleInputChange}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Marca"
                      name="brand"
                      value={editForm.brand}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Modelo"
                      name="model"
                      value={editForm.model}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Ano"
                      name="year"
                      type="number"
                      value={editForm.year}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Cor"
                      name="color"
                      value={editForm.color}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p><span className="font-medium text-gray-900">Placa:</span> <span className="text-gray-900">{vehicleDetails.plate}</span></p>
                  <p><span className="font-medium text-gray-900">Marca/Modelo:</span> <span className="text-gray-900">{vehicleDetails.brand} {vehicleDetails.model}</span></p>
                  <p><span className="font-medium text-gray-900">Ano:</span> <span className="text-gray-900">{vehicleDetails.year}</span></p>
                  <p><span className="font-medium text-gray-900">Cor:</span> <span className="text-gray-900">{vehicleDetails.color}</span></p>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Valores e Status</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Preço"
                    name="price"
                    type="text"
                    value={editForm.price}
                    onChange={handleInputChange}
                    placeholder="0,00"
                  />
                  <Input
                    label="Quilometragem"
                    name="mileage"
                    type="number"
                    value={editForm.mileage}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Chassi"
                    name="chassis"
                    value={editForm.chassis}
                    onChange={handleInputChange}
                  />
                  <Select
                    label="Status"
                    name="status"
                    value={editForm.status}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione</option>
                    <option value="available">Disponível</option>
                    <option value="sold">Vendido</option>
                    <option value="reserved">Reservado</option>
                    <option value="negotiating">Em Negociação</option>
                    <option value="maintenance">Em Revisão</option>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <p><span className="font-medium text-gray-900">Preço:</span> <span className="text-gray-900">{formatCurrency(vehicleDetails.price)}</span></p>
                  <p><span className="font-medium text-gray-900">Quilometragem:</span> <span className="text-gray-900">{vehicleDetails.mileage.toLocaleString('pt-BR')} km</span></p>
                  <p><span className="font-medium text-gray-900">Chassi:</span> <span className="text-gray-900">{vehicleDetails.chassis}</span></p>
                  <p><span className="font-medium text-gray-900">Status:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicleDetails.status)}`}>
                      {getStatusLabel(vehicleDetails.status)}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    label="Descrição"
                    name="description"
                    value={editForm.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Data de Criação:</span> {new Date(vehicleDetails.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Última Atualização:</span> {new Date(vehicleDetails.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p><span className="font-medium text-gray-900">Descrição:</span></p>
                  <p className="text-sm text-gray-600">{vehicleDetails.description || 'Nenhuma descrição disponível'}</p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Data de Criação:</span> {new Date(vehicleDetails.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Última Atualização:</span> {new Date(vehicleDetails.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumo Financeiro</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-600">Preço do Veículo</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(vehicleDetails.price)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-600">Status</p>
              <p className="text-lg font-bold text-green-900">{getStatusLabel(vehicleDetails.status)}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-600">Quilometragem</p>
              <p className="text-2xl font-bold text-purple-900">{vehicleDetails.mileage.toLocaleString('pt-BR')} km</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
