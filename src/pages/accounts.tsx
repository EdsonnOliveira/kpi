import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { formatCurrency, applyCurrencyMask, removeCurrencyMask } from "../lib/formatting";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import Select from "../components/Select";
import Chart, { ChartData } from "../components/Chart";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function Accounts() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, authenticatedFetch } = useAuth();
  const [activeTab, setActiveTab] = useState("pagar");
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Referência para o card de edição
  const editFormRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "despesa",
    balance: "",
    description: ""
  });

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';

  // Função para buscar accounts
  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (!user) {
        return;
      }
      
      const response = await authenticatedFetch(`${SUPABASE_URL}/rest/v1/accounts?company_id=eq.${user.company_id}&order=name.asc`);
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else {
        setError('Erro ao carregar contas');
      }
      
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar account (criar ou editar)
  const saveAccount = async () => {
    try {
      setError("");
      setSuccessMessage("");
      
      if (!user) {
        return;
      }
      
      const dataToSave = {
        ...formData,
        company_id: user.company_id,
        balance: formData.balance ? parseFloat(formData.balance.toString()) : 0
      };
      
      // Criar nova account
      const response = await authenticatedFetch(`${SUPABASE_URL}/rest/v1/accounts`, {
        method: 'POST',
        body: JSON.stringify(dataToSave)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar conta');
      }
      
      setSuccessMessage('Conta criada com sucesso!');
      setIsCreatingNew(false);
      resetForm();
      fetchAccounts();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    }
  };


  // Função para resetar formulário
  const resetForm = () => {
    setFormData({
      name: "",
      type: "despesa",
      balance: "",
      description: ""
    });
  };

  // Função para cancelar criação
  const cancelForm = () => {
    setIsCreatingNew(false);
    setSelectedAccount(null);
    resetForm();
    setError("");
    setSuccessMessage("");
  };

  // Função para lidar com clique na conta
  const handleAccountClick = (accountId: string) => {
    setSelectedAccount(accountId);
  };

  // Função para lidar com duplo clique na conta
  const handleAccountDoubleClick = (accountId: string) => {
    router.push(`/account-details?id=${accountId}`);
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

  // Função para calcular dados do gráfico comparativo
  const getChartData = (): ChartData[] => {
    const totalPagar = accounts
      .filter(account => account.type.toLowerCase() === 'despesa' || account.type.toLowerCase() === 'passivo')
      .reduce((sum, account) => sum + (account.balance || 0), 0);
    
    const totalReceber = accounts
      .filter(account => account.type.toLowerCase() === 'receita' || account.type.toLowerCase() === 'ativo')
      .reduce((sum, account) => sum + (account.balance || 0), 0);

    return [
      {
        label: "A Pagar",
        value: Math.abs(totalPagar),
        color: "#ef4444", // red-500
        tooltip: `Total a Pagar: ${formatCurrency(Math.abs(totalPagar))}`
      },
      {
        label: "A Receber", 
        value: Math.abs(totalReceber),
        color: "#10b981", // emerald-500
        tooltip: `Total a Receber: ${formatCurrency(Math.abs(totalReceber))}`
      }
    ];
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAccounts();
    }
  }, [isAuthenticated, user]);

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

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contas</h1>
              <p className="text-gray-600 mt-2">Gerencie as contas financeiras</p>
            </div>
            <div className="flex space-x-3">
              {selectedAccount && (
                <button
                  onClick={() => router.push(`/account-details?id=${selectedAccount}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ver Detalhes
                </button>
              )}
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
                Nova Conta
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

        {/* Formulário de Nova Conta */}
        {isCreatingNew && (
          <div ref={editFormRef} className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Nova Conta
              </h2>
              <p className="text-sm text-gray-600">
                Preencha as informações da nova conta
              </p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveAccount(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nome da Conta"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Select
                  label="Tipo"
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="despesa">Despesa</option>
                  <option value="ativo">Ativo</option>
                  <option value="receita">Receita</option>
                  <option value="passivo">Passivo</option>
                </Select>
                <Input
                  label="Saldo Inicial"
                  name="balance"
                  type="text"
                  value={formData.balance}
                  onChange={(e) => {
                    const maskedValue = applyCurrencyMask(e.target.value);
                    setFormData({...formData, balance: maskedValue});
                  }}
                  onBlur={(e) => {
                    const numericValue = removeCurrencyMask(e.target.value);
                    setFormData({...formData, balance: numericValue});
                  }}
                  placeholder="0,00"
                />
                <Input
                  label="Descrição"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  Criar Conta
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gráfico Comparativo */}
        {!isLoading && accounts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Comparativo: A Pagar vs A Receber</h2>
              <p className="text-sm text-gray-600">Visualização comparativa dos valores totais</p>
            </div>
            <div className="flex justify-center">
              <Chart
                type="comparison"
                title=""
                data={getChartData()}
                width={500}
                height={350}
                className="w-full max-w-2xl"
              />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(getChartData()[0].value)}
                </div>
                <div className="text-sm text-red-800">Total a Pagar</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(getChartData()[1].value)}
                </div>
                <div className="text-sm text-green-800">Total a Receber</div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Contas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Contas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr 
                    key={account.id} 
                    onClick={() => handleAccountClick(account.id)}
                    onDoubleClick={() => handleAccountDoubleClick(account.id)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedAccount === account.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {account.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(account.type)}`}>
                        {getTypeLabel(account.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(account.balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}