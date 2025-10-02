import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Select from "../components/Select";
import Input from "../components/Input";
import AutocompleteInput from "../components/AutocompleteInput";
import Textarea from "../components/Textarea";
import Checkbox from "../components/Checkbox";
import Radio from "../components/Radio";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

interface AttendanceFormData {
  id?: string;
  customer_name: string;
  email: string;
  phone: string;
  contact_method: string;
  attraction_media: string;
  seller: string;
  type: string;
  brand: string;
  model: string;
  year: number | string;
  vehicle_type: string;
  price_range: string;
  queue_brand: string;
  queue_model: string;
  queue_version: string;
  queue_color: string;
  queue_price_from: string;
  queue_price_to: string;
  appointment_date: string;
  status: string;
  notes: string;
  created_at?: string;
}

export default function AttendanceForm() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, authenticatedFetch } = useAuth();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("agendamentos");
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [attendanceForms, setAttendanceForms] = useState<AttendanceFormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Estados para opções dinâmicas
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  const [contactMethods, setContactMethods] = useState<string[]>([]);
  const [attractionMedia, setAttractionMedia] = useState<string[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [versions, setVersions] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<{id: string, name: string}[]>([]);
  
  // Estados para dados de autocomplete da tabela vehicles_search
  const [vehicleSearchData, setVehicleSearchData] = useState<{
    brands: string[];
    models: string[];
    years: string[];
    priceRanges: string[];
  }>({
    brands: [],
    models: [],
    years: [],
    priceRanges: []
  });

  const [formData, setFormData] = useState<AttendanceFormData>({
    customer_name: "",
    email: "",
    phone: "",
    contact_method: "",
    attraction_media: "",
    seller: "",
    type: "",
    brand: "",
    model: "",
    year: "",
    vehicle_type: "",
    price_range: "",
    queue_brand: "",
    queue_model: "",
    queue_version: "",
    queue_color: "",
    queue_price_from: "",
    queue_price_to: "",
    appointment_date: "",
    status: "pending",
    notes: ""
  });

  // useEffect para buscar dados ao carregar a página
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAttendanceForms();
      fetchDynamicOptions();
    }
  }, [isAuthenticated, user]);

  // Estado para armazenar todos os dados brutos
  const [allVehicleData, setAllVehicleData] = useState<any[]>([]);

  // Função para buscar dados da tabela vehicles_search para autocomplete
  const fetchVehicleSearchData = async () => {
    try {
      console.log('Iniciando busca de dados da vehicles_search...');
      
      // Buscar todos os dados de uma vez e filtrar no frontend
      const { data: allData, error } = await supabase
        .from('vehicles_search')
        .select('brand, model, version, year, price')
        .limit(1000);
      
      if (error) {
        console.error('Erro ao buscar dados:', error);
        return;
      }
      
      if (allData) {
        setAllVehicleData(allData); // Armazenar dados brutos
        
        // Extrair marcas únicas
        const uniqueBrands = [...new Set(allData.map((v: any) => v.brand).filter(Boolean))] as string[];
        uniqueBrands.sort(); // Ordenar alfabeticamente
        
        // Extrair modelos únicos com versão
        const uniqueModels = [...new Set(allData.map((v: any) => {
          if (v.model && v.version) {
            return `${v.model} - ${v.version}`;
          }
          return v.model;
        }).filter(Boolean))] as string[];
        uniqueModels.sort(); // Ordenar alfabeticamente
        
        // Extrair anos únicos
        const uniqueYears = [...new Set(allData.map((v: any) => v.year?.toString()).filter(Boolean))] as string[];
        uniqueYears.sort((a, b) => parseInt(b) - parseInt(a)); // Ordenar decrescente
        
        // Extrair faixas de preço únicas (agrupadas por faixas)
        const prices = allData.map((v: any) => v.price).filter(Boolean);
        const priceRanges = [...new Set(prices.map((price: number) => {
          if (price < 50000) return 'Até R$ 50.000';
          if (price < 100000) return 'R$ 50.000 - R$ 100.000';
          if (price < 150000) return 'R$ 100.000 - R$ 150.000';
          if (price < 200000) return 'R$ 150.000 - R$ 200.000';
          if (price < 250000) return 'R$ 200.000 - R$ 250.000';
          return 'Acima de R$ 250.000';
        }))] as string[];
        
        setVehicleSearchData({
          brands: uniqueBrands,
          models: uniqueModels,
          years: uniqueYears,
          priceRanges: priceRanges
        });
      }
    } catch (err) {
      console.error('Erro ao buscar dados de veículos para autocomplete:', err);
    }
  };

  // Função para filtrar dados baseado nas seleções atuais
  const filterVehicleData = (selectedBrand?: string, selectedModel?: string, selectedYear?: string) => {
    if (!allVehicleData.length) return;

    let filteredData = allVehicleData;

    // Filtrar por marca se selecionada
    if (selectedBrand) {
      filteredData = filteredData.filter(item => item.brand === selectedBrand);
    }

    // Filtrar por modelo se selecionado
    if (selectedModel) {
      // Se o modelo selecionado contém " - ", extrair modelo e versão
      if (selectedModel.includes(' - ')) {
        const [model, version] = selectedModel.split(' - ');
        filteredData = filteredData.filter(item => item.model === model && item.version === version);
      } else {
        filteredData = filteredData.filter(item => item.model === selectedModel);
      }
    }

    // Filtrar por ano se selecionado
    if (selectedYear) {
      filteredData = filteredData.filter(item => item.year?.toString() === selectedYear);
    }

    // Extrair opções únicas dos dados filtrados
    const brands = selectedBrand ? [selectedBrand] : [...new Set(filteredData.map(v => v.brand).filter(Boolean))].sort();
    const models = selectedModel ? [selectedModel] : [...new Set(filteredData.map(v => {
      if (v.model && v.version) {
        return `${v.model} - ${v.version}`;
      }
      return v.model;
    }).filter(Boolean))].sort();
    const years = selectedYear ? [selectedYear] : [...new Set(filteredData.map(v => v.year?.toString()).filter(Boolean))].sort((a, b) => parseInt(b) - parseInt(a));
    
    // Calcular faixas de preço dos dados filtrados
    const prices = filteredData.map(v => v.price).filter(Boolean);
    const priceRanges = [...new Set(prices.map((price: number) => {
      if (price < 50000) return 'Até R$ 50.000';
      if (price < 100000) return 'R$ 50.000 - R$ 100.000';
      if (price < 150000) return 'R$ 100.000 - R$ 150.000';
      if (price < 200000) return 'R$ 150.000 - R$ 200.000';
      if (price < 250000) return 'R$ 200.000 - R$ 250.000';
      return 'Acima de R$ 250.000';
    }))].sort();

    setVehicleSearchData({
      brands,
      models,
      years,
      priceRanges
    });
  };

  // Função para buscar opções dinâmicas
  const fetchDynamicOptions = async () => {
    try {
      if (!user) return;

      // Buscar dados da tabela vehicles_search
      await fetchVehicleSearchData();

      // Buscar usuários (vendedores)
      const usersResponse = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/users?company_id=eq.${user.company_id}&select=id,name&order=name.asc`);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Buscar fornecedores
      const suppliersResponse = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/suppliers?company_id=eq.${user.company_id}&select=id,name&order=name.asc`);
      if (suppliersResponse.ok) {
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData);
      }

      // Buscar veículos para extrair marcas e modelos
      const vehiclesResponse = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/vehicles?company_id=eq.${user.company_id}&select=brand,model,version,color&order=brand.asc`);
      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        
        // Extrair marcas únicas
        const uniqueBrands = [...new Set(vehiclesData.map((v: any) => v.brand).filter(Boolean))] as string[];
        setBrands(uniqueBrands);
        
        // Extrair modelos únicos
        const uniqueModels = [...new Set(vehiclesData.map((v: any) => v.model).filter(Boolean))] as string[];
        setModels(uniqueModels);
        
        // Extrair versões únicas
        const uniqueVersions = [...new Set(vehiclesData.map((v: any) => v.version).filter(Boolean))] as string[];
        setVersions(uniqueVersions);
        
        // Extrair cores únicas
        const uniqueColors = [...new Set(vehiclesData.map((v: any) => v.color).filter(Boolean))] as string[];
        setColors(uniqueColors);
      }

      // Opções fixas que podem ser configuradas no futuro
      setContactMethods([
        "WhatsApp",
        "Whatsapp Recebido", 
        "Telefonema dado",
        "Whatsapp Enviado",
        "Showroom",
        "Lead",
        "Telefonema recebido"
      ]);

      setAttractionMedia([
        "Icarros",
        "Webmotors",
        "Olx Ativo",
        "Teste 10/07",
        "Instagram",
        "Cliente de carteira",
        "OLX"
      ]);

      setVehicleTypes([
        "Conversível / Cupê",
        "Hatch",
        "Minivan",
        "Picapes",
        "Sedã",
        "SUV / Utilitário Esportivo",
        "Van / Utilitário",
        "Wagon / Perua"
      ]);

      setPaymentMethods([
        "deposito",
        "dinheiro",
        "cartao",
        "pix",
        "transferencia"
      ]);

    } catch (err) {
      console.error('Erro ao buscar opções dinâmicas:', err);
    }
  };

  const tabs = [
    { id: "agendamentos", label: "Agendamentos" },
    { id: "bolsao-cliente", label: "Bolsão de Cliente" },
    { id: "bolsao-tradein", label: "Bolsão de Trade In" },
    { id: "vendas-perdidas", label: "Vendas Perdidas" }
  ];

  // Função para buscar dados do banco
  const fetchAttendanceForms = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (!user) {
        return;
      }
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/attendance_forms?company_id=eq.${user.company_id}&order=created_at.desc`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar fichas de atendimento');
      }
      
      const data = await response.json();
      setAttendanceForms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar (inserir ou editar)
  const saveAttendanceForm = async () => {
    try {
      setError("");
      setSuccessMessage("");
      
      if (!user) {
        return;
      }

      // Validar faixa de preço se ambos os campos estiverem preenchidos
      if (formData.queue_price_from && formData.queue_price_to && !validatePriceRange(formData.queue_price_from, formData.queue_price_to)) {
        setError("O valor DE deve ser menor que o valor ATÉ na fila de espera.");
        return;
      }
      
      const dataToSave = {
        ...formData,
        company_id: user.company_id,
        year: formData.year ? parseInt(formData.year.toString()) : null
      };
      
      let response;
      
      if (isEditing && selectedRecord) {
        // Editar registro existente
        response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/attendance_forms?id=eq.${selectedRecord}`, {
          method: 'PATCH',
          body: JSON.stringify(dataToSave)
        });
      } else {
        // Inserir novo registro
        response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/attendance_forms`, {
          method: 'POST',
          body: JSON.stringify(dataToSave)
        });
      }
      
      if (!response.ok) {
        throw new Error('Erro ao salvar ficha de atendimento');
      }
      
      setSuccessMessage(isEditing ? 'Ficha atualizada com sucesso!' : 'Ficha criada com sucesso!');
      setIsCreatingNew(false);
      setIsEditing(false);
      setSelectedRecord(null);
      resetForm();
      fetchAttendanceForms();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    }
  };

  // Função para editar registro
  const editRecord = (record: AttendanceFormData) => {
    setFormData(record);
    setSelectedRecord(record.id || null);
    setIsEditing(true);
    setIsCreatingNew(true);
  };

  // Função para deletar registro
  const deleteRecord = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ficha de atendimento?')) {
      return;
    }
    
    try {
      setError("");
      
      if (!user) {
        return;
      }
      
      const response = await authenticatedFetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/attendance_forms?id=eq.${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir ficha de atendimento');
      }
      
      setSuccessMessage('Ficha excluída com sucesso!');
      fetchAttendanceForms();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir dados');
    }
  };

  // Função para resetar formulário
  const resetForm = () => {
    setFormData({
      customer_name: "",
      email: "",
      phone: "",
      contact_method: "",
      attraction_media: "",
      seller: "",
      type: "",
      brand: "",
      model: "",
      year: "",
      vehicle_type: "",
      price_range: "",
      queue_brand: "",
      queue_model: "",
      queue_version: "",
      queue_color: "",
      queue_price_from: "",
      queue_price_to: "",
      appointment_date: "",
      status: "pending",
      notes: ""
    });
  };

  // Função para cancelar edição/criação
  const cancelForm = () => {
    setIsCreatingNew(false);
    setIsEditing(false);
    setSelectedRecord(null);
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

  // Função para filtrar dados por tipo
  const getFilteredData = (type: string) => {
    return attendanceForms.filter(form => form.type === type);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para aplicar máscara de moeda
  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');
    
    // Se não há valor, retorna vazio
    if (!numericValue) return '';
    
    // Converte para número e formata como moeda brasileira
    const number = parseInt(numericValue);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  // Função para remover formatação de moeda e retornar apenas números
  const parseCurrency = (value: string) => {
    return value.replace(/\D/g, '');
  };

  // Função para validar se valor DE é menor que valor ATÉ
  const validatePriceRange = (fromValue: string, toValue: string) => {
    if (!fromValue || !toValue) return true; // Se algum campo estiver vazio, não há erro
    
    const fromNumeric = parseInt(parseCurrency(fromValue));
    const toNumeric = parseInt(parseCurrency(toValue));
    
    return fromNumeric < toNumeric;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue = value;
    
    // Aplicar máscara de moeda para campos de preço
    if (name === 'queue_price_from' || name === 'queue_price_to') {
      processedValue = formatCurrency(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : processedValue
    }));

    // Aplicar filtros em cascata APENAS quando uma opção é selecionada (não ao digitar)
    if (name === 'brand' || name === 'model' || name === 'year') {
      // Verificar se o valor é uma opção válida (não apenas digitando)
      let isOptionSelected = false;
      
      if (name === 'brand') {
        isOptionSelected = vehicleSearchData.brands.includes(value);
      } else if (name === 'model') {
        isOptionSelected = vehicleSearchData.models.includes(value);
      } else if (name === 'year') {
        isOptionSelected = vehicleSearchData.years.includes(value);
      }
      
      // Só aplicar filtros em cascata se uma opção válida foi selecionada
      if (isOptionSelected) {
        const currentBrand = name === 'brand' ? value : formData.brand;
        const currentModel = name === 'model' ? value : formData.model;
        const currentYear = name === 'year' ? value : formData.year?.toString();
        
        // Limpar campos dependentes quando um campo pai é alterado
        if (name === 'brand') {
          setFormData(prev => ({
            ...prev,
            model: '',
            year: '',
            price_range: ''
          }));
          filterVehicleData(currentBrand, '', '');
        } else if (name === 'model') {
          setFormData(prev => ({
            ...prev,
            year: '',
            price_range: ''
          }));
          filterVehicleData(currentBrand, currentModel, '');
        } else if (name === 'year') {
          setFormData(prev => ({
            ...prev,
            price_range: ''
          }));
          filterVehicleData(currentBrand, currentModel, currentYear);
        }
      }
    }
  };

  const handleRecordClick = (recordId: string) => {
    setSelectedRecord(recordId);
  };

  const handleGoToAppointment = () => {
    if (selectedRecord) {
      // Navegar para a página de agendamento passando o ID do registro
      router.push(`/appointment?id=${selectedRecord}`);
    }
  };

  const handleRecordDoubleClick = (recordId: string) => {
    // Navegar diretamente para a ficha do registro
    router.push(`/appointment?id=${recordId}`);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedRecord(null); // Limpa a seleção ao mudar de aba
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAttendanceForm();
  };

  const handleCancel = () => {
    cancelForm();
  };

  const renderTable = () => {
    switch (activeTab) {
      case "agendamentos":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dt. Atend.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo Interesse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trade In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mídia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredData("Agendamento").map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => handleRecordClick(item.id || '')}
                    onDoubleClick={handleGoToAppointment}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedRecord === item.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id?.slice(-8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.appointment_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.brand} {item.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.queue_brand ? 'Sim' : 'Não'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.attraction_media}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.seller}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "bolsao-cliente":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo Interesse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ano</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faixa de Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mídia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dt. Atend.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trade In</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredData("Bolsão Cliente").map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => handleRecordClick(item.id || '')}
                    onDoubleClick={handleGoToAppointment}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedRecord === item.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id?.slice(-8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.seller}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.brand} {item.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vehicle_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.queue_version}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.price_range}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.attraction_media}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.appointment_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.queue_brand ? 'Sim' : 'Não'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "bolsao-tradein":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo Interesse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ano</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Pretendido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mídia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dt. Atend.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trade In</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredData("Trade In").map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => handleRecordClick(item.id || '')}
                    onDoubleClick={handleGoToAppointment}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedRecord === item.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id?.slice(-8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.seller}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.brand} {item.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vehicle_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.queue_version}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.price_range}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.attraction_media}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.appointment_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.queue_brand ? 'Sim' : 'Não'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "vendas-perdidas":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data abertura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo Interesse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Venda Perdida</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dias</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredData("Venda Perdida").map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => handleRecordClick(item.id || '')}
                    onDoubleClick={handleGoToAppointment}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedRecord === item.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id?.slice(-8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.created_at || '')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.seller}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.brand} {item.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.queue_version}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.appointment_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.notes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editRecord(item);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRecord(item.id || '');
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Ficha de Atendimento
              </h2>
              <p className="text-gray-600">
                Gerencie agendamentos, clientes e vendas perdidas
              </p>
            </div>
            <div className="flex space-x-3">
              {selectedRecord && (
                <button
                  onClick={handleGoToAppointment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ir para agendamento
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

        {!isCreatingNew ? (
          /* Navegação por abas */
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Conteúdo da tabela */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {renderTable()}
            </div>
          </div>
        ) : (
          /* Formulário de nova ficha */
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Novo Cliente
              </h3>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informações do cliente */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Informações do Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Nome do cliente"
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    placeholder="Digite..."
                    required
                  />
                  <Input
                    label="E-mail"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Digite..."
                    required
                  />
                  <Input
                    label="Telefone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Digite..."
                    required
                  />
                </div>
              </div>

              {/* Contato e atração */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Contato e Atração</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AutocompleteInput
                    label="Forma de Contato"
                    type="text"
                    name="contact_method"
                    value={formData.contact_method}
                    onChange={handleInputChange}
                    placeholder="Buscar forma de contato"
                    options={contactMethods}
                  />
                  <AutocompleteInput
                    label="Mídia de atração"
                    type="text"
                    name="attraction_media"
                    value={formData.attraction_media}
                    onChange={handleInputChange}
                    placeholder="Buscar mídia de atração"
                    options={attractionMedia}
                  />
                </div>
              </div>

              {/* Vendas e compras */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Vendas e Compras</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AutocompleteInput
                    label="Vendedor"
                    type="text"
                    name="seller"
                    value={formData.seller}
                    onChange={handleInputChange}
                    placeholder="Buscar vendedor"
                    options={users.map(user => user.name)}
                  />
                  <AutocompleteInput
                    label="Tipo"
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="Buscar tipo"
                    options={['Compra', 'Venda', 'Consignação', 'Outras vendas']}
                  />
                </div>
              </div>

              {/* Detalhes do veículo */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Detalhes do Veículo</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <AutocompleteInput
                    label="Marca"
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Buscar marca"
                    options={vehicleSearchData.brands}
                  />
                  <AutocompleteInput
                    label="Modelo"
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="Buscar modelo"
                    options={vehicleSearchData.models}
                  />
                  <AutocompleteInput
                    label="Ano"
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="Buscar ano"
                    options={vehicleSearchData.years}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <AutocompleteInput
                    label="Tipo de veículo"
                    type="text"
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleInputChange}
                    placeholder="Buscar tipo de veículo"
                    options={vehicleTypes}
                  />
                  <AutocompleteInput
                    label="Faixa de preço"
                    type="text"
                    name="price_range"
                    value={formData.price_range}
                    onChange={handleInputChange}
                    placeholder="Digite..."
                    options={vehicleSearchData.priceRanges}
                  />
                </div>
              </div>

              {/* Fila de espera */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Fila de espera</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <AutocompleteInput
                    label="Marca"
                    type="text"
                    name="queue_brand"
                    value={formData.queue_brand}
                    onChange={handleInputChange}
                    placeholder="Buscar marca"
                    options={vehicleSearchData.brands}
                  />
                  <AutocompleteInput
                    label="Modelo"
                    type="text"
                    name="queue_model"
                    value={formData.queue_model}
                    onChange={handleInputChange}
                    placeholder="Buscar modelo"
                    options={vehicleSearchData.models}
                  />
                  <AutocompleteInput
                    label="Versão"
                    type="text"
                    name="queue_version"
                    value={formData.queue_version}
                    onChange={handleInputChange}
                    placeholder="Buscar versão"
                    options={['1.0', '1.4', '1.6', '1.8', '2.0', '2.4', 'Híbrido', 'Elétrico', 'Turbo', 'Sport']}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <AutocompleteInput
                    label="Cor"
                    type="text"
                    name="queue_color"
                    value={formData.queue_color}
                    onChange={handleInputChange}
                    placeholder="Buscar cor"
                    options={colors}
                  />
                  <div>
                    <Input
                      label="Valor DE"
                      type="text"
                      name="queue_price_from"
                      value={formData.queue_price_from}
                      onChange={handleInputChange}
                      placeholder="R$ 0,00"
                    />
                    {formData.queue_price_from && formData.queue_price_to && !validatePriceRange(formData.queue_price_from, formData.queue_price_to) && (
                      <p className="text-red-500 text-sm mt-1">O valor DE deve ser menor que o valor ATÉ</p>
                    )}
                  </div>
                  <div>
                    <Input
                      label="Valor ATÉ"
                      type="text"
                      name="queue_price_to"
                      value={formData.queue_price_to}
                      onChange={handleInputChange}
                      placeholder="R$ 0,00"
                    />
                    {formData.queue_price_from && formData.queue_price_to && !validatePriceRange(formData.queue_price_from, formData.queue_price_to) && (
                      <p className="text-red-500 text-sm mt-1">O valor DE deve ser menor que o valor ATÉ</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Data de agendamento e status */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Agendamento e Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Data do Agendamento"
                    type="date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleInputChange}
                    required
                  />
                  <Select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione um status</option>
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </Select>
                  <AutocompleteInput
                    label="Tipo"
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="Buscar tipo"
                    options={['Agendamento', 'Bolsão Cliente', 'Trade In', 'Venda Perdida']}
                    required
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Observações</h4>
                <Textarea
                  label="Observações"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Digite observações sobre o atendimento..."
                  rows={4}
                />
              </div>

              {/* Botão de ação */}
              <div className="flex justify-center space-x-4 pt-6 border-t">
                <button
                  type="submit"
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {isEditing ? 'Atualizar' : 'Cadastrar'} Cliente
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
