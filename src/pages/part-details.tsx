import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency, applyCurrencyMask, removeCurrencyMask } from "../lib/formatting";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";

interface PartDetails {
  id: string;
  company_id: string;
  supplier_id: string;
  name: string;
  part_number: string;
  description: string;
  category: string;
  unit_price: number;
  stock_quantity: number;
  min_stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  supplier_name?: string;
}

export default function PartDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, isLoading: authLoading, authenticatedFetch } = useAuth();
  const [partDetails, setPartDetails] = useState<PartDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    part_number: "",
    description: "",
    category: "",
    unit_price: "",
    stock_quantity: "",
    min_stock: "",
    active: true
  });

  // Função para buscar detalhes da peça
  const fetchPartDetails = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (!user || !id) {
        return;
      }
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/parts?id=eq.${id}&company_id=eq.${user.company_id}&select=*,suppliers(name)`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados da peça');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const part = data[0];
        setPartDetails({
          ...part,
          supplier_name: part.suppliers?.name || 'N/A'
        });
      } else {
        setError('Peça não encontrada');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && isAuthenticated && user) {
      fetchPartDetails();
    }
  }, [id, isAuthenticated, user]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    if (partDetails) {
      setEditForm({
        name: partDetails.name,
        part_number: partDetails.part_number || "",
        description: partDetails.description || "",
        category: partDetails.category || "",
        unit_price: applyCurrencyMask(partDetails.unit_price.toString()),
        stock_quantity: partDetails.stock_quantity.toString(),
        min_stock: partDetails.min_stock.toString(),
        active: partDetails.active
      });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError("");
    setSuccessMessage("");
  };

  const handleSaveEdit = async () => {
    try {
      setError("");
      setSuccessMessage("");
      
      if (!user || !partDetails) {
        return;
      }
      
      const dataToSave = {
        name: editForm.name,
        part_number: editForm.part_number,
        description: editForm.description,
        category: editForm.category,
        unit_price: parseFloat(removeCurrencyMask(editForm.unit_price)) || 0,
        stock_quantity: parseInt(editForm.stock_quantity) || 0,
        min_stock: parseInt(editForm.min_stock) || 0,
        active: editForm.active
      };
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/parts?id=eq.${partDetails.id}`, {
        method: 'PATCH',
        body: JSON.stringify(dataToSave)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar peça');
      }
      
      setSuccessMessage('Peça atualizada com sucesso!');
      setIsEditing(false);
      fetchPartDetails();
      
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar dados');
    }
  };

  const handlePrint = () => {
    if (!partDetails) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Detalhes da Peça - ${partDetails.name}</title>
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
            .status-active { background-color: #d4edda; color: #155724; }
            .status-inactive { background-color: #f8d7da; color: #721c24; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Detalhes da Peça</h1>
            <p>Peça #${partDetails.id.slice(-8)} - ${partDetails.name}</p>
            <p>Impresso em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>

          <div class="section">
            <h3>Informações Básicas</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Nome:</span> <span class="value">${partDetails.name}</span>
              </div>
              <div class="info-item">
                <span class="label">Número da Peça:</span> <span class="value">${partDetails.part_number || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">Categoria:</span> <span class="value">${partDetails.category || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">Fornecedor:</span> <span class="value">${partDetails.supplier_name || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Estoque e Preços</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Quantidade em Estoque:</span> <span class="value">${partDetails.stock_quantity}</span>
              </div>
              <div class="info-item">
                <span class="label">Estoque Mínimo:</span> <span class="value">${partDetails.min_stock}</span>
              </div>
              <div class="info-item">
                <span class="label">Preço Unitário:</span> <span class="value">${formatCurrency(partDetails.unit_price)}</span>
              </div>
              <div class="info-item">
                <span class="label">Status:</span> 
                <span class="status status-${partDetails.active ? 'active' : 'inactive'}">${partDetails.active ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Informações Adicionais</h3>
            <div class="info-item">
              <span class="label">Descrição:</span>
              <p class="value">${partDetails.description || 'Nenhuma descrição disponível'}</p>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Data de Criação:</span> <span class="value">${new Date(partDetails.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div class="info-item">
                <span class="label">Última Atualização:</span> <span class="value">${new Date(partDetails.updated_at).toLocaleDateString('pt-BR')}</span>
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

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'unit_price') {
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

  const getStatusColor = (active: boolean) => {
    return active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getStatusLabel = (active: boolean) => {
    return active ? "Ativo" : "Inativo";
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= 0) return { color: "bg-red-100 text-red-800", label: "Sem Estoque" };
    if (quantity <= minStock) return { color: "bg-yellow-100 text-yellow-800", label: "Estoque Baixo" };
    return { color: "bg-green-100 text-green-800", label: "Em Estoque" };
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
              <p className="text-gray-600">Carregando detalhes da peça...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar peça</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="primary" onClick={handleBack}>
              Voltar
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!partDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Peça não encontrada</h2>
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
                Detalhes da Peça
              </h2>
              <p className="text-gray-600">
                Peça #{partDetails.id.slice(-8)} - {partDetails.name}
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

        {/* Resumo da Peça */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Nome da Peça"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="Número da Peça"
                    name="part_number"
                    value={editForm.part_number}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Categoria"
                    name="category"
                    value={editForm.category}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
              <div className="space-y-2">
                  <p><span className="font-medium text-gray-900">Nome:</span> <span className="text-gray-900">{partDetails.name}</span></p>
                  <p><span className="font-medium text-gray-900">Número da Peça:</span> <span className="text-gray-900">{partDetails.part_number || 'N/A'}</span></p>
                  <p><span className="font-medium text-gray-900">Categoria:</span> <span className="text-gray-900">{partDetails.category || 'N/A'}</span></p>
                  <p><span className="font-medium text-gray-900">Fornecedor:</span> <span className="text-gray-900">{partDetails.supplier_name || 'N/A'}</span></p>
              </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estoque e Preços</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Preço Unitário"
                    name="unit_price"
                    type="text"
                    value={editForm.unit_price}
                    onChange={handleInputChange}
                    placeholder="0,00"
                    required
                  />
                  <Input
                    label="Quantidade em Estoque"
                    name="stock_quantity"
                    type="number"
                    value={editForm.stock_quantity}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="Estoque Mínimo"
                    name="min_stock"
                    type="number"
                    value={editForm.min_stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              ) : (
              <div className="space-y-2">
                  <p><span className="font-medium text-gray-900">Preço Unitário:</span> <span className="text-gray-900">{formatCurrency(partDetails.unit_price)}</span></p>
                  <p><span className="font-medium text-gray-900">Quantidade em Estoque:</span> <span className="text-gray-900">{partDetails.stock_quantity}</span></p>
                  <p><span className="font-medium text-gray-900">Estoque Mínimo:</span> <span className="text-gray-900">{partDetails.min_stock}</span></p>
                  <p><span className="font-medium text-gray-900">Status do Estoque:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatus(partDetails.stock_quantity, partDetails.min_stock).color}`}>
                      {getStockStatus(partDetails.stock_quantity, partDetails.min_stock).label}
                    </span>
                  </p>
              </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status e Datas</h3>
              <div className="space-y-2">
                <p><span className="font-medium text-gray-900">Status:</span> 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(partDetails.active)}`}>
                    {getStatusLabel(partDetails.active)}
                  </span>
                </p>
                <p><span className="font-medium text-gray-900">Data de Criação:</span> <span className="text-gray-900">{new Date(partDetails.created_at).toLocaleDateString('pt-BR')}</span></p>
                <p><span className="font-medium text-gray-900">Última Atualização:</span> <span className="text-gray-900">{new Date(partDetails.updated_at).toLocaleDateString('pt-BR')}</span></p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Descrição</h3>
              {isEditing ? (
                <Textarea
                  label="Descrição"
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  rows={4}
                />
              ) : (
                <p className="text-sm text-gray-600">{partDetails.description || 'Nenhuma descrição disponível'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumo Financeiro</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-600">Preço Unitário</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(partDetails.unit_price)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-600">Valor Total em Estoque</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(partDetails.unit_price * partDetails.stock_quantity)}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-600">Quantidade em Estoque</p>
              <p className="text-2xl font-bold text-purple-900">{partDetails.stock_quantity}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-600">Status do Estoque</p>
              <p className="text-lg font-bold text-orange-900">{getStockStatus(partDetails.stock_quantity, partDetails.min_stock).label}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
