import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { translateSalesStatus, getStatusColor } from "../lib/statusTranslations";
import { formatCurrency } from "../lib/formatting";
import Button from "../components/Button";

// Função para formatar data no padrão brasileiro (dd/mm/yyyy)
const formatDateBR = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

interface SaleDetails {
  id: string;
  customer_name: string;
  vehicle_id: string;
  vehicle_description: string;
  sale_price: number;
  status: string;
  user_id: string;
  user_name?: string;
  sale_date: string;
  sale_type: string;
  commission: number;
  margin: number;
  source: string;
  notes: string;
  next_contact_date: string;
  priority: string;
  created_at: string;
  updated_at: string;
  // Dados relacionados (se existirem)
  customer_data?: {
    name: string;
    cpf: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
  };
  vehicle_data?: {
    brand: string;
    model: string;
    year: string;
    color: string;
    plate: string;
    mileage: string;
    fuel_type: string;
    category: string;
  };
  financial_data?: {
    vehicle_value: number;
    down_payment: number;
    financing: number;
    installments: number;
    installment_value: number;
    bank: string;
    interest_rate: number;
  };
  documents?: {
    contract: boolean;
    invoice: boolean;
    ipva: boolean;
    registration: boolean;
    insurance: boolean;
  };
}

export default function SaleDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [saleDetails, setSaleDetails] = useState<SaleDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

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
        if (data && data.length > 0) {
          const sale = data[0];
          // Processar dados para incluir nome do vendedor
          const processedSale: SaleDetails = {
            ...sale,
            user_name: sale.users?.name || 'N/A'
          };
          setSaleDetails(processedSale);
        } else {
          setError('Venda não encontrada');
        }
      } else {
        setError('Erro ao carregar dados da venda');
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
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/sales/edit/${id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Função getStatusColor já está importada do statusTranslations

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando detalhes da venda...</p>
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
    <>
      {/* Estilos para impressão */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            font-size: 12px;
            line-height: 1.4;
          }
          
          .print-break {
            page-break-before: always;
          }
          
          .print-avoid-break {
            page-break-inside: avoid;
          }
          
          .shadow {
            box-shadow: none !important;
          }
          
          .bg-white {
            background: white !important;
          }
          
          .border {
            border: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 print-full-width">
      <div className="px-4 py-6 sm:px-0">
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
                Detalhes da Venda
              </h2>
              <p className="text-gray-600">
                Venda #{saleDetails.id} - {saleDetails.customer_name}
              </p>
            </div>
            <div className="flex space-x-3 no-print">
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
                variant="primary"
                onClick={handlePrint}
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

        {/* Resumo da Venda */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 print-avoid-break">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
              <div className="space-y-2">
                <p><span className="font-bold text-gray-900">Cliente:</span> <span className="text-gray-900">{saleDetails.customer_name}</span></p>
                <p><span className="font-bold text-gray-900">Veículo:</span> <span className="text-gray-900">{saleDetails.vehicle_description}</span></p>
                <p><span className="font-bold text-gray-900">Vendedor:</span> <span className="text-gray-900">{saleDetails.user_name || saleDetails.user_id}</span></p>
                <p><span className="font-bold text-gray-900">Data:</span> <span className="text-gray-900">{formatDateBR(saleDetails.sale_date)}</span></p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Valores</h3>
              <div className="space-y-2">
                <p><span className="font-bold text-gray-900">Valor Total:</span> <span className="text-gray-900">{formatCurrency(saleDetails.sale_price)}</span></p>
                <p><span className="font-bold text-gray-900">Tipo:</span> <span className="text-gray-900">{saleDetails.sale_type}</span></p>
                <p><span className="font-bold text-gray-900">Status:</span> 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(saleDetails.status, 'sales')}`}>
                    {translateSalesStatus(saleDetails.status)}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
              <div className="space-y-2">
                <p><span className="font-bold text-gray-900">Origem:</span> <span className="text-gray-900">{saleDetails.source || 'N/A'}</span></p>
                <p><span className="font-bold text-gray-900">Prioridade:</span> 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    saleDetails.priority === 'high' ? 'bg-red-100 text-red-800' :
                    saleDetails.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {saleDetails.priority}
                  </span>
                </p>
                <p><span className="font-bold text-gray-900">Comissão:</span> <span className="text-gray-900">{formatCurrency(saleDetails.commission || 0)}</span></p>
                <p><span className="font-bold text-gray-900">Margem:</span> <span className="text-gray-900">{saleDetails.margin || 0}%</span></p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
              <p className="text-sm text-gray-600">{saleDetails.notes || 'Nenhuma observação registrada.'}</p>
            </div>
          </div>
        </div>

        {/* Informações da Venda */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 print-break">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações da Venda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID da Venda</label>
              <p className="text-gray-900 font-mono">{saleDetails.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID do Veículo</label>
              <p className="text-gray-900 font-mono">{saleDetails.vehicle_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Criação</label>
              <p className="text-gray-900">{formatDateBR(saleDetails.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Última Atualização</label>
              <p className="text-gray-900">{formatDateBR(saleDetails.updated_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Próximo Contato</label>
              <p className="text-gray-900">{saleDetails.next_contact_date ? formatDateBR(saleDetails.next_contact_date) : 'Não agendado'}</p>
            </div>
          </div>
        </div>

      </div>
    </main>
    </>
  );
}
