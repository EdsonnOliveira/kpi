import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Select from "../../../components/Select";
import Textarea from "../../../components/Textarea";
import { formatCurrency, applyCurrencyMask, removeCurrencyMask } from "../../../lib/formatting";

interface ProposalDetails {
  id: string;
  company_id?: string;
  customer_name?: string;
  vehicle_id?: string;
  vehicle_description?: string;
  vehicle_price?: number;
  down_payment?: number;
  financing_amount?: number;
  installments?: number;
  installment_value?: number;
  status?: string;
  proposal_date?: string;
  user_id?: string;
  user_name?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export default function EditProposal() {
  const router = useRouter();
  const { id } = router.query;
  const [proposalDetails, setProposalDetails] = useState<ProposalDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

  // Função para buscar usuários
  const fetchUsers = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?company_id=eq.${user.company_id}&select=id,name`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
      
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  // Função para buscar dados da proposta
  const fetchProposalDetails = async () => {
    if (!id) return;
    
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
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/proposals?id=eq.${id}&company_id=eq.${user.company_id}&select=*,users(name)`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const proposal = data[0];
          const processedProposal: ProposalDetails = {
            ...proposal,
            user_name: proposal.users?.name || 'N/A'
          };
          setProposalDetails(processedProposal);
        } else {
          setError('Proposta não encontrada');
        }
      } else {
        setError('Erro ao carregar dados da proposta');
      }
      
    } catch (error) {
      console.error('Erro ao buscar detalhes da proposta:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar alterações
  const handleSave = async () => {
    if (!proposalDetails) return;
    
    try {
      setIsSaving(true);
      setError("");
      setSuccessMessage("");
      
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      // Filtrar apenas campos que não são nulos/undefined
      const dataToSave = {
        ...(proposalDetails.customer_name && { customer_name: proposalDetails.customer_name }),
        ...(proposalDetails.vehicle_id && { vehicle_id: proposalDetails.vehicle_id }),
        ...(proposalDetails.vehicle_description && { vehicle_description: proposalDetails.vehicle_description }),
        ...(proposalDetails.vehicle_price !== undefined && { vehicle_price: proposalDetails.vehicle_price }),
        ...(proposalDetails.down_payment !== undefined && { down_payment: proposalDetails.down_payment }),
        ...(proposalDetails.financing_amount !== undefined && { financing_amount: proposalDetails.financing_amount }),
        ...(proposalDetails.installments !== undefined && { installments: proposalDetails.installments }),
        ...(proposalDetails.installment_value !== undefined && { installment_value: proposalDetails.installment_value }),
        ...(proposalDetails.status && { status: proposalDetails.status }),
        ...(proposalDetails.user_id && { user_id: proposalDetails.user_id }),
        ...(proposalDetails.proposal_date && { proposal_date: proposalDetails.proposal_date }),
        ...(proposalDetails.notes && { notes: proposalDetails.notes })
      };

      console.log('Dados a serem salvos:', dataToSave);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/proposals?id=eq.${id}&company_id=eq.${user.company_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(dataToSave)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', response.status, errorText);
        throw new Error(`Erro ao atualizar proposta: ${response.status} - ${errorText}`);
      }

      setSuccessMessage('Proposta atualizada com sucesso!');
      setTimeout(() => {
        setSuccessMessage("");
        router.push(`/proposal-details?id=${id}`);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    } finally {
      setIsSaving(false);
    }
  };

  // Função para atualizar campo
  const updateField = (field: keyof ProposalDetails, value: any) => {
    if (!proposalDetails) return;
    setProposalDetails(prev => prev ? { ...prev, [field]: value } : null);
  };

  // Função para calcular valores automaticamente
  const calculateValues = () => {
    if (!proposalDetails) return;
    
    const vehiclePrice = proposalDetails.vehicle_price || 0;
    const downPayment = proposalDetails.down_payment || 0;
    const installments = proposalDetails.installments || 0;
    
    const financingAmount = vehiclePrice - downPayment;
    const installmentValue = installments > 0 ? financingAmount / installments : 0;
    
    updateField('financing_amount', financingAmount);
    updateField('installment_value', installmentValue);
  };


  useEffect(() => {
    fetchProposalDetails();
    fetchUsers();
  }, [id]);

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados da proposta...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !proposalDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar proposta</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.back()}>Voltar</Button>
          </div>
        </div>
      </main>
    );
  }

  if (!proposalDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Proposta não encontrada</h2>
            <Button onClick={() => router.back()}>Voltar</Button>
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
                onClick={() => router.back()}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              >
                Voltar
              </Button>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 mt-4">
                Editar Proposta
              </h2>
              <p className="text-gray-600">
                Proposta #{proposalDetails.id}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                leftIcon={
                  isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )
                }
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>

        {/* Mensagens de Erro e Sucesso */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800">{successMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Informações do Cliente (Somente Leitura) */}
        <div className="bg-gray-50 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h3>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-lg font-medium text-gray-900">{proposalDetails.customer_name || 'Nome não informado'}</p>
            <p className="text-sm text-gray-500 mt-1">Esta informação não pode ser editada</p>
          </div>
        </div>

        {/* Informações Editáveis */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações Editáveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Descrição do Veículo"
              value={proposalDetails.vehicle_description || ''}
              onChange={(e) => updateField('vehicle_description', e.target.value)}
            />
            <Input
              label="Valor do Veículo"
              value={proposalDetails.vehicle_price ? applyCurrencyMask(proposalDetails.vehicle_price.toString()) : 'R$ 0,00'}
              onChange={(e) => {
                const numericValue = removeCurrencyMask(e.target.value);
                updateField('vehicle_price', parseFloat(numericValue) || 0);
              }}
            />
            <Input
              label="Entrada"
              value={proposalDetails.down_payment ? applyCurrencyMask(proposalDetails.down_payment.toString()) : 'R$ 0,00'}
              onChange={(e) => {
                const numericValue = removeCurrencyMask(e.target.value);
                updateField('down_payment', parseFloat(numericValue) || 0);
              }}
            />
            <Input
              label="Número de Parcelas"
              type="number"
              value={proposalDetails.installments || ''}
              onChange={(e) => updateField('installments', parseInt(e.target.value) || 0)}
            />
            <Select
              label="Status"
              value={proposalDetails.status || ''}
              onChange={(e) => updateField('status', e.target.value)}
            >
              <option value="">Selecione o status</option>
              <option value="pending">Pendente</option>
              <option value="approved">Aprovada</option>
              <option value="rejected">Rejeitada</option>
              <option value="cancelled">Cancelada</option>
            </Select>
            <Select
              label="Vendedor"
              value={proposalDetails.user_id || ''}
              onChange={(e) => updateField('user_id', e.target.value)}
            >
              <option value="">Selecione o vendedor</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
            <Input
              label="Data da Proposta"
              type="date"
              value={proposalDetails.proposal_date || ''}
              onChange={(e) => updateField('proposal_date', e.target.value)}
            />
          </div>

          {/* Cálculo Automático */}
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={calculateValues}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
            >
              Calcular Financiamento
            </Button>
          </div>

          {/* Resultados do Cálculo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Input
              label="Valor Financiado"
              value={proposalDetails.financing_amount ? applyCurrencyMask(proposalDetails.financing_amount.toString()) : 'R$ 0,00'}
              readOnly
              className="bg-gray-100"
            />
            <Input
              label="Valor da Parcela"
              value={proposalDetails.installment_value ? applyCurrencyMask(proposalDetails.installment_value.toString()) : 'R$ 0,00'}
              readOnly
              className="bg-gray-100"
            />
          </div>

          {/* Observações */}
          <div className="mt-6">
            <Textarea
              label="Observações"
              value={proposalDetails.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
            />
          </div>
        </div>

      </div>
    </main>
  );
}
