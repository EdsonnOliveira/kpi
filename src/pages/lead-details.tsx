import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { formatDateBR } from "../lib/formatting";
import Button from "../components/Button";

interface LeadDetails {
  id: string;
  company_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  score?: number;
  prioridade?: string;
  vendedor?: string;
  ultimaAtividade?: string;
}

// Configuração do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export default function LeadDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [leadDetails, setLeadDetails] = useState<LeadDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar detalhes do lead
  const fetchLeadDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${id}&company_id=eq.${user.company_id}`, {
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
          setLeadDetails(data[0]);
        } else {
          setError('Lead não encontrado');
        }
      } else {
        setError('Erro ao carregar lead');
      }
      
    } catch (error) {
      console.error('Erro ao buscar lead:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLeadDetails();
    }
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "qualified":
        return "bg-green-100 text-green-800";
      case "lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const translateStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "Novo";
      case "contacted":
        return "Contatado";
      case "qualified":
        return "Qualificado";
      case "lost":
        return "Perdido";
      default:
        return status || "Desconhecido";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const translatePriority = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return priority || "Não definida";
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando detalhes do lead...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !leadDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lead não encontrado</h2>
            <p className="text-gray-600 mb-4">{error || 'O lead solicitado não foi encontrado.'}</p>
            <Button
              variant="primary"
              onClick={handleBack}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              >
                Voltar
              </Button>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 mt-4">
                Detalhes do Lead
              </h2>
              <p className="text-gray-600">
                Lead #{leadDetails.id} - {leadDetails.name || 'Nome não informado'}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/leads/edit/${id}`)}
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
                onClick={() => alert('Funcionalidade de conversão em cliente será implementada')}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Converter em Cliente
              </Button>
            </div>
          </div>
        </div>

        {/* Resumo do Lead */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
              <div className="space-y-2">
                <p><span className="font-medium text-gray-900">Nome:</span> <span className="text-gray-900">{leadDetails.name || 'N/A'}</span></p>
                <p><span className="font-medium text-gray-900">E-mail:</span> <span className="text-gray-900">{leadDetails.email || 'N/A'}</span></p>
                <p><span className="font-medium text-gray-900">Telefone:</span> <span className="text-gray-900">{leadDetails.phone || 'N/A'}</span></p>
                <p><span className="font-medium text-gray-900">Origem:</span> <span className="text-gray-900">{leadDetails.source || 'N/A'}</span></p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status e Prioridade</h3>
              <div className="space-y-2">
                <p><span className="font-medium text-gray-900">Status:</span> 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(leadDetails.status || '')}`}>
                    {translateStatus(leadDetails.status || '')}
                  </span>
                </p>
                <p><span className="font-medium text-gray-900">Prioridade:</span> 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(leadDetails.prioridade || '')}`}>
                    {translatePriority(leadDetails.prioridade || '')}
                  </span>
                </p>
                <p><span className="font-medium text-gray-900">Score:</span> <span className="text-gray-900">{leadDetails.score || 'N/A'}</span></p>
                <p><span className="font-medium text-gray-900">Vendedor:</span> <span className="text-gray-900">{leadDetails.vendedor || 'N/A'}</span></p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Datas</h3>
              <div className="space-y-2">
                <p><span className="font-medium text-gray-900">Criado em:</span> <span className="text-gray-900">{leadDetails.created_at ? formatDateBR(leadDetails.created_at) : 'N/A'}</span></p>
                <p><span className="font-medium text-gray-900">Atualizado em:</span> <span className="text-gray-900">{leadDetails.updated_at ? formatDateBR(leadDetails.updated_at) : 'N/A'}</span></p>
                <p><span className="font-medium text-gray-900">Última Atividade:</span> <span className="text-gray-900">{leadDetails.ultimaAtividade || 'N/A'}</span></p>
              </div>
            </div>
          </div>
          {leadDetails.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Observações</h3>
              <p className="text-sm text-gray-600">{leadDetails.notes}</p>
            </div>
          )}
        </div>

        {/* Informações Adicionais */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações Adicionais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID do Lead</label>
              <p className="text-gray-900 font-mono text-sm">{leadDetails.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID da Empresa</label>
              <p className="text-gray-900 font-mono text-sm">{leadDetails.company_id || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
