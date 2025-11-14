import { useState } from "react";
import { useRouter } from "next/router";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";
import Switch from "../components/Switch";
import ResponsivePage from "../components/ResponsivePage";
import ResponsiveCard from "../components/ResponsiveCard";

interface ChannelStatus {
  enabled: boolean;
}

export default function NewAd() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    veiculoId: "",
    titulo: "",
    preco: "",
    descricao: "",
    cidade: "",
    estado: "",
    vendedor: "",
    telefone: "",
    email: "",
    observacoes: ""
  });
  const [channels, setChannels] = useState<Record<string, ChannelStatus>>({
    OLX: { enabled: false },
    Webmotors: { enabled: false },
    "Mercado Livre": { enabled: false }
  });

  // Mock de veículos disponíveis para anúncio
  const mockVeiculos = [
    { id: "V001", marca: "Toyota", modelo: "Corolla", ano: "2025", placa: "ABC-1234", preco: "R$ 168.890" },
    { id: "V002", marca: "Honda", modelo: "Civic", ano: "2024", placa: "DEF-5678", preco: "R$ 145.900" },
    { id: "V003", marca: "Volkswagen", modelo: "Golf", ano: "2023", placa: "GHI-9012", preco: "R$ 98.500" },
    { id: "V004", marca: "Ford", modelo: "Focus", ano: "2022", placa: "JKL-3456", preco: "R$ 75.900" },
    { id: "V005", marca: "Chevrolet", modelo: "Onix", ano: "2024", placa: "MNO-7890", preco: "R$ 89.900" },
    { id: "V006", marca: "Nissan", modelo: "Sentra", ano: "2023", placa: "PQR-1357", preco: "R$ 92.800" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "veiculoId") {
      const veiculoSelecionado = mockVeiculos.find(v => v.id === value);
      if (veiculoSelecionado) {
        setFormData(prev => ({
          ...prev,
          veiculoId: value,
          titulo: `${veiculoSelecionado.marca} ${veiculoSelecionado.modelo} ${veiculoSelecionado.ano}`,
          preco: veiculoSelecionado.preco
        }));
      }
    }
  };

  const handleChannelToggle = (channelName: string, enabled: boolean) => {
    setChannels(prev => ({
      ...prev,
      [channelName]: {
        enabled
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const enabledChannels = Object.entries(channels).filter(([_, status]) => status.enabled);
    
    if (enabledChannels.length === 0) {
      alert("Selecione pelo menos um canal para publicar o anúncio.");
      return;
    }
    
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
      const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
      
      for (const [channelName, channelStatus] of enabledChannels) {
        const adData = {
          company_id: user.company_id,
          vehicle_id: formData.veiculoId,
          platform: channelName,
          title: formData.titulo,
          description: formData.descricao,
          price: parseFloat(formData.preco.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
          status: channelStatus.enabled ? 'active' : 'paused',
          published_at: channelStatus.enabled ? new Date().toISOString() : null
        };
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/ads`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(adData)
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao criar anúncio no canal ${channelName}`);
        }
      }
      
      alert("Anúncio criado com sucesso!");
      router.push("/ads");
    } catch (error) {
      console.error('Erro ao criar anúncio:', error);
      alert("Erro ao criar anúncio. Tente novamente.");
    }
  };

  const handleCancel = () => {
    router.push("/ads");
  };

  return (
    <ResponsivePage
      title="Novo Anúncio"
      subtitle="Criar um novo anúncio para veículo"
      actions={
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            type="submit"
            form="new-ad-form"
          >
            Criar Anúncio
          </Button>
        </div>
      }
    >
      <form id="new-ad-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Informações do Veículo */}
        <ResponsiveCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Veículo</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Select
              label="Selecionar Veículo"
              name="veiculoId"
              value={formData.veiculoId}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione um veículo</option>
              {mockVeiculos.map((veiculo) => (
                <option key={veiculo.id} value={veiculo.id}>
                  {veiculo.marca} {veiculo.modelo} {veiculo.ano} - {veiculo.placa} - {veiculo.preco}
                </option>
              ))}
            </Select>
          </div>
        </ResponsiveCard>

        {/* Canais de Publicação */}
        <ResponsiveCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Canais de Publicação</h3>
          <p className="text-sm text-gray-600 mb-4">
            Selecione os canais onde deseja publicar este anúncio. Você pode habilitar ou desabilitar cada canal a qualquer momento.
          </p>
          <div className="space-y-4">
            {Object.entries(channels).map(([channelName, channelStatus]) => (
              <div key={channelName} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-base font-medium text-gray-900">{channelName}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {channelStatus.enabled ? "Publicado" : "Despublicado"}
                  </p>
                </div>
                <Switch
                  checked={channelStatus.enabled}
                  onChange={(e) => handleChannelToggle(channelName, e.target.checked)}
                />
              </div>
            ))}
          </div>
        </ResponsiveCard>

        {/* Detalhes do Anúncio */}
        <ResponsiveCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Anúncio</h3>
          <div className="space-y-4">
            <Input
              label="Título do Anúncio"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ex: Toyota Corolla 2.0 VVT-i Flex XEI Direct Shift"
              required
            />
            <Input
              label="Preço"
              name="preco"
              value={formData.preco}
              onChange={handleInputChange}
              placeholder="Ex: R$ 168.890"
              required
            />
            <Textarea
              label="Descrição"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              rows={4}
              placeholder="Descreva o veículo, suas características e condições..."
              required
            />
          </div>
        </ResponsiveCard>

        {/* Localização */}
        <ResponsiveCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Localização</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label="Cidade"
              name="cidade"
              value={formData.cidade}
              onChange={handleInputChange}
              placeholder="Ex: São Paulo"
              required
            />
            <Input
              label="Estado"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              placeholder="Ex: SP"
              required
            />
          </div>
        </ResponsiveCard>

        {/* Dados do Vendedor */}
        <ResponsiveCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Vendedor</h3>
          <div className="space-y-4">
            <Input
              label="Nome do Vendedor"
              name="vendedor"
              value={formData.vendedor}
              onChange={handleInputChange}
              placeholder="Ex: Concessionária Toyota"
              required
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                placeholder="Ex: (11) 99999-9999"
                required
              />
              <Input
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ex: vendas@toyota.com.br"
                required
              />
            </div>
          </div>
        </ResponsiveCard>

        {/* Observações Adicionais */}
        <ResponsiveCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações Adicionais</h3>
          <Textarea
            label="Observações"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            rows={3}
            placeholder="Informações adicionais sobre o anúncio, condições especiais, etc."
          />
        </ResponsiveCard>
      </form>
    </ResponsivePage>
  );
}
