import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Input from "../components/Input";
import Select from "../components/Select";
import AIInsightCard from "../components/AIInsightCard";
import { useAuth } from "../hooks/useAuth";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  created_at: string;
  updated_at: string;
}

interface ContactHistory {
  id: string;
  data: string;
  tipo: string;
  descricao: string;
  vendedor: string;
}

export default function Customers() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, authenticatedFetch } = useAuth();
  const [activeTab, setActiveTab] = useState("clientes");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    address: "",
    city: "",
    state: "",
    zip_code: ""
  });
  const [contactForm, setContactForm] = useState({
    tipo: "",
    descricao: "",
    data: new Date().toISOString().split('T')[0]
  });

  // Carregar customers quando o componente montar
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCustomers();
    }
  }, [isAuthenticated, user]);

  // Simular carregamento de dados baseado no leadId da URL
  useEffect(() => {
    if (router.query.leadId && isAuthenticated) {
      // Aqui seria a lógica para carregar dados do lead e converter em cliente
      const leadData = {
        name: "Lead Convertido",
        email: "lead@email.com",
        phone: "(11) 99999-9999",
        document: "",
        address: "",
        city: "",
        state: "",
        zip_code: ""
      };
      setFormData(leadData);
      setIsCreatingNew(true);
    }
  }, [router.query.leadId, isAuthenticated]);

  // Função para buscar customers
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (!user) {
        return;
      }
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/customers?company_id=eq.${user.company_id}&order=created_at.desc`);
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        setError('Erro ao carregar clientes');
      }
      
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar customer (criar ou editar)
  const saveCustomer = async () => {
    try {
      setError("");
      setSuccessMessage("");
      
      if (!user) {
        return;
      }
      
      const dataToSave = {
        ...formData,
        company_id: user.company_id
      };
      
      let response;
      
      if (isEditing && selectedCustomer) {
        // Editar customer existente
        response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/customers?id=eq.${selectedCustomer}`, {
          method: 'PATCH',
          body: JSON.stringify(dataToSave)
        });
      } else {
        // Criar novo customer
        response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/customers`, {
          method: 'POST',
          body: JSON.stringify(dataToSave)
        });
      }
      
      if (!response.ok) {
        throw new Error('Erro ao salvar cliente');
      }
      
      setSuccessMessage(isEditing ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');
      setIsCreatingNew(false);
      setIsEditing(false);
      setSelectedCustomer(null);
      resetForm();
      fetchCustomers();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    }
  };

  // Função para editar customer
  const editCustomer = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      document: customer.document,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zip_code: customer.zip_code
    });
    setSelectedCustomer(customer.id);
    setIsEditing(true);
    setIsCreatingNew(true);
  };

  // Função para deletar customer
  const deleteCustomer = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }
    
    try {
      setError("");
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/customers?id=eq.${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir cliente');
      }
      
      setSuccessMessage('Cliente excluído com sucesso!');
      fetchCustomers();
      
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
      document: "",
      address: "",
      city: "",
      state: "",
      zip_code: ""
    });
  };

  // Função para cancelar edição/criação
  const cancelForm = () => {
    setIsCreatingNew(false);
    setIsEditing(false);
    setSelectedCustomer(null);
    resetForm();
    setError("");
    setSuccessMessage("");
  };

  // Mostrar loading se ainda estiver verificando autenticação
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirecionar se não estiver autenticado
  if (!isAuthenticated) {
    router.push('/');
    return null;
  }


  // Mock data para histórico de contatos
  const contactHistory: ContactHistory[] = [
    {
      id: "1",
      data: "20/09/2025",
      tipo: "Telefone",
      descricao: "Ligação para agendar test drive",
      vendedor: "Maria Santos"
    },
    {
      id: "2",
      data: "18/09/2025",
      tipo: "E-mail",
      descricao: "Envio de proposta de financiamento",
      vendedor: "Maria Santos"
    },
    {
      id: "3",
      data: "15/09/2025",
      tipo: "WhatsApp",
      descricao: "Primeiro contato via WhatsApp",
      vendedor: "Maria Santos"
    }
  ];

  const handleCustomerClick = (customerId: string) => {
    setSelectedCustomer(selectedCustomer === customerId ? null : customerId);
  };

  const handleCustomerDoubleClick = (customerId: string) => {
    router.push(`/customer-details?id=${customerId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria a lógica para salvar o cliente
    console.log("Dados do cliente:", formData);
    setIsCreatingNew(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      document: "",
      address: "",
      city: "",
      state: "",
      zip_code: ""
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria a lógica para salvar o contato
    console.log("Novo contato:", contactForm);
    setContactForm({
      tipo: "",
      descricao: "",
      data: new Date().toISOString().split('T')[0]
    });
    setShowContactForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800";
      case "Inativo":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderCustomersTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPF
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Endereço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Contato
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => handleCustomerClick(customer.id)}
                onDoubleClick={() => handleCustomerDoubleClick(customer.id)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedCustomer === customer.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {customer.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div>{customer.email}</div>
                    <div className="text-xs text-gray-400">{customer.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.document}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div>{customer.address}</div>
                    <div className="text-xs text-gray-400">{customer.city} - {customer.state}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Ativo
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderNewCustomerForm = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Novo Cliente
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome Completo"
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nome do cliente"
              required
            />
            <Input
              label="E-mail"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="email@exemplo.com"
              required
            />
            <Input
              label="Telefone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="(11) 99999-9999"
              required
            />
            <Input
              label="CPF"
              type="text"
              name="document"
              value={formData.document}
              onChange={(e) => setFormData({...formData, document: e.target.value})}
              placeholder="000.000.000-00"
              required
            />
          </div>

          {/* Endereço */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="CEP"
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
              placeholder="00000-000"
            />
            <Input
              label="Cidade"
              type="text"
              name="city"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="Cidade"
            />
            <Input
              label="Estado"
              type="text"
              name="state"
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              placeholder="Estado"
            />
          </div>

          <Input
            label="Endereço Completo"
            type="text"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="Rua, número, bairro"
          />

          

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
            >
              Salvar Cliente
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderContactHistory = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Histórico de Contatos
          </h3>
          <button
            onClick={() => setShowContactForm(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Novo Contato
          </button>
        </div>

        {/* Lista de contatos */}
        <div className="space-y-4">
          {contactHistory.map((contact) => (
            <div key={contact.id} className="border-l-4 border-primary pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{contact.tipo}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{contact.data}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{contact.descricao}</p>
                </div>
                <span className="text-xs text-gray-500">{contact.vendedor}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Formulário de novo contato */}
        {showContactForm && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Registrar Novo Contato
            </h4>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Tipo de Contato"
                  name="tipo"
                  value={contactForm.tipo}
                  onChange={(e) => setContactForm({...contactForm, tipo: e.target.value})}
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="telefone">Telefone</option>
                  <option value="email">E-mail</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="presencial">Presencial</option>
                  <option value="videochamada">Videochamada</option>
                </Select>
                <Input
                  label="Data"
                  type="date"
                  name="data"
                  value={contactForm.data}
                  onChange={(e) => setContactForm({...contactForm, data: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  rows={3}
                  value={contactForm.descricao}
                  onChange={(e) => setContactForm({...contactForm, descricao: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Descreva o contato realizado..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
                >
                  Salvar Contato
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Clientes
              </h2>
              <p className="text-gray-600">
                Gestão de clientes e histórico de relacionamento
              </p>
            </div>
            <div className="flex space-x-3">
              {selectedCustomer && (
                <button
                  onClick={() => setShowContactForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Novo Contato
                </button>
              )}
              <button
                onClick={() => setIsCreatingNew(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
              >
                Novo Cliente
              </button>
            </div>
          </div>
        </div>

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
            pageData={customers} 
            pageType="customers" 
            className="w-full"
          />
        </div>

        {/* Conteúdo */}
        {isCreatingNew ? (
          renderNewCustomerForm()
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {renderCustomersTable()}
              </div>
            </div>
            
            {selectedCustomer && renderContactHistory()}
          </div>
        )}
      </div>
    </main>
  );
}
