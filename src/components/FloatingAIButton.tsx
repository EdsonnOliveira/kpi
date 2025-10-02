import { useState } from "react";
import { useRouter } from "next/router";

interface FloatingAIButtonProps {
  className?: string;
}

export default function FloatingAIButton({ className = "" }: FloatingAIButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const suggestions = [
    {
      title: "Criar novo cliente",
      description: "Cadastrar um novo cliente no sistema",
      action: () => router.push("/attendance-form"),
      icon: "👤"
    },
    {
      title: "Ver vendas do mês",
      description: "Visualizar relatório de vendas",
      action: () => router.push("/sales"),
      icon: "💰"
    },
    {
      title: "Agendar serviço",
      description: "Criar novo agendamento na oficina",
      action: () => router.push("/schedule"),
      icon: "📅"
    },
    {
      title: "Cadastrar veículo",
      description: "Adicionar novo veículo ao estoque",
      action: () => router.push("/vehicles"),
      icon: "🚗"
    },
    {
      title: "Ver faturamento",
      description: "Consultar evolução do faturamento",
      action: () => router.push("/revenue-evolution"),
      icon: "📊"
    },
    {
      title: "Criar anúncio",
      description: "Publicar veículo em marketplace",
      action: () => router.push("/ads"),
      icon: "📢"
    },
    {
      title: "Ver DRE",
      description: "Consultar demonstração de resultado",
      action: () => router.push("/dre"),
      icon: "📈"
    },
    {
      title: "Gerenciar leads",
      description: "Visualizar e gerenciar leads",
      action: () => router.push("/leads"),
      icon: "🎯"
    },
    {
      title: "Ver estoque de peças",
      description: "Consultar peças disponíveis",
      action: () => router.push("/parts"),
      icon: "🔧"
    },
    {
      title: "Ordens de serviço",
      description: "Gerenciar ordens de serviço",
      action: () => router.push("/service-orders"),
      icon: "📋"
    },
    {
      title: "Contas a pagar",
      description: "Visualizar contas a pagar",
      action: () => router.push("/accounts"),
      icon: "💳"
    },
    {
      title: "Configurações",
      description: "Acessar configurações do sistema",
      action: () => router.push("/settings"),
      icon: "⚙️"
    }
  ];

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    suggestion.action();
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Aqui seria a lógica para processar a consulta da IA
      console.log("Consulta da IA:", query);
      
      // Simular processamento da IA
      const lowerQuery = query.toLowerCase();
      
      if (lowerQuery.includes("cliente") || lowerQuery.includes("cadastrar")) {
        router.push("/attendance-form");
      } else if (lowerQuery.includes("venda") || lowerQuery.includes("vender")) {
        router.push("/sales");
      } else if (lowerQuery.includes("agendar") || lowerQuery.includes("agendamento")) {
        router.push("/schedule");
      } else if (lowerQuery.includes("veículo") || lowerQuery.includes("carro")) {
        router.push("/vehicles");
      } else if (lowerQuery.includes("faturamento") || lowerQuery.includes("receita")) {
        router.push("/revenue-evolution");
      } else if (lowerQuery.includes("anúncio") || lowerQuery.includes("publicar")) {
        router.push("/ads");
      } else if (lowerQuery.includes("dre") || lowerQuery.includes("resultado")) {
        router.push("/dre");
      } else if (lowerQuery.includes("lead") || lowerQuery.includes("prospect")) {
        router.push("/leads");
      } else if (lowerQuery.includes("peça") || lowerQuery.includes("estoque")) {
        router.push("/parts");
      } else if (lowerQuery.includes("ordem") || lowerQuery.includes("serviço")) {
        router.push("/service-orders");
      } else if (lowerQuery.includes("conta") || lowerQuery.includes("pagar")) {
        router.push("/accounts");
      } else if (lowerQuery.includes("configuração") || lowerQuery.includes("config")) {
        router.push("/settings");
      } else {
        // Resposta genérica para consultas não reconhecidas
        alert(`Consulta recebida: "${query}". Em breve implementaremos processamento de IA mais avançado!`);
      }
      
      setQuery("");
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 z-40 no-print ${className}`}
        title="Assistente IA"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>

      {/* Modal da IA */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-800/70 overflow-y-auto h-full w-full z-50 no-print">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-11/12 sm:w-10/12 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Assistente IA</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Como posso ajudá-lo hoje?</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Input de Consulta */}
              <form onSubmit={handleSubmit} className="mb-4 sm:mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Digite o que você quer fazer..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 text-primary hover:bg-primary hover:text-white rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Sugestões */}
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Sugestões populares:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-64 sm:max-h-96 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-start p-2 sm:p-3 text-left border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors group"
                    >
                      <span className="text-lg sm:text-2xl mr-2 sm:mr-3 group-hover:scale-110 transition-transform flex-shrink-0">
                        {suggestion.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {suggestion.title}
                        </h5>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                          {suggestion.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500 text-center">
                  💡 Dica: Você pode digitar comandos em linguagem natural ou usar as sugestões acima
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
