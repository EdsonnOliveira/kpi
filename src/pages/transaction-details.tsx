import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency, applyCurrencyMask, removeCurrencyMask } from "../lib/formatting";
import { AttachmentList, AttachmentData } from "../components/Attachment";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";

interface TransactionDetails {
  id: string;
  company_id: string;
  account_id: string;
  description: string;
  amount: number;
  type: string;
  category?: string;
  transaction_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  account_name?: string;
}

export default function TransactionDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, isLoading: authLoading, authenticatedFetch } = useAuth();
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    description: "",
    amount: "",
    type: "receita",
    category: "",
    transaction_date: "",
    notes: ""
  });

  // Função para buscar detalhes da transação
  const fetchTransactionDetails = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (!user || !id) {
        return;
      }
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/transactions?id=eq.${id}&company_id=eq.${user.company_id}&select=*,accounts(name)`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const transaction = data[0];
          setTransactionDetails({
            ...transaction,
            account_name: transaction.accounts?.name || 'Conta não encontrada'
          });
        } else {
          setError('Transação não encontrada');
        }
      } else {
        setError('Erro ao carregar detalhes da transação');
      }
      
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && isAuthenticated && user) {
      fetchTransactionDetails();
    }
  }, [id, isAuthenticated, user]);

  const handleBack = () => {
    router.back();
  };

  // Função para editar transação
  const handleEdit = () => {
    if (transactionDetails) {
      setEditFormData({
        description: transactionDetails.description,
        amount: transactionDetails.amount.toString(),
        type: transactionDetails.type,
        category: transactionDetails.category || "",
        transaction_date: transactionDetails.transaction_date,
        notes: transactionDetails.notes || ""
      });
    }
    setIsEditing(true);
  };

  // Função para salvar edição
  const handleSaveEdit = async () => {
    try {
      setError("");
      setSuccessMessage("");
      
      if (!user || !transactionDetails) {
        return;
      }
      
      const dataToSave = {
        ...editFormData,
        amount: editFormData.amount ? parseFloat(editFormData.amount.toString()) : 0
      };
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/transactions?id=eq.${transactionDetails.id}`, {
        method: 'PATCH',
        body: JSON.stringify(dataToSave)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar transação');
      }
      
      setSuccessMessage('Transação atualizada com sucesso!');
      setIsEditing(false);
      fetchTransactionDetails();
      
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

  const getTypeColor = (type: string) => {
    return type === "receita" ? "text-green-600" : "text-red-600";
  };

  const getTypeBgColor = (type: string) => {
    return type === "receita" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getTypeLabel = (type: string) => {
    return type === "receita" ? "Receita" : "Despesa";
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
              <p className="text-gray-600">Carregando detalhes da transação...</p>
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

  if (!transactionDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Transação não encontrada</h2>
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
                Detalhes da Transação
              </h2>
              <p className="text-gray-600">
                Transação #{transactionDetails.id.slice(-8)} - {transactionDetails.description}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Editar Transação</h3>
              <p className="text-sm text-gray-600">Atualize as informações da transação</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Descrição"
                  name="description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  required
                />
                <Input
                  label="Valor"
                  name="amount"
                  type="text"
                  value={editFormData.amount}
                  onChange={(e) => {
                    const maskedValue = applyCurrencyMask(e.target.value);
                    setEditFormData({...editFormData, amount: maskedValue});
                  }}
                  onBlur={(e) => {
                    const numericValue = removeCurrencyMask(e.target.value);
                    setEditFormData({...editFormData, amount: numericValue});
                  }}
                  placeholder="0,00"
                  required
                />
                <Select
                  label="Tipo"
                  name="type"
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                  required
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </Select>
                <Input
                  label="Categoria"
                  name="category"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                />
                <Input
                  label="Data da Transação"
                  name="transaction_date"
                  type="date"
                  value={editFormData.transaction_date}
                  onChange={(e) => setEditFormData({...editFormData, transaction_date: e.target.value})}
                  required
                />
                <div className="md:col-span-2">
                  <Input
                    label="Observações"
                    name="notes"
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
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

        {/* Resumo da Transação */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">Data:</span> <span className="text-gray-900">{new Date(transactionDetails.transaction_date).toLocaleDateString('pt-BR')}</span></p>
                  <p><span className="font-bold text-gray-900">Descrição:</span> <span className="text-gray-900">{transactionDetails.description}</span></p>
                  <p><span className="font-bold text-gray-900">Tipo:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBgColor(transactionDetails.type)}`}>
                      {getTypeLabel(transactionDetails.type)}
                    </span>
                  </p>
                  {transactionDetails.category && (
                    <p><span className="font-bold text-gray-900">Categoria:</span> <span className="text-gray-900">{transactionDetails.category}</span></p>
                  )}
                  <p><span className="font-bold text-gray-900">Valor:</span> <span className={`font-bold text-lg ${getTypeColor(transactionDetails.type)}`}>{formatCurrency(transactionDetails.amount)}</span></p>
                  <p><span className="font-bold text-gray-900">Conta:</span> <span className="text-gray-900">{transactionDetails.account_name}</span></p>
                </div>
              </div>

              {/* Datas e Observações */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Datas e Observações</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">Data de Criação:</span> <span className="text-gray-900">{new Date(transactionDetails.created_at).toLocaleDateString('pt-BR')}</span></p>
                  <p><span className="font-bold text-gray-900">Última Atualização:</span> <span className="text-gray-900">{new Date(transactionDetails.updated_at).toLocaleDateString('pt-BR')}</span></p>
                  <p><span className="font-bold text-gray-900">ID da Transação:</span> <span className="text-gray-900 font-mono text-sm">{transactionDetails.id}</span></p>
                  {transactionDetails.notes && (
                    <>
                      <p><span className="font-bold text-gray-900">Observações:</span></p>
                      <p className="text-gray-600 pl-4 border-l-2 border-gray-200">{transactionDetails.notes}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              {/* Informações Adicionais */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">ID da Empresa:</span> <span className="text-gray-900 font-mono text-sm">{transactionDetails.company_id}</span></p>
                  <p><span className="font-bold text-gray-900">ID da Conta:</span> <span className="text-gray-900 font-mono text-sm">{transactionDetails.account_id}</span></p>
                  <p><span className="font-bold text-gray-900">Tipo de Transação:</span> <span className="text-gray-900">{transactionDetails.type}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumo Financeiro</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(transactionDetails.amount)}
              </div>
              <div className="text-sm text-gray-600">Valor da Transação</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {getTypeLabel(transactionDetails.type)}
              </div>
              <div className="text-sm text-gray-600">Tipo</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {transactionDetails.account_name}
              </div>
              <div className="text-sm text-gray-600">Conta</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
