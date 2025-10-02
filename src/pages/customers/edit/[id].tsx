import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Textarea from "../../../components/Textarea";

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

export default function EditCustomer() {
  const router = useRouter();
  const { id } = router.query;
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  // Função para salvar alterações
  const handleSave = async () => {
    if (!customerDetails) return;

    try {
      setIsSaving(true);
      setError(null);
      
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      // Filtrar apenas campos que não são nulos/undefined
      const dataToSave = {
        ...(customerDetails.name && { name: customerDetails.name }),
        ...(customerDetails.email && { email: customerDetails.email }),
        ...(customerDetails.phone && { phone: customerDetails.phone }),
        ...(customerDetails.document && { document: customerDetails.document }),
        ...(customerDetails.address && { address: customerDetails.address }),
        ...(customerDetails.city && { city: customerDetails.city }),
        ...(customerDetails.state && { state: customerDetails.state }),
        ...(customerDetails.zip_code && { zip_code: customerDetails.zip_code })
      };

      console.log('Dados a serem salvos:', dataToSave);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${id}&company_id=eq.${user.company_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(dataToSave)
      });
      
      if (response.ok) {
        setSuccessMessage('Cliente atualizado com sucesso!');
        setTimeout(() => {
          router.push('/customers');
        }, 1500);
      } else {
        const errorData = await response.text();
        console.error('Erro ao atualizar cliente:', errorData);
        setError('Erro ao atualizar cliente');
      }
      
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Função para atualizar campo
  const updateField = (field: keyof CustomerDetails, value: any) => {
    if (!customerDetails) return;
    setCustomerDetails(prev => prev ? { ...prev, [field]: value } : null);
  };

  useEffect(() => {
    if (id) {
      fetchCustomerDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando dados do cliente...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Cliente não encontrado</h1>
            <p className="text-gray-600 mt-2">{error || 'O cliente solicitado não foi encontrado.'}</p>
            <Button
              variant="primary"
              onClick={() => router.back()}
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
                onClick={() => router.back()}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              >
                Voltar
              </Button>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 mt-4">Editar Cliente</h2>
              <p className="text-gray-600">
                Cliente #{customerDetails.id}
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>

        {/* Mensagens de Erro e Sucesso */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <span className="text-green-800">{successMessage}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações do Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Nome"
              value={customerDetails.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Nome completo do cliente"
            />
            <Input
              label="E-mail"
              type="email"
              value={customerDetails.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="email@exemplo.com"
            />
            <Input
              label="Telefone"
              value={customerDetails.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
            <Input
              label="Documento (CPF/CNPJ)"
              value={customerDetails.document || ''}
              onChange={(e) => updateField('document', e.target.value)}
              placeholder="000.000.000-00"
            />
            <Input
              label="Endereço"
              value={customerDetails.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Rua, número, bairro"
            />
            <Input
              label="Cidade"
              value={customerDetails.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="Nome da cidade"
            />
            <Input
              label="Estado"
              value={customerDetails.state || ''}
              onChange={(e) => updateField('state', e.target.value)}
              placeholder="UF (ex: SP, RJ)"
              maxLength={2}
            />
            <Input
              label="CEP"
              value={customerDetails.zip_code || ''}
              onChange={(e) => updateField('zip_code', e.target.value)}
              placeholder="00000-000"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
