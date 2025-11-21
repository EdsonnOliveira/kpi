import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AttachmentList, AttachmentData } from "../components/Attachment";
import { CompactAttachmentList } from "../components/CompactAttachment";
import { 
  applyCurrencyMask, 
  removeCurrencyMask,
  applyCpfMask,
  removeCpfMask,
  applyCnpjMask,
  removeCnpjMask,
  applyPhoneMask,
  removePhoneMask,
  applyCepMask,
  removeCepMask,
  formatDateBR,
  formatCurrency
} from "../lib/formatting";
import { uploadMultipleFiles, listAppointmentFiles, deleteFile } from "../lib/fileUpload";
import FileUpload from "../components/FileUpload";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";
import jsPDF from "jspdf";

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
    proximoContato: "",
    proximoContatoHora: ""
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
    tipoDocumento: "CPF" as "CPF" | "CNPJ",
    cpf: "",
    cnpj: "",
    inscricaoEstadual: "",
    nome: "",
    email: "",
    celular: "",
    celular2: "",
    dataNascimento: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    uf: ""
  });

  const [proprietarioPosse, setProprietarioPosse] = useState({
    tipoDocumento: "CPF" as "CPF" | "CNPJ",
    cpf: "",
    cnpj: "",
    inscricaoEstadual: "",
    nome: "",
    email: "",
    celular: "(61) 98195-0302",
    celular2: "",
    dataNascimento: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    uf: ""
  });

  const [dadosVeiculo, setDadosVeiculo] = useState({
    marca: "",
    placa: "",
    modelo: "",
    ano: "",
    cor: "",
    chassi: "",
    renavam: "",
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
          const tipoDoc = legal.cnpj ? 'CNPJ' : 'CPF';
          const documento = legal.cnpj 
            ? applyCnpjMask(legal.cnpj) 
            : (legal.cpf ? applyCpfMask(legal.cpf) : '');
          
          setProprietarioLegal({
            tipoDocumento: tipoDoc,
            cpf: tipoDoc === 'CPF' ? documento : '',
            cnpj: tipoDoc === 'CNPJ' ? documento : '',
            inscricaoEstadual: legal.inscricao_estadual || '',
            nome: legal.name || '',
            email: legal.email || '',
            celular: legal.phone ? applyPhoneMask(legal.phone) : '',
            celular2: legal.phone2 ? applyPhoneMask(legal.phone2) : '',
            dataNascimento: legal.birth_date || '',
            cep: legal.zip_code ? applyCepMask(legal.zip_code) : '',
            endereco: legal.address || '',
            numero: legal.number || '',
            complemento: legal.complement || '',
            bairro: legal.neighborhood || '',
            cidade: legal.city || '',
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
          const tipoDoc = posse.cnpj ? 'CNPJ' : 'CPF';
          const documento = posse.cnpj 
            ? applyCnpjMask(posse.cnpj) 
            : (posse.cpf ? applyCpfMask(posse.cpf) : '');
          
          setProprietarioPosse({
            tipoDocumento: tipoDoc,
            cpf: tipoDoc === 'CPF' ? documento : '',
            cnpj: tipoDoc === 'CNPJ' ? documento : '',
            inscricaoEstadual: posse.inscricao_estadual || '',
            nome: posse.name || '',
            email: posse.email || '',
            celular: posse.phone ? applyPhoneMask(posse.phone) : '(61) 98195-0302',
            celular2: posse.phone2 ? applyPhoneMask(posse.phone2) : '',
            dataNascimento: posse.birth_date || '',
            cep: posse.zip_code ? applyCepMask(posse.zip_code) : '',
            endereco: posse.address || '',
            numero: posse.number || '',
            complemento: posse.complement || '',
            bairro: posse.neighborhood || '',
            cidade: posse.city || '',
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
            chassi: vehicle.chassis || '',
            renavam: vehicle.renavam || '',
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
                  termoAssinadoPath = uploadResults[0].data.url || '';
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

      const proximoContatoDateTime = contactForm.proximoContato && contactForm.proximoContatoHora
        ? `${contactForm.proximoContato}T${contactForm.proximoContatoHora}:00`
        : contactForm.proximoContato
          ? `${contactForm.proximoContato}T00:00:00`
          : null;

      const dataToSend = {
        appointment_id: id.toString(),
        company_id: user.company_id,
        data_contato: contactForm.data,
        hora_contato: contactForm.hora,
        tipo_contato: contactForm.tipoContato,
        vendedor: contactForm.vendedor,
        observacoes: contactForm.observacoes,
        proximo_contato: proximoContatoDateTime
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
          proximoContato: "",
          proximoContatoHora: ""
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
      proximoContato: "",
      proximoContatoHora: ""
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

      const documento = proprietarioLegal.tipoDocumento === 'CNPJ' 
        ? removeCnpjMask(proprietarioLegal.cnpj)
        : removeCpfMask(proprietarioLegal.cpf);

      const dataToSend = {
        appointment_id: id.toString(),
        company_id: user.company_id,
        name: proprietarioLegal.nome,
        cpf: proprietarioLegal.tipoDocumento === 'CPF' ? documento : null,
        cnpj: proprietarioLegal.tipoDocumento === 'CNPJ' ? documento : null,
        inscricao_estadual: proprietarioLegal.tipoDocumento === 'CNPJ' ? proprietarioLegal.inscricaoEstadual : null,
        email: proprietarioLegal.email,
        phone: removePhoneMask(proprietarioLegal.celular),
        phone2: removePhoneMask(proprietarioLegal.celular2),
        birth_date: proprietarioLegal.dataNascimento || null,
        zip_code: removeCepMask(proprietarioLegal.cep),
        address: proprietarioLegal.endereco,
        number: proprietarioLegal.numero,
        complement: proprietarioLegal.complemento,
        neighborhood: proprietarioLegal.bairro,
        city: proprietarioLegal.cidade,
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

      const documento = proprietarioPosse.tipoDocumento === 'CNPJ' 
        ? removeCnpjMask(proprietarioPosse.cnpj)
        : removeCpfMask(proprietarioPosse.cpf);

      const dataToSend = {
        appointment_id: id.toString(),
        company_id: user.company_id,
        name: proprietarioPosse.nome,
        cpf: proprietarioPosse.tipoDocumento === 'CPF' ? documento : null,
        cnpj: proprietarioPosse.tipoDocumento === 'CNPJ' ? documento : null,
        inscricao_estadual: proprietarioPosse.tipoDocumento === 'CNPJ' ? proprietarioPosse.inscricaoEstadual : null,
        email: proprietarioPosse.email,
        phone: removePhoneMask(proprietarioPosse.celular),
        phone2: removePhoneMask(proprietarioPosse.celular2),
        birth_date: proprietarioPosse.dataNascimento || null,
        zip_code: removeCepMask(proprietarioPosse.cep),
        address: proprietarioPosse.endereco,
        number: proprietarioPosse.numero,
        complement: proprietarioPosse.complemento,
        neighborhood: proprietarioPosse.bairro,
        city: proprietarioPosse.cidade,
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

      const dataToSend = {
        appointment_id: id.toString(),
        company_id: user.company_id,
        brand: dadosVeiculo.marca,
        plate: dadosVeiculo.placa,
        model: dadosVeiculo.modelo,
        year: dadosVeiculo.ano,
        color: dadosVeiculo.cor,
        chassis: dadosVeiculo.chassi || null,
        renavam: dadosVeiculo.renavam || null,
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

  const gerarPDFContrato = async () => {
    const userData = localStorage.getItem('user_data');
    const accessToken = localStorage.getItem('supabase_access_token');
    
    if (!userData || !accessToken) {
      alert('Erro ao gerar PDF: dados do usuário não encontrados');
      return;
    }

    const user = JSON.parse(userData);
    let companyData = null;

    try {
      const companyResponse = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/companies?id=eq.${user.company_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });

      if (companyResponse.ok) {
        const data = await companyResponse.json();
        if (data.length > 0) {
          companyData = data[0];
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados da empresa:', error);
    }

    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    const numeroContrato = id || 'N/A';
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`CONTRATO DE VENDA Nº ${numeroContrato}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTRATO DE COMPRA E VENDA DE VEÍCULO USADO', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const textoRegulamentacao = 'Regulado pelo Código Civil Brasileiro (Lei nº 10.406/2002)';
    doc.text(textoRegulamentacao, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('VENDEDORA', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const vendedoraNome = companyData?.name || 'Não informado';
    const vendedoraCnpj = companyData?.document || companyData?.cnpj || 'Não informado';
    const vendedoraEndereco = companyData?.address || 'Não informado';
    const vendedoraNumero = '';
    const vendedoraBairro = '';
    const vendedoraCidade = companyData?.city || 'Não informado';
    const vendedoraEstado = companyData?.state || 'Não informado';
    const vendedoraCep = companyData?.zip_code || 'Não informado';

    doc.text(`Identifica-se ${vendedoraNome}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${vendedoraCnpj},`, margin, yPos);
    yPos += 6;
    const enderecoVendedora = `${vendedoraEndereco}${vendedoraNumero ? ', Nº ' + vendedoraNumero : ''}${vendedoraBairro ? ', bairro ' + vendedoraBairro : ''}, ${vendedoraCidade}/${vendedoraEstado}${vendedoraCep ? ', CEP: ' + vendedoraCep : ''}.`;
    const enderecoLines = doc.splitTextToSize(enderecoVendedora, maxWidth);
    doc.text(enderecoLines, margin, yPos);
    yPos += enderecoLines.length * 6 + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('COMPRADOR(A)', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const compradorNome = formalizationClient.nome || clientData?.nomeCliente || 'Não informado';
    const compradorCpfCnpj = formalizationClient.cpfCnpj || 'Não informado';
    const compradorRg = formalizationClient.rgIe || 'Não informado';
    const compradorCep = formalizationClient.cep || 'Não informado';
    const compradorEndereco = formalizationClient.endereco || 'Não informado';
    const compradorCidade = formalizationClient.cidade || 'Não informado';
    const compradorEstado = formalizationClient.estado || 'Não informado';

    const compradorTexto = `Identifica-se ${compradorNome}, portador(a) do CPF/CNPJ nº ${compradorCpfCnpj}, RG nº ${compradorRg},`;
    const compradorTextoLines = doc.splitTextToSize(compradorTexto, maxWidth);
    doc.text(compradorTextoLines, margin, yPos);
    yPos += compradorTextoLines.length * 6;
    
    const compradorEnderecoTexto = `residente e domiciliado(a) em ${compradorEndereco}${compradorCep ? ', CEP: ' + compradorCep : ''}, ${compradorCidade}/${compradorEstado}.`;
    const compradorEnderecoLines = doc.splitTextToSize(compradorEnderecoTexto, maxWidth);
    doc.text(compradorEnderecoLines, margin, yPos);
    yPos += compradorEnderecoLines.length * 6 + 8;

    const textoPartes = 'As partes acima identificadas têm entre si justo e contratado o presente CONTRATO DE COMPRA E VENDA DE VEÍCULO USADO, que se regerá pelas cláusulas e condições seguintes:';
    const textoPartesLines = doc.splitTextToSize(textoPartes, maxWidth);
    doc.text(textoPartesLines, margin, yPos);
    yPos += textoPartesLines.length * 6 + 10;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DO OBJETO DO CONTRATO', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Cláusula Primeira', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const clausula1 = `O presente contrato tem por objeto o veículo usado de propriedade da VENDEDORA, livre e desembaraçado de qualquer ônus ou gravame.`;
    const clausula1Lines = doc.splitTextToSize(clausula1, maxWidth);
    doc.text(clausula1Lines, margin, yPos);
    yPos += clausula1Lines.length * 6 + 6;

    doc.setFont('helvetica', 'bold');
    doc.text('Cláusula Segunda', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const clausula2 = `O veículo é USADO, apresentando desgaste natural pelo tempo, já visto e vistoriado pelo COMPRADOR, que está ciente de suas condições e estado de conservação.`;
    const clausula2Lines = doc.splitTextToSize(clausula2, maxWidth);
    doc.text(clausula2Lines, margin, yPos);
    yPos += clausula2Lines.length * 6 + 10;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DADOS DO VEÍCULO', margin, yPos);
    yPos += 8;

    const veiculoMarca = dadosVeiculo.marca || clientData?.marca || 'Não informado';
    const veiculoModelo = dadosVeiculo.modelo || clientData?.modelo || 'Não informado';
    const veiculoAno = dadosVeiculo.ano || clientData?.ano || 'Não informado';
    const veiculoCor = dadosVeiculo.cor || 'Não informado';
    const veiculoPlaca = dadosVeiculo.placa || 'Não informado';
    const veiculoChassi = dadosVeiculo.chassi || '';
    const veiculoRenavam = dadosVeiculo.renavam || 'Não informado';
    const veiculoKm = '';

    const veiculoCompleto = `${veiculoMarca.toUpperCase()} ${veiculoModelo.toUpperCase()}`;
    
    const tableStartY = yPos;
    const col1X = margin;
    const col2X = margin + 100;
    const lineHeight = 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Veículo:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(veiculoCompleto, col2X, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('Renavam:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(veiculoRenavam, col2X, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('Placa:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(veiculoPlaca, col2X, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('KM:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(veiculoKm || 'Não informado', col2X, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('Chassi:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(veiculoChassi || '', col2X, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('Ano:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(veiculoAno, col2X, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('Cor:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(veiculoCor, col2X, yPos);
    yPos += 12;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DO PREÇO E FORMA DE PAGAMENTO', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Cláusula Terceira', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const clausula3 = `O COMPRADOR declara ter examinado o veículo, recebendo-o em perfeitas condições de uso e conservação, sendo o negócio realizado nesta data pelo valor de:`;
    const clausula3Lines = doc.splitTextToSize(clausula3, maxWidth);
    doc.text(clausula3Lines, margin, yPos);
    yPos += clausula3Lines.length * 6 + 6;

    let valorTotal = 0;
    if (formalizationPayments && formalizationPayments.length > 0) {
      formalizationPayments.forEach((pagamento) => {
        const valorPag = pagamento.valorPagamento || '0,00';
        const valorNum = parseFloat(removeCurrencyMask(valorPag)) || 0;
        valorTotal += valorNum;
      });
    } else {
      const veiculoValor = dadosVeiculo.valor || '0,00';
      valorTotal = parseFloat(removeCurrencyMask(veiculoValor)) || 0;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`Valor da Venda: ${formatCurrency(valorTotal, { showSymbol: true })}`, margin, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CONDIÇÕES DE PAGAMENTO', margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('O pagamento se dará da seguinte forma:', margin, yPos);
    yPos += 8;

    const tableY = yPos;
    const tableCol1X = margin;
    const tableCol2X = margin + 50;
    const tableCol3X = margin + 100;
    const tableCol4X = margin + 150;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('FORMA PAGAMENTO', tableCol1X, yPos);
    doc.text('DESCRIÇÃO', tableCol2X, yPos);
    doc.text('DATA', tableCol3X, yPos);
    doc.text('VALOR', tableCol4X, yPos);
    yPos += 6;

    doc.setLineWidth(0.1);
    doc.line(tableCol1X, yPos - 2, pageWidth - margin, yPos - 2);
    yPos += 3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    if (formalizationPayments && formalizationPayments.length > 0) {
      formalizationPayments.forEach((pagamento) => {
        const formaPag = pagamento.formaPagamento || 'Não informado';
        const formaPagFormatada = formaPag === 'deposito' ? 'Depósito' :
                                  formaPag === 'dinheiro' ? 'Dinheiro' :
                                  formaPag === 'cartao' ? 'Cartão' :
                                  formaPag === 'pix' ? 'PIX' :
                                  formaPag === 'transferencia' ? 'Transferência' : formaPag;
        const dataPag = pagamento.dataPagamento ? formatDateBR(pagamento.dataPagamento) : 'Não informado';
        const valorPag = pagamento.valorPagamento || '0,00';

        doc.text(formaPagFormatada, tableCol1X, yPos);
        doc.text('-', tableCol2X, yPos);
        doc.text(dataPag, tableCol3X, yPos);
        doc.text(valorPag, tableCol4X, yPos);
        yPos += 6;

        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
      });
    } else {
      doc.text('Não informado', tableCol1X, yPos);
      doc.text('-', tableCol2X, yPos);
      doc.text('Não informado', tableCol3X, yPos);
      doc.text('Não informado', tableCol4X, yPos);
      yPos += 6;
    }

    yPos += 10;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const textoCondicoes = [
      '- O valor de venda do veículo, crédito e condições de pagamento estão sujeitos a aprovação do agente financeiro e da diretoria da empresa.',
      '',
      '- O veículo somente será entregue ao cliente após recebimento e compensação integral do pagamento.',
      '',
      '- Alterado as condições de pagamento será alterado também o preço de veículo bem como possíveis cortesias.',
      '',
      '- Caso ocorra financiamento do bem ofertado como troca, o COMPRADOR(A), autoriza de imediato o pagamento do contrato de financiamento com a instituição financeira no ato da assinatura do contrato, para posterior apuração de haveres.',
      '',
      'O veículo adquirido que for pago por meio da apresentação de carta de crédito (consórcio) CONTEMPLADA seguirá as seguintes regras:',
      '',
      'a) - É de responsabilidade do cliente consorciado o valor informado da carta de credito e o mesmo assume qualquer alteração neste valor. Ao assinar este contrato o mesmo assume que já foi contemplado e possui a carta de credito; Para efeito de reserva e faturamento, deverá ser apresentada a autorização de faturamento comprovando o valor total da carta e o parte a vista deverá ser paga de imediato, desta maneira ficará pendente apenas a parte de responsabilidade do consórcio.',
      '',
      'b) - O COMPRADOR (A) tem o prazo de até 07 (SETE) dias após assinatura do contrato para entregar toda a documentação necessária (kit) para a liberação do pagamento da carta contemplada;',
      '',
      'c) – Caso o valor atribuído na carta de crédito, não venha ser liberado dentro do prazo estipulado, considerar-se-á cancelado o contrato de compra e venda de veículo usado, que utilizou o valor da carta de crédito como parcela de pagamento, sendo considerado pelas partes que após este período automaticamente o veículo retornará para a lista de veículos em estoque, cabendo a perda do sinal de negócio pelo COMPRADOR (A);',
      '',
      'd)- Caso haja algum atraso no prazo de pagamento do consórcio por responsabilidade do cliente tais como: não aprovação do credito do cliente, atraso no pagamento da parcela do consorcio, falta de documentação entre outros a – VENDEDORA poderá reincidir o contrato, perdendo o cliente o sinal de negócio, além da obrigatoriedade do pagamento da multa conforme cláusulas de contrato.',
      '',
      'Cláusula Quarta: Caso ocorra arrependimento do negócio por qualquer uma das partes, as arras ou sinal terão função unicamente indenizatória. Neste caso, quem as deu perdê-las-á em benefício da outra parte, e quem as recebeu devolvê-las-á, mais o equivalente. (art. 420 do Código Civil). O arrependimento da compra não se aplica em vendas realizadas dentro do estabelecimento comercial da VENDEDORA, após a devida inspeção do veículo pelo COMPRADOR (A).',
      '',
      'O veículo usado, recebido em troca, como sinal de negócio, deverá ser entregue imediatamente a concretização do negócio, mas caso seja alterada a data de entrega, por convenção das partes, passará por nova avaliação e conferência de seu estado de uso e conservação, na data, e, devendo estar livre de multas, autuações, efeitos suspensivos, perda total, impedimentos e remarcação de chassi.',
      '',
      'Caso esteja em trâmite ações no âmbito da justiça municipal, estadual, federal e trabalhista, em nome do proprietário do veículo objeto da troca, que possam ocasionar futuro impedimento judicial, será motivo de recusa no recebimento do mesmo.',
      '',
      'O COMPRADOR (A) declara estar ciente que o direito de arrependimento de 07 (sete) dias previsto no Código de Defesa do Consumidor não se aplica em compra e venda presencial de veículos, tendo valor apenas para compras via internet.',
      '',
      'DA VISTORIA E AVALIAÇÃO DO VEÍCULO',
      '',
      'Cláusula Quinta: O COMPRADOR (A) declara para todos os fins de direito, ter vistoriado e avaliado o estado em que se encontra o veículo usado ora negociado, estando o mesmo em perfeitas condições de uso/funcionamento e estado de conservação, com todos os seus componentes de série, conforme checklist apresentado, declarando, também ter ciência do desgaste natural dos seus componentes, devido ao uso por tratar-se de veículo usado.',
      '',
      'Parágrafo Primeiro:',
      '',
      'É facultado a(o) COMPRADOR (A) a realização de vistoria por profissional técnico de sua confiança e responsabilidade no ato da compra do veículo usado, inclusive com teste drive acompanhado de funcionário da empresa VENDEDORA, para avaliação técnica do veículo. A não realização por interesse do COMPRADOR (A) isenta de imediato as responsabilidades técnicas e condições de uso do veículo quanto à empresa VENDEDORA, respeitando somente as garantias expressas e constantes em Cláusula Sétima e suas cominações legais.',
      '',
      'DA RESPONSABILIDADE CIVIL E CRIMINAL',
      '',
      'Cláusula Sexta: A partir da entrega do veículo, conforme check list de saída, o COMPRADOR (A) se responsabiliza por quaisquer danos, seja no âmbito civil ou penal, decorrente da utilização do veículo ora adquirido, inclusive multas e pontuações na CNH decorrentes de tais infrações, sejam elas de âmbito Municipal, Estadual e ou Federal, bem como, fica responsável também, nos mesmos termos acima, até a presente data e hora, por eventual veículo dado na compra do objeto do presente, respondendo ainda o comprador, pela evicção e eventuais vícios redibitórios do mesmo.',
      '',
      'A VENDEDORA, acaso tenha recebido algum veículo do COMPRADOR (A), como forma de pagamento do bem objeto do presente, fica responsável, por quaisquer danos, seja no âmbito civil ou penal, decorrente da utilização do veículo ora recebido, inclusive multas e pontuações na CNH decorrentes de tais infrações, sejam elas de âmbito Municipal, Estadual e ou Federal;',
      '',
      'Deste modo, o presente instrumento é firmado nos termos do artigo 784 - Inciso III do Novo Código de Processo Civil, razão pela qual é um título executivo extrajudicial, mesmo porque, o "quantum debeatur" depende de simples cálculo aritmético, à partir de dados consignados em documentos comprobatórios do débito (multas de trânsito, IPVA, licenciamento e outros).',
      '',
      'Nesta seara, a VENDEDORA poderá executar o presente para cobrança de eventuais valores encontrados e de responsabilidade do COMPRADOR (A).',
      '',
      'DA GARANTIA',
      '',
      'Cláusula Sétima: Para os veículos usados e identificados, a VENDEDORA concede uma cobertura de garantia pelo período de 90 (noventa) dias (art. 26 do CDC) ou 3.000 km rodados, para os conjuntos de motor e câmbio, a partir da data de entrega e quilometragem especificada, prevalecendo à condição que primeiro ocorrer, restringindo a mão de obra e reposição de peças lubrificadas, dos conjuntos de motor e câmbio, quando os referidos componentes apresentarem algum defeito.',
      '',
      'A mesma estará automaticamente cancelada, no ato da constatação de mau uso do veículo em questão; em caso deste último ter suas características originais (especificadas pelo fabricante no manual do veículo) alteradas, bem como, quando o mesmo for utilizado for utilizado fora dos padrões e ou limites de carga e/ou de rotação especificadas pelo fabricante, ou, ainda, se for utilizado em competições de qualquer espécie ou natureza, além do que, se tiver sua manutenção negligenciada.',
      '',
      'Todo e qualquer serviço e ou conserto coberto por esta garantia deverá ser executado somente por assistência técnica ou oficina mecânica credenciada por esta VENDEDORA e somente após o orçamento aprovado pela VENDEDORA.',
      '',
      'Qualquer manutenção feita pelo COMPRADOR (A) em oficina própria do mesmo decorrente do mau uso ao longo do tempo, sem comunicação e autorização da VENDEDORA após apuração em laudo de vistoria, não será ressarcido pela VENDEDORA, nem ressarcido a titulo de compensação.',
      '',
      'Considera-se fora da presente garantia itens de desgaste natural e vida útil pré-determinados: discos e platô de embreagem, discos, tambores, pastilhas e lonas de freio, cabos de vela, correias em geral, bateria, amortecedores, e molas, juntas homocinética, conjunto de suspensão, sistema de lubrificação e pressão do óleo, entre outros incluindo ainda os itens considerados de manutenção normal, como limpeza de bicos injetores, fluídos e óleos em geral, equipamentos e acessórios rádios, compact disc, toca fitas, conjunto de som e alarmes, rodas, pneus, painel de instrumentos, carroceria e pintura em geral. Todo e qualquer custo ou outra forma de compensação, a qualquer título, de despesas ou danos, diretos ou indiretos, causados por pessoas ou bens em decorrência de defeito verificado no veículo, tais como despesas com taxi, Uber, guincho, alimentação, hospedagem, etc., é de única e exclusiva responsabilidade do COMPRADOR (A).',
      '',
      'Para atendimento da garantia, deverá o comprador apresentar manifestação por escrito, dentro do prazo legal estipulado em Cláusula Sétima, objeto de pesquisa, análise ou perícia técnica pela VENDEDORA e, caso, assim não proceda, estará automaticamente precluso infringindo as cláusulas contratuais especificadas.',
      '',
      'DA TRANSFERÊNCIA DO BEM',
      '',
      'Cláusula Oitava: A transferência do bem objeto do presente instrumento para o nome do COMPRADOR (A) ou de alguém por ele determinado é obrigatória, porém, só se dará após a total quitação do bem descrito na Cláusula Primeira – OBJETO, sendo que na hipótese de pagamento em cheques(s) ou qualquer outro título de crédito, após a compensação ou quitação do(s) mesmo(s), de acordo com o Art. 123 § 1ª do Código de Trânsito Brasileiro (Lei Federal nº 9503 de 23/09/1997)',
      '',
      'Dados da Transferência: SERVIÇO DE DESPACHANTE, Valor R$ 1.000,00',
      '',
      'DA CLÁUSULA RESOLUTIVA',
      '',
      'Cláusula Nona: As partes VENDEDORA e COMPRADOR (A) estabelecem desde já, que no caso de não cumprimento do presente, quanto aos pagamentos devidos pelo COMPRADOR (A) a VENDEDORA, nos quais foram firmados em comum acordo entre as partes perfeitamente capazes e isentas de quaisquer vícios que pudessem macular o ato, na presença de testemunhas, portanto operou a concretização de um ato jurídico perfeito, fazendo lei entre as partes, forma e prazos estabelecidos no bojo deste instrumento particular de contrato de compra e venda de veículo usado, permitirá a VENDEDORA, como melhor lhe aprouver, pedir a resolução do contrato, ou, se preferir, exigir o cumprimento do mesmo, independentemente de notificação ou interpelação, nos termos do que reza o artigo 475 do Código Civil Brasileiro.',
      '',
      'Fica desde já firmado entre as partes, que após a assinatura de deste contrato de compra e venda de veículo usado e antes da respectiva transferência do veículo pela parte VENDEDORA, é facultada a desistência pelo COMPRADOR (A), obrigando-se ao pagamento de multa no valor de 10% (dez por cento) sobre o valor do veículo objeto deste contrato, a título de multa contratual, o COMPRADOR (A) manifestam sua especial aceitação e anuência, nada mais tendo a reclamar..',
      '',
      'Cláusula Décima: Nos termos do que estabelece o artigo 629 do Código Civil Brasileiro, o COMPRADOR (A), assume de forma gratuita, a condição de depositário do bem objeto do presente, obrigando-se pela guarda e conservação do mesmo, até o integral pagamento do preço.',
      '',
      'SITUAÇÃO DE REGULARIDADE',
      '',
      'Cláusula Décima Primeira:',
      '',
      '- Valor aproximado dos tributos: 16,33% IBPT',
      '',
      '- Furto: Nada Consta',
      '',
      '- Multas e taxas anuais em aberto:',
      '',
      '- Autuações: Serão quitadas somente quando forem convertidas em multas',
      '',
      '- Alienação fiduciária: Nada consta',
      '',
      '- Impedimentos Administrativos: Nada consta',
      '',
      '- Impedimentos Judiciais: Nada consta',
      '',
      '- Outros registros impeditivos a circulação do veículo: Nada consta',
      '',
      '- IPVA do ano corrente é de responsabilidade do comprador.',
      '',
      'FORO DE ELEIÇÃO',
      '',
      'Cláusula Décima Segunda: Para dirimir quaisquer dúvidas decorrentes do presente, as partes elegem e estabelecem desde já, com exclusividade, o foro da COMARCA DA VENDEDORA, por mais privilegiado que outro possa ser.',
      '',
      'O COMPRADOR (A), de livre e espontânea vontade, RENUNCIA ao foro previsto no artigo 101 – inciso I do Código de Defesa do Consumidor.',
      '',
      'E, pra que produza seus efeitos legais e jurídicos, firmam o presente termo, de igual teor em 02 (duas) vias na presença de 01 (uma) testemunha.'
    ];

    const titulosSecao = [
      'DA VISTORIA E AVALIAÇÃO DO VEÍCULO',
      'DA RESPONSABILIDADE CIVIL E CRIMINAL',
      'DA GARANTIA',
      'DA TRANSFERÊNCIA DO BEM',
      'DA CLÁUSULA RESOLUTIVA',
      'SITUAÇÃO DE REGULARIDADE',
      'FORO DE ELEIÇÃO'
    ];

    textoCondicoes.forEach(paragrafo => {
      if (paragrafo === '') {
        yPos += 3;
      } else if (titulosSecao.includes(paragrafo)) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(paragrafo, margin, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
      } else {
        const lines = doc.splitTextToSize(paragrafo, maxWidth);
        doc.text(lines, margin, yPos);
        yPos += lines.length * 5;
      }
      
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });

    yPos += 10;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const cidadeEmpresa = companyData?.city || 'Goiânia';
    doc.text(`${cidadeEmpresa}, ${dataAtual}.`, margin, yPos);
    yPos += 20;

    const assinaturaY = yPos;
    const assinaturaVendedorX = margin;
    const assinaturaCompradorX = pageWidth / 2 + 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('___________________________', assinaturaVendedorX, yPos);
    yPos += 6;
    doc.text('VENDEDORA', assinaturaVendedorX, yPos);
    yPos += 6;
    doc.text(vendedoraNome, assinaturaVendedorX, yPos);
    yPos += 6;
    doc.text(`CNPJ: ${vendedoraCnpj}`, assinaturaVendedorX, yPos);

    yPos = assinaturaY;
    doc.text('___________________________', assinaturaCompradorX, yPos);
    yPos += 6;
    doc.text('COMPRADOR(A)', assinaturaCompradorX, yPos);
    yPos += 6;
    doc.text(compradorNome, assinaturaCompradorX, yPos);
    yPos += 6;
    doc.text(`CPF/CNPJ: ${compradorCpfCnpj}`, assinaturaCompradorX, yPos);

    doc.save(`Contrato_Venda_${numeroContrato}_${dataAtual.replace(/\//g, '_')}.pdf`);
  };

  const gerarPDFTermoEntrega = async () => {
    const userData = localStorage.getItem('user_data');
    const accessToken = localStorage.getItem('supabase_access_token');
    
    if (!userData || !accessToken) {
      alert('Erro ao gerar PDF: dados do usuário não encontrados');
      return;
    }

    const user = JSON.parse(userData);
    let companyData = null;

    try {
      const companyResponse = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/companies?id=eq.${user.company_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });

      if (companyResponse.ok) {
        const data = await companyResponse.json();
        if (data.length > 0) {
          companyData = data[0];
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados da empresa:', error);
    }

    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (companyData?.logo_url) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = companyData.logo_url;
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            const logoWidth = 60;
            const logoHeight = (img.height * logoWidth) / img.width;
            doc.addImage(img.src, 'PNG', pageWidth - margin - logoWidth, yPos, logoWidth, logoHeight);
            yPos += logoHeight + 10;
            resolve(null);
          };
          img.onerror = reject;
        });
      } catch (error) {
        console.error('Erro ao carregar logo:', error);
      }
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMO DE ENTREGA DE VEÍCULO', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${dataAtual}`, margin, yPos);
    doc.text(`Hora: ${horaAtual}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DADOS DA EMPRESA VENDEDORA', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const empresaNome = companyData?.name || 'Não informado';
    const empresaCnpj = companyData?.document || companyData?.cnpj || 'Não informado';
    const empresaEndereco = companyData?.address || 'Não informado';
    const empresaCidade = companyData?.city || 'Não informado';
    const empresaEstado = companyData?.state || 'Não informado';
    const empresaCep = companyData?.zip_code || 'Não informado';
    const empresaTelefone = companyData?.phone || 'Não informado';
    const empresaEmail = companyData?.email || 'Não informado';

    doc.text(`Razão Social: ${empresaNome}`, margin, yPos);
    yPos += 6;
    doc.text(`CNPJ: ${empresaCnpj}`, margin, yPos);
    yPos += 6;
    const enderecoCompleto = `${empresaEndereco}, ${empresaCidade}/${empresaEstado}${empresaCep ? ', CEP: ' + empresaCep : ''}`;
    const enderecoLines = doc.splitTextToSize(`Endereço: ${enderecoCompleto}`, maxWidth);
    doc.text(enderecoLines, margin, yPos);
    yPos += enderecoLines.length * 6;
    doc.text(`Telefone: ${empresaTelefone}`, margin, yPos);
    yPos += 6;
    doc.text(`E-mail: ${empresaEmail}`, margin, yPos);
    yPos += 12;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DADOS DO COMPRADOR', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const compradorNome = formalizationClient.nome || clientData?.nomeCliente || 'Não informado';
    const compradorCpfCnpj = formalizationClient.cpfCnpj || 'Não informado';
    const compradorRg = formalizationClient.rgIe || 'Não informado';
    const compradorTelefone = formalizationClient.telefone || clientData?.telefone || 'Não informado';
    const compradorEmail = formalizationClient.email || clientData?.email || 'Não informado';
    const compradorCep = formalizationClient.cep || 'Não informado';
    const compradorEndereco = formalizationClient.endereco || 'Não informado';
    const compradorCidade = formalizationClient.cidade || 'Não informado';
    const compradorEstado = formalizationClient.estado || 'Não informado';

    doc.text(`Nome: ${compradorNome}`, margin, yPos);
    yPos += 6;
    doc.text(`CPF/CNPJ: ${compradorCpfCnpj}`, margin, yPos);
    yPos += 6;
    doc.text(`RG/IE: ${compradorRg}`, margin, yPos);
    yPos += 6;
    doc.text(`Telefone: ${compradorTelefone}`, margin, yPos);
    yPos += 6;
    doc.text(`E-mail: ${compradorEmail}`, margin, yPos);
    yPos += 6;
    const compradorEnderecoCompleto = `${compradorEndereco}${compradorCep ? ', CEP: ' + compradorCep : ''}, ${compradorCidade}/${compradorEstado}`;
    const compradorEnderecoLines = doc.splitTextToSize(`Endereço: ${compradorEnderecoCompleto}`, maxWidth);
    doc.text(compradorEnderecoLines, margin, yPos);
    yPos += compradorEnderecoLines.length * 6 + 12;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DADOS DO VEÍCULO ENTREGUE', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const veiculoMarca = dadosVeiculo.marca || clientData?.marca || 'Não informado';
    const veiculoModelo = dadosVeiculo.modelo || clientData?.modelo || 'Não informado';
    const veiculoAno = dadosVeiculo.ano || clientData?.ano || 'Não informado';
    const veiculoCor = dadosVeiculo.cor || 'Não informado';
    const veiculoPlaca = dadosVeiculo.placa || 'Não informado';
    const veiculoChassi = dadosVeiculo.chassi || 'Não informado';
    const veiculoRenavam = dadosVeiculo.renavam || 'Não informado';

    const col1X = margin;
    const col2X = margin + 100;
    const lineHeight = 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Marca/Modelo:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${veiculoMarca} ${veiculoModelo}`, col2X, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('Ano:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(veiculoAno, col2X, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('Cor:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(veiculoCor, col2X, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('Placa:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(veiculoPlaca, col2X, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('Chassi:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(veiculoChassi || 'Não informado', col2X, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('RENAVAM:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(veiculoRenavam, col2X, yPos);
    yPos += 12;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DADOS DA ENTREGA', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const dataHoraEntrega = formalizationDelivery.dataHora ? formatDateBR(formalizationDelivery.dataHora) : dataAtual;
    const horaEntrega = formalizationDelivery.dataHora ? new Date(formalizationDelivery.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : horaAtual;
    const kmEntrega = formalizationDelivery.km || 'Não informado';
    const observacaoEntrega = formalizationDelivery.observacao || '';

    doc.text(`Data da Entrega: ${dataHoraEntrega}`, margin, yPos);
    yPos += 6;
    doc.text(`Hora da Entrega: ${horaEntrega}`, margin, yPos);
    yPos += 6;
    doc.text(`Quilometragem: ${kmEntrega} km`, margin, yPos);
    yPos += 6;
    doc.text(`Manual do Veículo: ${formalizationDelivery.manualEntregue ? 'Sim' : 'Não'}`, margin, yPos);
    yPos += 6;
    doc.text(`Chave Reserva: ${formalizationDelivery.chaveReservaEntregue ? 'Sim' : 'Não'}`, margin, yPos);
    yPos += 12;

    if (observacaoEntrega) {
      doc.setFont('helvetica', 'bold');
      doc.text('Observações:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const obsLines = doc.splitTextToSize(observacaoEntrega, maxWidth);
      doc.text(obsLines, margin, yPos);
      yPos += obsLines.length * 6 + 12;
    }

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const textoDeclaracao = 'Declaro para os devidos fins, que recebi o veículo acima descrito em perfeitas condições de uso e conservação, estando de acordo com o estado em que se encontra, comprometendo-me a efetuar a transferência de propriedade do mesmo no prazo legal estabelecido.';
    const declaracaoLines = doc.splitTextToSize(textoDeclaracao, maxWidth);
    doc.text(declaracaoLines, margin, yPos);
    yPos += declaracaoLines.length * 6 + 15;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const cidadeEmpresa = companyData?.city || 'Goiânia';
    doc.text(`${cidadeEmpresa}, ${dataAtual} às ${horaAtual}.`, margin, yPos);
    yPos += 20;

    const assinaturaY = yPos;
    const assinaturaVendedorX = margin;
    const assinaturaCompradorX = pageWidth / 2 + 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('___________________________', assinaturaVendedorX, yPos);
    yPos += 6;
    doc.text('VENDEDORA', assinaturaVendedorX, yPos);
    yPos += 6;
    doc.text(empresaNome, assinaturaVendedorX, yPos);
    yPos += 6;
    doc.text(`CNPJ: ${empresaCnpj}`, assinaturaVendedorX, yPos);

    yPos = assinaturaY;
    doc.text('___________________________', assinaturaCompradorX, yPos);
    yPos += 6;
    doc.text('COMPRADOR(A)', assinaturaCompradorX, yPos);
    yPos += 6;
    doc.text(compradorNome, assinaturaCompradorX, yPos);
    yPos += 6;
    doc.text(`CPF/CNPJ: ${compradorCpfCnpj}`, assinaturaCompradorX, yPos);

    doc.save(`Termo_Entrega_${veiculoMarca}_${veiculoModelo}_${dataAtual.replace(/\//g, '_')}.pdf`);
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
                          router.push(`/attendance-form?edit=${clientData.id}`);
                        } else {
                          alert('ID do atendimento não encontrado');
                        }
                      }}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
                    >
                      Editar Cliente
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Próximo Contato - Data (opcional)"
                          type="date"
                          name="proximoContato"
                          value={contactForm.proximoContato}
                          onChange={handleContactFormChange}
                        />
                        <Input
                          label="Próximo Contato - Hora (opcional)"
                          type="time"
                          name="proximoContatoHora"
                          value={contactForm.proximoContatoHora}
                          onChange={handleContactFormChange}
                        />
                      </div>
                      
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
                              {(() => {
                                const date = new Date(contact.proximoContato);
                                const dateStr = date.toLocaleDateString('pt-BR');
                                const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                const hasTime = timeStr !== '00:00' && date.getHours() !== 0 && date.getMinutes() !== 0;
                                return hasTime ? `${dateStr} às ${timeStr}` : dateStr;
                              })()}
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
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Instruções para fotos da avaliação:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Frente do veículo</li>
                  <li>Lateral (ambos os lados)</li>
                  <li>Traseira</li>
                  <li>Interior (painel, bancos, detalhes)</li>
                  <li>Detalhes para preparar (danos, arranhões, etc.)</li>
                </ul>
                <p className="text-xs text-blue-700 mt-2 italic">
                  Essas fotos serão utilizadas para a previsão de custo de reparo.
                </p>
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
                    label="Nome / Razão Social"
                    type="text"
                    name="nome"
                    placeholder="Nome ou Razão Social"
                    value={proprietarioLegal.nome}
                    onChange={(e) => setProprietarioLegal(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                  <Select
                    label="Tipo de Documento"
                    name="tipoDocumento"
                    value={proprietarioLegal.tipoDocumento}
                    onChange={(e) => {
                      const tipo = e.target.value as "CPF" | "CNPJ";
                      setProprietarioLegal(prev => ({ 
                        ...prev, 
                        tipoDocumento: tipo,
                        cpf: tipo === 'CPF' ? prev.cpf : '',
                        cnpj: tipo === 'CNPJ' ? prev.cnpj : '',
                        inscricaoEstadual: tipo === 'CPF' ? '' : prev.inscricaoEstadual
                      }));
                    }}
                    required
                  >
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                  </Select>
                  {proprietarioLegal.tipoDocumento === 'CPF' ? (
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
                  ) : (
                    <>
                      <Input
                        label="CNPJ"
                        type="text"
                        name="cnpj"
                        placeholder="00.000.000/0000-00"
                        value={proprietarioLegal.cnpj}
                        onChange={(e) => {
                          const maskedValue = applyCnpjMask(e.target.value);
                          setProprietarioLegal(prev => ({ ...prev, cnpj: maskedValue }));
                        }}
                        required
                      />
                    </>
                  )}
                </div>
                
                {proprietarioLegal.tipoDocumento === 'CNPJ' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input
                      label="Inscrição Estadual"
                      type="text"
                      name="inscricaoEstadual"
                      placeholder="Inscrição Estadual (opcional)"
                      value={proprietarioLegal.inscricaoEstadual}
                      onChange={(e) => setProprietarioLegal(prev => ({ ...prev, inscricaoEstadual: e.target.value }))}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    required={proprietarioLegal.tipoDocumento === 'CPF'}
                  />
                </div>

                {/* Terceira linha - Endereço completo */}
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
                    placeholder="Rua, Avenida, etc."
                    value={proprietarioLegal.endereco}
                    onChange={(e) => setProprietarioLegal(prev => ({ ...prev, endereco: e.target.value }))}
                    required
                  />
                  <Input
                    label="Número"
                    type="text"
                    name="numero"
                    placeholder="Número"
                    value={proprietarioLegal.numero}
                    onChange={(e) => setProprietarioLegal(prev => ({ ...prev, numero: e.target.value }))}
                    required
                  />
                  <Input
                    label="Complemento"
                    type="text"
                    name="complemento"
                    placeholder="Apto, Bloco, etc. (opcional)"
                    value={proprietarioLegal.complemento}
                    onChange={(e) => setProprietarioLegal(prev => ({ ...prev, complemento: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="Bairro"
                    type="text"
                    name="bairro"
                    placeholder="Bairro"
                    value={proprietarioLegal.bairro}
                    onChange={(e) => setProprietarioLegal(prev => ({ ...prev, bairro: e.target.value }))}
                    required
                  />
                  <Input
                    label="Cidade"
                    type="text"
                    name="cidade"
                    placeholder="Cidade"
                    value={proprietarioLegal.cidade}
                    onChange={(e) => setProprietarioLegal(prev => ({ ...prev, cidade: e.target.value }))}
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
                    maxLength={2}
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
                    label="Nome / Razão Social"
                    type="text"
                    name="nome"
                    placeholder="Nome ou Razão Social"
                    value={proprietarioPosse.nome}
                    onChange={(e) => setProprietarioPosse(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                  <Select
                    label="Tipo de Documento"
                    name="tipoDocumento"
                    value={proprietarioPosse.tipoDocumento}
                    onChange={(e) => {
                      const tipo = e.target.value as "CPF" | "CNPJ";
                      setProprietarioPosse(prev => ({ 
                        ...prev, 
                        tipoDocumento: tipo,
                        cpf: tipo === 'CPF' ? prev.cpf : '',
                        cnpj: tipo === 'CNPJ' ? prev.cnpj : '',
                        inscricaoEstadual: tipo === 'CPF' ? '' : prev.inscricaoEstadual
                      }));
                    }}
                    required
                  >
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                  </Select>
                  {proprietarioPosse.tipoDocumento === 'CPF' ? (
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
                  ) : (
                    <Input
                      label="CNPJ"
                      type="text"
                      name="cnpj"
                      placeholder="00.000.000/0000-00"
                      value={proprietarioPosse.cnpj}
                      onChange={(e) => {
                        const maskedValue = applyCnpjMask(e.target.value);
                        setProprietarioPosse(prev => ({ ...prev, cnpj: maskedValue }));
                      }}
                      required
                    />
                  )}
                </div>
                
                {proprietarioPosse.tipoDocumento === 'CNPJ' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input
                      label="Inscrição Estadual"
                      type="text"
                      name="inscricaoEstadual"
                      placeholder="Inscrição Estadual (opcional)"
                      value={proprietarioPosse.inscricaoEstadual}
                      onChange={(e) => setProprietarioPosse(prev => ({ ...prev, inscricaoEstadual: e.target.value }))}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    required={proprietarioPosse.tipoDocumento === 'CPF'}
                  />
                </div>

                {/* Terceira linha - Endereço completo */}
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
                    placeholder="Rua, Avenida, etc."
                    value={proprietarioPosse.endereco}
                    onChange={(e) => setProprietarioPosse(prev => ({ ...prev, endereco: e.target.value }))}
                    required
                  />
                  <Input
                    label="Número"
                    type="text"
                    name="numero"
                    placeholder="Número"
                    value={proprietarioPosse.numero}
                    onChange={(e) => setProprietarioPosse(prev => ({ ...prev, numero: e.target.value }))}
                    required
                  />
                  <Input
                    label="Complemento"
                    type="text"
                    name="complemento"
                    placeholder="Apto, Bloco, etc. (opcional)"
                    value={proprietarioPosse.complemento}
                    onChange={(e) => setProprietarioPosse(prev => ({ ...prev, complemento: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="Bairro"
                    type="text"
                    name="bairro"
                    placeholder="Bairro"
                    value={proprietarioPosse.bairro}
                    onChange={(e) => setProprietarioPosse(prev => ({ ...prev, bairro: e.target.value }))}
                    required
                  />
                  <Input
                    label="Cidade"
                    type="text"
                    name="cidade"
                    placeholder="Cidade"
                    value={proprietarioPosse.cidade}
                    onChange={(e) => setProprietarioPosse(prev => ({ ...prev, cidade: e.target.value }))}
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
                    maxLength={2}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  <Input
                    label="Chassi"
                    type="text"
                    name="chassi"
                    placeholder="Digite o chassi"
                    value={dadosVeiculo.chassi}
                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, chassi: e.target.value.toUpperCase() }))}
                    required
                  />
                  <Input
                    label="RENAVAM"
                    type="text"
                    name="renavam"
                    placeholder="Digite o RENAVAM"
                    value={dadosVeiculo.renavam}
                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, renavam: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                onClick={gerarPDFContrato}
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
                  onClick={gerarPDFTermoEntrega}
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
