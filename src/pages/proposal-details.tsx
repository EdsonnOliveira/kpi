import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { translateStatus, getStatusColor } from "../lib/statusTranslations";
import { formatCurrency } from "../lib/formatting";
import Button from "../components/Button";

// Função para formatar data no padrão brasileiro (dd/mm/yyyy)
const formatDateBR = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

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

export default function ProposalDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [proposalDetails, setProposalDetails] = useState<ProposalDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

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
          // Processar dados para incluir nome do vendedor
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

  useEffect(() => {
    fetchProposalDetails();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando detalhes da proposta...</p>
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
            <div className="mb-4">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar proposta</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
            >
              Voltar
            </button>
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
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 print-full-width">
      <div className="px-4 py-6 sm:px-0 print-no-margin">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4 no-print"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Detalhes da Proposta
              </h2>
              <p className="text-gray-600">
                Proposta #{proposalDetails.id}
              </p>
            </div>
            <div className="flex space-x-3 no-print">
              <Button 
                variant="outline"
                onClick={() => router.push(`/proposals/edit/${id}`)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              >
                Editar
              </Button>
              <Button 
                variant="primary"
                onClick={() => window.print()}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                }
              >
                Imprimir
              </Button>
            </div>
          </div>
        </div>

        {/* Resumo da Proposta */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
              <div className="space-y-2">
                <p><span className="font-bold text-gray-900">Cliente:</span> <span className="text-gray-900">{proposalDetails.customer_name || 'N/A'}</span></p>
                <p><span className="font-bold text-gray-900">Veículo:</span> <span className="text-gray-900">{proposalDetails.vehicle_description || proposalDetails.vehicle_id || 'N/A'}</span></p>
                <p><span className="font-bold text-gray-900">Vendedor:</span> <span className="text-gray-900">{proposalDetails.user_name || proposalDetails.user_id || 'N/A'}</span></p>
                <p><span className="font-bold text-gray-900">Data da Proposta:</span> <span className="text-gray-900">{proposalDetails.proposal_date ? formatDateBR(proposalDetails.proposal_date) : 'N/A'}</span></p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Valores</h3>
              <div className="space-y-2">
                <p><span className="font-bold text-gray-900">Valor do Veículo:</span> <span className="text-gray-900">{proposalDetails.vehicle_price ? formatCurrency(proposalDetails.vehicle_price) : 'N/A'}</span></p>
                <p><span className="font-bold text-gray-900">Entrada:</span> <span className="text-gray-900">{proposalDetails.down_payment ? formatCurrency(proposalDetails.down_payment) : 'N/A'}</span></p>
                <p><span className="font-bold text-gray-900">Valor Financiado:</span> <span className="text-gray-900">{proposalDetails.financing_amount ? formatCurrency(proposalDetails.financing_amount) : 'N/A'}</span></p>
                <p><span className="font-bold text-gray-900">Número de Parcelas:</span> <span className="text-gray-900">{proposalDetails.installments || 'N/A'}</span></p>
                <p><span className="font-bold text-gray-900">Valor da Parcela:</span> <span className="text-gray-900">{proposalDetails.installment_value ? formatCurrency(proposalDetails.installment_value) : 'N/A'}</span></p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="space-y-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(proposalDetails.status || '', 'proposals')}`}>
                  {translateStatus(proposalDetails.status || '', 'proposals')}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
              <p className="text-sm text-gray-600">{proposalDetails.notes || 'Nenhuma observação registrada'}</p>
            </div>
          </div>
        </div>

        {/* Informações da Proposta */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações da Proposta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID da Proposta</label>
              <p className="text-gray-900 font-mono">{proposalDetails.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID da Empresa</label>
              <p className="text-gray-900 font-mono">{proposalDetails.company_id || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
              <p className="text-gray-900 font-mono">{proposalDetails.customer_name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID do Veículo</label>
              <p className="text-gray-900 font-mono">{proposalDetails.vehicle_id || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID do Vendedor</label>
              <p className="text-gray-900 font-mono">{proposalDetails.user_id || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Criação</label>
              <p className="text-gray-900">{proposalDetails.created_at ? formatDateBR(proposalDetails.created_at) : 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Última Atualização</label>
              <p className="text-gray-900">{proposalDetails.updated_at ? formatDateBR(proposalDetails.updated_at) : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
