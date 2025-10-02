import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Select from "../../../components/Select";
import Textarea from "../../../components/Textarea";

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

export default function EditLead() {
  const router = useRouter();
  const { id } = router.query;
  const [leadDetails, setLeadDetails] = useState<LeadDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  // Função para salvar alterações
  const handleSave = async () => {
    if (!leadDetails) return;

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
        ...(leadDetails.name && { name: leadDetails.name }),
        ...(leadDetails.email && { email: leadDetails.email }),
        ...(leadDetails.phone && { phone: leadDetails.phone }),
        ...(leadDetails.source && { source: leadDetails.source }),
        ...(leadDetails.status && { status: leadDetails.status }),
        ...(leadDetails.notes && { notes: leadDetails.notes }),
        ...(leadDetails.score !== undefined && { score: leadDetails.score }),
        ...(leadDetails.prioridade && { prioridade: leadDetails.prioridade }),
        ...(leadDetails.vendedor && { vendedor: leadDetails.vendedor }),
        ...(leadDetails.ultimaAtividade && { ultimaAtividade: leadDetails.ultimaAtividade })
      };

      console.log('Dados a serem salvos:', dataToSave);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${id}&company_id=eq.${user.company_id}`, {
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
        setSuccessMessage('Lead atualizado com sucesso!');
        setTimeout(() => {
          router.push('/leads');
        }, 1500);
      } else {
        const errorData = await response.text();
        console.error('Erro ao atualizar lead:', errorData);
        setError('Erro ao atualizar lead');
      }
      
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Função para atualizar campo
  const updateField = (field: keyof LeadDetails, value: any) => {
    if (!leadDetails) return;
    setLeadDetails(prev => prev ? { ...prev, [field]: value } : null);
  };

  useEffect(() => {
    if (id) {
      fetchLeadDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando dados do lead...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Lead não encontrado</h1>
            <p className="text-gray-600 mt-2">{error || 'O lead solicitado não foi encontrado.'}</p>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2 mt-4">Editar Lead</h2>
              <p className="text-gray-600">
                Lead #{leadDetails.id}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações do Lead</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Nome"
              value={leadDetails.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Nome completo do lead"
            />
            <Input
              label="E-mail"
              type="email"
              value={leadDetails.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="email@exemplo.com"
            />
            <Input
              label="Telefone"
              value={leadDetails.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
            <Select
              label="Origem"
              value={leadDetails.source || ''}
              onChange={(e) => updateField('source', e.target.value)}
            >
              <option value="">Selecione a origem</option>
              <option value="site">Site</option>
              <option value="indicacao">Indicação</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="google">Google</option>
              <option value="outros">Outros</option>
            </Select>
            <Select
              label="Status"
              value={leadDetails.status || ''}
              onChange={(e) => updateField('status', e.target.value)}
            >
              <option value="">Selecione o status</option>
              <option value="new">Novo</option>
              <option value="contacted">Contatado</option>
              <option value="qualified">Qualificado</option>
              <option value="lost">Perdido</option>
            </Select>
            <Select
              label="Prioridade"
              value={leadDetails.prioridade || ''}
              onChange={(e) => updateField('prioridade', e.target.value)}
            >
              <option value="">Selecione a prioridade</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </Select>
            <Input
              label="Score"
              type="number"
              value={leadDetails.score || ''}
              onChange={(e) => updateField('score', parseInt(e.target.value) || 0)}
              placeholder="0-100"
            />
            <Input
              label="Vendedor"
              value={leadDetails.vendedor || ''}
              onChange={(e) => updateField('vendedor', e.target.value)}
              placeholder="Nome do vendedor responsável"
            />
            <Input
              label="Última Atividade"
              type="date"
              value={leadDetails.ultimaAtividade || ''}
              onChange={(e) => updateField('ultimaAtividade', e.target.value)}
            />
          </div>
          
          <div className="mt-6">
            <Textarea
              label="Observações"
              value={leadDetails.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={4}
              placeholder="Observações sobre o lead..."
            />
          </div>
        </div>
      </div>
    </main>
  );
}
