import { supabase } from './supabase';
import { AttachmentData } from '../components/Attachment';

export interface UploadResult {
  success: boolean;
  data?: AttachmentData;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Função para gerar nome único do arquivo
const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
};

// Função para formatar tamanho do arquivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Função para obter tipo MIME do arquivo
const getFileType = (file: File): string => {
  return file.type || 'application/octet-stream';
};

// Função para salvar metadados no banco de dados
const saveAttachmentMetadata = async (
  appointmentId: string,
  attachmentType: 'documentos' | 'avaliacao' | 'anuncio' | 'cnh' | 'rg' | 'documento1' | 'documento2',
  file: File,
  filePath: string,
  publicUrl: string
): Promise<boolean> => {
  try {
    // Obter dados do usuário logado
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      console.error('Dados do usuário não encontrados');
      return false;
    }

    const user = JSON.parse(userData);

    // Preparar dados para inserção
    const insertData = {
      appointment_id: appointmentId, // Já é UUID, não precisa converter
      company_id: user.company_id,
      attachment_type: attachmentType,
      file_name: filePath.split('/').pop(),
      original_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: getFileType(file),
      public_url: publicUrl,
      created_by: user.id
    };

    console.log('Tentando inserir metadados:', insertData);

    // Inserir metadados na tabela
    const { data, error } = await supabase
      .from('appointment_attachments')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Erro ao salvar metadados:', error);
      console.error('Dados que causaram erro:', insertData);
      return false;
    }

    console.log('Metadados salvos com sucesso:', data);

    return true;
  } catch (error) {
    console.error('Erro ao salvar metadados:', error);
    return false;
  }
};

// Função principal de upload
export const uploadFile = async (
  file: File,
  appointmentId: string,
  attachmentType: 'documentos' | 'avaliacao' | 'anuncio' | 'cnh' | 'rg' | 'documento1' | 'documento2',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    // Gerar nome único para o arquivo
    const uniqueFileName = generateUniqueFileName(file.name);
    
    // Definir caminho no storage
    const filePath = `appointments/${appointmentId}/${attachmentType}/${uniqueFileName}`;
    
    // Upload do arquivo para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return {
        success: false,
        error: `Erro no upload: ${uploadError.message}`
      };
    }

    // Obter URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    // Salvar metadados no banco de dados
    const metadataSaved = await saveAttachmentMetadata(
      appointmentId,
      attachmentType,
      file,
      filePath,
      urlData.publicUrl
    );

    if (!metadataSaved) {
      // Se falhou ao salvar metadados, remover arquivo do storage
      await supabase.storage
        .from('attachments')
        .remove([filePath]);
      
      return {
        success: false,
        error: 'Erro ao salvar metadados do arquivo'
      };
    }

    // Criar objeto de anexo
    const attachment: AttachmentData = {
      id: uploadData.path,
      nome: file.name,
      tipo: getFileType(file),
      tamanho: formatFileSize(file.size),
      dataUpload: new Date().toLocaleDateString('pt-BR'),
      url: urlData.publicUrl
    };

    return {
      success: true,
      data: attachment
    };

  } catch (error) {
    console.error('Erro no upload do arquivo:', error);
    return {
      success: false,
      error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};

// Função para upload múltiplo
export const uploadMultipleFiles = async (
  files: FileList,
  appointmentId: string,
  attachmentType: 'documentos' | 'avaliacao' | 'anuncio' | 'cnh' | 'rg' | 'documento1' | 'documento2',
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadFile(file, appointmentId, attachmentType, (progress) => {
      onProgress?.(i, progress);
    });
    results.push(result);
  }
  
  return results;
};

// Função para deletar arquivo
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    // Primeiro, remover metadados do banco de dados
    const { error: dbError } = await supabase
      .from('appointment_attachments')
      .delete()
      .eq('file_path', filePath);

    if (dbError) {
      console.error('Erro ao deletar metadados:', dbError);
      return false;
    }

    // Depois, remover arquivo do storage
    const { error: storageError } = await supabase.storage
      .from('attachments')
      .remove([filePath]);

    if (storageError) {
      console.error('Erro ao deletar arquivo do storage:', storageError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return false;
  }
};

// Função para listar arquivos de um appointment
export const listAppointmentFiles = async (
  appointmentId: string,
  attachmentType: 'documentos' | 'avaliacao' | 'anuncio' | 'cnh' | 'rg' | 'documento1' | 'documento2'
): Promise<AttachmentData[]> => {
  try {
    // Obter dados do usuário logado
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      console.error('Dados do usuário não encontrados');
      return [];
    }

    const user = JSON.parse(userData);

    // Buscar metadados do banco de dados
    const { data, error } = await supabase
      .from('appointment_attachments')
      .select('*')
      .eq('appointment_id', appointmentId) // Já é UUID, não precisa converter
      .eq('attachment_type', attachmentType)
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }

    // Converter para formato AttachmentData
    const attachments: AttachmentData[] = data.map(record => ({
      id: record.file_path,
      nome: record.original_name,
      tipo: record.mime_type,
      tamanho: formatFileSize(record.file_size),
      dataUpload: new Date(record.created_at).toLocaleDateString('pt-BR'),
      url: record.public_url
    }));

    return attachments;
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return [];
  }
};
