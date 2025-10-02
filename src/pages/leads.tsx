import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { formatPercent } from "../lib/formatting";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import ResponsivePage from "../components/ResponsivePage";
import ResponsiveCard from "../components/ResponsiveCard";
import ResponsiveTable, { 
  ResponsiveTableHeader, 
  ResponsiveTableHeaderCell, 
  ResponsiveTableBody, 
  ResponsiveTableRow, 
  ResponsiveTableCell 
} from "../components/ResponsiveTable";
import AIInsightCard from "../components/AIInsightCard";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  score?: number;
  prioridade?: string;
  vendedor?: string;
  ultimaAtividade?: string;
}

export default function Leads() {
  const router = useRouter();
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    source: "",
    priority: "",
    seller: "",
    scoreMin: "",
    scoreMax: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    status: "new",
    notes: ""
  });

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

  // Função para buscar leads
  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError("");

      const userData = localStorage.getItem('user_data');
      if (!userData) {
        router.push('/');
        return;
      }

      const user = JSON.parse(userData);
      const accessToken = localStorage.getItem('supabase_access_token');

      if (!accessToken) {
        router.push('/');
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?company_id=eq.${user.company_id}&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      } else {
        setError('Erro ao carregar leads');
      }

    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar lead (criar ou editar)
  const saveLead = async () => {
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
        company_id: user.company_id
      };
      
      let response;
      
      if (isEditing && selectedLead) {
        // Editar lead existente
        response = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${selectedLead}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSave)
        });
      } else {
        // Criar novo lead
        response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
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
        throw new Error('Erro ao salvar lead');
      }
      
      setSuccessMessage(isEditing ? 'Lead atualizado com sucesso!' : 'Lead criado com sucesso!');
      setIsCreatingNew(false);
      setIsEditing(false);
      setSelectedLead(null);
      resetForm();
      fetchLeads();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    }
  };

  // Função para editar lead
  const editLead = (lead: Lead) => {
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      notes: lead.notes
    });
    setSelectedLead(lead.id);
    setIsEditing(true);
    setIsCreatingNew(true);
  };

  // Função para deletar lead
  const deleteLead = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) {
      return;
    }
    
    try {
      setError("");
      
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!accessToken) {
        router.push('/');
        return;
      }
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir lead');
      }
      
      setSuccessMessage('Lead excluído com sucesso!');
      fetchLeads();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir dados');
    }
  };

  // Função para resetar formulário
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      source: "",
      status: "new",
      notes: ""
    });
  };

  // Função para cancelar edição/criação
  const cancelForm = () => {
    setIsCreatingNew(false);
    setIsEditing(false);
    setSelectedLead(null);
    resetForm();
    setError("");
    setSuccessMessage("");
  };

  // Carregar leads quando o componente montar
  // Função para traduzir status do inglês para português
  const translateStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'new': 'Novo',
      'contacted': 'Contatado',
      'qualified': 'Qualificado',
      'presentation': 'Apresentação',
      'lost': 'Perdido',
      'Novo': 'Novo',
      'Contatado': 'Contatado',
      'Qualificado': 'Qualificado',
      'Apresentação': 'Apresentação',
      'Perdido': 'Perdido'
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Função para filtrar leads
  const filteredLeads = leads.filter(lead => {
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.source && lead.source !== filters.source) return false;
    return true;
  });

  // Dados mockados para fallback (quando não há dados reais)
  const mockLeadsData: Lead[] = [];

  const handleLeadClick = (leadId: string) => {
    setSelectedLead(selectedLead === leadId ? null : leadId);
  };

  const handleLeadDoubleClick = (leadId: string) => {
    router.push(`/lead-details?id=${leadId}`);
  };

  const handleGoToCustomer = () => {
    if (selectedLead) {
      router.push(`/customers?leadId=${selectedLead}`);
    }
  };


  // Funções para estatísticas
  const getLeadsStats = () => {
    const total = leads.length;
    const novos = leads.filter(l => l.status === "new").length;
    const qualificados = leads.filter(l => l.status === "qualified").length;
    const convertidos = leads.filter(l => l.status === "converted").length;
    const emNegociacao = leads.filter(l => ["contacted", "qualified"].includes(l.status)).length;
    const scoreMedio = 75; // Valor fixo já que não temos score no banco
    const taxaConversao = total > 0 ? (convertidos / total * 100) : 0;

    return {
      total,
      novos,
      qualificados,
      convertidos,
      emNegociacao,
      scoreMedio: scoreMedio.toFixed(1),
      taxaConversao
    };
  };

  // Função para filtrar leads (já implementada acima)
  const getFilteredLeads = () => {
    return filteredLeads;
  };

  const stats = getLeadsStats();

  if (isLoading) {
    return (
      <ResponsivePage
        title="Leads"
        subtitle="Gestão de leads e prospecção de clientes"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Carregando leads...</span>
        </div>
      </ResponsivePage>
    );
  }

  if (error) {
    return (
      <ResponsivePage
        title="Leads"
        subtitle="Gestão de leads e prospecção de clientes"
      >
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </ResponsivePage>
    );
  }

  return (
    <ResponsivePage
      title="Leads"
      subtitle="Gestão de leads e prospecção de clientes"
      actions={
        <div className="flex gap-3">
          {selectedLead && (
            <Button
              variant="success"
              onClick={handleGoToCustomer}
            >
              Converter em Cliente
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => setIsCreatingNew(true)}
          >
            Novo Lead
          </Button>
        </div>
      }
    >
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

      {/* Insights da IA */}
      <div className="mb-6 sm:mb-8">
        <AIInsightCard 
          pageData={leads} 
          pageType="leads" 
          className="w-full"
        />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <ResponsiveCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Convertidos</p>
              <p className="text-2xl font-bold text-green-600">{stats.convertidos}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Score Médio</p>
              <p className="text-2xl font-bold text-purple-600">{stats.scoreMedio}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-orange-600">{formatPercent(stats.taxaConversao)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>
      </div>

      {/* Formulário de Criação/Edição */}
      {isCreatingNew && (
        <ResponsiveCard className="mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isEditing ? 'Editar Lead' : 'Novo Lead'}
            </h3>
            <p className="text-sm text-gray-600">
              {isEditing ? 'Atualize as informações do lead' : 'Preencha as informações do novo lead'}
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); saveLead(); }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Nome"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nome completo do lead"
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@exemplo.com"
                required
              />
              <Input
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="(11) 99999-9999"
                required
              />
              <Select
                label="Origem"
                name="source"
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                required
              >
                <option value="">Selecione a origem</option>
                <option value="Website">Website</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Indicação">Indicação</option>
                <option value="Telefone">Telefone</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Outros">Outros</option>
              </Select>
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
              >
                <option value="new">Novo</option>
                <option value="contacted">Contatado</option>
                <option value="qualified">Qualificado</option>
                <option value="proposal">Proposta Enviada</option>
                <option value="negotiation">Negociação</option>
                <option value="closed-won">Fechado - Ganho</option>
                <option value="closed-lost">Fechado - Perdido</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Observações sobre o lead..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={cancelForm}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                {isEditing ? 'Atualizar' : 'Criar'} Lead
              </Button>
            </div>
          </form>
        </ResponsiveCard>
      )}

      {/* Filtros */}
      <ResponsiveCard className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Ocultar" : "Mostrar"} Filtros
          </Button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">Todos os Status</option>
              <option value="new">Novo</option>
              <option value="contacted">Contatado</option>
              <option value="qualified">Qualificado</option>
              <option value="presentation">Apresentação</option>
              <option value="lost">Perdido</option>
            </Select>
            <Select
              label="Origem"
              value={filters.source}
              onChange={(e) => setFilters({...filters, source: e.target.value})}
            >
              <option value="">Todas as Origens</option>
              <option value="Site">Site</option>
              <option value="Indicação">Indicação</option>
              <option value="Google Ads">Google Ads</option>
            </Select>
            <Select
              label="Prioridade"
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
            >
              <option value="">Todas as Prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </Select>
            <Select
              label="Vendedor"
              value={filters.seller}
              onChange={(e) => setFilters({...filters, seller: e.target.value})}
            >
              <option value="">Todos os Vendedores</option>
              <option value="Maria Santos">Maria Santos</option>
              <option value="Pedro Oliveira">Pedro Oliveira</option>
            </Select>
            <Input
              label="Score Mínimo"
              type="number"
              value={filters.scoreMin}
              onChange={(e) => setFilters({...filters, scoreMin: e.target.value})}
              placeholder="0"
            />
            <Input
              label="Score Máximo"
              type="number"
              value={filters.scoreMax}
              onChange={(e) => setFilters({...filters, scoreMax: e.target.value})}
              placeholder="100"
            />
          </div>
        )}
      </ResponsiveCard>

      {/* Tabela de Leads */}
      <ResponsiveCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Leads ({filteredLeads.length})
          </h3>
        </div>
        
        <ResponsiveTable>
          <ResponsiveTableHeader>
            <tr>
              <ResponsiveTableHeaderCell>Nome</ResponsiveTableHeaderCell>
              <ResponsiveTableHeaderCell>Contato</ResponsiveTableHeaderCell>
              <ResponsiveTableHeaderCell>Origem</ResponsiveTableHeaderCell>
              <ResponsiveTableHeaderCell>Status</ResponsiveTableHeaderCell>
              <ResponsiveTableHeaderCell>Score</ResponsiveTableHeaderCell>
              <ResponsiveTableHeaderCell>Prioridade</ResponsiveTableHeaderCell>
              <ResponsiveTableHeaderCell>Vendedor</ResponsiveTableHeaderCell>
              <ResponsiveTableHeaderCell>Última Atividade</ResponsiveTableHeaderCell>
              <ResponsiveTableHeaderCell>Ações</ResponsiveTableHeaderCell>
            </tr>
          </ResponsiveTableHeader>
          <ResponsiveTableBody>
            {filteredLeads.map((lead) => (
              <ResponsiveTableRow 
                key={lead.id}
                onClick={() => handleLeadClick(lead.id)}
                onDoubleClick={() => handleLeadDoubleClick(lead.id)}
                className={selectedLead === lead.id ? 'bg-blue-50 border-l-4 border-primary' : ''}
              >
                <ResponsiveTableCell isHeader>{lead.name}</ResponsiveTableCell>
                <ResponsiveTableCell>
                  <div>
                    <div>{lead.email}</div>
                    <div className="text-xs text-gray-400">{lead.phone}</div>
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell>{lead.source}</ResponsiveTableCell>
                <ResponsiveTableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    lead.status === 'new' || lead.status === 'Novo' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'contacted' || lead.status === 'Contatado' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'qualified' || lead.status === 'Qualificado' ? 'bg-green-100 text-green-800' :
                    lead.status === 'presentation' || lead.status === 'Apresentação' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {translateStatus(lead.status)}
                  </span>
                </ResponsiveTableCell>
                <ResponsiveTableCell>
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${
                      (lead.score || 0) >= 80 ? 'text-green-600' :
                      (lead.score || 0) >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {lead.score || 0}
                    </span>
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    lead.prioridade === 'Alta' ? 'bg-red-100 text-red-800' :
                    lead.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {lead.prioridade}
                  </span>
                </ResponsiveTableCell>
                <ResponsiveTableCell>{lead.vendedor}</ResponsiveTableCell>
                <ResponsiveTableCell>{lead.ultimaAtividade}</ResponsiveTableCell>
                <ResponsiveTableCell>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        editLead(lead);
                      }}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLead(lead.id);
                      }}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </ResponsiveTableCell>
              </ResponsiveTableRow>
            ))}
          </ResponsiveTableBody>
        </ResponsiveTable>
      </ResponsiveCard>

      {/* Modal Novo Lead */}
      {isCreatingNew && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Novo Lead</h3>
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); saveLead(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome do lead"
                    required
                  />
                  <Input
                    label="E-mail"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Telefone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    required
                  />
                  <Select
                    label="Origem"
                    name="source"
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    required
                  >
                    <option value="">Selecione a origem</option>
                    <option value="Site">Site</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Facebook">Facebook</option>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="">Selecione o status</option>
                    <option value="new">Novo</option>
                    <option value="contacted">Contatado</option>
                    <option value="qualified">Qualificado</option>
                    <option value="presentation">Apresentação</option>
                    <option value="lost">Perdido</option>
                  </Select>
                  <Input
                    label="Observações"
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Observações sobre o lead"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Vendedor"
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    placeholder="Nome do vendedor"
                    required
                  />
                  <Input
                    label="Próximo Contato"
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Observações sobre o lead..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreatingNew(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Salvar Lead
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ResponsivePage>
  );
}
