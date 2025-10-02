import React from 'react';

export interface AttachmentData {
  id?: string;
  nome: string;
  tipo: string;
  tamanho: string;
  dataUpload: string;
  url?: string;
}

export interface AttachmentProps {
  attachment: AttachmentData;
  onView?: (attachment: AttachmentData) => void;
  onDownload?: (attachment: AttachmentData) => void;
  onDelete?: (attachment: AttachmentData) => void;
  showActions?: boolean;
  className?: string;
}

export default function Attachment({
  attachment,
  onView,
  onDownload,
  onDelete,
  showActions = true,
  className = ''
}: AttachmentProps) {
  const getFileIcon = (tipo: string) => {
    const lowerTipo = tipo.toLowerCase();
    
    if (lowerTipo.includes('pdf')) {
      return (
        <div className="p-2 bg-red-100 rounded-lg mr-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    
    if (lowerTipo.includes('image') || lowerTipo.includes('jpg') || lowerTipo.includes('jpeg') || lowerTipo.includes('png') || lowerTipo.includes('gif')) {
      return (
        <div className="p-2 bg-blue-100 rounded-lg mr-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    
    if (lowerTipo.includes('doc') || lowerTipo.includes('docx')) {
      return (
        <div className="p-2 bg-blue-100 rounded-lg mr-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    }
    
    if (lowerTipo.includes('xls') || lowerTipo.includes('xlsx')) {
      return (
        <div className="p-2 bg-green-100 rounded-lg mr-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    }
    
    // Ícone padrão para outros tipos de arquivo
    return (
      <div className="p-2 bg-gray-100 rounded-lg mr-4">
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  };

  const handleView = () => {
    if (onView) {
      onView(attachment);
    } else {
      // Comportamento padrão: abrir em nova aba se tiver URL
      if (attachment.url) {
        window.open(attachment.url, '_blank');
      }
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(attachment);
    } else {
      // Comportamento padrão: download direto se tiver URL
      if (attachment.url) {
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.nome;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(attachment);
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${className}`}>
      <div className="flex items-center">
        {getFileIcon(attachment.tipo)}
        <div>
          <p className="font-medium text-gray-900">{attachment.nome}</p>
          <p className="text-sm text-gray-500">
            {attachment.tipo} • {attachment.tamanho} • {attachment.dataUpload}
          </p>
        </div>
      </div>
      
      {showActions && (
        <div className="flex space-x-2">
          <button
            onClick={handleView}
            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
          >
            Visualizar
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded hover:bg-green-200 transition-colors"
          >
            Download
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200 transition-colors"
            >
              Excluir
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Componente para lista de anexos
export interface AttachmentListProps {
  attachments: AttachmentData[];
  onView?: (attachment: AttachmentData) => void;
  onDownload?: (attachment: AttachmentData) => void;
  onDelete?: (attachment: AttachmentData) => void;
  showActions?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function AttachmentList({
  attachments,
  onView,
  onDownload,
  onDelete,
  showActions = true,
  emptyMessage = "Nenhum anexo disponível",
  className = ''
}: AttachmentListProps) {
  if (attachments.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {attachments.map((attachment, index) => (
        <Attachment
          key={attachment.id || index}
          attachment={attachment}
          onView={onView}
          onDownload={onDownload}
          onDelete={onDelete}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
