import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency, applyCurrencyMask, removeCurrencyMask } from "../lib/formatting";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";

interface AccountDetails {
  id: string;
  name: string;
  type: string;
  category?: string;
  description?: string;
  balance: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  company_id: string;
}

export default function AccountDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, isLoading: authLoading, authenticatedFetch } = useAuth();
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    type: "despesa",
    category: "",
    description: "",
    balance: ""
  });

  // Função para buscar detalhes da conta
  const fetchAccountDetails = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (!user || !id) {
        return;
      }
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/accounts?id=eq.${id}&company_id=eq.${user.company_id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setAccountDetails(data[0]);
        } else {
          setError('Conta não encontrada');
        }
      } else {
        setError('Erro ao carregar detalhes da conta');
      }
      
    } catch (error) {
      console.error('Erro ao buscar conta:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && isAuthenticated && user) {
      fetchAccountDetails();
    }
  }, [id, isAuthenticated, user]);

  const handleBack = () => {
    router.back();
  };

  // Função para editar conta
  const handleEdit = () => {
    if (accountDetails) {
      setEditFormData({
        name: accountDetails.name,
        type: accountDetails.type,
        category: accountDetails.category || "",
        description: accountDetails.description || "",
        balance: accountDetails.balance.toString()
      });
    }
    setIsEditing(true);
  };

  // Função para salvar edição
  const handleSaveEdit = async () => {
    try {
      setError("");
      setSuccessMessage("");
      
      if (!user || !accountDetails) {
        return;
      }
      
      const dataToSave = {
        ...editFormData,
        balance: editFormData.balance ? parseFloat(editFormData.balance.toString()) : 0
      };
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/accounts?id=eq.${accountDetails.id}`, {
        method: 'PATCH',
        body: JSON.stringify(dataToSave)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar conta');
      }
      
      setSuccessMessage('Conta atualizada com sucesso!');
      setIsEditing(false);
      fetchAccountDetails();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar dados');
    }
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setIsEditing(false);
    setError("");
    setSuccessMessage("");
  };

  // Função para excluir conta
  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      setError("");
      setSuccessMessage("");
      
      if (!user || !accountDetails) {
        return;
      }
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/accounts?id=eq.${accountDetails.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir conta');
      }
      
      setSuccessMessage('Conta excluída com sucesso!');
      
      // Redirecionar para a lista de contas após 2 segundos
      setTimeout(() => {
        router.push('/accounts');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir dados');
    } finally {
      setIsDeleting(false);
    }
  };


  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "despesa":
        return "bg-red-100 text-red-800";
      case "ativo":
        return "bg-green-100 text-green-800";
      case "receita":
        return "bg-blue-100 text-blue-800";
      case "passivo":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case "despesa":
        return "Despesa";
      case "ativo":
        return "Ativo";
      case "receita":
        return "Receita";
      case "passivo":
        return "Passivo";
      default:
        return type;
    }
  };

  const getStatusColor = (active: boolean) => {
    return active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getStatusLabel = (active: boolean) => {
    return active ? "Ativo" : "Inativo";
  };

  if (authLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando...</span>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
            <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
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
              <p className="text-gray-600">Carregando detalhes da conta...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            variant="primary"
            onClick={handleBack}
          >
            Voltar
          </Button>
        </div>
        </div>
      </main>
    );
  }

  if (!accountDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Conta não encontrada</h2>
          <Button
            variant="primary"
            onClick={handleBack}
          >
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
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
                className="mb-4"
              >
                Voltar
              </Button>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Detalhes da Conta
              </h2>
              <p className="text-gray-600">
                Conta #{accountDetails.id.slice(-8)} - {accountDetails.name}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={handleEdit}
              >
                Editar
              </Button>
              <Button 
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
                loading={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </Button>
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

        {/* Formulário de Edição */}
        {isEditing && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Editar Conta</h3>
              <p className="text-sm text-gray-600">Atualize as informações da conta</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nome da Conta"
                  name="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  required
                />
                <Select
                  label="Tipo"
                  name="type"
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                  required
                >
                  <option value="despesa">Despesa</option>
                  <option value="ativo">Ativo</option>
                  <option value="receita">Receita</option>
                  <option value="passivo">Passivo</option>
                </Select>
                <Input
                  label="Categoria"
                  name="category"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                />
                <Input
                  label="Saldo"
                  name="balance"
                  type="text"
                  value={editFormData.balance}
                  onChange={(e) => {
                    const maskedValue = applyCurrencyMask(e.target.value);
                    setEditFormData({...editFormData, balance: maskedValue});
                  }}
                  onBlur={(e) => {
                    const numericValue = removeCurrencyMask(e.target.value);
                    setEditFormData({...editFormData, balance: numericValue});
                  }}
                  placeholder="0,00"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Descrição"
                    name="description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </Button>
                <Button
                  variant="success"
                  type="submit"
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Resumo da Conta */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">Nome:</span> <span className="text-gray-900">{accountDetails.name}</span></p>
                  <p><span className="font-bold text-gray-900">Tipo:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(accountDetails.type)}`}>
                      {getTypeLabel(accountDetails.type)}
                    </span>
                  </p>
                  <p><span className="font-bold text-gray-900">Saldo:</span> <span className="text-gray-900">{formatCurrency(accountDetails.balance)}</span></p>
                  <p><span className="font-bold text-gray-900">Status:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(accountDetails.active)}`}>
                      {getStatusLabel(accountDetails.active)}
                    </span>
                  </p>
                  {accountDetails.category && (
                    <p><span className="font-bold text-gray-900">Categoria:</span> <span className="text-gray-900">{accountDetails.category}</span></p>
                  )}
                </div>
              </div>

              {/* Datas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Datas</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">Data de Criação:</span> <span className="text-gray-900">{new Date(accountDetails.created_at).toLocaleDateString('pt-BR')}</span></p>
                  <p><span className="font-bold text-gray-900">Última Atualização:</span> <span className="text-gray-900">{new Date(accountDetails.updated_at).toLocaleDateString('pt-BR')}</span></p>
                  <p><span className="font-bold text-gray-900">ID da Conta:</span> <span className="text-gray-900 font-mono text-sm">{accountDetails.id}</span></p>
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              {/* Informações Adicionais */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">ID da Empresa:</span> <span className="text-gray-900 font-mono text-sm">{accountDetails.company_id}</span></p>
                  <p><span className="font-bold text-gray-900">Tipo de Conta:</span> <span className="text-gray-900">{accountDetails.type}</span></p>
                  <p><span className="font-bold text-gray-900">Saldo Atual:</span> <span className="text-gray-900 font-semibold">{formatCurrency(accountDetails.balance)}</span></p>
                </div>
              </div>

              {/* Descrição */}
              {accountDetails.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Descrição</h3>
                  <p className="text-gray-600">{accountDetails.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumo Financeiro</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(accountDetails.balance)}
              </div>
              <div className="text-sm text-gray-600">Saldo Atual</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {accountDetails.type === 'despesa' || accountDetails.type === 'passivo' ? 'A Pagar' : 'A Receber'}
              </div>
              <div className="text-sm text-gray-600">Classificação</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {accountDetails.active ? 'Ativa' : 'Inativa'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
