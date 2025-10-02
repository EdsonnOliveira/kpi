import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { formatDateBR } from "../lib/formatting";
import Button from "../components/Button";

interface CustomerDetails {
  id: string;
  company_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
}

// Configuração do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export default function CustomerDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar detalhes do cliente
  const fetchCustomerDetails = async () => {
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
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${id}&company_id=eq.${user.company_id}`, {
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
          setCustomerDetails(data[0]);
        } else {
          setError('Cliente não encontrado');
        }
      } else {
        setError('Erro ao carregar cliente');
      }
      
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomerDetails();
    }
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
              <p className="text-gray-600">Carregando detalhes do cliente...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !customerDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cliente não encontrado</h2>
            <p className="text-gray-600 mb-4">{error || 'O cliente solicitado não foi encontrado.'}</p>
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
                Detalhes do Cliente
              </h2>
              <p className="text-gray-600">
                Cliente #{customerDetails.id} - {customerDetails.name || 'Nome não informado'}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/customers/edit/${id}`)}
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
                onClick={() => alert('Funcionalidade de novo contato será implementada')}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                }
              >
                Novo Contato
              </Button>
              <Button
                variant="primary"
                onClick={() => alert('Funcionalidade de nova venda será implementada')}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Nova Venda
              </Button>
            </div>
          </div>
        </div>

        {/* Resumo do Cliente */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">Nome:</span> <span className="text-gray-900">{customerDetails.name || 'N/A'}</span></p>
                  <p><span className="font-bold text-gray-900">E-mail:</span> <span className="text-gray-900">{customerDetails.email || 'N/A'}</span></p>
                  <p><span className="font-bold text-gray-900">Telefone:</span> <span className="text-gray-900">{customerDetails.phone || 'N/A'}</span></p>
                  <p><span className="font-bold text-gray-900">Documento:</span> <span className="text-gray-900">{customerDetails.document || 'N/A'}</span></p>
                </div>
              </div>

              {/* Datas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Datas</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">Data de Cadastro:</span> <span className="text-gray-900">{customerDetails.created_at ? formatDateBR(customerDetails.created_at) : 'N/A'}</span></p>
                  <p><span className="font-bold text-gray-900">Última Atualização:</span> <span className="text-gray-900">{customerDetails.updated_at ? formatDateBR(customerDetails.updated_at) : 'N/A'}</span></p>
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              {/* Endereço */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">Endereço:</span> <span className="text-gray-900">{customerDetails.address || 'N/A'}</span></p>
                  <p><span className="font-bold text-gray-900">Cidade/Estado:</span> <span className="text-gray-900">{customerDetails.city || 'N/A'}/{customerDetails.state || 'N/A'}</span></p>
                  <p><span className="font-bold text-gray-900">CEP:</span> <span className="text-gray-900">{customerDetails.zip_code || 'N/A'}</span></p>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">ID do Cliente:</span> <span className="text-gray-900 font-mono text-sm">{customerDetails.id}</span></p>
                  <p><span className="font-bold text-gray-900">ID da Empresa:</span> <span className="text-gray-900 font-mono text-sm">{customerDetails.company_id || 'N/A'}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
