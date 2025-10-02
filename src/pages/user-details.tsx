import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";

interface UserDetails {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: string;
  status: string;
  dataCadastro: string;
  ultimoAcesso: string;
  permissoes: string[];
  dadosPessoais: {
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    dataNascimento: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  dadosProfissionais: {
    cargo: string;
    departamento: string;
    dataAdmissao: string;
    salario: string;
    supervisor: string;
    tipoContrato: string;
  };
  historico: {
    data: string;
    acao: string;
    usuario: string;
    observacoes: string;
  }[];
}

export default function UserDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
    departamento: "",
    status: "",
    cpf: "",
    dataNascimento: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    dataAdmissao: "",
    salario: "",
    observacoes: ""
  });

  useEffect(() => {
    if (id) {
      // Simular carregamento dos dados
      setTimeout(() => {
        const mockUserDetails: UserDetails = {
          id: id as string,
          nome: "Maria Santos",
          email: "maria.santos@empresa.com",
          telefone: "(11) 99999-9999",
          cargo: "Gerente",
          departamento: "Vendas",
          status: "Ativo",
          dataCadastro: "2025-01-15",
          ultimoAcesso: "2025-09-25 14:30",
          permissoes: ["Vendas", "Clientes", "Relatórios", "Leads"],
          dadosPessoais: {
            nome: "Maria Santos",
            email: "maria.santos@empresa.com",
            telefone: "(11) 99999-9999",
            cpf: "123.456.789-00",
            dataNascimento: "1985-03-15",
            endereco: "Rua das Flores, 123",
            cidade: "São Paulo",
            estado: "SP",
            cep: "01234-567"
          },
          dadosProfissionais: {
            cargo: "Gerente de Vendas",
            departamento: "Vendas",
            dataAdmissao: "2020-01-15",
            salario: "R$ 8.500,00",
            supervisor: "João Silva",
            tipoContrato: "CLT"
          },
          historico: [
            {
              data: "25/09/2025 14:30",
              acao: "Último Acesso",
              usuario: "Maria Santos",
              observacoes: "Login realizado no sistema"
            },
            {
              data: "24/09/2025 16:45",
              acao: "Permissão Atualizada",
              usuario: "Admin Sistema",
              observacoes: "Adicionada permissão de Relatórios"
            },
            {
              data: "20/09/2025 10:15",
              acao: "Usuário Criado",
              usuario: "Admin Sistema",
              observacoes: "Usuário criado com permissões básicas"
            }
          ]
        };
        setUserDetails(mockUserDetails);
        setIsLoading(false);
      }, 1000);
    }
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Restaurar dados originais
    if (userDetails) {
      setEditForm({
        nome: userDetails.nome,
        email: userDetails.email,
        telefone: userDetails.telefone,
        cargo: userDetails.cargo,
        departamento: userDetails.departamento,
        status: userDetails.status,
        cpf: userDetails.dadosPessoais.cpf,
        dataNascimento: userDetails.dadosPessoais.dataNascimento,
        endereco: userDetails.dadosPessoais.endereco,
        cidade: userDetails.dadosPessoais.cidade,
        estado: userDetails.dadosPessoais.estado,
        cep: userDetails.dadosPessoais.cep,
        dataAdmissao: userDetails.dadosProfissionais.dataAdmissao,
        salario: userDetails.dadosProfissionais.salario,
        observacoes: ""
      });
    }
  };

  const handleSaveEdit = () => {
    // Aqui seria a lógica para salvar as alterações
    console.log("Salvando alterações:", editForm);
    
    // Atualizar os dados do usuário
    if (userDetails) {
      const updatedUser = {
        ...userDetails,
        nome: editForm.nome,
        email: editForm.email,
        telefone: editForm.telefone,
        cargo: editForm.cargo,
        departamento: editForm.departamento,
        status: editForm.status,
        dadosPessoais: {
          ...userDetails.dadosPessoais,
          nome: editForm.nome,
          email: editForm.email,
          telefone: editForm.telefone,
          cpf: editForm.cpf,
          dataNascimento: editForm.dataNascimento,
          endereco: editForm.endereco,
          cidade: editForm.cidade,
          estado: editForm.estado,
          cep: editForm.cep
        },
        dadosProfissionais: {
          ...userDetails.dadosProfissionais,
          cargo: editForm.cargo,
          departamento: editForm.departamento,
          dataAdmissao: editForm.dataAdmissao,
          salario: editForm.salario
        },
        observacoes: editForm.observacoes
      };
      setUserDetails(updatedUser);
    }
    
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800";
      case "Inativo":
        return "bg-red-100 text-red-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando detalhes do usuário...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!userDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Usuário não encontrado</h2>
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
                Detalhes do Usuário
              </h2>
              <p className="text-gray-600">
                {userDetails.nome} - {userDetails.cargo}
              </p>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <>
                  <button 
                    onClick={handleEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Resetar Senha
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Desativar
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Salvar
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Resumo do Usuário */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
              <div className="space-y-2">
                <p><span className="font-bold text-gray-900">Nome:</span> <span className="text-gray-900">{userDetails.nome}</span></p>
                <p><span className="font-bold text-gray-900">E-mail:</span> <span className="text-gray-900">{userDetails.email}</span></p>
                <p><span className="font-bold text-gray-900">Telefone:</span> <span className="text-gray-900">{userDetails.telefone}</span></p>
                <p><span className="font-bold text-gray-900">Status:</span> 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(userDetails.status)}`}>
                    {userDetails.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Informações Profissionais */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Profissionais</h3>
              <div className="space-y-2">
                <p><span className="font-bold text-gray-900">Cargo:</span> <span className="text-gray-900">{userDetails.cargo}</span></p>
                <p><span className="font-bold text-gray-900">Departamento:</span> <span className="text-gray-900">{userDetails.departamento}</span></p>
                <p><span className="font-bold text-gray-900">Data Cadastro:</span> <span className="text-gray-900">{new Date(userDetails.dataCadastro).toLocaleDateString('pt-BR')}</span></p>
                <p><span className="font-bold text-gray-900">Último Acesso:</span> <span className="text-gray-900">{userDetails.ultimoAcesso}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <p className="text-gray-900">{userDetails.dadosPessoais.nome}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <p className="text-gray-900">{userDetails.dadosPessoais.cpf}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <p className="text-gray-900">{new Date(userDetails.dadosPessoais.dataNascimento).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <p className="text-gray-900">{userDetails.dadosPessoais.telefone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <p className="text-gray-900">{userDetails.dadosPessoais.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <p className="text-gray-900">{userDetails.dadosPessoais.cep}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <p className="text-gray-900">{userDetails.dadosPessoais.endereco}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade/Estado</label>
              <p className="text-gray-900">{userDetails.dadosPessoais.cidade}/{userDetails.dadosPessoais.estado}</p>
            </div>
          </div>
        </div>

        {/* Dados Profissionais */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Dados Profissionais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
              <p className="text-gray-900">{userDetails.dadosProfissionais.cargo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <p className="text-gray-900">{userDetails.dadosProfissionais.departamento}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão</label>
              <p className="text-gray-900">{new Date(userDetails.dadosProfissionais.dataAdmissao).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salário</label>
              <p className="text-gray-900">{userDetails.dadosProfissionais.salario}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
              <p className="text-gray-900">{userDetails.dadosProfissionais.supervisor}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contrato</label>
              <p className="text-gray-900">{userDetails.dadosProfissionais.tipoContrato}</p>
            </div>
          </div>
        </div>

        {/* Permissões */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Permissões do Sistema</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {userDetails.permissoes.map((permissao) => (
              <div key={permissao} className="flex items-center p-3 bg-green-50 rounded-lg">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-green-800">{permissao}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Histórico do Usuário</h3>
          <div className="space-y-4">
            {userDetails.historico.map((item, index) => (
              <div key={index} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.acao}</h4>
                    <p className="text-sm text-gray-600">{item.observacoes}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{item.data}</p>
                    <p className="text-sm text-gray-500">{item.usuario}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
