import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency, applyCurrencyMask, removeCurrencyMask } from "../lib/formatting";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";

interface ReconciliationDetails {
  id: string;
  company_id: string;
  account_id: string;
  statement_balance: number;
  book_balance: number;
  difference: number;
  reconciliation_date: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  account_name?: string;
}

export default function ReconciliationDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, isLoading: authLoading, authenticatedFetch } = useAuth();
  const [reconciliationDetails, setReconciliationDetails] = useState<ReconciliationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [editFormData, setEditFormData] = useState({
    account_id: "",
    reconciliation_date: "",
    statement_balance: "",
    book_balance: "",
    notes: ""
  });

  // Função para buscar detalhes da conciliação
  const fetchReconciliationDetails = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (!user || !id) {
        return;
      }
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/reconciliations?id=eq.${id}&company_id=eq.${user.company_id}&select=*,accounts(name)`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const reconciliation = data[0];
          setReconciliationDetails({
            ...reconciliation,
            account_name: reconciliation.accounts?.name || 'Conta não encontrada'
          });
        } else {
          setError('Conciliação não encontrada');
        }
      } else {
        setError('Erro ao carregar detalhes da conciliação');
      }
      
    } catch (error) {
      console.error('Erro ao buscar conciliação:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar contas
  const fetchAccounts = async () => {
    try {
      if (!user) {
        return;
      }
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/accounts?company_id=eq.${user.company_id}&active=eq.true&select=id,name,type`);
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else {
        console.error('Erro ao carregar contas');
      }
      
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
    }
  };

  useEffect(() => {
    if (id && isAuthenticated && user) {
      fetchReconciliationDetails();
      fetchAccounts();
    }
  }, [id, isAuthenticated, user]);

  const handleBack = () => {
    router.back();
  };

  // Função para editar conciliação
  const handleEdit = () => {
    if (reconciliationDetails) {
      setEditFormData({
        account_id: reconciliationDetails.account_id,
        reconciliation_date: reconciliationDetails.reconciliation_date,
        statement_balance: applyCurrencyMask(reconciliationDetails.statement_balance.toString()),
        book_balance: applyCurrencyMask(reconciliationDetails.book_balance.toString()),
        notes: reconciliationDetails.notes || ""
      });
    }
    setIsEditing(true);
  };

  // Função para salvar edição
  const handleSaveEdit = async () => {
    try {
      setError("");
      setSuccessMessage("");
      
      if (!user || !reconciliationDetails) {
        return;
      }
      
      const dataToSave = {
        account_id: editFormData.account_id,
        reconciliation_date: editFormData.reconciliation_date,
        statement_balance: parseFloat(removeCurrencyMask(editFormData.statement_balance)) || 0,
        book_balance: parseFloat(removeCurrencyMask(editFormData.book_balance)) || 0,
        difference: (parseFloat(removeCurrencyMask(editFormData.statement_balance)) || 0) - (parseFloat(removeCurrencyMask(editFormData.book_balance)) || 0),
        notes: editFormData.notes
      };
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/reconciliations?id=eq.${reconciliationDetails.id}`, {
        method: 'PATCH',
        body: JSON.stringify(dataToSave)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar conciliação');
      }
      
      setSuccessMessage('Conciliação atualizada com sucesso!');
      setIsEditing(false);
      fetchReconciliationDetails();
      
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Conciliado";
      case "pending":
        return "Pendente";
      case "error":
        return "Erro";
      default:
        return status;
    }
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
              <p className="text-gray-600">Carregando detalhes da conciliação...</p>
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

  if (!reconciliationDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Conciliação não encontrada</h2>
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
                Detalhes da Conciliação
              </h2>
              <p className="text-gray-600">
                Conciliação #{reconciliationDetails.id.slice(-8)} - {reconciliationDetails.account_name}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={handleEdit}
              >
                Editar
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Editar Conciliação</h3>
              <p className="text-sm text-gray-600">Atualize as informações da conciliação</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Conta"
                  name="account_id"
                  value={editFormData.account_id}
                  onChange={(e) => setEditFormData({...editFormData, account_id: e.target.value})}
                  required
                >
                  <option value="">Selecione a conta</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.type}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Data da Conciliação"
                  type="date"
                  name="reconciliation_date"
                  value={editFormData.reconciliation_date}
                  onChange={(e) => setEditFormData({...editFormData, reconciliation_date: e.target.value})}
                  required
                />
                <Input
                  label="Saldo do Extrato"
                  type="text"
                  name="statement_balance"
                  value={editFormData.statement_balance}
                  onChange={(e) => {
                    const maskedValue = applyCurrencyMask(e.target.value);
                    setEditFormData({...editFormData, statement_balance: maskedValue});
                  }}
                  onBlur={(e) => {
                    const numericValue = removeCurrencyMask(e.target.value);
                    setEditFormData({...editFormData, statement_balance: numericValue});
                  }}
                  placeholder="0,00"
                  required
                />
                <Input
                  label="Saldo Contábil"
                  type="text"
                  name="book_balance"
                  value={editFormData.book_balance}
                  onChange={(e) => {
                    const maskedValue = applyCurrencyMask(e.target.value);
                    setEditFormData({...editFormData, book_balance: maskedValue});
                  }}
                  onBlur={(e) => {
                    const numericValue = removeCurrencyMask(e.target.value);
                    setEditFormData({...editFormData, book_balance: numericValue});
                  }}
                  placeholder="0,00"
                  required
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    name="notes"
                    rows={4}
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Observações sobre a conciliação..."
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

        {/* Resumo da Conciliação */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">Conta:</span> <span className="text-gray-900">{reconciliationDetails.account_name}</span></p>
                  <p><span className="font-bold text-gray-900">Data da Conciliação:</span> <span className="text-gray-900">{new Date(reconciliationDetails.reconciliation_date).toLocaleDateString('pt-BR')}</span></p>
                  <p><span className="font-bold text-gray-900">Status:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reconciliationDetails.status)}`}>
                      {getStatusLabel(reconciliationDetails.status)}
                    </span>
                  </p>
                  <p><span className="font-bold text-gray-900">ID da Conciliação:</span> <span className="text-gray-900 font-mono text-sm">{reconciliationDetails.id}</span></p>
                </div>
              </div>

              {/* Datas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Datas</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">Data de Criação:</span> <span className="text-gray-900">{new Date(reconciliationDetails.created_at).toLocaleDateString('pt-BR')}</span></p>
                  <p><span className="font-bold text-gray-900">Última Atualização:</span> <span className="text-gray-900">{new Date(reconciliationDetails.updated_at).toLocaleDateString('pt-BR')}</span></p>
                  <p><span className="font-bold text-gray-900">ID da Empresa:</span> <span className="text-gray-900 font-mono text-sm">{reconciliationDetails.company_id}</span></p>
                  <p><span className="font-bold text-gray-900">ID da Conta:</span> <span className="text-gray-900 font-mono text-sm">{reconciliationDetails.account_id}</span></p>
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              {/* Saldos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Saldos</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-600">Saldo Contábil</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(reconciliationDetails.book_balance)}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-600">Saldo do Extrato</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(reconciliationDetails.statement_balance)}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${reconciliationDetails.difference === 0 ? "bg-green-50" : "bg-red-50"}`}>
                    <p className={`text-sm font-medium ${reconciliationDetails.difference === 0 ? "text-green-600" : "text-red-600"}`}>Diferença</p>
                    <p className={`text-2xl font-bold ${reconciliationDetails.difference === 0 ? "text-green-900" : "text-red-900"}`}>{formatCurrency(reconciliationDetails.difference)}</p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {reconciliationDetails.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
                  <p className="text-gray-600">{reconciliationDetails.notes}</p>
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
                {formatCurrency(reconciliationDetails.difference)}
              </div>
              <div className="text-sm text-gray-600">Diferença</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {getStatusLabel(reconciliationDetails.status)}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {reconciliationDetails.account_name}
              </div>
              <div className="text-sm text-gray-600">Conta</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
