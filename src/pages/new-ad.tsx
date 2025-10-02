import { useState } from "react";
import { useRouter } from "next/router";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";
import ResponsivePage from "../components/ResponsivePage";
import ResponsiveCard from "../components/ResponsiveCard";

export default function NewAd() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    veiculoId: "",
    canal: "",
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

    // Auto-preencher dados quando selecionar um veículo
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aqui seria a lógica para criar o anúncio
    console.log("Criando novo anúncio:", formData);
    
    // Simular criação do anúncio
    alert("Anúncio criado com sucesso!");
    
    // Redirecionar para a página de anúncios
    router.push("/ads");
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
            <Select
              label="Canal de Anúncio"
              name="canal"
              value={formData.canal}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione o canal</option>
              <option value="OLX">OLX</option>
              <option value="Webmotors">Webmotors</option>
              <option value="Mercado Livre">Mercado Livre</option>
            </Select>
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
