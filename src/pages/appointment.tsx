import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AttachmentList, AttachmentData } from "../components/Attachment";
import { CompactAttachmentList } from "../components/CompactAttachment";
import { 
  applyCurrencyMask, 
  removeCurrencyMask,
  applyCpfMask,
  removeCpfMask,
  applyPhoneMask,
  removePhoneMask,
  applyCepMask,
  removeCepMask,
  applyDateMask,
  removeDateMask,
  isValidCpf,
  isValidPhone,
  isValidCep
} from "../lib/formatting";
import { uploadMultipleFiles, listAppointmentFiles, deleteFile } from "../lib/fileUpload";
import FileUpload from "../components/FileUpload";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";

interface ClientData {
  // Informações do cliente
  id?: string;
  nomeCliente: string;
  email: string;
  telefone: string;
  
  // Contato e atração
  formaContato: string;
  midiaAtracao: string;
  
  // Vendas e compras
  vendedor: string;
  tipo: string;
  
  // Detalhes do veículo
  marca: string;
  modelo: string;
  ano: string;
  tipoVeiculo: string;
  faixaPreco: string;
  
  // Fila de espera
  marcaFila: string;
  modeloFila: string;
  versaoFila: string;
}

interface ContactRecord {
  id: number;
  data: string;
  hora: string;
  tipoContato: string;
  vendedor: string;
  observacoes: string;
  proximoContato?: string;
}

export default function Appointment() {
  const router = useRouter();
  const { id } = router.query;
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("historico");
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactHistory, setContactHistory] = useState<ContactRecord[]>([]);
  const [contactForm, setContactForm] = useState({
    data: "",
    hora: "",
    tipoContato: "",
    vendedor: "",
    observacoes: "",
    proximoContato: ""
  });

  // Estados para opções dinâmicas
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  const [contactMethods, setContactMethods] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<{id: string, name: string}[]>([]);

  // Estados para anexos
  const [documentosAnexos, setDocumentosAnexos] = useState<AttachmentData[]>([]);
  const [avaliacaoAnexos, setAvaliacaoAnexos] = useState<AttachmentData[]>([]);
  const [anuncioAnexos, setAnuncioAnexos] = useState<AttachmentData[]>([]);
  
  // Estados para anexos de documentos do cliente
  const [cnhAnexos, setCnhAnexos] = useState<AttachmentData[]>([]);
  const [rgAnexos, setRgAnexos] = useState<AttachmentData[]>([]);
  const [documento1Anexos, setDocumento1Anexos] = useState<AttachmentData[]>([]);
  const [documento2Anexos, setDocumento2Anexos] = useState<AttachmentData[]>([]);
  
  // Estados para upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  // Estados para formulários de avaliação
  const [previsaoReparo, setPrevisaoReparo] = useState({
    descricao: "",
    fornecedor: "",
    valor: "",
    data: ""
  });

  const [proprietarioLegal, setProprietarioLegal] = useState({
    nome: "",
    cpf: "",
    email: "",
    celular: "",
    celular2: "",
    dataNascimento: "",
    cep: "",
    endereco: "",
    estado: "",
    uf: ""
  });

  const [proprietarioPosse, setProprietarioPosse] = useState({
    nome: "",
    cpf: "",
    email: "",
    celular: "(61) 98195-0302",
    celular2: "",
    dataNascimento: "",
    cep: "",
    endereco: "",
    estado: "",
    uf: ""
  });

  const [dadosVeiculo, setDadosVeiculo] = useState({
    marca: "",
    placa: "",
    modelo: "",
    ano: "",
    cor: "",
    maisBarato: "",
    fipe: "",
    maisCaro: "",
    precoMedio: "",
    precoAvaliacao: "",
    portas: "",
    lugares: "",
    valor: ""
  });

  const [previsoesReparo, setPrevisoesReparo] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para armazenar IDs dos registros existentes
  const [existingLegalOwnerId, setExistingLegalOwnerId] = useState<number | null>(null);
  const [existingPosseOwnerId, setExistingPosseOwnerId] = useState<number | null>(null);
  const [existingVehicleEvaluationId, setExistingVehicleEvaluationId] = useState<number | null>(null);

  // Estados para edição de previsões
  const [editingPrevisaoId, setEditingPrevisaoId] = useState<number | null>(null);

  // Estados para dados de formalização
  const [formalizationTypes, setFormalizationTypes] = useState({
    pedidoVenda: false,
    contratoCompra: true,
    contratoConsignacao: false
  });

  const [formalizationClient, setFormalizationClient] = useState({
    cpfCnpj: "",
    rgIe: "",
    nome: "",
    telefone: "",
    email: "",
    dataNascimento: "",
    cep: "",
    endereco: "",
    cidade: "",
    estado: ""
  });

  const [formalizationPayments, setFormalizationPayments] = useState<any[]>([]);
  const [newPayment, setNewPayment] = useState({
    dataPagamento: "",
    formaPagamento: "",
    valorPagamento: ""
  });

  const [formalizationDelivery, setFormalizationDelivery] = useState({
    dataHora: "",
    km: "",
    observacao: "",
    manualEntregue: true,
    chaveReservaEntregue: true,
    termoAssinado: null as File | null
  });

  // Estados para IDs dos registros existentes de formalização
  const [existingFormalizationTypesId, setExistingFormalizationTypesId] = useState<number | null>(null);
  const [existingFormalizationClientId, setExistingFormalizationClientId] = useState<number | null>(null);
  const [existingFormalizationDeliveryId, setExistingFormalizationDeliveryId] = useState<number | null>(null);

  const tabs = [
    { id: "historico", label: "Histórico de atendimento" },
    { id: "avaliacao", label: "Incluir avaliação" },
    { id: "formalizacao", label: "Formalização" },
    { id: "entrega", label: "Entrega" }
  ];

  // Função para buscar opções dinâmicas
  const fetchDynamicOptions = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) return;
      
      const user = JSON.parse(userData);

      // Buscar usuários (vendedores)
      const usersResponse = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/users?company_id=eq.${user.company_id}&select=id,name&order=name.asc`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Buscar fornecedores
      const suppliersResponse = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/suppliers?company_id=eq.${user.company_id}&select=id,name&order=name.asc`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });
      
      if (suppliersResponse.ok) {
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData);
      }

      // Buscar veículos para extrair cores
      const vehiclesResponse = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/vehicles?company_id=eq.${user.company_id}&select=color&order=color.asc`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });
      
      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        const uniqueColors = [...new Set(vehiclesData.map((v: any) => v.color).filter(Boolean))] as string[];
        setColors(uniqueColors);
      }

      // Opções fixas
      setContactMethods([
        "WhatsApp",
        "Whatsapp Recebido", 
        "Telefonema dado",
        "Whatsapp Enviado",
        "Showroom",
        "Lead",
        "Telefonema recebido"
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

  useEffect(() => {
    if (!id) return;

    // Buscar opções dinâmicas
    fetchDynamicOptions();
    
    // Buscar dados reais do cliente
    fetchClientData();
    
    // Carregar anexos existentes
    loadExistingAttachments();
    
    // Carregar dados salvos da avaliação
    loadEvaluationData();
    
    // Carregar dados salvos de formalização
    loadFormalizationData();
    
    // Carregar histórico de contatos
    loadContactHistory();
  }, [id]);

  // Função para buscar dados reais do cliente
  const fetchClientData = async () => {
    try {
      setIsLoading(true);
      
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        setIsLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);

      // Buscar dados do cliente da tabela attendance_forms
      const response = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/attendance_forms?id=eq.${id}&company_id=eq.${user.company_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const client = data[0];
          setClientData({
            id: client.id,
            nomeCliente: client.customer_name,
            email: client.email,
            telefone: client.phone,
            formaContato: client.contact_method,
            midiaAtracao: client.attraction_media,
            vendedor: client.seller,
            tipo: client.type,
            marca: client.brand,
            modelo: client.model,
            ano: client.year?.toString() || '',
            tipoVeiculo: client.vehicle_type,
            faixaPreco: client.price_range,
            marcaFila: client.queue_brand,
            modeloFila: client.queue_model,
            versaoFila: client.queue_version
          });
        }
      }

      // Buscar histórico de contatos (se existir uma tabela específica)
      // Por enquanto, deixar vazio até implementar a tabela de histórico
      setContactHistory([]);
      
    } catch (err) {
      console.error('Erro ao buscar dados do cliente:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para carregar anexos existentes
  const loadExistingAttachments = async () => {
    if (!id) return;
    
    try {
      const appointmentId = id.toString();
      
      // Carregar anexos de documentos
      const documentos = await listAppointmentFiles(appointmentId, 'documentos');
      setDocumentosAnexos(documentos);
      
      // Carregar anexos de avaliação
      const avaliacao = await listAppointmentFiles(appointmentId, 'avaliacao');
      setAvaliacaoAnexos(avaliacao);
      
      // Carregar anexos de anúncio
      const anuncio = await listAppointmentFiles(appointmentId, 'anuncio');
      setAnuncioAnexos(anuncio);
      
      // Carregar anexos de documentos do cliente
      const cnh = await listAppointmentFiles(appointmentId, 'cnh');
      setCnhAnexos(cnh);
      
      const rg = await listAppointmentFiles(appointmentId, 'rg');
      setRgAnexos(rg);
      
      const documento1 = await listAppointmentFiles(appointmentId, 'documento1');
      setDocumento1Anexos(documento1);
      
      const documento2 = await listAppointmentFiles(appointmentId, 'documento2');
      setDocumento2Anexos(documento2);
      
    } catch (error) {
      console.error('Erro ao carregar anexos:', error);
    }
  };

  // Função para carregar dados salvos da avaliação
  const loadEvaluationData = async () => {
    if (!id) return;
    
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) return;
      
      const user = JSON.parse(userData);
      const appointmentId = id.toString();

      // Carregar previsões de reparo
      const repairResponse = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/repair_estimates?appointment_id=eq.${appointmentId}&company_id=eq.${user.company_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });

      if (repairResponse.ok) {
        const repairData = await repairResponse.json();
        const formattedRepairs = repairData.map((item: any) => ({
          id: item.id,
          descricao: item.description,
          fornecedor: item.supplier,
          valor: item.value ? applyCurrencyMask(item.value.toString()) : '',
          valorNumerico: item.value,
          data: item.estimated_date,
          created_at: item.created_at
        }));
        setPrevisoesReparo(formattedRepairs);
      }

      // Carregar proprietário legal
      const legalResponse = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/legal_owners?appointment_id=eq.${appointmentId}&company_id=eq.${user.company_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });

      if (legalResponse.ok) {
        const legalData = await legalResponse.json();
        if (legalData.length > 0) {
          const legal = legalData[0];
          setExistingLegalOwnerId(legal.id);
          setProprietarioLegal({
            nome: legal.name || '',
            cpf: legal.cpf ? applyCpfMask(legal.cpf) : '',
            email: legal.email || '',
            celular: legal.phone ? applyPhoneMask(legal.phone) : '',
            celular2: legal.phone2 ? applyPhoneMask(legal.phone2) : '',
            dataNascimento: legal.birth_date || '',
            cep: legal.zip_code ? applyCepMask(legal.zip_code) : '',
            endereco: legal.address || '',
            estado: legal.state || '',
            uf: legal.uf || ''
          });
        }
      }

      // Carregar proprietário de posse
      const posseResponse = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/possession_owners?appointment_id=eq.${appointmentId}&company_id=eq.${user.company_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });

      if (posseResponse.ok) {
        const posseData = await posseResponse.json();
        if (posseData.length > 0) {
          const posse = posseData[0];
          setExistingPosseOwnerId(posse.id);
          setProprietarioPosse({
            nome: posse.name || '',
            cpf: posse.cpf ? applyCpfMask(posse.cpf) : '',
            email: posse.email || '',
            celular: posse.phone ? applyPhoneMask(posse.phone) : '(61) 98195-0302',
            celular2: posse.phone2 ? applyPhoneMask(posse.phone2) : '',
            dataNascimento: posse.birth_date || '',
            cep: posse.zip_code ? applyCepMask(posse.zip_code) : '',
            endereco: posse.address || '',
            estado: posse.state || '',
            uf: posse.uf || ''
          });
        }
      }

      // Carregar dados do veículo
      const vehicleResponse = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/vehicle_evaluations?appointment_id=eq.${appointmentId}&company_id=eq.${user.company_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });

      if (vehicleResponse.ok) {
        const vehicleData = await vehicleResponse.json();
        if (vehicleData.length > 0) {
          const vehicle = vehicleData[0];
          setExistingVehicleEvaluationId(vehicle.id);
          setDadosVeiculo({
            marca: vehicle.brand || '',
            placa: vehicle.plate || '',
            modelo: vehicle.model || '',
            ano: vehicle.year || '',
            cor: vehicle.color || '',
            maisBarato: vehicle.cheapest_price ? applyCurrencyMask(vehicle.cheapest_price.toString()) : '',
            fipe: vehicle.fipe_price ? applyCurrencyMask(vehicle.fipe_price.toString()) : '',
            maisCaro: vehicle.expensive_price ? applyCurrencyMask(vehicle.expensive_price.toString()) : '',
            precoMedio: vehicle.average_price ? applyCurrencyMask(vehicle.average_price.toString()) : '',
            precoAvaliacao: vehicle.evaluation_price ? applyCurrencyMask(vehicle.evaluation_price.toString()) : '',
            portas: vehicle.doors ? vehicle.doors.toString() : '',
            lugares: vehicle.seats ? vehicle.seats.toString() : '',
            valor: vehicle.value ? applyCurrencyMask(vehicle.value.toString()) : ''
          });
        }
      }

    } catch (error) {
      console.error('Erro ao carregar dados da avaliação:', error);
    }
  };

  const loadFormalizationData = async () => {
    if (!id) return;

    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) return;
      
      const user = JSON.parse(userData);
      const appointmentId = id.toString();

      // Carregar tipos de formalização
      const typesResponse = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_types?appointment_id=eq.${appointmentId}&company_id=eq.${user.company_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });

      if (typesResponse.ok) {
        const typesData = await typesResponse.json();
        if (typesData.length > 0) {
          const types = typesData[0];
          setExistingFormalizationTypesId(types.id);
          setFormalizationTypes({
            pedidoVenda: types.pedido_venda || false,
            contratoCompra: types.contrato_compra || true,
            contratoConsignacao: types.contrato_consignacao || false
          });
        }
      }

      // Carregar dados do cliente
      const clientResponse = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_clients?appointment_id=eq.${appointmentId}&company_id=eq.${user.company_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });

      if (clientResponse.ok) {
        const clientData = await clientResponse.json();
        if (clientData.length > 0) {
          const client = clientData[0];
          setExistingFormalizationClientId(client.id);
          setFormalizationClient({
            cpfCnpj: client.cpf_cnpj ? applyCpfMask(client.cpf_cnpj) : '',
            rgIe: client.rg_ie || '',
            nome: client.nome || '',
            telefone: client.telefone ? applyPhoneMask(client.telefone) : '',
            email: client.email || '',
            dataNascimento: client.data_nascimento || '',
            cep: client.cep ? applyCepMask(client.cep) : '',
            endereco: client.endereco || '',
            cidade: client.cidade || '',
            estado: client.estado || ''
          });
        }
      }

      // Carregar pagamentos
      const paymentsResponse = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_payments?appointment_id=eq.${appointmentId}&company_id=eq.${user.company_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        const formattedPayments = paymentsData.map((payment: any) => ({
          id: payment.id,
          dataPagamento: payment.data_pagamento,
          formaPagamento: payment.forma_pagamento,
          valorPagamento: payment.valor ? applyCurrencyMask(payment.valor.toString()) : '',
          valorNumerico: payment.valor,
          status: payment.status,
          created_at: payment.created_at
        }));
        setFormalizationPayments(formattedPayments);
      }

      // Carregar dados de entrega
      const deliveryResponse = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_deliveries?appointment_id=eq.${appointmentId}&company_id=eq.${user.company_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });

      if (deliveryResponse.ok) {
        const deliveryData = await deliveryResponse.json();
        if (deliveryData.length > 0) {
          const delivery = deliveryData[0];
          setExistingFormalizationDeliveryId(delivery.id);
          setFormalizationDelivery({
            dataHora: delivery.data_hora ? new Date(delivery.data_hora).toISOString().slice(0, 16) : '',
            km: delivery.km || '',
            observacao: delivery.observacao || '',
            manualEntregue: delivery.manual_entregue !== null ? delivery.manual_entregue : true,
            chaveReservaEntregue: delivery.chave_reserva_entregue !== null ? delivery.chave_reserva_entregue : true,
            termoAssinado: null // Arquivo será carregado separadamente se necessário
          });
        }
      }

    } catch (error) {
      console.error('Erro ao carregar dados de formalização:', error);
    }
  };

  const loadContactHistory = async () => {
    if (!id) return;

    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        console.log('Dados de autenticação não encontrados para carregar histórico de contatos');
        return;
      }
      
      const user = JSON.parse(userData);
      const appointmentId = id.toString();

      console.log('Carregando histórico de contatos para appointment:', appointmentId, 'company:', user.company_id);

      // Carregar histórico de contatos
      const response = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/contact_history?appointment_id=eq.${appointmentId}&company_id=eq.${user.company_id}&order=data_contato.desc,hora_contato.desc`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });

      console.log('Resposta do histórico de contatos:', response.status, response.statusText);

      if (response.ok) {
        const contactData = await response.json();
        console.log('Dados de contatos recebidos:', contactData);
        
        const formattedContacts = contactData.map((contact: any) => ({
          id: contact.id,
          data: contact.data_contato,
          hora: contact.hora_contato,
          tipoContato: contact.tipo_contato,
          vendedor: contact.vendedor,
          observacoes: contact.observacoes,
          proximoContato: contact.proximo_contato,
          created_at: contact.created_at
        }));
        
        console.log('Contatos formatados:', formattedContacts);
        setContactHistory(formattedContacts);
        console.log('Estado contactHistory atualizado com', formattedContacts.length, 'contatos');
      } else {
        const errorData = await response.text();
        console.error('Erro ao carregar histórico de contatos:', response.status, errorData);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de contatos:', error);
    }
  };

  // Funções para salvar dados de formalização
  const salvarTiposFormalizacao = async (updatedTypes?: any) => {
    if (!id) return;

    setIsSaving(true);
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        alert('Erro de autenticação');
        return;
      }
      
      const user = JSON.parse(userData);

      // Usar os tipos atualizados se fornecidos, senão usar o estado atual
      const typesToSave = updatedTypes || formalizationTypes;

      const dataToSend = {
        appointment_id: id.toString(),
        company_id: user.company_id,
        pedido_venda: typesToSave.pedidoVenda,
        contrato_compra: typesToSave.contratoCompra,
        contrato_consignacao: typesToSave.contratoConsignacao
      };

      console.log('Dados sendo enviados:', dataToSend);

      // Determinar se é INSERT ou UPDATE
      const isUpdate = existingFormalizationTypesId !== null;
      const url = isUpdate 
        ? `https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_types?id=eq.${existingFormalizationTypesId}`
        : 'https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_types';
      const method = isUpdate ? 'PATCH' : 'POST';

      console.log(`${isUpdate ? 'UPDATE' : 'INSERT'} - Tipos de Formalização`);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        alert(`Tipos de formalização ${isUpdate ? 'atualizados' : 'salvos'} com sucesso!`);
        loadFormalizationData();
      } else {
        const errorData = await response.text();
        console.error('Erro detalhado:', response.status, errorData);
        alert(`Erro ao ${isUpdate ? 'atualizar' : 'salvar'} tipos de formalização: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao salvar tipos de formalização:', error);
      alert('Erro inesperado ao salvar tipos de formalização');
    } finally {
      setIsSaving(false);
    }
  };

  const salvarDadosCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        alert('Erro de autenticação');
        return;
      }
      
      const user = JSON.parse(userData);

      const dataToSend = {
        appointment_id: id.toString(),
        company_id: user.company_id,
        cpf_cnpj: removeCpfMask(formalizationClient.cpfCnpj),
        rg_ie: formalizationClient.rgIe,
        nome: formalizationClient.nome,
        telefone: removePhoneMask(formalizationClient.telefone),
        email: formalizationClient.email,
        data_nascimento: formalizationClient.dataNascimento || null,
        cep: removeCepMask(formalizationClient.cep),
        endereco: formalizationClient.endereco,
        cidade: formalizationClient.cidade,
        estado: formalizationClient.estado
      };

      console.log('Dados sendo enviados:', dataToSend);

      // Determinar se é INSERT ou UPDATE
      const isUpdate = existingFormalizationClientId !== null;
      const url = isUpdate 
        ? `https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_clients?id=eq.${existingFormalizationClientId}`
        : 'https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_clients';
      const method = isUpdate ? 'PATCH' : 'POST';

      console.log(`${isUpdate ? 'UPDATE' : 'INSERT'} - Dados do Cliente`);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        alert(`Dados do cliente ${isUpdate ? 'atualizados' : 'salvos'} com sucesso!`);
        loadFormalizationData();
      } else {
        const errorData = await response.text();
        console.error('Erro detalhado:', response.status, errorData);
        alert(`Erro ao ${isUpdate ? 'atualizar' : 'salvar'} dados do cliente: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao salvar dados do cliente:', error);
      alert('Erro inesperado ao salvar dados do cliente');
    } finally {
      setIsSaving(false);
    }
  };

  const salvarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        alert('Erro de autenticação');
        return;
      }
      
      const user = JSON.parse(userData);

      const dataToSend = {
        appointment_id: id.toString(),
        company_id: user.company_id,
        data_pagamento: newPayment.dataPagamento || null,
        forma_pagamento: newPayment.formaPagamento,
        valor: newPayment.valorPagamento ? parseFloat(removeCurrencyMask(newPayment.valorPagamento)) : null,
        status: 'pendente'
      };

      console.log('Dados sendo enviados:', dataToSend);

      const response = await fetch('https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        setNewPayment({ dataPagamento: "", formaPagamento: "", valorPagamento: "" });
        alert('Pagamento salvo com sucesso!');
        loadFormalizationData();
      } else {
        const errorData = await response.text();
        console.error('Erro detalhado:', response.status, errorData);
        alert(`Erro ao salvar pagamento: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      alert('Erro inesperado ao salvar pagamento');
    } finally {
      setIsSaving(false);
    }
  };

  const liquidarPagamento = async (paymentId: number) => {
    if (!confirm('Tem certeza que deseja liquidar este pagamento?')) {
      return;
    }

    try {
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!accessToken) {
        alert('Erro de autenticação');
        return;
      }

      const response = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_payments?id=eq.${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'pago' })
      });

      if (response.ok) {
        alert('Pagamento liquidado com sucesso!');
        loadFormalizationData();
      } else {
        const errorData = await response.text();
        console.error('Erro ao liquidar pagamento:', response.status, errorData);
        alert(`Erro ao liquidar pagamento: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao liquidar pagamento:', error);
      alert('Erro inesperado ao liquidar pagamento');
    }
  };

  const marcarComoPendente = async (paymentId: number) => {
    if (!confirm('Tem certeza que deseja marcar este pagamento como pendente?')) {
      return;
    }

    try {
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!accessToken) {
        alert('Erro de autenticação');
        return;
      }

      const response = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_payments?id=eq.${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'pendente' })
      });

      if (response.ok) {
        alert('Pagamento marcado como pendente!');
        loadFormalizationData();
      } else {
        const errorData = await response.text();
        console.error('Erro ao marcar como pendente:', response.status, errorData);
        alert(`Erro ao marcar como pendente: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao marcar como pendente:', error);
      alert('Erro inesperado ao marcar como pendente');
    }
  };

  const excluirPagamento = async (paymentId: number) => {
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) {
      return;
    }

    try {
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!accessToken) {
        alert('Erro de autenticação');
        return;
      }

      const response = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_payments?id=eq.${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE'
        }
      });

      if (response.ok) {
        alert('Pagamento excluído com sucesso!');
        loadFormalizationData();
      } else {
        const errorData = await response.text();
        console.error('Erro ao excluir pagamento:', response.status, errorData);
        alert(`Erro ao excluir pagamento: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      alert('Erro inesperado ao excluir pagamento');
    }
  };

  const salvarDadosEntrega = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        alert('Erro de autenticação');
        return;
      }
      
      const user = JSON.parse(userData);

            // Upload do termo assinado se existir
            let termoAssinadoPath = null;
            if (formalizationDelivery.termoAssinado) {
              try {
                const fileList = new DataTransfer();
                fileList.items.add(formalizationDelivery.termoAssinado);
                const uploadResults = await uploadMultipleFiles(
                  fileList.files,
                  id.toString(),
                  'documentos'
                );
                
                if (uploadResults[0]?.success && uploadResults[0]?.data) {
                  termoAssinadoPath = uploadResults[0].data.file_path;
                } else {
                  alert('Erro ao fazer upload do termo assinado: ' + (uploadResults[0]?.error || 'Erro desconhecido'));
                  return;
                }
              } catch (uploadError) {
                alert('Erro ao fazer upload do termo assinado: ' + uploadError);
                return;
              }
            }

            const dataToSend = {
              appointment_id: id.toString(),
              company_id: user.company_id,
              data_hora: formalizationDelivery.dataHora || null,
              km: formalizationDelivery.km,
              observacao: formalizationDelivery.observacao,
              manual_entregue: formalizationDelivery.manualEntregue,
              chave_reserva_entregue: formalizationDelivery.chaveReservaEntregue,
              termo_assinado_path: termoAssinadoPath
            };

            // Determinar se é INSERT ou UPDATE
            const isUpdate = existingFormalizationDeliveryId !== null;
            const url = isUpdate 
              ? `https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_deliveries?id=eq.${existingFormalizationDeliveryId}`
              : 'https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/formalization_deliveries';
            const method = isUpdate ? 'PATCH' : 'POST';

            const response = await fetch(url, {
              method: method,
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(dataToSend)
            });

            if (response.ok) {
              alert(`Dados de entrega ${isUpdate ? 'atualizados' : 'salvos'} com sucesso!`);
              await loadFormalizationData();
            } else {
              const errorData = await response.text();
              console.error('Erro detalhado:', response.status, errorData);
              alert(`Erro ao ${isUpdate ? 'atualizar' : 'salvar'} dados de entrega: ${response.status} - ${errorData}`);
            }
    } catch (error) {
      console.error('Erro ao salvar dados de entrega:', error);
      alert('Erro inesperado ao salvar dados de entrega');
    } finally {
      setIsSaving(false);
    }
  };

  // Função para upload de arquivos
  const handleFileUpload = async (
    files: FileList,
    attachmentType: 'documentos' | 'avaliacao' | 'anuncio' | 'cnh' | 'rg' | 'documento1' | 'documento2'
  ) => {
    if (!id || files.length === 0) return;
    
    setIsUploading(true);
    const appointmentId = id.toString();
    
    try {
      const results = await uploadMultipleFiles(
        files,
        appointmentId,
        attachmentType,
        (fileIndex, progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [`${attachmentType}_${fileIndex}`]: progress.percentage
          }));
        }
      );
      
      // Processar resultados
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);
      
      if (successfulUploads.length > 0) {
        const newAttachments = successfulUploads.map(result => result.data!);
        
        // Atualizar estado correspondente
        switch (attachmentType) {
          case 'documentos':
            setDocumentosAnexos(prev => [...prev, ...newAttachments]);
            break;
          case 'avaliacao':
            setAvaliacaoAnexos(prev => [...prev, ...newAttachments]);
            break;
          case 'anuncio':
            setAnuncioAnexos(prev => [...prev, ...newAttachments]);
            break;
          case 'cnh':
            setCnhAnexos(prev => [...prev, ...newAttachments]);
            break;
          case 'rg':
            setRgAnexos(prev => [...prev, ...newAttachments]);
            break;
          case 'documento1':
            setDocumento1Anexos(prev => [...prev, ...newAttachments]);
            break;
          case 'documento2':
            setDocumento2Anexos(prev => [...prev, ...newAttachments]);
            break;
        }
      }
      
      if (failedUploads.length > 0) {
        const errorMessages = failedUploads.map(result => result.error).join('\n');
        alert(`Erro ao enviar ${failedUploads.length} arquivo(s):\n${errorMessages}`);
      }
      
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro inesperado durante o upload');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  // Função para deletar anexo
  const handleDeleteAttachment = async (
    attachment: AttachmentData,
    attachmentType: 'documentos' | 'avaliacao' | 'anuncio' | 'cnh' | 'rg' | 'documento1' | 'documento2'
  ) => {
    if (!attachment.id) return;
    
    try {
      const success = await deleteFile(attachment.id);
      
      if (success) {
        // Remover do estado correspondente
        switch (attachmentType) {
          case 'documentos':
            setDocumentosAnexos(prev => prev.filter(a => a.id !== attachment.id));
            break;
          case 'avaliacao':
            setAvaliacaoAnexos(prev => prev.filter(a => a.id !== attachment.id));
            break;
          case 'anuncio':
            setAnuncioAnexos(prev => prev.filter(a => a.id !== attachment.id));
            break;
          case 'cnh':
            setCnhAnexos(prev => prev.filter(a => a.id !== attachment.id));
            break;
          case 'rg':
            setRgAnexos(prev => prev.filter(a => a.id !== attachment.id));
            break;
          case 'documento1':
            setDocumento1Anexos(prev => prev.filter(a => a.id !== attachment.id));
            break;
          case 'documento2':
            setDocumento2Anexos(prev => prev.filter(a => a.id !== attachment.id));
            break;
        }
      } else {
        alert('Erro ao remover anexo');
      }
    } catch (error) {
      console.error('Erro ao deletar anexo:', error);
      alert('Erro inesperado ao remover anexo');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        alert('Erro de autenticação');
        return;
      }
      
      const user = JSON.parse(userData);

      const dataToSend = {
        appointment_id: id.toString(),
        company_id: user.company_id,
        data_contato: contactForm.data,
        hora_contato: contactForm.hora,
        tipo_contato: contactForm.tipoContato,
        vendedor: contactForm.vendedor,
        observacoes: contactForm.observacoes,
        proximo_contato: contactForm.proximoContato || null
      };

      console.log('Dados sendo enviados:', dataToSend);

      const response = await fetch('https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/contact_history', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        alert('Contato registrado com sucesso!');
        
        // Limpar formulário
        setContactForm({
          data: "",
          hora: "",
          tipoContato: "",
          vendedor: "",
          observacoes: "",
          proximoContato: ""
        });
        setShowContactForm(false);
        
        // Recarregar histórico de contatos
        loadContactHistory();
      } else {
        const errorData = await response.text();
        console.error('Erro detalhado:', response.status, errorData);
        alert(`Erro ao registrar contato: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao registrar contato:', error);
      alert('Erro inesperado ao registrar contato');
    }
  };

  const handleCancelContactForm = () => {
    setContactForm({
      data: "",
      hora: "",
      tipoContato: "",
      vendedor: "",
      observacoes: "",
      proximoContato: ""
    });
    setShowContactForm(false);
  };

  // Funções para salvar dados de avaliação
  const salvarPrevisaoReparo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        alert('Erro de autenticação');
        return;
      }
      
      const user = JSON.parse(userData);

      // Preparar dados para envio
      const dataToSend = {
        appointment_id: id.toString(),
        company_id: user.company_id,
        description: previsaoReparo.descricao,
        supplier: previsaoReparo.fornecedor,
        value: previsaoReparo.valor ? parseFloat(removeCurrencyMask(previsaoReparo.valor)) : null,
        estimated_date: previsaoReparo.data || null
      };

      console.log('Dados sendo enviados:', dataToSend);

      // Determinar se é INSERT ou UPDATE
      const isUpdate = editingPrevisaoId !== null;
      const url = isUpdate 
        ? `https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/repair_estimates?id=eq.${editingPrevisaoId}`
        : 'https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/repair_estimates';
      const method = isUpdate ? 'PATCH' : 'POST';

      console.log(`${isUpdate ? 'UPDATE' : 'INSERT'} - Previsão de Reparo`);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        setPrevisaoReparo({ descricao: "", fornecedor: "", valor: "", data: "" });
        setEditingPrevisaoId(null);
        alert(`Previsão de reparo ${isUpdate ? 'atualizada' : 'salva'} com sucesso!`);
        // Recarregar dados da avaliação
        loadEvaluationData();
      } else {
        const errorData = await response.text();
        console.error('Erro detalhado:', response.status, errorData);
        alert(`Erro ao ${isUpdate ? 'atualizar' : 'salvar'} previsão de reparo: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao salvar previsão:', error);
      alert('Erro inesperado ao salvar previsão');
    } finally {
      setIsSaving(false);
    }
  };

  const editarPrevisao = (previsao: any) => {
    setPrevisaoReparo({
      descricao: previsao.descricao,
      fornecedor: previsao.fornecedor,
      valor: previsao.valor,
      data: previsao.data
    });
    setEditingPrevisaoId(previsao.id);
  };

  const excluirPrevisao = async (previsaoId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta previsão de reparo?')) {
      return;
    }

    try {
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!accessToken) {
        alert('Erro de autenticação');
        return;
      }

      const response = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/repair_estimates?id=eq.${previsaoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE'
        }
      });

      if (response.ok) {
        alert('Previsão de reparo excluída com sucesso!');
        loadEvaluationData();
      } else {
        const errorData = await response.text();
        console.error('Erro ao excluir:', response.status, errorData);
        alert(`Erro ao excluir previsão: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao excluir previsão:', error);
      alert('Erro inesperado ao excluir previsão');
    }
  };

  const salvarProprietarioLegal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        alert('Erro de autenticação');
        return;
      }
      
      const user = JSON.parse(userData);

      // Preparar dados para envio
      const dataToSend = {
        appointment_id: id.toString(),
        company_id: user.company_id,
        name: proprietarioLegal.nome,
        cpf: removeCpfMask(proprietarioLegal.cpf),
        email: proprietarioLegal.email,
        phone: removePhoneMask(proprietarioLegal.celular),
        phone2: removePhoneMask(proprietarioLegal.celular2),
        birth_date: proprietarioLegal.dataNascimento || null,
        zip_code: removeCepMask(proprietarioLegal.cep),
        address: proprietarioLegal.endereco,
        state: proprietarioLegal.estado,
        uf: proprietarioLegal.uf
      };

      console.log('Dados sendo enviados:', dataToSend);

      // Determinar se é INSERT ou UPDATE
      const isUpdate = existingLegalOwnerId !== null;
      const url = isUpdate 
        ? `https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/legal_owners?id=eq.${existingLegalOwnerId}`
        : 'https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/legal_owners';
      const method = isUpdate ? 'PATCH' : 'POST';

      console.log(`${isUpdate ? 'UPDATE' : 'INSERT'} - Proprietário Legal`);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        alert('Proprietário legal salvo com sucesso!');
        // Recarregar dados da avaliação
        loadEvaluationData();
      } else {
        const errorData = await response.text();
        console.error('Erro detalhado:', response.status, errorData);
        alert(`Erro ao salvar proprietário legal: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao salvar proprietário legal:', error);
      alert('Erro inesperado ao salvar proprietário legal');
    } finally {
      setIsSaving(false);
    }
  };

  const salvarProprietarioPosse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        alert('Erro de autenticação');
        return;
      }
      
      const user = JSON.parse(userData);

      // Preparar dados para envio
      const dataToSend = {
        appointment_id: id.toString(),
        company_id: user.company_id,
        name: proprietarioPosse.nome,
        cpf: removeCpfMask(proprietarioPosse.cpf),
        email: proprietarioPosse.email,
        phone: removePhoneMask(proprietarioPosse.celular),
        phone2: removePhoneMask(proprietarioPosse.celular2),
        birth_date: proprietarioPosse.dataNascimento || null,
        zip_code: removeCepMask(proprietarioPosse.cep),
        address: proprietarioPosse.endereco,
        state: proprietarioPosse.estado,
        uf: proprietarioPosse.uf
      };

      console.log('Dados sendo enviados:', dataToSend);

      // Determinar se é INSERT ou UPDATE
      const isUpdate = existingPosseOwnerId !== null;
      const url = isUpdate 
        ? `https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/possession_owners?id=eq.${existingPosseOwnerId}`
        : 'https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/possession_owners';
      const method = isUpdate ? 'PATCH' : 'POST';

      console.log(`${isUpdate ? 'UPDATE' : 'INSERT'} - Proprietário de Posse`);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        alert('Proprietário de posse salvo com sucesso!');
        // Recarregar dados da avaliação
        loadEvaluationData();
      } else {
        const errorData = await response.text();
        console.error('Erro detalhado:', response.status, errorData);
        alert(`Erro ao salvar proprietário de posse: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao salvar proprietário de posse:', error);
      alert('Erro inesperado ao salvar proprietário de posse');
    } finally {
      setIsSaving(false);
    }
  };

  const salvarDadosVeiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        alert('Erro de autenticação');
        return;
      }
      
      const user = JSON.parse(userData);

      // Preparar dados para envio
      const dataToSend = {
        appointment_id: id.toString(),
        company_id: user.company_id,
        brand: dadosVeiculo.marca,
        plate: dadosVeiculo.placa,
        model: dadosVeiculo.modelo,
        year: dadosVeiculo.ano,
        color: dadosVeiculo.cor,
        cheapest_price: dadosVeiculo.maisBarato ? parseFloat(removeCurrencyMask(dadosVeiculo.maisBarato)) : null,
        fipe_price: dadosVeiculo.fipe ? parseFloat(removeCurrencyMask(dadosVeiculo.fipe)) : null,
        expensive_price: dadosVeiculo.maisCaro ? parseFloat(removeCurrencyMask(dadosVeiculo.maisCaro)) : null,
        average_price: dadosVeiculo.precoMedio ? parseFloat(removeCurrencyMask(dadosVeiculo.precoMedio)) : null,
        evaluation_price: dadosVeiculo.precoAvaliacao ? parseFloat(removeCurrencyMask(dadosVeiculo.precoAvaliacao)) : null,
        doors: dadosVeiculo.portas ? parseInt(dadosVeiculo.portas) : null,
        seats: dadosVeiculo.lugares ? parseInt(dadosVeiculo.lugares) : null,
        value: dadosVeiculo.valor ? parseFloat(removeCurrencyMask(dadosVeiculo.valor)) : null
      };

      console.log('Dados sendo enviados:', dataToSend);

      // Determinar se é INSERT ou UPDATE
      const isUpdate = existingVehicleEvaluationId !== null;
      const url = isUpdate 
        ? `https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/vehicle_evaluations?id=eq.${existingVehicleEvaluationId}`
        : 'https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/vehicle_evaluations';
      const method = isUpdate ? 'PATCH' : 'POST';

      console.log(`${isUpdate ? 'UPDATE' : 'INSERT'} - Dados do Veículo`);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        alert('Dados do veículo salvos com sucesso!');
        // Recarregar dados da avaliação
        loadEvaluationData();
      } else {
        const errorData = await response.text();
        console.error('Erro detalhado:', response.status, errorData);
        alert(`Erro ao salvar dados do veículo: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao salvar dados do veículo:', error);
      alert('Erro inesperado ao salvar dados do veículo');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "historico":
        return (
          <>
            {/* Dados do Cliente */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Informações do Cliente
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Informações Básicas */}
                  <div className="space-y-4">
                    <h4 className="text-md font-bold text-gray-900 border-b border-gray-200 pb-2">
                      Dados Pessoais
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Nome do Cliente</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.nomeCliente}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">E-mail</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Telefone</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.telefone}</p>
                    </div>
                  </div>

                  {/* Contato e Atração */}
                  <div className="space-y-4">
                    <h4 className="text-md font-bold text-gray-900 border-b border-gray-200 pb-2">
                      Contato e Atração
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Forma de Contato</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.formaContato}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Mídia de Atração</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.midiaAtracao}</p>
                    </div>
                  </div>

                  {/* Vendas e Compras */}
                  <div className="space-y-4">
                    <h4 className="text-md font-bold text-gray-900 border-b border-gray-200 pb-2">
                      Vendas e Compras
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Vendedor</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.vendedor}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Tipo</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.tipo}</p>
                    </div>
                  </div>
                </div>

                {/* Detalhes do Veículo */}
                <div className="mt-8">
                  <h4 className="text-md font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    Detalhes do Veículo de Interesse
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Marca</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.marca}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Modelo</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.modelo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Ano</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.ano}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Tipo de Veículo</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.tipoVeiculo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Faixa de Preço</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.faixaPreco}</p>
                    </div>
                  </div>
                </div>

                {/* Fila de Espera */}
                <div className="mt-8">
                  <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    Fila de Espera
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Marca</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.marcaFila}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Modelo</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.modeloFila}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Versão</label>
                      <p className="mt-1 text-sm text-gray-900">{clientData?.versaoFila}</p>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={handleBack}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => {
                        if (clientData?.id) {
                          router.push(`/customer-details?id=${clientData.id}`);
                        } else {
                          alert('ID do cliente não encontrado');
                        }
                      }}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
                    >
                      Editar Cliente
                    </button>
                    <button
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Agendar Atendimento
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Histórico de Contatos */}
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Histórico de Contatos
                  </h3>
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    Novo Registro
                  </button>
                </div>

                {/* Formulário de Registro de Contato */}
                {showContactForm && (
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Registro de Contato
                    </h4>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Input
                          label="Data"
                          type="date"
                          name="data"
                          value={contactForm.data}
                          onChange={handleContactFormChange}
                          required
                        />
                        <Input
                          label="Hora"
                          type="time"
                          name="hora"
                          value={contactForm.hora}
                          onChange={handleContactFormChange}
                          required
                        />
                        <Select
                          label="Tipo de Contato"
                          name="tipoContato"
                          value={contactForm.tipoContato}
                          onChange={handleContactFormChange}
                        >
                          <option value="">Selecione</option>
                          {contactMethods.map((method) => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </Select>
                        <Select
                          label="Vendedor"
                          name="vendedor"
                          value={contactForm.vendedor}
                          onChange={handleContactFormChange}
                        >
                          <option value="">Selecione</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.name}>{user.name}</option>
                          ))}
                        </Select>
                      </div>
                      
                      <Textarea
                        label="Observações"
                        name="observacoes"
                        value={contactForm.observacoes}
                        onChange={handleContactFormChange}
                        rows={3}
                        placeholder="Descreva o que foi discutido no contato..."
                        required
                      />
                      
                      <Input
                        label="Próximo Contato (opcional)"
                        type="date"
                        name="proximoContato"
                        value={contactForm.proximoContato}
                        onChange={handleContactFormChange}
                      />
                      
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={handleCancelContactForm}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
                        >
                          Salvar Registro
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Lista de Histórico */}
                <div className="space-y-4">
                  {console.log('Renderizando histórico de contatos. Total:', contactHistory.length, 'Contatos:', contactHistory)}
                  {contactHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>Nenhum registro de contato encontrado</p>
                      <p className="text-sm text-gray-600">Clique em "Novo Registro" para começar</p>
                    </div>
                  ) : (
                    contactHistory.map((contact) => (
                      <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex space-x-4">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-gray-900">
                                {contact.data ? new Date(contact.data).toLocaleDateString('pt-BR') : '-'}
                              </span>
                              <span className="text-gray-500 ml-2">{contact.hora || '-'}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {contact.tipoContato}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {contact.vendedor || '-'}
                          </div>
                        </div>
                        
                        {contact.observacoes && (
                          <div className="text-sm text-gray-700 mb-2">
                            <span className="font-medium">Observações:</span> {contact.observacoes}
                          </div>
                        )}
                        
                        {contact.proximoContato && (
                          <div className="text-sm text-gray-600">
                            <span className="text-gray-500">Próximo contato: </span>
                            <span className="font-medium text-gray-900">
                              {new Date(contact.proximoContato).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        );

      case "avaliacao":
        return (
          <div className="space-y-8">
            {/* Fotos de documentos */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Fotos de documentos
                </h3>
                <FileUpload
                  onFileSelect={(files) => handleFileUpload(files, 'documentos')}
                  accept="image/*,.pdf,.doc,.docx"
                  multiple={true}
                >
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Enviando...' : 'Adicionar Anexo'}
                  </button>
                </FileUpload>
              </div>
              <AttachmentList
                attachments={documentosAnexos}
                onView={(attachment) => {
                  if (attachment.url) {
                    window.open(attachment.url, '_blank');
                  }
                }}
                onDownload={(attachment) => {
                  if (attachment.url) {
                    const link = document.createElement('a');
                    link.href = attachment.url;
                    link.download = attachment.nome;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
                onDelete={(attachment) => {
                  handleDeleteAttachment(attachment, 'documentos');
                }}
                emptyMessage="Nenhum anexo de documento encontrado"
              />
            </div>

            {/* Fotos da avaliação */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Fotos da avaliação
                </h3>
                <FileUpload
                  onFileSelect={(files) => handleFileUpload(files, 'avaliacao')}
                  accept="image/*,.pdf,.doc,.docx"
                  multiple={true}
                >
                  <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Enviando...' : 'Adicionar Anexo'}
                  </button>
                </FileUpload>
              </div>
              <AttachmentList
                attachments={avaliacaoAnexos}
                onView={(attachment) => {
                  if (attachment.url) {
                    window.open(attachment.url, '_blank');
                  }
                }}
                onDownload={(attachment) => {
                  if (attachment.url) {
                    const link = document.createElement('a');
                    link.href = attachment.url;
                    link.download = attachment.nome;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
                onDelete={(attachment) => {
                  handleDeleteAttachment(attachment, 'avaliacao');
                }}
                emptyMessage="Nenhum anexo de avaliação encontrado"
              />
            </div>

            {/* Fotos do anúncio */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Fotos do anúncio
                </h3>
                <FileUpload
                  onFileSelect={(files) => handleFileUpload(files, 'anuncio')}
                  accept="image/*,.pdf,.doc,.docx"
                  multiple={true}
                >
                  <button 
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Enviando...' : 'Adicionar Anexo'}
                  </button>
                </FileUpload>
              </div>
              <AttachmentList
                attachments={anuncioAnexos}
                onView={(attachment) => {
                  if (attachment.url) {
                    window.open(attachment.url, '_blank');
                  }
                }}
                onDownload={(attachment) => {
                  if (attachment.url) {
                    const link = document.createElement('a');
                    link.href = attachment.url;
                    link.download = attachment.nome;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
                onDelete={(attachment) => {
                  handleDeleteAttachment(attachment, 'anuncio');
                }}
                emptyMessage="Nenhum anexo de anúncio encontrado"
              />
            </div>

            {/* Previsão de Reparo */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Previsão de Reparo
              </h3>
              
              {/* Tabela de previsões */}
              <div className="mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previsão</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previsoesReparo.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            Nenhuma previsão de reparo encontrada
                          </td>
                        </tr>
                      ) : (
                        previsoesReparo.map((previsao, index) => (
                          <tr key={previsao.id || index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {previsao.descricao}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {previsao.created_at ? new Date(previsao.created_at).toLocaleDateString('pt-BR') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {previsao.data}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {previsao.fornecedor}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {previsao.valor}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div></div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      Total: R$ {previsoesReparo.reduce((total, previsao) => {
                        const valor = previsao.valorNumerico || 0;
                        return total + valor;
                      }, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formulário para registrar previsão */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Registrar Previsão de Reparo
                </h4>
                <form onSubmit={salvarPrevisaoReparo} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                      label="Descrição"
                      type="text"
                      name="descricao"
                      placeholder="Descrição"
                      value={previsaoReparo.descricao}
                      onChange={(e) => setPrevisaoReparo(prev => ({ ...prev, descricao: e.target.value }))}
                      required
                    />
                    <Select
                      label="Fornecedor"
                      name="fornecedor"
                      value={previsaoReparo.fornecedor}
                      onChange={(e) => setPrevisaoReparo(prev => ({ ...prev, fornecedor: e.target.value }))}
                    >
                      <option value="">Selecione</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                      ))}
                    </Select>
                    <Input
                      label="Valor"
                      type="text"
                      name="valor"
                      placeholder="0,00"
                      value={previsaoReparo.valor}
                      onChange={(e) => {
                        const maskedValue = applyCurrencyMask(e.target.value);
                        setPrevisaoReparo(prev => ({ ...prev, valor: maskedValue }));
                      }}
                      required
                    />
                    <Input
                      label="Data"
                      type="date"
                      name="data"
                      value={previsaoReparo.data}
                      onChange={(e) => setPrevisaoReparo(prev => ({ ...prev, data: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    {editingPrevisaoId ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPrevisaoReparo({ descricao: "", fornecedor: "", valor: "", data: "" });
                          setEditingPrevisaoId(null);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPrevisaoReparo({ descricao: "", fornecedor: "", valor: "", data: "" })}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Limpar
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Salvando...' : editingPrevisaoId ? 'Atualizar Previsão' : 'Salvar Previsão'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Proprietário Legal */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Proprietário Legal
              </h3>
              
              <form onSubmit={salvarProprietarioLegal} className="space-y-4">
                {/* Primeira linha */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Nome"
                    type="text"
                    name="nome"
                    placeholder="Nome"
                    value={proprietarioLegal.nome}
                    onChange={(e) => setProprietarioLegal(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                  <Input
                    label="CPF"
                    type="text"
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={proprietarioLegal.cpf}
                    onChange={(e) => {
                      const maskedValue = applyCpfMask(e.target.value);
                      setProprietarioLegal(prev => ({ ...prev, cpf: maskedValue }));
                    }}
                    required
                  />
                  <Input
                    label="E-Mail"
                    type="email"
                    name="email"
                    placeholder="E-Mail"
                    value={proprietarioLegal.email}
                    onChange={(e) => setProprietarioLegal(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                {/* Segunda linha */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Celular"
                    type="tel"
                    name="celular"
                    placeholder="(00) 00000-0000"
                    value={proprietarioLegal.celular}
                    onChange={(e) => {
                      const maskedValue = applyPhoneMask(e.target.value);
                      setProprietarioLegal(prev => ({ ...prev, celular: maskedValue }));
                    }}
                    required
                  />
                  <Input
                    label="Celular 2"
                    type="tel"
                    name="celular2"
                    placeholder="(00) 00000-0000"
                    value={proprietarioLegal.celular2}
                    onChange={(e) => {
                      const maskedValue = applyPhoneMask(e.target.value);
                      setProprietarioLegal(prev => ({ ...prev, celular2: maskedValue }));
                    }}
                  />
                  <Input
                    label="Data de Nascimento"
                    type="date"
                    name="dataNascimento"
                    placeholder="Data de Nascimento"
                    value={proprietarioLegal.dataNascimento}
                    onChange={(e) => setProprietarioLegal(prev => ({ ...prev, dataNascimento: e.target.value }))}
                    required
                  />
                </div>

                {/* Terceira linha */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="CEP"
                    type="text"
                    name="cep"
                    placeholder="00000-000"
                    value={proprietarioLegal.cep}
                    onChange={(e) => {
                      const maskedValue = applyCepMask(e.target.value);
                      setProprietarioLegal(prev => ({ ...prev, cep: maskedValue }));
                    }}
                    required
                  />
                  <Input
                    label="Endereço"
                    type="text"
                    name="endereco"
                    placeholder="Endereço"
                    value={proprietarioLegal.endereco}
                    onChange={(e) => setProprietarioLegal(prev => ({ ...prev, endereco: e.target.value }))}
                    required
                  />
                  <Input
                    label="Estado"
                    type="text"
                    name="estado"
                    placeholder="Estado"
                    value={proprietarioLegal.estado}
                    onChange={(e) => setProprietarioLegal(prev => ({ ...prev, estado: e.target.value }))}
                    required
                  />
                  <Input
                    label="UF"
                    type="text"
                    name="uf"
                    placeholder="UF"
                    value={proprietarioLegal.uf}
                    onChange={(e) => setProprietarioLegal(prev => ({ ...prev, uf: e.target.value }))}
                    required
                  />
                </div>

                {/* Botão de ação */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>

            {/* Proprietário de Posse */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Proprietário de Posse
              </h3>
              
              <form onSubmit={salvarProprietarioPosse} className="space-y-4">
                {/* Primeira linha */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Nome"
                    type="text"
                    name="nome"
                    placeholder="Nome do proprietário de posse"
                    value={proprietarioPosse.nome}
                    onChange={(e) => setProprietarioPosse(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                  <Input
                    label="CPF"
                    type="text"
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={proprietarioPosse.cpf}
                    onChange={(e) => {
                      const maskedValue = applyCpfMask(e.target.value);
                      setProprietarioPosse(prev => ({ ...prev, cpf: maskedValue }));
                    }}
                    required
                  />
                  <Input
                    label="E-Mail"
                    type="email"
                    name="email"
                    placeholder="E-mail do proprietário de posse"
                    value={proprietarioPosse.email}
                    onChange={(e) => setProprietarioPosse(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                {/* Segunda linha */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Celular"
                    type="tel"
                    name="celular"
                    value={proprietarioPosse.celular}
                    readOnly
                    className="bg-gray-100"
                  />
                  <Input
                    label="Celular 2"
                    type="tel"
                    name="celular2"
                    placeholder="(00) 00000-0000"
                    value={proprietarioPosse.celular2}
                    onChange={(e) => {
                      const maskedValue = applyPhoneMask(e.target.value);
                      setProprietarioPosse(prev => ({ ...prev, celular2: maskedValue }));
                    }}
                  />
                  <Input
                    label="Data de Nascimento"
                    type="date"
                    name="dataNascimento"
                    placeholder="Data de Nascimento"
                    value={proprietarioPosse.dataNascimento}
                    onChange={(e) => setProprietarioPosse(prev => ({ ...prev, dataNascimento: e.target.value }))}
                    required
                  />
                </div>

                {/* Terceira linha */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="CEP"
                    type="text"
                    name="cep"
                    placeholder="00000-000"
                    value={proprietarioPosse.cep}
                    onChange={(e) => {
                      const maskedValue = applyCepMask(e.target.value);
                      setProprietarioPosse(prev => ({ ...prev, cep: maskedValue }));
                    }}
                    required
                  />
                  <Input
                    label="Endereço"
                    type="text"
                    name="endereco"
                    placeholder="Endereço"
                    value={proprietarioPosse.endereco}
                    onChange={(e) => setProprietarioPosse(prev => ({ ...prev, endereco: e.target.value }))}
                    required
                  />
                  <Input
                    label="Estado"
                    type="text"
                    name="estado"
                    placeholder="Estado"
                    value={proprietarioPosse.estado}
                    onChange={(e) => setProprietarioPosse(prev => ({ ...prev, estado: e.target.value }))}
                    required
                  />
                  <Input
                    label="UF"
                    type="text"
                    name="uf"
                    placeholder="UF"
                    value={proprietarioPosse.uf}
                    onChange={(e) => setProprietarioPosse(prev => ({ ...prev, uf: e.target.value }))}
                    required
                  />
                </div>

                {/* Botão de ação */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>

            {/* Formulário de dados do veículo */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Dados do Veículo
              </h3>
              
              <form onSubmit={salvarDadosVeiculo} className="space-y-6">
                {/* Primeira linha */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <Input
                    label="Marca"
                    type="text"
                    name="marca"
                    placeholder="Marca do veículo"
                    value={dadosVeiculo.marca}
                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, marca: e.target.value }))}
                    required
                  />
                  <Input
                    label="Placa"
                    type="text"
                    name="placa"
                    placeholder="Digite a placa"
                    value={dadosVeiculo.placa}
                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, placa: e.target.value }))}
                    required
                  />
                  <Input
                    label="Modelo"
                    type="text"
                    name="modelo"
                    placeholder="Modelo do veículo"
                    value={dadosVeiculo.modelo}
                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, modelo: e.target.value }))}
                    required
                  />
                  <Input
                    label="Ano"
                    type="text"
                    name="ano"
                    placeholder="Digite o ano"
                    value={dadosVeiculo.ano}
                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, ano: e.target.value }))}
                    required
                  />
                  <Select
                    label="Cor"
                    name="cor"
                    value={dadosVeiculo.cor}
                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, cor: e.target.value }))}
                  >
                    <option value="">Selecione</option>
                    {colors.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </Select>
                  <Input
                    label="Mais barato"
                    type="text"
                    name="maisBarato"
                    placeholder="R$ 0,00"
                    value={dadosVeiculo.maisBarato}
                    onChange={(e) => {
                      const maskedValue = applyCurrencyMask(e.target.value);
                      setDadosVeiculo(prev => ({ ...prev, maisBarato: maskedValue }));
                    }}
                  />
                </div>

                {/* Segunda linha */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="FIPE"
                    type="text"
                    name="fipe"
                    placeholder="R$ 0,00"
                    value={dadosVeiculo.fipe}
                    onChange={(e) => {
                      const maskedValue = applyCurrencyMask(e.target.value);
                      setDadosVeiculo(prev => ({ ...prev, fipe: maskedValue }));
                    }}
                  />
                  <Input
                    label="Mais caro"
                    type="text"
                    name="maisCaro"
                    placeholder="R$ 0,00"
                    value={dadosVeiculo.maisCaro}
                    onChange={(e) => {
                      const maskedValue = applyCurrencyMask(e.target.value);
                      setDadosVeiculo(prev => ({ ...prev, maisCaro: maskedValue }));
                    }}
                  />
                  <Input
                    label="R$ Médio"
                    type="text"
                    name="precoMedio"
                    placeholder="R$ 0,00"
                    value={dadosVeiculo.precoMedio}
                    onChange={(e) => {
                      const maskedValue = applyCurrencyMask(e.target.value);
                      setDadosVeiculo(prev => ({ ...prev, precoMedio: maskedValue }));
                    }}
                  />
                  <Input
                    label="R$ Avaliação"
                    type="text"
                    name="precoAvaliacao"
                    placeholder="R$ 0,00"
                    value={dadosVeiculo.precoAvaliacao}
                    onChange={(e) => {
                      const maskedValue = applyCurrencyMask(e.target.value);
                      setDadosVeiculo(prev => ({ ...prev, precoAvaliacao: maskedValue }));
                    }}
                  />
                </div>

                {/* Terceira linha */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Portas"
                    type="number"
                    name="portas"
                    placeholder="4"
                    value={dadosVeiculo.portas}
                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, portas: e.target.value }))}
                  />
                  <Input
                    label="Qntd. de lugares"
                    type="number"
                    name="lugares"
                    placeholder="5"
                    value={dadosVeiculo.lugares}
                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, lugares: e.target.value }))}
                  />
                  <Input
                    label="Valor"
                    type="text"
                    name="valor"
                    placeholder="0,00"
                    value={dadosVeiculo.valor}
                    onChange={(e) => {
                      const maskedValue = applyCurrencyMask(e.target.value);
                      setDadosVeiculo(prev => ({ ...prev, valor: maskedValue }));
                    }}
                    required
                  />
                </div>

                {/* Botões de ação */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Iniciar avaliação
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar avaliação'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case "formalizacao":
        return (
          <div className="space-y-6">
            {/* Checkboxes de tipo de formalização */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tipo de Formalização
              </h3>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formalizationTypes.pedidoVenda}
                    onChange={(e) => {
                      const updatedTypes = { ...formalizationTypes, pedidoVenda: e.target.checked };
                      setFormalizationTypes(updatedTypes);
                      salvarTiposFormalizacao(updatedTypes);
                    }}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pedido de Venda</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formalizationTypes.contratoCompra}
                    onChange={(e) => {
                      const updatedTypes = { ...formalizationTypes, contratoCompra: e.target.checked };
                      setFormalizationTypes(updatedTypes);
                      salvarTiposFormalizacao(updatedTypes);
                    }}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Contrato de Compra</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formalizationTypes.contratoConsignacao}
                    onChange={(e) => {
                      const updatedTypes = { ...formalizationTypes, contratoConsignacao: e.target.checked };
                      setFormalizationTypes(updatedTypes);
                      salvarTiposFormalizacao(updatedTypes);
                    }}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Contrato de Consignação</span>
                </label>
              </div>
            </div>

            {/* Seção Cliente */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Cliente
              </h3>
              
              {/* Área de upload de documentos */}
              <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* CNH */}
                  <div className="space-y-4">
                    {cnhAnexos.length > 0 ? (
                      <CompactAttachmentList
                        attachments={cnhAnexos}
                        onView={(attachment) => {
                          if (attachment.url) {
                            window.open(attachment.url, '_blank');
                          }
                        }}
                        onDownload={(attachment) => {
                          if (attachment.url) {
                            const link = document.createElement('a');
                            link.href = attachment.url;
                            link.download = attachment.nome;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        onDelete={(attachment) => {
                          handleDeleteAttachment(attachment, 'cnh');
                        }}
                      />
                    ) : (
                      <FileUpload
                        onFileSelect={(files) => handleFileUpload(files, 'cnh')}
                        accept="image/*,.pdf,.doc,.docx"
                        multiple={true}
                      >
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-700">CNH</p>
                        </div>
                      </FileUpload>
                    )}
                  </div>

                  {/* RG */}
                  <div className="space-y-4">
                    {rgAnexos.length > 0 ? (
                      <CompactAttachmentList
                        attachments={rgAnexos}
                        onView={(attachment) => {
                          if (attachment.url) {
                            window.open(attachment.url, '_blank');
                          }
                        }}
                        onDownload={(attachment) => {
                          if (attachment.url) {
                            const link = document.createElement('a');
                            link.href = attachment.url;
                            link.download = attachment.nome;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        onDelete={(attachment) => {
                          handleDeleteAttachment(attachment, 'rg');
                        }}
                      />
                    ) : (
                      <FileUpload
                        onFileSelect={(files) => handleFileUpload(files, 'rg')}
                        accept="image/*,.pdf,.doc,.docx"
                        multiple={true}
                      >
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-700">RG</p>
                        </div>
                      </FileUpload>
                    )}
                  </div>

                  {/* DOCUMENTO 1 */}
                  <div className="space-y-4">
                    {documento1Anexos.length > 0 ? (
                      <CompactAttachmentList
                        attachments={documento1Anexos}
                        onView={(attachment) => {
                          if (attachment.url) {
                            window.open(attachment.url, '_blank');
                          }
                        }}
                        onDownload={(attachment) => {
                          if (attachment.url) {
                            const link = document.createElement('a');
                            link.href = attachment.url;
                            link.download = attachment.nome;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        onDelete={(attachment) => {
                          handleDeleteAttachment(attachment, 'documento1');
                        }}
                      />
                    ) : (
                      <FileUpload
                        onFileSelect={(files) => handleFileUpload(files, 'documento1')}
                        accept="image/*,.pdf,.doc,.docx"
                        multiple={true}
                      >
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-700">DOCUMENTO 1</p>
                        </div>
                      </FileUpload>
                    )}
                  </div>

                  {/* DOCUMENTO 2 */}
                  <div className="space-y-4">
                    {documento2Anexos.length > 0 ? (
                      <CompactAttachmentList
                        attachments={documento2Anexos}
                        onView={(attachment) => {
                          if (attachment.url) {
                            window.open(attachment.url, '_blank');
                          }
                        }}
                        onDownload={(attachment) => {
                          if (attachment.url) {
                            const link = document.createElement('a');
                            link.href = attachment.url;
                            link.download = attachment.nome;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        onDelete={(attachment) => {
                          handleDeleteAttachment(attachment, 'documento2');
                        }}
                      />
                    ) : (
                      <FileUpload
                        onFileSelect={(files) => handleFileUpload(files, 'documento2')}
                        accept="image/*,.pdf,.doc,.docx"
                        multiple={true}
                      >
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-700">DOCUMENTO 2</p>
                        </div>
                      </FileUpload>
                    )}
                  </div>
                </div>
              </div>

              {/* Formulário de dados do cliente */}
              <form onSubmit={salvarDadosCliente} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Coluna esquerda */}
                  <div className="space-y-4">
                    <Input
                      label="CPF/CNPJ"
                      type="text"
                      name="cpfCnpj"
                      placeholder="CPF/CNPJ"
                      value={formalizationClient.cpfCnpj}
                      onChange={(e) => {
                        const maskedValue = applyCpfMask(e.target.value);
                        setFormalizationClient(prev => ({ ...prev, cpfCnpj: maskedValue }));
                      }}
                    />
                    <Input
                      label="RG/IE"
                      type="text"
                      name="rgIe"
                      placeholder="RG/IE"
                      value={formalizationClient.rgIe}
                      onChange={(e) => setFormalizationClient(prev => ({ ...prev, rgIe: e.target.value }))}
                    />
                    <Input
                      label="CEP"
                      type="text"
                      name="cep"
                      placeholder="CEP"
                      value={formalizationClient.cep}
                      onChange={(e) => {
                        const maskedValue = applyCepMask(e.target.value);
                        setFormalizationClient(prev => ({ ...prev, cep: maskedValue }));
                      }}
                    />
                  </div>

                  {/* Coluna direita */}
                  <div className="space-y-4">
                    <Input
                      label="Nome"
                      type="text"
                      name="nome"
                      placeholder="Nome do cliente"
                      value={formalizationClient.nome}
                      onChange={(e) => setFormalizationClient(prev => ({ ...prev, nome: e.target.value }))}
                    />
                    <Input
                      label="Telefone"
                      type="tel"
                      name="telefone"
                      placeholder="Telefone do cliente"
                      value={formalizationClient.telefone}
                      onChange={(e) => {
                        const maskedValue = applyPhoneMask(e.target.value);
                        setFormalizationClient(prev => ({ ...prev, telefone: maskedValue }));
                      }}
                    />
                    <Input
                      label="E-mail"
                      type="email"
                      name="email"
                      placeholder="E-mail do cliente"
                      value={formalizationClient.email}
                      onChange={(e) => setFormalizationClient(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <Input
                      label="Data de Nasc."
                      type="date"
                      name="dataNascimento"
                      placeholder="Data de Nascimento"
                      value={formalizationClient.dataNascimento}
                      onChange={(e) => setFormalizationClient(prev => ({ ...prev, dataNascimento: e.target.value }))}
                    />
                    <Input
                      label="Endereço"
                      type="text"
                      name="endereco"
                      placeholder="Endereço"
                      value={formalizationClient.endereco}
                      onChange={(e) => setFormalizationClient(prev => ({ ...prev, endereco: e.target.value }))}
                    />
                    <Input
                      label="Cidade"
                      type="text"
                      name="cidade"
                      placeholder="Cidade"
                      value={formalizationClient.cidade}
                      onChange={(e) => setFormalizationClient(prev => ({ ...prev, cidade: e.target.value }))}
                    />
                    <Input
                      label="Estado"
                      type="text"
                      name="estado"
                      placeholder="Estado"
                      value={formalizationClient.estado}
                      onChange={(e) => setFormalizationClient(prev => ({ ...prev, estado: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Botão de ação */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>

            {/* Seção Forma de Pagamento */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Forma de pagamento
              </h3>
              
              {/* Tabela de pagamentos */}
              <div className="mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formalizationPayments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            Nenhum pagamento registrado
                          </td>
                        </tr>
                      ) : (
                        formalizationPayments.map((payment, index) => (
                          <tr key={payment.id || index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.dataPagamento ? new Date(payment.dataPagamento).toLocaleDateString('pt-BR') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.formaPagamento}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.valorPagamento}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                                payment.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                payment.status === 'pago' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Total e botões de ação */}
                <div className="flex justify-between items-center mt-4">
                  <div></div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">
                      Total: R$ {formalizationPayments.reduce((total, payment) => {
                        const valor = payment.valorNumerico || 0;
                        return total + valor;
                      }, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formulário para registrar pagamento */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Registrar Forma de Pagamento
                </h4>
                <form onSubmit={salvarPagamento} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Data"
                      type="date"
                      name="dataPagamento"
                      placeholder="Data do pagamento"
                      value={newPayment.dataPagamento}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, dataPagamento: e.target.value }))}
                    />
                    <Select
                      label="Forma de pagamento"
                      name="formaPagamento"
                      value={newPayment.formaPagamento}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, formaPagamento: e.target.value }))}
                    >
                      <option value="">Selecione...</option>
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method === 'deposito' ? 'Depósito' :
                           method === 'dinheiro' ? 'Dinheiro' :
                           method === 'cartao' ? 'Cartão' :
                           method === 'pix' ? 'PIX' :
                           method === 'transferencia' ? 'Transferência' : method}
                        </option>
                      ))}
                    </Select>
                    <Input
                      label="Valor"
                      type="text"
                      name="valorPagamento"
                      placeholder="0,00"
                      value={newPayment.valorPagamento}
                      onChange={(e) => {
                        const maskedValue = applyCurrencyMask(e.target.value);
                        setNewPayment(prev => ({ ...prev, valorPagamento: maskedValue }));
                      }}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setNewPayment({ dataPagamento: "", formaPagamento: "", valorPagamento: "" })}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Salvando...' : 'Salvar Pagamento'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Botão Imprimir */}
            <div className="flex justify-end">
              <button
                type="button"
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Imprimir
              </button>
            </div>
          </div>
        );

      case "entrega":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Entrega
            </h3>
            
            <form onSubmit={salvarDadosEntrega} className="space-y-6">
              {/* Campos superiores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Data e hora"
                  type="datetime-local"
                  name="dataHora"
                  placeholder="Data e hora da entrega"
                  value={formalizationDelivery.dataHora}
                  onChange={(e) => setFormalizationDelivery(prev => ({ ...prev, dataHora: e.target.value }))}
                />
                <Input
                  label="KM"
                  type="text"
                  name="km"
                  placeholder="KM"
                  value={formalizationDelivery.km}
                  onChange={(e) => setFormalizationDelivery(prev => ({ ...prev, km: e.target.value }))}
                />
              </div>

              {/* Campo de observação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observação
                </label>
                <textarea
                  name="observacao"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Observações sobre a entrega..."
                  value={formalizationDelivery.observacao}
                  onChange={(e) => setFormalizationDelivery(prev => ({ ...prev, observacao: e.target.value }))}
                />
              </div>

              {/* Seção do termo assinado */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Termo Assinado
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setFormalizationDelivery(prev => ({ ...prev, termoAssinado: file }));
                      }}
                      className="hidden"
                      id="termo-assinado-upload"
                    />
                    <label
                      htmlFor="termo-assinado-upload"
                      className="cursor-pointer"
                    >
                      {formalizationDelivery.termoAssinado ? (
                        <div className="text-green-600">
                          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-medium">Arquivo selecionado:</p>
                          <p className="text-sm text-gray-600">{formalizationDelivery.termoAssinado.name}</p>
                          <p className="text-xs text-gray-500 mt-1">Clique para alterar</p>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm font-medium">Clique para fazer upload</p>
                          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DOC, DOCX</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formalizationDelivery.manualEntregue}
                      onChange={(e) => setFormalizationDelivery(prev => ({ ...prev, manualEntregue: e.target.checked }))}
                      className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Veículo entregue com manual
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formalizationDelivery.chaveReservaEntregue}
                      onChange={(e) => setFormalizationDelivery(prev => ({ ...prev, chaveReservaEntregue: e.target.checked }))}
                      className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Veículo entregue com chave reserva
                    </span>
                  </label>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Imprimir termo de entrega
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!clientData) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center py-12">
            <p className="text-gray-500">Cliente não encontrado</p>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Ficha de Atendimento
              </h2>
              <p className="text-gray-600">
                Dados completos do cliente selecionado
              </p>
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>

        {/* Navegação por abas */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

          {/* Conteúdo das abas */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </main>
  );
}
