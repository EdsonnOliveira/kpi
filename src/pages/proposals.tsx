import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Input from "../components/Input";
import Select from "../components/Select";
import { translateStatus, getStatusColor } from "../lib/statusTranslations";
import { formatCurrency, parseCurrencyInput, applyCurrencyMask, removeCurrencyMask } from "../lib/formatting";

interface Proposal {
  id: string;
  customer_name: string;
  vehicle_id: string;
  vehicle_description: string;
  vehicle_price: number;
  down_payment: number;
  financing_amount: number;
  installments: number;
  installment_value: number;
  status: string;
  proposal_date: string;
  user_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function Proposals() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("propostas");
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Referência para o card de edição
  const editFormRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    customer_name: "",
    vehicle_id: "",
    vehicle_description: "",
    vehicle_price: "",
    down_payment: "",
    financing_amount: "",
    installments: "",
    installment_value: "",
    status: "pending",
    proposal_date: "",
    notes: ""
  });

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

  // Função para buscar vehicles
  const fetchVehicles = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/vehicles?company_id=eq.${user.company_id}&status=eq.available&order=brand.asc`, {
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
      }
      
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    }
  };

  // Função para buscar proposals
  const fetchProposals = async () => {
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
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/proposals?company_id=eq.${user.company_id}&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProposals(data);
      } else {
        setError('Erro ao carregar propostas');
      }
      
    } catch (error) {
      console.error('Erro ao buscar propostas:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar proposal (criar ou editar)
  const saveProposal = async () => {
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
        user_id: user.id,
        vehicle_price: formData.vehicle_price ? parseFloat(formData.vehicle_price.toString()) : null,
        down_payment: formData.down_payment ? parseFloat(formData.down_payment.toString()) : null,
        financing_amount: formData.financing_amount ? parseFloat(formData.financing_amount.toString()) : null,
        installments: formData.installments ? parseInt(formData.installments.toString()) : null,
        installment_value: formData.installment_value ? parseFloat(formData.installment_value.toString()) : null,
        proposal_date: formData.proposal_date || new Date().toISOString().split('T')[0]
      };
      
      let response;
      
      if (isEditing && selectedProposal) {
        // Editar proposal existente
        response = await fetch(`${SUPABASE_URL}/rest/v1/proposals?id=eq.${selectedProposal}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSave)
        });
      } else {
        // Criar nova proposal
        response = await fetch(`${SUPABASE_URL}/rest/v1/proposals`, {
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
        throw new Error('Erro ao salvar proposta');
      }
      
      setSuccessMessage(isEditing ? 'Proposta atualizada com sucesso!' : 'Proposta criada com sucesso!');
      setIsCreatingNew(false);
      setIsEditing(false);
      setSelectedProposal(null);
      resetForm();
      fetchProposals();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    }
  };

  // Função para editar proposal
  const editProposal = (proposal: Proposal) => {
    setFormData({
      customer_name: proposal.customer_name,
      vehicle_id: proposal.vehicle_id,
      vehicle_description: proposal.vehicle_description,
      vehicle_price: proposal.vehicle_price.toString(),
      down_payment: proposal.down_payment.toString(),
      financing_amount: proposal.financing_amount.toString(),
      installments: proposal.installments.toString(),
      installment_value: proposal.installment_value.toString(),
      status: proposal.status,
      proposal_date: proposal.proposal_date,
      notes: proposal.notes || ""
    });
    setSelectedProposal(proposal.id);
    setIsEditing(true);
    setIsCreatingNew(true);
  };

  // Função para deletar proposal
  const deleteProposal = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta proposta?')) {
      return;
    }
    
    try {
      setError("");
      
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!accessToken) {
        router.push('/');
        return;
      }
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/proposals?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir proposta');
      }
      
      setSuccessMessage('Proposta excluída com sucesso!');
      fetchProposals();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir dados');
    }
  };

  // Função para resetar formulário
  const resetForm = () => {
    setFormData({
      customer_name: "",
      vehicle_id: "",
      vehicle_description: "",
      vehicle_price: "",
      down_payment: "",
      financing_amount: "",
      installments: "",
      installment_value: "",
      status: "pending",
      proposal_date: "",
      notes: ""
    });
  };

  // Função para cancelar edição/criação
  const cancelForm = () => {
    setIsCreatingNew(false);
    setIsEditing(false);
    setSelectedProposal(null);
    resetForm();
    setError("");
    setSuccessMessage("");
  };

  // Função para calcular valores automaticamente
  const calculateValues = () => {
    const vehiclePrice = parseFloat(formData.vehicle_price) || 0;
    const downPayment = parseFloat(formData.down_payment) || 0;
    const installments = parseInt(formData.installments) || 0;
    
    const financingAmount = vehiclePrice - downPayment;
    const installmentValue = installments > 0 ? financingAmount / installments : 0;
    
    setFormData(prev => ({
      ...prev,
      financing_amount: financingAmount.toString(),
      installment_value: installmentValue.toFixed(2)
    }));
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchProposals();
    fetchVehicles();
  }, []);

  // Mock data para propostas
  const proposalsData: Proposal[] = [
    {
      id: "1",
      customer_name: "João Silva",
      vehicle_id: "1",
      vehicle_description: "Toyota Corolla 2023",
      vehicle_price: 95000.00,
      down_payment: 20000.00,
      financing_amount: 75000.00,
      installments: 60,
      installment_value: 1250.00,
      status: "Aprovada",
      proposal_date: "2024-09-15",
      user_id: "1",
      created_at: "2024-09-15T00:00:00Z",
      updated_at: "2024-09-15T00:00:00Z"
    },
    {
      id: "2",
      customer_name: "Ana Costa",
      vehicle_id: "2",
      vehicle_description: "Honda Civic 2024",
      vehicle_price: 120000.00,
      down_payment: 30000.00,
      financing_amount: 90000.00,
      installments: 72,
      installment_value: 1500.00,
      status: "Pendente",
      proposal_date: "2024-09-20",
      user_id: "2",
      created_at: "2024-09-20T00:00:00Z",
      updated_at: "2024-09-20T00:00:00Z"
    },
    {
      id: "3",
      customer_name: "Carlos Mendes",
      vehicle_id: "3",
      vehicle_description: "Volkswagen Golf 2023",
      vehicle_price: 85000.00,
      down_payment: 15000.00,
      financing_amount: 70000.00,
      installments: 48,
      installment_value: 1458.33,
      status: "Rejeitada",
      proposal_date: "2024-09-25",
      user_id: "1",
      created_at: "2024-09-25T00:00:00Z",
      updated_at: "2024-09-25T00:00:00Z"
    }
  ];

  // Simular carregamento de dados baseado no ID da URL
  useEffect(() => {
    if (router.query.id) {
      const proposal = proposals.find(p => p.id === router.query.id);
      if (proposal) {
        setFormData({
          customer_name: proposal.customer_name,
          vehicle_id: proposal.vehicle_id,
          vehicle_description: proposal.vehicle_description,
          vehicle_price: proposal.vehicle_price.toString(),
          down_payment: proposal.down_payment.toString(),
          financing_amount: proposal.financing_amount.toString(),
          installments: proposal.installments.toString(),
          installment_value: proposal.installment_value.toString(),
          status: proposal.status,
          proposal_date: proposal.proposal_date,
          notes: proposal.notes || ""
        });
        setIsCreatingNew(true);
      }
    }
  }, [router.query.id]);

  const handleProposalClick = (proposalId: string) => {
    setSelectedProposal(selectedProposal === proposalId ? null : proposalId);
  };

  const handleProposalDoubleClick = (proposalId: string) => {
    router.push(`/proposal-details?id=${proposalId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria a lógica para salvar a proposta
    console.log("Dados da proposta:", formData);
    setIsCreatingNew(false);
    setFormData({
      customer_name: "",
      vehicle_id: "",
      vehicle_description: "",
      vehicle_price: "",
      down_payment: "",
      financing_amount: "",
      installments: "",
      installment_value: "",
      status: "",
      proposal_date: "",
      notes: ""
    });
  };

  const calculateFinancing = () => {
    const valorVeiculo = parseFloat(formData.vehicle_price.replace(/[^\d,]/g, '').replace(',', '.'));
    const entrada = parseFloat(formData.down_payment.replace(/[^\d,]/g, '').replace(',', '.'));
    const parcelas = parseInt(formData.installments) || 0;
    
    if (valorVeiculo && entrada && parcelas) {
      const financiamento = valorVeiculo - entrada;
      const valorParcela = financiamento / parcelas;
      
      setFormData(prev => ({
        ...prev,
        financing_amount: formatCurrency(financiamento, { showSymbol: false }),
        installment_value: formatCurrency(valorParcela, { showSymbol: false })
      }));
    }
  };

  const renderProposalsTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Veículo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entrada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parcelas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Parcela
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {proposals.map((proposal) => (
              <tr
                key={proposal.id}
                onClick={() => handleProposalClick(proposal.id)}
                onDoubleClick={() => handleProposalDoubleClick(proposal.id)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedProposal === proposal.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {proposal.customer_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {proposal.vehicle_description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(proposal.vehicle_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(proposal.down_payment)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {proposal.installments}x
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(proposal.installment_value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(proposal.status, 'proposals')}`}>
                    {translateStatus(proposal.status, 'proposals')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {proposal.proposal_date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderNewProposalForm = () => {
    return (
      <div ref={editFormRef} className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Nova Proposta
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente e Veículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Cliente"
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              placeholder="Nome do cliente"
              required
            />
            <Input
              label="Veículo"
              type="text"
              name="vehicle_description"
              value={formData.vehicle_description}
              onChange={(e) => setFormData({...formData, vehicle_description: e.target.value})}
              placeholder="Modelo do veículo"
              required
            />
          </div>

          {/* Valores Financeiros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Valor do Veículo"
              type="text"
              name="vehicle_price"
              value={formData.vehicle_price}
              onChange={(e) => {
                const maskedValue = applyCurrencyMask(e.target.value);
                setFormData({...formData, vehicle_price: maskedValue});
              }}
              onBlur={(e) => {
                const numericValue = removeCurrencyMask(e.target.value);
                setFormData({...formData, vehicle_price: numericValue});
              }}
              placeholder="0,00"
              required
            />
            <Input
              label="Entrada"
              type="text"
              name="down_payment"
              value={formData.down_payment}
              onChange={(e) => {
                const maskedValue = applyCurrencyMask(e.target.value);
                setFormData({...formData, down_payment: maskedValue});
              }}
              onBlur={(e) => {
                const numericValue = removeCurrencyMask(e.target.value);
                setFormData({...formData, down_payment: numericValue});
              }}
              placeholder="0,00"
              required
            />
            <Input
              label="Número de Parcelas"
              type="number"
              name="installments"
              value={formData.installments}
              onChange={(e) => setFormData({...formData, installments: e.target.value})}
              placeholder="60"
              required
            />
          </div>

          {/* Cálculo Automático */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={calculateFinancing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Calcular Financiamento
            </button>
          </div>

          {/* Resultados do Cálculo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Valor Financiado"
              type="text"
              name="financing_amount"
              value={formData.financing_amount}
              readOnly
              className="bg-gray-100"
              placeholder="0,00"
            />
            <Input
              label="Valor da Parcela"
              type="text"
              name="installment_value"
              value={formData.installment_value}
              readOnly
              className="bg-gray-100"
              placeholder="0,00"
            />
          </div>

          {/* Tipo de Financiamento */}
          <div>
            <Select
              label="Tipo de Financiamento"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="financiamento">Financiamento Direto</option>
              <option value="consorcio">Consórcio</option>
              <option value="leasing">Leasing</option>
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
              placeholder="Observações sobre a proposta..."
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
              type="button"
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Imprimir Proposta
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
            >
              Salvar Proposta
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Propostas
              </h2>
              <p className="text-gray-600">
                Simulações de financiamento e orçamentos
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
                Nova Proposta
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

        {/* Conteúdo */}
        {isCreatingNew ? (
          renderNewProposalForm()
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {renderProposalsTable()}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
