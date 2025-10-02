import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { formatPercent, formatCurrency, formatDateBR } from "../lib/formatting";
import Button from "../components/Button";

interface AdDetails {
  id: string;
  company_id?: string;
  vehicle_id?: string;
  platform?: string;
  title?: string;
  description?: string;
  price?: number;
  status?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Configuração do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export default function AdDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [adDetails, setAdDetails] = useState<AdDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Função para buscar detalhes do anúncio
  const fetchAdDetails = async () => {
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
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/ads?id=eq.${id}&company_id=eq.${user.company_id}`, {
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
          setAdDetails(data[0]);
        } else {
          setError('Anúncio não encontrado');
        }
      } else {
        setError('Erro ao carregar anúncio');
      }
      
    } catch (error) {
      console.error('Erro ao buscar anúncio:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAdDetails();
    }
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  // Função para editar anúncio
  const handleEdit = () => {
    router.push(`/ads/edit/${id}`);
  };

  // Função para excluir anúncio
  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/ads?id=eq.${id}&company_id=eq.${user.company_id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Anúncio excluído com sucesso!');
        router.push('/ads');
      } else {
        setError('Erro ao excluir anúncio');
      }
      
    } catch (error) {
      console.error('Erro ao excluir anúncio:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para alterar status (Pausar/Ativar)
  const handleToggleStatus = async () => {
    if (!adDetails) return;

    try {
      setIsUpdating(true);
      
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      const newStatus = adDetails.status === 'active' ? 'paused' : 'active';
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/ads?id=eq.${id}&company_id=eq.${user.company_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setAdDetails(prev => prev ? { ...prev, status: newStatus } : null);
        alert(`Anúncio ${newStatus === 'active' ? 'ativado' : 'pausado'} com sucesso!`);
      } else {
        setError('Erro ao alterar status do anúncio');
      }
      
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case "olx":
        return "bg-green-100 text-green-800";
      case "webmotors":
        return "bg-blue-100 text-blue-800";
      case "mercado livre":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const translateStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Ativo";
      case "paused":
        return "Pausado";
      case "sold":
        return "Vendido";
      default:
        return status || "Desconhecido";
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando detalhes do anúncio...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !adDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Anúncio não encontrado</h1>
            <p className="text-gray-600 mt-2">{error || 'O anúncio solicitado não foi encontrado.'}</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mt-4">Detalhes do Anúncio</h1>
              <p className="text-gray-600 mt-2">
                Anúncio #{adDetails.id} - {adDetails.title || 'Sem título'}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleEdit}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              >
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleStatus}
                disabled={isUpdating}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              >
                {isUpdating ? 'Alterando...' : (adDetails.status === 'active' ? 'Pausar' : 'Ativar')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Imagem e Informações Básicas */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Imagem do Veículo</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{adDetails.title || 'Sem título'}</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Plataforma:</span>
                      <span className="ml-2 text-gray-900">{adDetails.platform || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="ml-2 text-gray-900">{translateStatus(adDetails.status || '')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">ID do Veículo:</span>
                      <span className="ml-2 text-gray-900 font-mono text-xs">{adDetails.vehicle_id || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Publicado em:</span>
                      <span className="ml-2 text-gray-900">{adDetails.published_at ? formatDateBR(adDetails.published_at) : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {adDetails.price ? formatCurrency(adDetails.price) : 'Preço não informado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Descrição</h3>
              <p className="text-gray-700 leading-relaxed">{adDetails.description || 'Nenhuma descrição disponível'}</p>
            </div>

          </div>

          {/* Coluna Lateral */}
          <div className="space-y-8">
            {/* Informações do Anúncio */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Anúncio</h3>
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-700">Plataforma:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlatformColor(adDetails.platform || '')}`}>
                    {adDetails.platform || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(adDetails.status || '')}`}>
                    {translateStatus(adDetails.status || '')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Data de Publicação:</span>
                  <span className="ml-2 text-gray-900">
                    {adDetails.published_at ? formatDateBR(adDetails.published_at) : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Criado em:</span>
                  <span className="ml-2 text-gray-900">
                    {adDetails.created_at ? formatDateBR(adDetails.created_at) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">ID do Anúncio:</span>
                  <span className="ml-2 text-gray-900 font-mono text-sm">{adDetails.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">ID do Veículo:</span>
                  <span className="ml-2 text-gray-900 font-mono text-sm">{adDetails.vehicle_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Última Atualização:</span>
                  <span className="ml-2 text-gray-900">
                    {adDetails.updated_at ? formatDateBR(adDetails.updated_at) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
