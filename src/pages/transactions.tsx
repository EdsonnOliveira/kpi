import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { formatCurrency, applyCurrencyMask, removeCurrencyMask } from "../lib/formatting";
import Input from "../components/Input";
import Select from "../components/Select";
import Chart, { ChartData } from "../components/Chart";

interface Transaction {
  id: string;
  transaction_date: string;
  description: string;
  type: string;
  category: string;
  amount: number;
  account_id: string;
  account_name: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function Transactions() {
  const router = useRouter();
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Referência para o card de edição
  const editFormRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    transaction_date: "",
    description: "",
    type: "",
    category: "",
    amount: "",
    account_id: "",
    notes: ""
  });

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

  // Função para buscar accounts
  const fetchAccounts = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/accounts?company_id=eq.${user.company_id}&order=name.asc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
      
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
    }
  };

  // Função para buscar transactions
  const fetchTransactions = async () => {
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
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions?company_id=eq.${user.company_id}&order=transaction_date.desc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        setError('Erro ao carregar transações');
      }
      
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar transaction (criar ou editar)
  const saveTransaction = async () => {
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
        amount: formData.amount ? parseFloat(formData.amount.toString()) : null,
         transaction_date: formData.transaction_date || new Date().toISOString().split('T')[0]
      };
      
      let response;
      
      if (isEditing && selectedTransaction) {
        // Editar transaction existente
        response = await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${selectedTransaction}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSave)
        });
      } else {
        // Criar nova transaction
        response = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
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
        throw new Error('Erro ao salvar transação');
      }
      
      setSuccessMessage(isEditing ? 'Transação atualizada com sucesso!' : 'Transação criada com sucesso!');
      setIsCreatingNew(false);
      setIsEditing(false);
      setSelectedTransaction(null);
      resetForm();
      fetchTransactions();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    }
  };

  // Função para editar transaction
  const editTransaction = (transaction: Transaction) => {
    setFormData({
      transaction_date: transaction.transaction_date,
      description: transaction.description,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      account_id: transaction.account_id,
      notes: transaction.notes
    });
    setSelectedTransaction(transaction.id);
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

  // Função para deletar transaction
  const deleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }
    
    try {
      setError("");
      
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!accessToken) {
        router.push('/');
        return;
      }
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir transação');
      }
      
      setSuccessMessage('Transação excluída com sucesso!');
      fetchTransactions();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir dados');
    }
  };

  // Função para resetar formulário
  const resetForm = () => {
    setFormData({
      transaction_date: "",
      description: "",
      type: "",
      category: "",
      amount: "",
      account_id: "",
      notes: ""
    });
  };

  // Função para cancelar edição/criação
  const cancelForm = () => {
    setIsCreatingNew(false);
    setIsEditing(false);
    setSelectedTransaction(null);
    resetForm();
    setError("");
    setSuccessMessage("");
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, []);

  // Mock data para movimentações financeiras
  const transactionsData: Transaction[] = [
    {
      id: "1",
      transaction_date: "25/09/2025",
      description: "Venda de veículo - João Silva",
      type: "Receita",
      category: "Vendas",
      amount: 95000.00,
      account_id: "1",
      account_name: "Conta Corrente",
      notes: "Primeira parcela do financiamento",
      created_at: "2025-09-25T10:00:00Z",
      updated_at: "2025-09-25T10:00:00Z"
    },
    {
      id: "2",
      transaction_date: "24/09/2025",
      description: "Pagamento de aluguel",
      type: "Despesa",
      category: "Operacional",
      amount: -15000.00,
      account_id: "1",
      account_name: "Conta Corrente",
      notes: "Aluguel mensal da concessionária",
      created_at: "2025-09-24T10:00:00Z",
      updated_at: "2025-09-24T10:00:00Z"
    },
    {
      id: "3",
      transaction_date: "23/09/2025",
      description: "Serviço de oficina - Ana Costa",
      type: "Receita",
      category: "Serviços",
      amount: 1200.00,
      account_id: "1",
      account_name: "Conta Corrente",
      notes: "Revisão completa",
      created_at: "2025-09-23T10:00:00Z",
      updated_at: "2025-09-23T10:00:00Z"
    },
    {
      id: "4",
      transaction_date: "22/09/2025",
      description: "Compra de peças",
      type: "Despesa",
      category: "Estoque",
      amount: -8000.00,
      account_id: "1",
      account_name: "Conta Corrente",
      notes: "Peças diversas para oficina",
      created_at: "2025-09-22T10:00:00Z",
      updated_at: "2025-09-22T10:00:00Z"
    },
    {
      id: "5",
      transaction_date: "21/09/2025",
      description: "Transferência para poupança",
      type: "Transferência",
      category: "Investimento",
      amount: -10000.00,
      account_id: "1",
      account_name: "Conta Corrente",
      notes: "Aplicação mensal",
      created_at: "2025-09-21T10:00:00Z",
      updated_at: "2025-09-21T10:00:00Z"
    },
    {
      id: "6",
      transaction_date: "20/09/2025",
      description: "Venda de veículo - Carlos Mendes",
      type: "Receita",
      category: "Vendas",
      amount: 85000.00,
      account_id: "1",
      account_name: "Conta Corrente",
      notes: "Pagamento à vista",
      created_at: "2025-09-20T10:00:00Z",
      updated_at: "2025-09-20T10:00:00Z"
    }
  ];

  const handleTransactionClick = (transactionId: string) => {
    setSelectedTransaction(selectedTransaction === transactionId ? null : transactionId);
  };

  const handleTransactionDoubleClick = (transactionId: string) => {
    router.push(`/transaction-details?id=${transactionId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria a lógica para salvar a movimentação
    console.log("Dados da movimentação:", formData);
    setIsCreatingNew(false);
    setFormData({
      transaction_date: "",
      description: "",
      type: "",
      category: "",
      amount: "",
      account_id: "",
      notes: ""
    });
  };

  const getTipoColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "receita":
      case "income":
        return "bg-green-100 text-green-800";
      case "despesa":
      case "expense":
        return "bg-red-100 text-red-800";
      case "transferência":
      case "transferencia":
      case "transfer":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTypeLabel = (type: string) => {
    if (!type) return type;
    
    // Mapear valores em inglês para português
    const typeMap: { [key: string]: string } = {
      'income': 'Receita',
      'expense': 'Despesa',
      'transfer': 'Transferência',
      'receita': 'Receita',
      'despesa': 'Despesa',
      'transferencia': 'Transferência',
      'transferência': 'Transferência'
    };
    
    const mappedType = typeMap[type.toLowerCase()];
    if (mappedType) {
      return mappedType;
    }
    
    // Se não estiver no mapa, capitalizar a primeira letra
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const renderTransactionsTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conta
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction.id)}
                onDoubleClick={() => handleTransactionDoubleClick(transaction.id)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedTransaction === transaction.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.transaction_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(transaction.type)}`}>
                    {formatTypeLabel(transaction.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.account_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderNewTransactionForm = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Nova Movimentação
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Data"
              type="date"
              name="data"
               value={formData.transaction_date}
              onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
              required
            />
            <Input
              label="Descrição"
              type="text"
              name="descricao"
               value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição da movimentação"
              required
            />
            <Select
              label="Tipo"
              name="tipo"
               value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
              <option value="transferencia">Transferência</option>
            </Select>
            <Select
              label="Categoria"
              name="categoria"
               value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="">Selecione a categoria</option>
              <option value="vendas">Vendas</option>
              <option value="servicos">Serviços</option>
              <option value="operacional">Operacional</option>
              <option value="estoque">Estoque</option>
              <option value="marketing">Marketing</option>
              <option value="administrativo">Administrativo</option>
              <option value="impostos">Impostos</option>
              <option value="investimento">Investimento</option>
              <option value="financiamento">Financiamento</option>
            </Select>
            <Input
              label="Valor"
              type="text"
              name="valor"
               value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="R$ 0,00"
              required
            />
            <Select
              label="Conta"
              name="conta"
               value={formData.account_id}
              onChange={(e) => setFormData({...formData, account_id: e.target.value})}
              required
            >
              <option value="">Selecione a conta</option>
              <option value="conta-corrente">Conta Corrente</option>
              <option value="poupanca">Poupança</option>
              <option value="investimento">Investimento</option>
              <option value="caixa">Caixa</option>
            </Select>
          </div>
          
          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="observacoes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Observações sobre a movimentação..."
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
              Salvar Movimentação
            </button>
          </div>
        </form>
      </div>
    );
  };

  const calculateTotals = () => {
    const receitas = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const despesas = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const saldoAtual = receitas - despesas;

    return { receitas, despesas, saldoAtual };
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
                Movimentações Financeiras
              </h2>
              <p className="text-gray-600">
                Controle de todas as movimentações financeiras
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
                Nova Movimentação
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
                {isEditing ? 'Editar Transação' : 'Nova Transação'}
              </h3>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Atualize as informações da transação' : 'Preencha as informações da nova transação'}
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveTransaction(); }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Data"
                  name="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                  required
                />
                <Input
                  label="Descrição"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descrição da transação"
                  required
                />
                <Select
                  label="Tipo"
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                  <option value="transfer">Transferência</option>
                </Select>
                <Input
                  label="Categoria"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Ex: Vendas, Aluguel, etc."
                  required
                />
                <Input
                  label="Valor"
                  name="amount"
                  type="text"
                  value={formData.amount}
                  onChange={(e) => {
                    const maskedValue = applyCurrencyMask(e.target.value);
                    setFormData({...formData, amount: maskedValue});
                  }}
                  onBlur={(e) => {
                    const numericValue = removeCurrencyMask(e.target.value);
                    setFormData({...formData, amount: numericValue});
                  }}
                  placeholder="0,00"
                  required
                />
                <Select
                  label="Conta"
                  name="account_id"
                  value={formData.account_id}
                  onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                  required
                >
                  <option value="">Selecione uma conta</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Observações adicionais..."
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
                  {isEditing ? 'Atualizar' : 'Criar'} Transação
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Receitas</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totals.receitas)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Despesas</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totals.despesas)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Saldo Atual</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totals.saldoAtual)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Evolução do Saldo */}
          <Chart
            type="line"
            title="Evolução do Saldo"
            data={[
              { label: "20/09", value: 150000, tooltip: "Dia 1: R$ 150.000" },
              { label: "21/09", value: 140000, tooltip: "Dia 2: R$ 140.000" },
              { label: "22/09", value: 130000, tooltip: "Dia 3: R$ 130.000" },
              { label: "23/09", value: 120000, tooltip: "Dia 4: R$ 120.000" },
              { label: "24/09", value: 110000, tooltip: "Dia 5: R$ 110.000" },
              { label: "25/09", value: 100000, tooltip: "Dia 6: R$ 100.000" },
              { label: "26/09", value: 90000, tooltip: "Dia 7: R$ 90.000" }
            ]}
          />

          {/* Gráfico de Receitas vs Despesas por Categoria */}
          <Chart
            type="bar"
            title="Receitas vs Despesas por Categoria"
            data={[
              { label: "Vendas", value: 180000, color: "#10b981", tooltip: "Vendas: R$ 180.000" },
              { label: "Serviços", value: 1200, color: "#10b981", tooltip: "Serviços: R$ 1.200" },
              { label: "Operacional", value: 15000, color: "#ef4444", tooltip: "Operacional: R$ 15.000" },
              { label: "Estoque", value: 8000, color: "#ef4444", tooltip: "Estoque: R$ 8.000" },
              { label: "Investimento", value: 10000, color: "#ef4444", tooltip: "Investimento: R$ 10.000" }
            ]}
          />
        </div>

        {/* Gráfico de Movimentações por Tipo */}
        <Chart
          type="pie"
          title="Distribuição por Tipo de Movimentação"
          data={[
            { label: "Receitas", value: 181200, color: "#10b981", tooltip: "Receitas: R$ 181.200" },
            { label: "Despesas", value: 33000, color: "#ef4444", tooltip: "Despesas: R$ 33.000" },
            { label: "Transferências", value: 10000, color: "#3b82f6", tooltip: "Transferências: R$ 10.000" }
          ]}
          className="mb-8"
        />

        {/* Conteúdo */}
        {isCreatingNew ? (
          renderNewTransactionForm()
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {renderTransactionsTable()}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
