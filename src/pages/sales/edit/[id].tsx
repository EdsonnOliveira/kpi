import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { translateSalesStatus, getStatusColor } from "../../../lib/statusTranslations";
import { formatCurrency, applyCurrencyMask, removeCurrencyMask } from "../../../lib/formatting";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Select from "../../../components/Select";
import Checkbox from "../../../components/Checkbox";
import Textarea from "../../../components/Textarea";

interface SaleDetails {
  id: string;
  customer_name?: string;
  vehicle_id?: string;
  vehicle_description?: string;
  sale_price?: number;
  status?: string;
  user_id?: string;
  user_name?: string;
  sale_date?: string;
  sale_type?: string;
  commission?: number;
  margin?: number;
  source?: string;
  notes?: string;
  next_contact_date?: string;
  priority?: string;
  created_at?: string;
  updated_at?: string;
}

export default function EditSale() {
  const router = useRouter();
  const { id } = router.query;
  const [saleDetails, setSaleDetails] = useState<SaleDetails | null>(null);
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
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?company_id=eq.${user.company_id}&select=id,name&order=name.asc`, {
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

  // Função para buscar dados da venda
  const fetchSaleDetails = async () => {
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
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/sales?id=eq.${id}&company_id=eq.${user.company_id}&select=*,users(name)`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dados recebidos:', data);
        if (data && data.length > 0) {
          const sale = data[0];
          // Processar dados para incluir nome do vendedor
          const processedSale: SaleDetails = {
            ...sale,
            user_name: sale.users?.name || 'N/A'
          };
          console.log('Venda processada:', processedSale);
          setSaleDetails(processedSale);
        } else {
          setError('Venda não encontrada');
        }
      } else {
        const errorText = await response.text();
        console.error('Erro ao buscar venda:', response.status, errorText);
        setError(`Erro ao carregar dados da venda: ${response.status} - ${errorText}`);
      }
      
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaleDetails();
    fetchUsers();
  }, [id]);

  const handleBack = () => {
    router.push(`/sale-details?id=${id}`);
  };

  const handleSave = async () => {
    if (!saleDetails) return;
    
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
      
      // Filtrar apenas campos que não são nulos/undefined (customer_name não é editável)
      const dataToSave = {
        ...(saleDetails.vehicle_description && { vehicle_description: saleDetails.vehicle_description }),
        ...(saleDetails.sale_price !== undefined && { sale_price: saleDetails.sale_price }),
        ...(saleDetails.status && { status: saleDetails.status }),
        ...(saleDetails.user_id && { user_id: saleDetails.user_id }),
        ...(saleDetails.sale_date && { sale_date: saleDetails.sale_date }),
        ...(saleDetails.sale_type && { sale_type: saleDetails.sale_type }),
        ...(saleDetails.commission !== undefined && { commission: saleDetails.commission }),
        ...(saleDetails.margin !== undefined && { margin: saleDetails.margin }),
        ...(saleDetails.source && { source: saleDetails.source }),
        ...(saleDetails.notes && { notes: saleDetails.notes }),
        ...(saleDetails.next_contact_date && { next_contact_date: saleDetails.next_contact_date }),
        ...(saleDetails.priority && { priority: saleDetails.priority })
      };

      console.log('Dados a serem salvos:', dataToSave);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/sales?id=eq.${id}&company_id=eq.${user.company_id}`, {
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
        throw new Error(`Erro ao atualizar venda: ${response.status} - ${errorText}`);
      }
      
      setSuccessMessage('Venda atualizada com sucesso!');
      
      // Limpar mensagem de sucesso após 3 segundos e redirecionar
      setTimeout(() => {
        setSuccessMessage("");
        router.push(`/sale-details?id=${id}`);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    } finally {
      setIsSaving(false);
    }
  };

  // Função para atualizar campos simples
  const updateField = (field: keyof SaleDetails, value: any) => {
    if (!saleDetails) return;
    setSaleDetails(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados da venda...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar venda</h2>
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

  if (!saleDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Venda não encontrada</h2>
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
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Mensagens de Sucesso/Erro */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Editar Venda
              </h2>
              <p className="text-gray-600">
                Venda #{saleDetails.id} - {saleDetails.customer_name}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={handleBack}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary"
                onClick={handleSave}
                loading={isSaving}
                leftIcon={
                  !isSaving ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : undefined
                }
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>

        {/* Informações do Cliente (Somente Leitura) */}
        <div className="bg-gray-50 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h3>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-lg font-medium text-gray-900">{saleDetails.customer_name || 'Nome não informado'}</p>
            <p className="text-sm text-gray-500 mt-1">Esta informação não pode ser editada</p>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações Editáveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Descrição do Veículo"
              value={saleDetails.vehicle_description || ''}
              onChange={(e) => updateField('vehicle_description', e.target.value)}
            />
            <Input
              label="Valor da Venda"
              value={saleDetails.sale_price ? applyCurrencyMask(saleDetails.sale_price.toString()) : 'R$ 0,00'}
              onChange={(e) => {
                const numericValue = removeCurrencyMask(e.target.value);
                updateField('sale_price', parseFloat(numericValue) || 0);
              }}
            />
            <Select
              label="Status"
              value={saleDetails.status || ''}
              onChange={(e) => updateField('status', e.target.value)}
            >
              <option value="pending">Primeiro Contato</option>
              <option value="qualified">Qualificação</option>
              <option value="presentation">Apresentação</option>
              <option value="proposal_sent">Proposta Enviada</option>
              <option value="negotiation">Negociação</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
              <option value="lost">Perdida</option>
            </Select>
            <Select
              label="Vendedor"
              value={saleDetails.user_id || ''}
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
              label="Data da Venda"
              type="date"
              value={saleDetails.sale_date || ''}
              onChange={(e) => updateField('sale_date', e.target.value)}
            />
            <Select
              label="Tipo de Venda"
              value={saleDetails.sale_type || ''}
              onChange={(e) => updateField('sale_type', e.target.value)}
            >
              <option value="">Selecione o tipo</option>
              <option value="vista">À Vista</option>
              <option value="financiamento">Financiamento</option>
              <option value="consorcio">Consórcio</option>
              <option value="trocas">Trocas</option>
            </Select>
            <Input
              label="Origem"
              value={saleDetails.source || ''}
              onChange={(e) => updateField('source', e.target.value)}
            />
            <Select
              label="Prioridade"
              value={saleDetails.priority || ''}
              onChange={(e) => updateField('priority', e.target.value)}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </Select>
            <Input
              label="Comissão"
              value={saleDetails.commission ? applyCurrencyMask(saleDetails.commission.toString()) : 'R$ 0,00'}
              onChange={(e) => {
                const numericValue = removeCurrencyMask(e.target.value);
                updateField('commission', parseFloat(numericValue) || 0);
              }}
            />
            <Input
              label="Margem (%)"
              value={saleDetails.margin ? `${saleDetails.margin}%` : '0%'}
              onChange={(e) => {
                const numericValue = e.target.value.replace('%', '');
                updateField('margin', parseFloat(numericValue) || 0);
              }}
            />
            <Input
              label="Próximo Contato"
              type="date"
              value={saleDetails.next_contact_date || ''}
              onChange={(e) => updateField('next_contact_date', e.target.value)}
            />
          </div>
          <div className="mt-6">
            <Textarea
              label="Observações"
              value={saleDetails.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
            />
          </div>
        </div>

      </div>
    </main>
  );
}
