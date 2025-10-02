import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { translateStatus, getStatusColor } from "../lib/statusTranslations";

interface ScheduleDetails {
  id: string;
  cliente: string;
  veiculo: string;
  placa: string;
  data: string;
  hora: string;
  tipoServico: string;
  mecanico: string;
  status: string;
  observacoes: string;
  telefone: string;
  email: string;
  dadosCliente: {
    nome: string;
    telefone: string;
    telefone2: string;
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
  dadosServico: {
    tipo: string;
    descricao: string;
    previsao: string;
    prioridade: string;
    observacoes: string;
  };
  historico: {
    data: string;
    acao: string;
    usuario: string;
    observacoes: string;
  }[];
}

export default function ScheduleDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [scheduleDetails, setScheduleDetails] = useState<ScheduleDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Simular carregamento dos dados
      setTimeout(() => {
        const mockScheduleDetails: ScheduleDetails = {
          id: id as string,
          cliente: "Fernanda Lima",
          veiculo: "Nissan Sentra 2021",
          placa: "JKL-3456",
          data: "2025-09-27",
          hora: "08:00",
          tipoServico: "Manutenção",
          mecanico: "Maria Silva",
          status: "Agendado",
          observacoes: "Troca de óleo e filtros",
          telefone: "(11) 66666-6666",
          email: "fernanda.lima@email.com",
          dadosCliente: {
            nome: "Fernanda Lima",
            telefone: "(11) 66666-6666",
            telefone2: "(11) 55555-5555",
            email: "fernanda.lima@email.com",
            cpf: "987.654.321-00",
            endereco: "Rua das Palmeiras, 456",
            cidade: "São Paulo",
            estado: "SP",
            cep: "04567-890"
          },
          dadosVeiculo: {
            marca: "Nissan",
            modelo: "Sentra",
            ano: "2021",
            cor: "Prata",
            placa: "JKL-3456",
            km: "25.000",
            combustivel: "Flex",
            categoria: "Sedan"
          },
          dadosServico: {
            tipo: "Manutenção",
            descricao: "Troca de óleo e filtros",
            previsao: "1 hora",
            prioridade: "Normal",
            observacoes: "Manutenção preventiva solicitada pelo cliente"
          },
          historico: [
            {
              data: "25/09/2025 14:30",
              acao: "Agendamento Confirmado",
              usuario: "Maria Santos",
              observacoes: "Cliente confirmou o agendamento para 27/09 às 09:00"
            },
            {
              data: "24/09/2025 16:45",
              acao: "Agendamento Criado",
              usuario: "Maria Santos",
              observacoes: "Agendamento criado após contato telefônico"
            },
            {
              data: "24/09/2025 10:15",
              acao: "Primeiro Contato",
              usuario: "Maria Santos",
              observacoes: "Cliente demonstrou interesse em agendar revisão"
            }
          ]
        };
        setScheduleDetails(mockScheduleDetails);
        setIsLoading(false);
      }, 1000);
    }
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Agendado":
        return "bg-blue-100 text-blue-800";
      case "Confirmado":
        return "bg-green-100 text-green-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelado":
        return "bg-red-100 text-red-800";
      case "Concluído":
        return "bg-gray-100 text-gray-800";
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
              <p className="text-gray-600">Carregando detalhes do agendamento...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!scheduleDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agendamento não encontrado</h2>
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
                Detalhes do Agendamento
              </h2>
              <p className="text-gray-600">
                Agendamento #{scheduleDetails.id} - {scheduleDetails.cliente}
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Reagendar
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Confirmar
              </button>
            </div>
          </div>
        </div>

        {/* Resumo do Agendamento */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              {/* Informações do Cliente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Cliente</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">Nome:</span> <span className="text-gray-900">{scheduleDetails.cliente}</span></p>
                  <p><span className="font-bold text-gray-900">Telefone:</span> <span className="text-gray-900">{scheduleDetails.telefone}</span></p>
                  <p><span className="font-bold text-gray-900">E-mail:</span> <span className="text-gray-900">{scheduleDetails.email}</span></p>
                </div>
              </div>

              {/* Informações do Serviço */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Serviço</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">Data:</span> <span className="text-gray-900">{new Date(scheduleDetails.data).toLocaleDateString('pt-BR')}</span></p>
                  <p><span className="font-bold text-gray-900">Hora:</span> <span className="text-gray-900">{scheduleDetails.hora}</span></p>
                  <p><span className="font-bold text-gray-900">Tipo:</span> <span className="text-gray-900">{scheduleDetails.tipoServico}</span></p>
                  <p><span className="font-bold text-gray-900">Mecânico:</span> <span className="text-gray-900">{scheduleDetails.mecanico}</span></p>
                </div>
              </div>

              {/* Observações */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
                <p className="text-gray-600">{scheduleDetails.observacoes}</p>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              {/* Informações do Veículo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Veículo</h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-900">Veículo:</span> <span className="text-gray-900">{scheduleDetails.veiculo}</span></p>
                  <p><span className="font-bold text-gray-900">Placa:</span> <span className="text-gray-900">{scheduleDetails.placa}</span></p>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(scheduleDetails.status || '')}`}>
                  {translateStatus(scheduleDetails.status || '', 'vehicles')}
                </span>
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
              <p className="text-gray-900">{scheduleDetails.dadosCliente.nome}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <p className="text-gray-900">{scheduleDetails.dadosCliente.cpf}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Principal</label>
              <p className="text-gray-900">{scheduleDetails.dadosCliente.telefone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Secundário</label>
              <p className="text-gray-900">{scheduleDetails.dadosCliente.telefone2}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <p className="text-gray-900">{scheduleDetails.dadosCliente.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <p className="text-gray-900">{scheduleDetails.dadosCliente.cep}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <p className="text-gray-900">{scheduleDetails.dadosCliente.endereco}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade/Estado</label>
              <p className="text-gray-900">{scheduleDetails.dadosCliente.cidade}/{scheduleDetails.dadosCliente.estado}</p>
            </div>
          </div>
        </div>

        {/* Dados do Veículo */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Dados do Veículo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca/Modelo</label>
              <p className="text-gray-900">{scheduleDetails.dadosVeiculo.marca} {scheduleDetails.dadosVeiculo.modelo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <p className="text-gray-900">{scheduleDetails.dadosVeiculo.ano}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <p className="text-gray-900">{scheduleDetails.dadosVeiculo.cor}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
              <p className="text-gray-900">{scheduleDetails.dadosVeiculo.placa}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">KM</label>
              <p className="text-gray-900">{scheduleDetails.dadosVeiculo.km}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Combustível</label>
              <p className="text-gray-900">{scheduleDetails.dadosVeiculo.combustivel}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <p className="text-gray-900">{scheduleDetails.dadosVeiculo.categoria}</p>
            </div>
          </div>
        </div>

        {/* Dados do Serviço */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Dados do Serviço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Serviço</label>
              <p className="text-gray-900">{scheduleDetails.dadosServico.tipo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Previsão</label>
              <p className="text-gray-900">{scheduleDetails.dadosServico.previsao}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <p className="text-gray-900">{scheduleDetails.dadosServico.prioridade}</p>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <p className="text-gray-900">{scheduleDetails.dadosServico.descricao}</p>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações do Serviço</label>
            <p className="text-gray-900">{scheduleDetails.dadosServico.observacoes}</p>
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Histórico do Agendamento</h3>
          <div className="space-y-4">
            {scheduleDetails.historico.map((item, index) => (
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
