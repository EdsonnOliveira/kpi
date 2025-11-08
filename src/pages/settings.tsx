import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Switch from "../components/Switch";
import { applyPhoneMask, removePhoneMask } from "../lib/formatting";

interface Integration {
  id: string;
  nome: string;
  tipo: string;
  status: string;
  ultimaSincronizacao: string;
  configuracoes: {
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    autoSync?: boolean;
    syncInterval?: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface CompanyData {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  active: boolean;
}

interface SettingsData {
  [key: string]: string;
}

export default function Settings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("geral");
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isEditingIntegration, setIsEditingIntegration] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [settingsData, setSettingsData] = useState<SettingsData>({});
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const [primaryColorChanged, setPrimaryColorChanged] = useState(false);
  const [secondaryColorChanged, setSecondaryColorChanged] = useState(false);
  const [currentPrimaryColor, setCurrentPrimaryColor] = useState('#5CBEF5');
  const [currentSecondaryColor, setCurrentSecondaryColor] = useState('#0C1F2B');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

  // Função para buscar dados da empresa e configurações
  const fetchCompanyData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Verificar se há dados do usuário no localStorage
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

      // Buscar dados da empresa
      const companyResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${user.company_id}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        if (companyData.length > 0) {
          setCompanyData(companyData[0]);
          // Adicionar cores da empresa ao settingsData
          setSettingsData(prev => ({
            ...prev,
            primary_color: companyData[0].primary_color || '#5CBEF5',
            secondary_color: companyData[0].secondary_color || '#0C1F2B'
          }));
        }
      }

      // Buscar configurações da empresa
      const settingsResponse = await fetch(`${SUPABASE_URL}/rest/v1/settings?company_id=eq.${user.company_id}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        const settingsMap: SettingsData = {};
        settingsData.forEach((setting: any) => {
          settingsMap[setting.key] = setting.value;
        });
        setSettingsData(settingsMap);
      }

    } catch (error) {
      console.error('Erro ao buscar dados da empresa:', error);
      setError('Erro ao carregar dados da empresa');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar configurações
  const saveSettings = async (key: string, value: string) => {
    try {
      setIsSaving(true);
      setSaveMessage("");

      const userData = localStorage.getItem('user_data');
      if (!userData) {
        setError('Usuário não encontrado');
        return;
      }

      const user = JSON.parse(userData);
      const accessToken = localStorage.getItem('supabase_access_token');

      if (!accessToken) {
        setError('Token de acesso não encontrado');
        return;
      }

      // Salvar na tabela companies para cores
      if (key === 'primary_color' || key === 'secondary_color') {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${user.company_id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            [key]: value,
            updated_at: new Date().toISOString()
          })
        });

        if (response.ok) {
          setSaveMessage(`${key === 'primary_color' ? 'Cor primária' : 'Cor secundária'} salva com sucesso!`);
          setTimeout(() => setSaveMessage(""), 3000);
        } else {
          setError('Erro ao salvar configuração');
        }
      } else {
        // Salvar na tabela settings para outras configurações
        const response = await fetch(`${SUPABASE_URL}/rest/v1/settings?company_id=eq.${user.company_id}&key=eq.${key}`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const existingSettings = await response.json();
          
          if (existingSettings.length > 0) {
            // Atualizar configuração existente
            const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/settings?id=eq.${existingSettings[0].id}`, {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                value: value,
                updated_at: new Date().toISOString()
              })
            });

            if (updateResponse.ok) {
              setSaveMessage('Configuração salva com sucesso!');
              setTimeout(() => setSaveMessage(""), 3000);
            } else {
              setError('Erro ao atualizar configuração');
            }
          } else {
            // Criar nova configuração
            const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/settings`, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                company_id: user.company_id,
                key: key,
                value: value,
                description: `Configuração ${key}`
              })
            });

            if (createResponse.ok) {
              setSaveMessage('Configuração salva com sucesso!');
              setTimeout(() => setSaveMessage(""), 3000);
            } else {
              setError('Erro ao criar configuração');
            }
          }
        }
      }

      // Atualizar dados locais
      await fetchCompanyData();

    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      setError('Erro ao salvar configuração');
    } finally {
      setIsSaving(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchCompanyData();
    if (activeTab === "users") {
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  // Atualizar variáveis CSS quando os dados da empresa forem carregados
  useEffect(() => {
    if (settingsData.primary_color || settingsData.secondary_color) {
      const primaryColor = settingsData.primary_color || '#5CBEF5';
      const secondaryColor = settingsData.secondary_color || '#0C1F2B';
      
      setCurrentPrimaryColor(primaryColor);
      setCurrentSecondaryColor(secondaryColor);
      updateCSSVariables(primaryColor, secondaryColor);
    }
  }, [settingsData.primary_color, settingsData.secondary_color]);
  const [integrationForm, setIntegrationForm] = useState({
    nome: "",
    tipo: "",
    apiKey: "",
    apiSecret: "",
    webhookUrl: "",
    autoSync: false,
    syncInterval: ""
  });
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    password: ""
  });

  // Mock data para integrações
  const integrationsData: Integration[] = [
    {
      id: "1",
      nome: "OLX",
      tipo: "Marketplace",
      status: "Ativo",
      ultimaSincronizacao: "25/09/2025 14:30",
      configuracoes: {
        apiKey: "olx_***_***_***",
        apiSecret: "***_***_***",
        webhookUrl: "https://api.olx.com.br/webhook",
        autoSync: true,
        syncInterval: "30"
      }
    },
    {
      id: "2",
      nome: "Webmotors",
      tipo: "Marketplace",
      status: "Ativo",
      ultimaSincronizacao: "25/09/2025 12:15",
      configuracoes: {
        apiKey: "wm_***_***_***",
        apiSecret: "***_***_***",
        webhookUrl: "https://api.webmotors.com.br/webhook",
        autoSync: true,
        syncInterval: "60"
      }
    },
    {
      id: "3",
      nome: "Mercado Livre",
      tipo: "Marketplace",
      status: "Inativo",
      ultimaSincronizacao: "20/09/2025 09:45",
      configuracoes: {
        apiKey: "ml_***_***_***",
        apiSecret: "***_***_***",
        webhookUrl: "https://api.mercadolivre.com.br/webhook",
        autoSync: false,
        syncInterval: "120"
      }
    },
    {
      id: "4",
      nome: "AutoPecas",
      tipo: "Fornecedor",
      status: "Ativo",
      ultimaSincronizacao: "25/09/2025 16:20",
      configuracoes: {
        apiKey: "ap_***_***_***",
        apiSecret: "***_***_***",
        webhookUrl: "https://api.autopecas.com.br/webhook",
        autoSync: true,
        syncInterval: "15"
      }
    }
  ];

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setError("");

      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');

      if (!userData || !accessToken) {
        router.push('/');
        return;
      }

      const user = JSON.parse(userData);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?company_id=eq.${user.company_id}&order=created_at.desc`, {
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
      } else {
        setError('Erro ao carregar usuários');
      }

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleIntegrationClick = (integrationId: string) => {
    setSelectedIntegration(selectedIntegration === integrationId ? null : integrationId);
  };

  const handleEditIntegration = (integration: Integration) => {
    setIntegrationForm({
      nome: integration.nome,
      tipo: integration.tipo,
      apiKey: integration.configuracoes.apiKey || "",
      apiSecret: integration.configuracoes.apiSecret || "",
      webhookUrl: integration.configuracoes.webhookUrl || "",
      autoSync: integration.configuracoes.autoSync || false,
      syncInterval: integration.configuracoes.syncInterval || ""
    });
    setIsEditingIntegration(true);
  };

  const handleIntegrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Configurações da integração:", integrationForm);
    setIsEditingIntegration(false);
  };

  const handleEditUser = (user: User) => {
    setUserForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone ? applyPhoneMask(user.phone) : "",
      position: user.position || "",
      department: user.department || "",
      password: ""
    });
    setEditingUserId(user.id);
    setIsCreatingUser(true);
  };

  const handleCancelEdit = () => {
    setIsCreatingUser(false);
    setEditingUserId(null);
    setUserForm({
      name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      password: ""
    });
  };

  const handleDeleteUser = async () => {
    if (!editingUserId) return;

    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      const accessToken = localStorage.getItem('supabase_access_token');

      if (!accessToken) {
        router.push('/');
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${editingUserId}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const deleteError = await response.json();
        throw new Error(deleteError.message || 'Erro ao excluir usuário');
      }

      setSuccessMessage('Usuário excluído com sucesso!');
      setIsCreatingUser(false);
      setEditingUserId(null);
      setUserForm({
        name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        password: ""
      });
      fetchUsers();

      setTimeout(() => {
        setSuccessMessage("");
        setError("");
      }, 5000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir usuário');
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setSuccessMessage("");

      if (!editingUserId && (!userForm.password || userForm.password.length < 6)) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');

      if (!userData || !accessToken) {
        router.push('/');
        return;
      }

      const user = JSON.parse(userData);

      if (editingUserId) {
        const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${editingUserId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            name: userForm.name,
            email: userForm.email,
            phone: removePhoneMask(userForm.phone) || null,
            position: userForm.position || null,
            department: userForm.department || null
          })
        });

        if (!updateResponse.ok) {
          const updateError = await updateResponse.json();
          throw new Error(updateError.message || 'Erro ao atualizar usuário');
        }

        setSuccessMessage('Usuário atualizado com sucesso!');
        setIsCreatingUser(false);
        setEditingUserId(null);
        setUserForm({
          name: "",
          email: "",
          phone: "",
          position: "",
          department: "",
          password: ""
        });
        fetchUsers();

        setTimeout(() => {
          setSuccessMessage("");
          setError("");
        }, 5000);

        return;
      }

      let authUserId: string | null = null;
      let authCreated = false;
      let signupData: any = null;

      try {
        const signupResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            email: userForm.email,
            password: userForm.password,
            data: {
              name: userForm.name
            }
          })
        });

        signupData = await signupResponse.json();

        if (signupResponse.ok) {
          authUserId = signupData.user?.id || 
                      signupData.id || 
                      signupData.user_id || 
                      signupData.session?.user?.id ||
                      null;
          
          if (!authUserId && signupData.user) {
            authUserId = signupData.user.id || 
                        signupData.user.user_id || 
                        signupData.user.uid ||
                        null;
          }
          
          if (authUserId) {
            authCreated = true;
          } else {
            console.warn('Resposta do signup não contém ID do usuário:', signupData);
            throw new Error('Resposta do autenticador não contém ID do usuário. Verifique se a confirmação de email está desabilitada.');
          }
        } else {
          if (signupResponse.status === 429) {
            throw new Error('Limite de requisições excedido. Aguarde alguns instantes e tente novamente.');
          } else if (signupResponse.status === 400 || signupResponse.status === 422) {
            const errorMsg = signupData.msg || signupData.message || signupData.error_description || 'Erro ao criar usuário';
            if (errorMsg.toLowerCase().includes('already registered') || 
                errorMsg.toLowerCase().includes('already exists') ||
                errorMsg.toLowerCase().includes('user already registered')) {
              throw new Error('Este e-mail já está cadastrado');
            }
            throw new Error(`Erro ao criar usuário: ${errorMsg}`);
          } else {
            const errorMsg = signupData.msg || signupData.message || signupData.error_description || 'Erro ao criar usuário no autenticador';
            throw new Error(errorMsg);
          }
        }
      } catch (authErr) {
        if (authErr instanceof Error) {
          throw authErr;
        }
        throw new Error('Erro ao criar usuário no autenticador. Tente novamente.');
      }

      if (!authUserId) {
        console.error('Resposta completa do signup:', JSON.stringify(signupData, null, 2));
        throw new Error('Erro ao obter ID do usuário criado no autenticador. Verifique o console para mais detalhes.');
      }

      const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: authUserId,
          email: userForm.email,
          password: '$2a$10$placeholder.auth.managed',
          name: userForm.name,
          phone: removePhoneMask(userForm.phone) || null,
          position: userForm.position || null,
          department: userForm.department || null,
          company_id: user.company_id,
          active: true
        })
      });

      if (!dbResponse.ok) {
        const dbError = await dbResponse.json();
        throw new Error(dbError.message || 'Erro ao criar usuário no banco de dados');
      }

      setSuccessMessage('Usuário criado com sucesso no autenticador e no banco de dados!');

      setIsCreatingUser(false);
      setUserForm({
        name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        password: ""
      });
      fetchUsers();

      setTimeout(() => {
        setSuccessMessage("");
        setError("");
      }, 5000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    }
  };

  const getStatusColor = (active: boolean) => {
    return active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const updateCSSVariables = (primaryColor: string, secondaryColor: string) => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
  };

  const handlePrimaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentPrimaryColor(newColor);
    setPrimaryColorChanged(true);
    updateCSSVariables(newColor, currentSecondaryColor);
  };

  const handleSecondaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentSecondaryColor(newColor);
    setSecondaryColorChanged(true);
    updateCSSVariables(currentPrimaryColor, newColor);
  };

  const resetPrimaryColor = async () => {
    setCurrentPrimaryColor('#5CBEF5');
    setPrimaryColorChanged(false);
    updateCSSVariables('#5CBEF5', currentSecondaryColor);
    await saveSettings('primary_color', '#5CBEF5');
  };

  const resetSecondaryColor = async () => {
    setCurrentSecondaryColor('#0C1F2B');
    setSecondaryColorChanged(false);
    updateCSSVariables(currentPrimaryColor, '#0C1F2B');
    await saveSettings('secondary_color', '#0C1F2B');
  };

  const saveColors = async () => {
    try {
      setIsSaving(true);
      setSaveMessage("");
      
      if (primaryColorChanged) {
        await saveSettings('primary_color', currentPrimaryColor);
      }
      
      if (secondaryColorChanged) {
        await saveSettings('secondary_color', currentSecondaryColor);
      }
      
      setPrimaryColorChanged(false);
      setSecondaryColorChanged(false);
      setSaveMessage('Cores salvas com sucesso!');
      setTimeout(() => setSaveMessage(""), 3000);
      
    } catch (error) {
      console.error('Erro ao salvar cores:', error);
      setError('Erro ao salvar cores');
    } finally {
      setIsSaving(false);
    }
  };


  const renderIntegrationsTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Sincronização
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {integrationsData.map((integration) => (
              <tr
                key={integration.id}
                onClick={() => handleIntegrationClick(integration.id)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedIntegration === integration.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {integration.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {integration.tipo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(integration.status === 'Ativo')}`}>
                    {integration.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {integration.ultimaSincronizacao}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditIntegration(integration);
                    }}
                    className="text-primary hover:text-primary-dark"
                  >
                    Configurar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderUsersTable = () => {
    if (isLoadingUsers) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Carregando usuários...</span>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-mail
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Criação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.position || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.active)}`}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderIntegrationForm = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Configurar Integração
        </h3>
        
        <form onSubmit={handleIntegrationSubmit} className="space-y-6">
          {/* Mensagem de Sucesso de Cópia */}
          {copySuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-800 text-sm">{copySuccess}</span>
              </div>
            </div>
          )}
          
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome da Integração"
              type="text"
              name="nome"
              value={integrationForm.nome}
              onChange={(e) => setIntegrationForm({...integrationForm, nome: e.target.value})}
              placeholder="Nome da plataforma"
              required
            />
            <Select
              label="Tipo"
              name="tipo"
              value={integrationForm.tipo}
              onChange={(e) => setIntegrationForm({...integrationForm, tipo: e.target.value})}
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="marketplace">Marketplace</option>
              <option value="fornecedor">Fornecedor</option>
              <option value="financeiro">Financeiro</option>
              <option value="estoque">Estoque</option>
            </Select>
          </div>

          {/* Configurações de API */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="API Key"
              type="password"
              name="apiKey"
              value={integrationForm.apiKey}
              onChange={(e) => setIntegrationForm({...integrationForm, apiKey: e.target.value})}
              placeholder="Chave da API"
              required
              allowCopy={true}
              showPassword={true}
              onCopy={(text) => setCopySuccess("API Key copiado com sucesso!")}
            />
            <Input
              label="API Secret"
              type="password"
              name="apiSecret"
              value={integrationForm.apiSecret}
              onChange={(e) => setIntegrationForm({...integrationForm, apiSecret: e.target.value})}
              placeholder="Segredo da API"
              required
              allowCopy={true}
              showPassword={true}
              onCopy={(text) => setCopySuccess("API Secret copiado com sucesso!")}
            />
          </div>

          <Input
            label="Webhook URL"
            type="url"
            name="webhookUrl"
            value={integrationForm.webhookUrl}
            onChange={(e) => setIntegrationForm({...integrationForm, webhookUrl: e.target.value})}
            placeholder="https://api.exemplo.com/webhook"
          />

          {/* Configurações de Sincronização */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={integrationForm.autoSync}
                  onChange={(e) => setIntegrationForm({...integrationForm, autoSync: e.target.checked})}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Sincronização Automática</span>
              </label>
            </div>
            <Select
              label="Intervalo de Sincronização (minutos)"
              name="syncInterval"
              value={integrationForm.syncInterval}
              onChange={(e) => setIntegrationForm({...integrationForm, syncInterval: e.target.value})}
            >
              <option value="">Selecione o intervalo</option>
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="60">1 hora</option>
              <option value="120">2 horas</option>
              <option value="240">4 horas</option>
            </Select>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsEditingIntegration(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderUserForm = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {editingUserId ? 'Editar Usuário' : 'Novo Usuário'}
        </h3>
        
        <form onSubmit={handleUserSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-800 text-sm">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Dados do Usuário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome Completo"
              type="text"
              name="name"
              value={userForm.name}
              onChange={(e) => setUserForm({...userForm, name: e.target.value})}
              placeholder="Nome do usuário"
              required
            />
            <Input
              label="E-mail"
              type="email"
              name="email"
              value={userForm.email}
              onChange={(e) => setUserForm({...userForm, email: e.target.value})}
              placeholder="email@exemplo.com"
              required
            />
            <Input
              label="Telefone"
              type="tel"
              name="phone"
              value={userForm.phone}
              onChange={(e) => {
                const maskedValue = applyPhoneMask(e.target.value);
                setUserForm({...userForm, phone: maskedValue});
              }}
              onBlur={(e) => {
                const numericValue = removePhoneMask(e.target.value);
                setUserForm({...userForm, phone: numericValue});
              }}
              placeholder="(00) 00000-0000"
            />
            <Input
              label="Cargo"
              type="text"
              name="position"
              value={userForm.position}
              onChange={(e) => setUserForm({...userForm, position: e.target.value})}
              placeholder="Cargo/Função"
            />
            <Input
              label="Departamento"
              type="text"
              name="department"
              value={userForm.department}
              onChange={(e) => setUserForm({...userForm, department: e.target.value})}
              placeholder="Departamento"
            />
            {!editingUserId && (
              <Input
                label="Senha"
                type="password"
                name="password"
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                placeholder="Senha do usuário (mínimo 6 caracteres)"
                required
                showPassword={true}
              />
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-between items-center">
            {editingUserId && (
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir Usuário
              </button>
            )}
            <div className="flex justify-end space-x-4 ml-auto">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
              >
                {editingUserId ? 'Salvar Alterações' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  const renderGeneralSettings = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Carregando dados...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Mensagens de sucesso e loading */}
        {saveMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800">{saveMessage}</p>
            </div>
          </div>
        )}

        {isSaving && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-blue-800">Salvando configurações...</p>
            </div>
          </div>
        )}
        {/* Configurações Gerais */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Configurações Gerais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome da Empresa"
              type="text"
              defaultValue={companyData?.name || ''}
              placeholder="Nome da empresa"
              readOnly
            />
            <Input
              label="CNPJ"
              type="text"
              defaultValue={companyData?.document || ''}
              placeholder="CNPJ da empresa"
              readOnly
            />
            <Input
              label="Telefone"
              type="tel"
              defaultValue={companyData?.phone || ''}
              placeholder="Telefone de contato"
              readOnly
            />
            <Input
              label="E-mail"
              type="email"
              defaultValue={companyData?.email || ''}
              placeholder="E-mail de contato"
              readOnly
            />
            <Input
              label="Endereço"
              type="text"
              defaultValue={companyData?.address || ''}
              placeholder="Endereço completo"
              readOnly
            />
            <Input
              label="Cidade/Estado"
              type="text"
              defaultValue={`${companyData?.city || ''} - ${companyData?.state || ''}`}
              placeholder="Cidade e estado"
              readOnly
            />
          </div>
        </div>

         {/* Configurações de Cores */}
         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-6">
             Configurações de Cores
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <Input
                 label="Cor Primária"
                 type="color"
                 data-color="primary"
                 value={currentPrimaryColor}
                 className="border-0 cursor-pointer"
                 onChange={handlePrimaryColorChange}
               />
               {currentPrimaryColor !== '#5CBEF5' && (
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={resetPrimaryColor}
                   className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline p-0 h-auto"
                 >
                   Resetar configuração de cor
                 </Button>
               )}
             </div>
             <div>
               <Input
                 label="Cor Secundária"
                 type="color"
                 data-color="secondary"
                 value={currentSecondaryColor}
                 className="border-0 cursor-pointer"
                 onChange={handleSecondaryColorChange}
               />
               {currentSecondaryColor !== '#0C1F2B' && (
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={resetSecondaryColor}
                   className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline p-0 h-auto"
                 >
                   Resetar configuração de cor
                 </Button>
               )}
             </div>
           </div>
           
           {(currentPrimaryColor !== '#5CBEF5' || currentSecondaryColor !== '#0C1F2B') && (
             <div className="mt-6 flex justify-end">
               <Button
                 variant="primary"
                 size="md"
                 onClick={saveColors}
                 disabled={isSaving}
                 className="px-6"
               >
                 {isSaving ? 'Salvando...' : 'Salvar Cores'}
               </Button>
             </div>
           )}
         </div>

        {/* Configurações de Backup */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Backup e Segurança
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Backup Automático</h4>
                <p className="text-sm text-gray-500">Backup diário dos dados do sistema</p>
              </div>
              <Switch
                defaultChecked={settingsData.backup_enabled === 'true'}
                variant="primary"
                onChange={async (e) => await saveSettings('backup_enabled', e.target.checked.toString())}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Log de Auditoria</h4>
                <p className="text-sm text-gray-500">Registro de todas as ações dos usuários</p>
              </div>
              <Switch
                defaultChecked={settingsData.audit_log_enabled === 'true'}
                variant="primary"
                onChange={async (e) => await saveSettings('audit_log_enabled', e.target.checked.toString())}
              />
            </div>
          </div>
        </div>
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
                Configurações
              </h2>
              <p className="text-gray-600">
                Configurações do sistema e integrações
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("geral")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "geral"
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Configurações Gerais
              </button>
              <button
                onClick={() => setActiveTab("integrations")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "integrations"
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Integrações
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Usuários
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo */}
        {activeTab === "geral" && renderGeneralSettings()}
        
        {activeTab === "integrations" && (
          <div className="space-y-6">
            {isEditingIntegration ? (
              renderIntegrationForm()
            ) : (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Integrações
                    </h3>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors">
                      Nova Integração
                    </button>
                  </div>
                  {renderIntegrationsTable()}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "users" && (
          <div className="space-y-6">
            {isCreatingUser ? (
              renderUserForm()
            ) : (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Usuários
                    </h3>
                    <button
                      onClick={() => setIsCreatingUser(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
                    >
                      Novo Usuário
                    </button>
                  </div>
                  {renderUsersTable()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
