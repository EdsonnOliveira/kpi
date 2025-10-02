import React from 'react';

interface AdCardProps {
  id: string;
  title: string;
  model: string;
  version: string;
  year: number;
  mileage: number;
  price: number;
  image: string;
  status?: string;
  isSponsored?: boolean;
  isFactoryOffer?: boolean;
  isZeroKm?: boolean;
  imageCount?: number;
  currentImage?: number;
  onViewOffer?: () => void;
  onImageClick?: () => void;
}

export default function AdCard({
  id,
  title,
  model,
  version,
  year,
  mileage,
  price,
  image,
  status,
  isSponsored = false,
  isFactoryOffer = false,
  isZeroKm = false,
  imageCount = 1,
  currentImage = 1,
  onViewOffer,
  onImageClick
}: AdCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    if (mileage === 0) return '0 Km';
    return `${mileage.toLocaleString('pt-BR')} Km`;
  };

  const getStatusInfo = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { text: 'Ativo', color: 'bg-green-100 text-green-800' };
      case 'paused':
        return { text: 'Pausado', color: 'bg-yellow-100 text-yellow-800' };
      case 'sold':
        return { text: 'Vendido', color: 'bg-red-100 text-red-800' };
      default:
        return { text: status || 'Desconhecido', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Seção da Imagem */}
      <div className="relative">
        {/* Badge Patrocinado */}
        {isSponsored && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
              Patrocinado
            </span>
          </div>
        )}

        {/* Imagem do Veículo */}
        <div 
          className="relative w-full h-48 bg-gray-100 cursor-pointer"
          onClick={onImageClick}
        >
          <img
            src={image}
            alt={`${model} ${version}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback para imagem quebrada
              e.currentTarget.src = '/placeholder-car.jpg';
            }}
          />
          
          {/* Contador de Imagens */}
          {imageCount > 1 && (
            <div className="absolute bottom-3 left-3">
              <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                {currentImage}/{imageCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Seção de Informações */}
      <div className="p-4">
        {/* Labels */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isFactoryOffer && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                Oferta de Fábrica
              </span>
            )}
          </div>
          
          {isZeroKm && (
            <div className="flex items-center justify-center w-8 h-8 bg-black border-2 border-red-600 rounded-full">
              <span className="text-white text-xs font-bold">0</span>
              <span className="text-white text-xs font-bold">KM</span>
            </div>
          )}
        </div>

        {/* Modelo do Veículo */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {model.toUpperCase()}
        </h3>

        {/* Status */}
        {status && (
          <div className="mb-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusInfo(status).color}`}>
              {getStatusInfo(status).text}
            </span>
          </div>
        )}

        {/* Versão */}
        <p className="text-sm text-gray-600 mb-3">
          {version}
        </p>

        {/* Ano e Quilometragem */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{year}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{formatMileage(mileage)}</span>
          </div>
        </div>

        {/* Preço */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(price)}
          </span>
        </div>

        {/* Botão Ver Anúncio */}
        <button
          onClick={onViewOffer}
          className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
        >
          Ver Anúncio
        </button>
      </div>
    </div>
  );
}

// Componente para Grid de Anúncios
interface AdGridProps {
  ads: AdCardProps[];
  onViewOffer?: (adId: string) => void;
  onImageClick?: (adId: string) => void;
  className?: string;
}

export function AdGrid({ ads, onViewOffer, onImageClick, className = '' }: AdGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {ads.map((ad) => (
        <AdCard
          key={ad.id}
          {...ad}
          onViewOffer={() => onViewOffer?.(ad.id)}
          onImageClick={() => onImageClick?.(ad.id)}
        />
      ))}
    </div>
  );
}
