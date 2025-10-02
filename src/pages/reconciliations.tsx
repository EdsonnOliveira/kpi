import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency, applyCurrencyMask, removeCurrencyMask } from "../lib/formatting";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";

interface Reconciliation {
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


export default function Reconciliations() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, authenticatedFetch } = useAuth();
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReconciliation, setSelectedReconciliation] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formData, setFormData] = useState({
    account_id: "",
    reconciliation_date: "",
    statement_balance: "",
    book_balance: "",
    notes: ""
  });

  // Função para buscar conciliações
  const fetchReconciliations = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (!user) {
        return;
      }
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/reconciliations?company_id=eq.${user.company_id}&select=*,accounts(name)`);
      
      if (response.ok) {
        const data = await response.json();
        const reconciliationsWithAccountName = data.map((reconciliation: any) => ({
          ...reconciliation,
          account_name: reconciliation.accounts?.name || 'Conta não encontrada'
        }));
        setReconciliations(reconciliationsWithAccountName);
      } else {
        setError('Erro ao carregar conciliações');
      }
      
    } catch (error) {
      console.error('Erro ao buscar conciliações:', error);
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
    if (isAuthenticated && user) {
      fetchReconciliations();
      fetchAccounts();
    }
  }, [isAuthenticated, user]);


  const handleReconciliationClick = (reconciliationId: string) => {
    setSelectedReconciliation(selectedReconciliation === reconciliationId ? null : reconciliationId);
  };

  const handleReconciliationDoubleClick = (reconciliationId: string) => {
    router.push(`/reconciliation-details?id=${reconciliationId}`);
  };

  // Função para baixar extrato
  const handleDownloadStatement = async () => {
    try {
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      // Buscar transações da empresa para gerar o extrato
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/transactions?company_id=eq.${user.company_id}&select=*,accounts(name)&order=transaction_date.desc`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar transações');
      }

      const transactions = await response.json();
      
      // Gerar CSV do extrato
      const csvContent = generateStatementCSV(transactions);
      
      // Criar e baixar arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `extrato_bancario_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Erro ao baixar extrato:', error);
      setError('Erro ao baixar extrato. Tente novamente.');
    }
  };

  // Função para gerar CSV do extrato
  const generateStatementCSV = (transactions: any[]) => {
    const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Conta', 'Observações'];
    const csvRows = [headers.join(',')];
    
    transactions.forEach(transaction => {
      const row = [
        new Date(transaction.transaction_date).toLocaleDateString('pt-BR'),
        `"${transaction.description}"`,
        transaction.type,
        transaction.category || '',
        formatCurrency(transaction.amount),
        `"${transaction.accounts?.name || 'Conta não encontrada'}"`,
        `"${transaction.notes || ''}"`
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) {
        return;
      }
      
      const dataToSave = {
        company_id: user.company_id,
        account_id: formData.account_id,
        reconciliation_date: formData.reconciliation_date,
        statement_balance: parseFloat(formData.statement_balance) || 0,
        book_balance: parseFloat(formData.book_balance) || 0,
        difference: (parseFloat(formData.statement_balance) || 0) - (parseFloat(formData.book_balance) || 0),
        status: 'pending',
        notes: formData.notes
      };
      
      const response = await authenticatedFetch('https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/reconciliations', {
        method: 'POST',
        body: JSON.stringify(dataToSave)
      });
      
      if (response.ok) {
        setIsCreatingNew(false);
        setFormData({
          account_id: "",
          reconciliation_date: "",
          statement_balance: "",
          book_balance: "",
          notes: ""
        });
        fetchReconciliations();
      } else {
        setError('Erro ao criar conciliação');
      }
      
    } catch (error) {
      console.error('Erro ao salvar conciliação:', error);
      setError('Erro ao salvar conciliação');
    }
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

  const renderReconciliationsTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Período
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo Sistema
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo Extrato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Diferença
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Conciliação
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reconciliations.map((reconciliation) => (
              <tr
                key={reconciliation.id}
                onClick={() => handleReconciliationClick(reconciliation.id)}
                onDoubleClick={() => handleReconciliationDoubleClick(reconciliation.id)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedReconciliation === reconciliation.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {reconciliation.account_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(reconciliation.reconciliation_date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(reconciliation.book_balance)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(reconciliation.statement_balance)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  reconciliation.difference === 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {formatCurrency(reconciliation.difference)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reconciliation.status)}`}>
                    {getStatusLabel(reconciliation.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(reconciliation.created_at).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderNewReconciliationForm = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Nova Conciliação
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Conta"
              name="account_id"
              value={formData.account_id}
              onChange={(e) => setFormData({...formData, account_id: e.target.value})}
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
              value={formData.reconciliation_date}
              onChange={(e) => setFormData({...formData, reconciliation_date: e.target.value})}
              required
            />
            <Input
              label="Saldo do Extrato"
              type="text"
              name="statement_balance"
              value={formData.statement_balance}
              onChange={(e) => {
                const maskedValue = applyCurrencyMask(e.target.value);
                setFormData({...formData, statement_balance: maskedValue});
              }}
              onBlur={(e) => {
                const numericValue = removeCurrencyMask(e.target.value);
                setFormData({...formData, statement_balance: numericValue});
              }}
              placeholder="0,00"
              required
            />
            <Input
              label="Saldo Contábil"
              type="text"
              name="book_balance"
              value={formData.book_balance}
              onChange={(e) => {
                const maskedValue = applyCurrencyMask(e.target.value);
                setFormData({...formData, book_balance: maskedValue});
              }}
              onBlur={(e) => {
                const numericValue = removeCurrencyMask(e.target.value);
                setFormData({...formData, book_balance: numericValue});
              }}
              placeholder="0,00"
              required
            />
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
              placeholder="Observações sobre a conciliação..."
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsCreatingNew(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              Iniciar Conciliação
            </Button>
          </div>
        </form>
      </div>
    );
  };


  const calculateTotals = () => {
    const totalReconciliations = reconciliations.length;
    const conciliadas = reconciliations.filter(r => r.status === "completed").length;
    const pendentes = reconciliations.filter(r => r.status === "pending").length;
    const comDiferenca = reconciliations.filter(r => r.difference !== 0).length;

    return { totalReconciliations, conciliadas, pendentes, comDiferenca };
  };

  const totals = calculateTotals();

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
              <p className="text-gray-600">Carregando conciliações...</p>
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
              onClick={() => fetchReconciliations()}
            >
              Tentar Novamente
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Conciliações Financeiras
              </h2>
              <p className="text-gray-600">
                Conciliação de extratos bancários com o sistema
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleDownloadStatement}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                Baixar Extrato
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsCreatingNew(true)}
              >
                Nova Conciliação
              </Button>
            </div>
          </div>
        </div>

        {/* Resumo */}
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
                <p className="text-sm font-medium text-gray-500">Total de Conciliações</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.totalReconciliations}</p>
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
                <p className="text-sm font-medium text-gray-500">Conciliadas</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.conciliadas}</p>
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
                <p className="text-sm font-medium text-gray-500">Com Diferença</p>
                <p className="text-2xl font-semibold text-gray-900">{totals.comDiferenca}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        {isCreatingNew ? (
          renderNewReconciliationForm()
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {renderReconciliationsTable()}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
