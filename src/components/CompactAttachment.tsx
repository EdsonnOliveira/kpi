import React from 'react';
import { AttachmentData } from './Attachment';

interface CompactAttachmentProps {
  attachment: AttachmentData;
  onView?: (attachment: AttachmentData) => void;
  onDownload?: (attachment: AttachmentData) => void;
  onDelete?: (attachment: AttachmentData) => void;
  className?: string;
}

export default function CompactAttachment({
  attachment,
  onView,
  onDownload,
  onDelete,
  className = ''
}: CompactAttachmentProps) {
  const getFileIcon = (tipo: string) => {
    const lowerTipo = tipo.toLowerCase();
    
    if (lowerTipo.includes('pdf')) {
      return (
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    
    if (lowerTipo.includes('image') || lowerTipo.includes('jpg') || lowerTipo.includes('jpeg') || lowerTipo.includes('png') || lowerTipo.includes('gif')) {
      return (
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    
    // Ícone padrão para outros tipos de arquivo
    return (
      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const handleView = () => {
    if (onView) {
      onView(attachment);
    } else {
      if (attachment.url) {
        window.open(attachment.url, '_blank');
      }
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(attachment);
    } else {
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
    <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors bg-white ${className}`}>
      <div className="mx-auto h-10 w-10 text-gray-400 mb-2">
        {getFileIcon(attachment.tipo)}
      </div>
      <p className="text-xs font-medium text-gray-700 mb-1 truncate">{attachment.nome}</p>
      <p className="text-xs text-gray-500 mb-3">
        {attachment.tamanho} • {attachment.dataUpload}
      </p>
      
      <div className="flex space-x-1">
        <button
          onClick={handleView}
          className="flex-1 px-1 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition-colors"
        >
          Ver
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 px-1 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors"
        >
          Baixar
        </button>
        {onDelete && (
          <button
            onClick={handleDelete}
            className="flex-1 px-1 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200 transition-colors"
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}

// Componente para lista compacta de anexos
export interface CompactAttachmentListProps {
  attachments: AttachmentData[];
  onView?: (attachment: AttachmentData) => void;
  onDownload?: (attachment: AttachmentData) => void;
  onDelete?: (attachment: AttachmentData) => void;
  className?: string;
}

export function CompactAttachmentList({
  attachments,
  onView,
  onDownload,
  onDelete,
  className = ''
}: CompactAttachmentListProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {attachments.map((attachment, index) => (
        <CompactAttachment
          key={attachment.id || index}
          attachment={attachment}
          onView={onView}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
