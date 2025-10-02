import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { translateServiceOrderStatus, getStatusColor } from "../lib/statusTranslations";

interface ServiceOrderDetails {
  id: string;
  numero: string;
  cliente: string;
  veiculo: string;
  placa: string;
  dataEntrada: string;
  previsao: string;
  mecanico: string;
  tipo: string;
  status: string;
  observacoes: string;
  dadosCliente: {
    nome: string;
    telefone: string;
    email: string;
    cpf: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  dadosVeiculo: {
    marca: string;
    modelo: string;
    ano: string;
    cor: string;
    placa: string;
    km: string;
    combustivel: string;
    categoria: string;
  };
  itens: {
    id: string;
    descricao: string;
    quantidade: number;
    precoUnitario: string;
    precoTotal: string;
    tipo: string;
  }[];
  historico: {
    data: string;
    acao: string;
    usuario: string;
    observacoes: string;
  }[];
}

export default function ServiceOrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [serviceOrderDetails, setServiceOrderDetails] = useState<ServiceOrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Simular carregamento dos dados
      setTimeout(() => {
        const mockServiceOrderDetails: ServiceOrderDetails = {
          id: id as string,
          numero: "OS-2025-001",
          cliente: "João Silva",
          veiculo: "Toyota Corolla 2023",
          placa: "ABC-1234",
          dataEntrada: "2025-09-25",
          previsao: "2025-09-27",
          mecanico: "Carlos Santos",
          tipo: "Revisão",
          status: "Em Andamento",
          observacoes: "Cliente solicitou revisão completa do veículo com 15.000 km.",
          dadosCliente: {
            nome: "João Silva",
            telefone: "(11) 99999-9999",
            email: "joao.silva@email.com",
            cpf: "123.456.789-00",
            endereco: "Rua das Flores, 123",
            cidade: "São Paulo",
            estado: "SP",
            cep: "01234-567"
          },
          dadosVeiculo: {
            marca: "Toyota",
            modelo: "Corolla",
            ano: "2023",
            cor: "Preto",
            placa: "ABC-1234",
            km: "15.000",
            combustivel: "Flex",
            categoria: "Sedan"
          },
          itens: [
            {
              id: "1",
              descricao: "Troca de óleo do motor",
              quantidade: 1,
              precoUnitario: "R$ 45,00",
              precoTotal: "R$ 45,00",
              tipo: "Serviço"
            },
            {
              id: "2",
              descricao: "Filtro de óleo",
              quantidade: 1,
              precoUnitario: "R$ 25,00",
              precoTotal: "R$ 25,00",
              tipo: "Peça"
            },
            {
              id: "3",
              descricao: "Inspeção geral do veículo",
              quantidade: 1,
              precoUnitario: "R$ 80,00",
              precoTotal: "R$ 80,00",
              tipo: "Serviço"
            },
            {
              id: "4",
              descricao: "Lavagem completa",
              quantidade: 1,
              precoUnitario: "R$ 30,00",
              precoTotal: "R$ 30,00",
              tipo: "Serviço"
            }
          ],
          historico: [
            {
              data: "25/09/2025 14:30",
              acao: "OS Criada",
              usuario: "Maria Santos",
              observacoes: "Ordem de serviço criada para revisão do veículo"
            },
            {
              data: "25/09/2025 15:00",
              acao: "OS Iniciada",
              usuario: "Carlos Santos",
              observacoes: "Mecânico iniciou os trabalhos na OS"
            },
            {
              data: "26/09/2025 09:00",
              acao: "Serviços Executados",
              usuario: "Carlos Santos",
              observacoes: "Troca de óleo e filtro realizados"
            }
          ]
        };
        setServiceOrderDetails(mockServiceOrderDetails);
        setIsLoading(false);
      }, 1000);
    }
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em Andamento":
        return "bg-blue-100 text-blue-800";
      case "Concluída":
        return "bg-green-100 text-green-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "Serviço":
        return "bg-blue-100 text-blue-800";
      case "Peça":
        return "bg-green-100 text-green-800";
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
              <p className="text-gray-600">Carregando detalhes da ordem de serviço...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!serviceOrderDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ordem de serviço não encontrada</h2>
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
                Detalhes da Ordem de Serviço
              </h2>
              <p className="text-gray-600">
                {serviceOrderDetails.numero} - {serviceOrderDetails.cliente}
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Editar
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Imprimir
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Finalizar
              </button>
            </div>
          </div>
        </div>

        {/* Resumo da OS */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informações do Cliente */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Cliente</h3>
              <div className="space-y-2">
                <p><span className="font-medium text-gray-900">Cliente:</span> <span className="text-gray-900">{serviceOrderDetails.cliente}</span></p>
                <p><span className="font-medium text-gray-900">Veículo:</span> <span className="text-gray-900">{serviceOrderDetails.veiculo}</span></p>
                <p><span className="font-medium text-gray-900">Placa:</span> <span className="text-gray-900">{serviceOrderDetails.placa}</span></p>
              </div>
            </div>

            {/* Informações da OS */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da OS</h3>
              <div className="space-y-2">
                <p><span className="font-medium text-gray-900">Data Entrada:</span> <span className="text-gray-900">{new Date(serviceOrderDetails.dataEntrada).toLocaleDateString('pt-BR')}</span></p>
                <p><span className="font-medium text-gray-900">Previsão:</span> <span className="text-gray-900">{new Date(serviceOrderDetails.previsao).toLocaleDateString('pt-BR')}</span></p>
                <p><span className="font-medium text-gray-900">Mecânico:</span> <span className="text-gray-900">{serviceOrderDetails.mecanico}</span></p>
                <p><span className="font-medium text-gray-900">Tipo:</span> <span className="text-gray-900">{serviceOrderDetails.tipo}</span></p>
                <p><span className="font-medium text-gray-900">Status:</span> 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(serviceOrderDetails.status || '')}`}>
                    {translateServiceOrderStatus(serviceOrderDetails.status || '')}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Dados do Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosCliente.nome}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosCliente.cpf}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosCliente.telefone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosCliente.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosCliente.cep}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosCliente.endereco}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade/Estado</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosCliente.cidade}/{serviceOrderDetails.dadosCliente.estado}</p>
            </div>
          </div>
        </div>

        {/* Dados do Veículo */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Dados do Veículo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca/Modelo</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosVeiculo.marca} {serviceOrderDetails.dadosVeiculo.modelo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosVeiculo.ano}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosVeiculo.cor}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosVeiculo.placa}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">KM</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosVeiculo.km}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Combustível</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosVeiculo.combustivel}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <p className="text-gray-900">{serviceOrderDetails.dadosVeiculo.categoria}</p>
            </div>
          </div>
        </div>

        {/* Itens da Ordem de Serviço */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Itens da Ordem de Serviço</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Unitário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceOrderDetails.itens.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.descricao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.precoUnitario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.precoTotal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(item.tipo)}`}>
                        {item.tipo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    Total:
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    R$ {serviceOrderDetails.itens.reduce((total, item) => {
                      const preco = parseFloat(item.precoTotal.replace('R$ ', '').replace(',', '.'));
                      return total + preco;
                    }, 0).toFixed(2).replace('.', ',')}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
          <p className="text-gray-600">{serviceOrderDetails.observacoes}</p>
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Histórico da OS</h3>
          <div className="space-y-4">
            {serviceOrderDetails.historico.map((item, index) => (
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
