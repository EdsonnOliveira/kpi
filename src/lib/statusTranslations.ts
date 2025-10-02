// Traduções dos status de vendas
export const salesStatusTranslations = {
  pending: 'Primeiro Contato',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  proposal_sent: 'Proposta Enviada',
  negotiation: 'Negociação',
  qualified: 'Qualificação',
  presentation: 'Apresentação',
  cancelled: 'Cancelada',
  lost: 'Perdida'
};

// Traduções dos status de propostas
export const proposalStatusTranslations = {
  pending: 'Pendente',
  accepted: 'Aceita',
  rejected: 'Rejeitada',
  expired: 'Expirada',
  negotiation: 'Em Negociação'
};

// Traduções dos status de veículos
export const vehicleStatusTranslations = {
  available: 'Disponível',
  sold: 'Vendido',
  reserved: 'Reservado',
  maintenance: 'Em Manutenção',
  unavailable: 'Indisponível'
};

// Traduções dos status de leads
export const leadStatusTranslations = {
  new: 'Novo',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  proposal_sent: 'Proposta Enviada',
  negotiation: 'Negociação',
  converted: 'Convertido',
  lost: 'Perdido'
};

// Traduções dos status de ordens de serviço
export const serviceOrderStatusTranslations = {
  pending: 'Aguardando',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  waiting_parts: 'Aguardando Peças',
  cancelled: 'Cancelada'
};

// Função genérica para traduzir status
export function translateStatus(status: string, type: 'sales' | 'proposals' | 'vehicles' | 'leads' | 'service_orders' = 'sales'): string {
  const translations = {
    sales: salesStatusTranslations,
    proposals: proposalStatusTranslations,
    vehicles: vehicleStatusTranslations,
    leads: leadStatusTranslations,
    service_orders: serviceOrderStatusTranslations
  };

  return translations[type][status as keyof typeof translations[typeof type]] || status;
}

// Função específica para status de vendas
export function translateSalesStatus(status: string): string {
  return salesStatusTranslations[status as keyof typeof salesStatusTranslations] || status;
}

// Função específica para status de ordens de serviço
export function translateServiceOrderStatus(status: string): string {
  return serviceOrderStatusTranslations[status as keyof typeof serviceOrderStatusTranslations] || status;
}

// Função para obter a cor do status
export function getStatusColor(status: string, type: 'sales' | 'proposals' | 'vehicles' | 'leads' | 'service_orders' = 'sales'): string {
  const colorMap = {
    sales: {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      proposal_sent: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-orange-100 text-orange-800',
      qualified: 'bg-indigo-100 text-indigo-800',
      presentation: 'bg-pink-100 text-pink-800',
      cancelled: 'bg-red-100 text-red-800',
      lost: 'bg-gray-100 text-gray-800'
    },
    proposals: {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      negotiation: 'bg-orange-100 text-orange-800'
    },
    vehicles: {
      available: 'bg-green-100 text-green-800',
      sold: 'bg-blue-100 text-blue-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-orange-100 text-orange-800',
      unavailable: 'bg-red-100 text-red-800'
    },
    leads: {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-indigo-100 text-indigo-800',
      proposal_sent: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-orange-100 text-orange-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    },
    service_orders: {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      waiting_parts: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
  };

  return colorMap[type][status as keyof typeof colorMap[typeof type]] || 'bg-gray-100 text-gray-800';
}
