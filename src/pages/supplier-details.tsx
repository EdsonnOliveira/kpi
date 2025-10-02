import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";

interface SupplierDetails {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  contato: string;
  categoria: string;
  status: string;
  dataCadastro: string;
  ultimaCompra: string;
  totalCompras: string;
  dadosCompletos: {
    inscricaoEstadual: string;
    inscricaoMunicipal: string;
    site: string;
    observacoes: string;
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: string;
  };
  produtos: {
    id: string;
    nome: string;
    categoria: string;
    preco: string;
    estoque: string;
    ultimaCompra: string;
  }[];
  historico: {
    data: string;
    acao: string;
    usuario: string;
    observacoes: string;
  }[];
}

export default function SupplierDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [supplierDetails, setSupplierDetails] = useState<SupplierDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    contato: "",
    categoria: "",
    status: "",
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
    site: "",
    observacoes: "",
    banco: "",
    agencia: "",
    conta: "",
    tipoConta: ""
  });

  useEffect(() => {
    if (id) {
      // Simular carregamento dos dados
      setTimeout(() => {
        const mockSupplierDetails: SupplierDetails = {
          id: id as string,
          nome: "Auto Peças SP Ltda",
          cnpj: "12.345.678/0001-90",
          email: "vendas@autopecassp.com.br",
          telefone: "(11) 3333-4444",
          endereco: "Rua das Peças, 1000",
          cidade: "São Paulo",
          estado: "SP",
          cep: "01234-567",
          contato: "João Silva",
          categoria: "Peças Automotivas",
          status: "Ativo",
          dataCadastro: "2023-01-15",
          ultimaCompra: "2025-01-10",
          totalCompras: "R$ 125.000,00",
          dadosCompletos: {
            inscricaoEstadual: "123.456.789.012",
            inscricaoMunicipal: "987.654.321",
            site: "www.autopecassp.com.br",
            observacoes: "Fornecedor confiável com entrega rápida e produtos de qualidade.",
            banco: "Banco do Brasil",
            agencia: "1234-5",
            conta: "12345-6",
            tipoConta: "Corrente"
          },
          produtos: [
            {
              id: "P001",
              nome: "Filtro de Óleo",
              categoria: "Filtros",
              preco: "R$ 25,00",
              estoque: "150 unidades",
              ultimaCompra: "2025-01-10"
            },
            {
              id: "P002",
              nome: "Pastilha de Freio",
              categoria: "Freios",
              preco: "R$ 85,00",
              estoque: "75 unidades",
              ultimaCompra: "2025-01-08"
            },
            {
              id: "P003",
              nome: "Vela de Ignição",
              categoria: "Motor",
              preco: "R$ 15,00",
              estoque: "200 unidades",
              ultimaCompra: "2025-01-05"
            }
          ],
          historico: [
            {
              data: "2025-01-10",
              acao: "Compra realizada",
              usuario: "Maria Santos",
              observacoes: "Compra de filtros e pastilhas de freio"
            },
            {
              data: "2025-01-08",
              acao: "Atualização de preços",
              usuario: "João Silva",
              observacoes: "Preços atualizados conforme tabela vigente"
            },
            {
              data: "2025-01-05",
              acao: "Cadastro de produto",
              usuario: "Ana Costa",
              observacoes: "Novo produto: Vela de Ignição"
            },
            {
              data: "2023-01-15",
              acao: "Fornecedor cadastrado",
              usuario: "Sistema",
              observacoes: "Cadastro inicial do fornecedor"
            }
          ]
        };
        setSupplierDetails(mockSupplierDetails);
        // Preencher o formulário de edição
        setEditForm({
          nome: mockSupplierDetails.nome,
          cnpj: mockSupplierDetails.cnpj,
          email: mockSupplierDetails.email,
          telefone: mockSupplierDetails.telefone,
          endereco: mockSupplierDetails.endereco,
          cidade: mockSupplierDetails.cidade,
          estado: mockSupplierDetails.estado,
          cep: mockSupplierDetails.cep,
          contato: mockSupplierDetails.contato,
          categoria: mockSupplierDetails.categoria,
          status: mockSupplierDetails.status,
          inscricaoEstadual: mockSupplierDetails.dadosCompletos.inscricaoEstadual,
          inscricaoMunicipal: mockSupplierDetails.dadosCompletos.inscricaoMunicipal,
          site: mockSupplierDetails.dadosCompletos.site,
          observacoes: mockSupplierDetails.dadosCompletos.observacoes,
          banco: mockSupplierDetails.dadosCompletos.banco,
          agencia: mockSupplierDetails.dadosCompletos.agencia,
          conta: mockSupplierDetails.dadosCompletos.conta,
          tipoConta: mockSupplierDetails.dadosCompletos.tipoConta
        });
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
    if (supplierDetails) {
      setEditForm({
        nome: supplierDetails.nome,
        cnpj: supplierDetails.cnpj,
        email: supplierDetails.email,
        telefone: supplierDetails.telefone,
        endereco: supplierDetails.endereco,
        cidade: supplierDetails.cidade,
        estado: supplierDetails.estado,
        cep: supplierDetails.cep,
        contato: supplierDetails.contato,
        categoria: supplierDetails.categoria,
        status: supplierDetails.status,
        inscricaoEstadual: supplierDetails.dadosCompletos.inscricaoEstadual,
        inscricaoMunicipal: supplierDetails.dadosCompletos.inscricaoMunicipal,
        site: supplierDetails.dadosCompletos.site,
        observacoes: supplierDetails.dadosCompletos.observacoes,
        banco: supplierDetails.dadosCompletos.banco,
        agencia: supplierDetails.dadosCompletos.agencia,
        conta: supplierDetails.dadosCompletos.conta,
        tipoConta: supplierDetails.dadosCompletos.tipoConta
      });
    }
  };

  const handleSaveEdit = () => {
    // Aqui seria a lógica para salvar as alterações
    console.log("Salvando alterações:", editForm);
    
    // Atualizar os dados do fornecedor
    if (supplierDetails) {
      const updatedSupplier = {
        ...supplierDetails,
        nome: editForm.nome,
        cnpj: editForm.cnpj,
        email: editForm.email,
        telefone: editForm.telefone,
        endereco: editForm.endereco,
        cidade: editForm.cidade,
        estado: editForm.estado,
        cep: editForm.cep,
        contato: editForm.contato,
        categoria: editForm.categoria,
        status: editForm.status,
        dadosCompletos: {
          ...supplierDetails.dadosCompletos,
          inscricaoEstadual: editForm.inscricaoEstadual,
          inscricaoMunicipal: editForm.inscricaoMunicipal,
          site: editForm.site,
          observacoes: editForm.observacoes,
          banco: editForm.banco,
          agencia: editForm.agencia,
          conta: editForm.conta,
          tipoConta: editForm.tipoConta
        }
      };
      setSupplierDetails(updatedSupplier);
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
      case "Suspenso":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando detalhes do fornecedor...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!supplierDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Fornecedor não encontrado</h1>
            <p className="text-gray-600 mt-2">O fornecedor solicitado não foi encontrado.</p>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
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
              <h1 className="text-3xl font-bold text-gray-900">Detalhes do Fornecedor</h1>
              <p className="text-gray-600 mt-2">
                Fornecedor #{supplierDetails.id} - {supplierDetails.nome}
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
                    Nova Compra
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Contatar
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informações Básicas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações Básicas</h3>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nome/Razão Social"
                    name="nome"
                    value={editForm.nome}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="CNPJ"
                    name="cnpj"
                    value={editForm.cnpj}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="E-mail"
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Telefone"
                    name="telefone"
                    value={editForm.telefone}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Contato"
                    name="contato"
                    value={editForm.contato}
                    onChange={handleInputChange}
                  />
                  <Select
                    label="Categoria"
                    name="categoria"
                    value={editForm.categoria}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione</option>
                    <option value="Peças Automotivas">Peças Automotivas</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Combustível">Combustível</option>
                    <option value="Seguros">Seguros</option>
                    <option value="Outros">Outros</option>
                  </Select>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome/Razão Social</label>
                    <p className="text-gray-900">{supplierDetails.nome}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                    <p className="text-gray-900">{supplierDetails.cnpj}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <p className="text-gray-900">{supplierDetails.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <p className="text-gray-900">{supplierDetails.telefone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contato</label>
                    <p className="text-gray-900">{supplierDetails.contato}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <p className="text-gray-900">{supplierDetails.categoria}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Endereço */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Endereço</h3>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Endereço"
                      name="endereco"
                      value={editForm.endereco}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Input
                    label="Cidade"
                    name="cidade"
                    value={editForm.cidade}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Estado"
                    name="estado"
                    value={editForm.estado}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="CEP"
                    name="cep"
                    value={editForm.cep}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                    <p className="text-gray-900">{supplierDetails.endereco}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <p className="text-gray-900">{supplierDetails.cidade}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <p className="text-gray-900">{supplierDetails.estado}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <p className="text-gray-900">{supplierDetails.cep}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Produtos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Produtos Fornecidos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estoque
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Compra
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supplierDetails.produtos.map((produto) => (
                      <tr key={produto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {produto.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {produto.categoria}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {produto.preco}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {produto.estoque}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(produto.ultimaCompra).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-8">
            {/* Status e Resumo */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status e Resumo</h3>
              <div className="space-y-4">
                {isEditing ? (
                  <Select
                    label="Status"
                    name="status"
                    value={editForm.status}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Suspenso">Suspenso</option>
                  </Select>
                ) : (
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplierDetails.status)}`}>
                      {supplierDetails.status}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Data de Cadastro:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(supplierDetails.dataCadastro).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Última Compra:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(supplierDetails.ultimaCompra).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total de Compras:</span>
                  <span className="ml-2 text-gray-900 font-semibold">{supplierDetails.totalCompras}</span>
                </div>
              </div>
            </div>

            {/* Dados Completos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Completos</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Inscrição Estadual"
                    name="inscricaoEstadual"
                    value={editForm.inscricaoEstadual}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Inscrição Municipal"
                    name="inscricaoMunicipal"
                    value={editForm.inscricaoMunicipal}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Site"
                    name="site"
                    value={editForm.site}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Banco"
                    name="banco"
                    value={editForm.banco}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Agência"
                    name="agencia"
                    value={editForm.agencia}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Conta"
                    name="conta"
                    value={editForm.conta}
                    onChange={handleInputChange}
                  />
                  <Select
                    label="Tipo de Conta"
                    name="tipoConta"
                    value={editForm.tipoConta}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione</option>
                    <option value="Corrente">Corrente</option>
                    <option value="Poupança">Poupança</option>
                  </Select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Inscrição Estadual:</span>
                    <span className="ml-2 text-gray-900">{supplierDetails.dadosCompletos.inscricaoEstadual}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Inscrição Municipal:</span>
                    <span className="ml-2 text-gray-900">{supplierDetails.dadosCompletos.inscricaoMunicipal}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Site:</span>
                    <span className="ml-2 text-gray-900">{supplierDetails.dadosCompletos.site}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Banco:</span>
                    <span className="ml-2 text-gray-900">{supplierDetails.dadosCompletos.banco}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Agência:</span>
                    <span className="ml-2 text-gray-900">{supplierDetails.dadosCompletos.agencia}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Conta:</span>
                    <span className="ml-2 text-gray-900">{supplierDetails.dadosCompletos.conta}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tipo de Conta:</span>
                    <span className="ml-2 text-gray-900">{supplierDetails.dadosCompletos.tipoConta}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Observações */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
              {isEditing ? (
                <Textarea
                  label="Observações"
                  name="observacoes"
                  value={editForm.observacoes}
                  onChange={handleInputChange}
                  rows={4}
                />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {supplierDetails.dadosCompletos.observacoes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Histórico */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Histórico do Fornecedor</h3>
          <div className="space-y-4">
            {supplierDetails.historico.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{item.acao}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(item.data).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.observacoes}</p>
                  <p className="text-xs text-gray-500 mt-1">Por: {item.usuario}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
