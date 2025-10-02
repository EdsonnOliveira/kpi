import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { formatNumber } from "../lib/formatting";
import Select from "../components/Select";
import Button from "../components/Button";
import ResponsivePage from "../components/ResponsivePage";
import ResponsiveCard from "../components/ResponsiveCard";
import AdCard, { AdGrid } from "../components/AdCard";
import AIInsightCard from "../components/AIInsightCard";
import { supabase } from "../lib/supabase";

interface Ad {
  id: string;
  company_id: string;
  vehicle_id: string;
  platform: string;
  title: string;
  description: string;
  price: number;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  // Dados do veículo (join)
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    plate: string;
    chassis: string;
    mileage: number;
    price: number;
    status: string;
    description: string;
  };
}

export default function Ads() {
  const router = useRouter();
  const [filtroCanal, setFiltroCanal] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroMarca, setFiltroMarca] = useState("todos");
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar anúncios do banco de dados
  const fetchAds = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar anúncios com dados do veículo
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAds(data || []);
    } catch (err) {
      console.error('Erro ao buscar anúncios:', err);
      setError('Erro ao carregar anúncios. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar anúncios quando o componente montar
  useEffect(() => {
    fetchAds();
  }, []);

  // Função para filtrar anúncios
  const getFilteredAds = () => {
    return ads.filter(ad => {
      if (filtroCanal !== "todos" && ad.platform !== filtroCanal) return false;
      if (filtroStatus !== "todos" && ad.status !== filtroStatus) return false;
      if (filtroMarca !== "todos" && ad.vehicle?.brand !== filtroMarca) return false;
      return true;
    });
  };

  // Função para converter Ad para AdCard props
  const convertToAdCardProps = (ad: Ad) => ({
    id: ad.id,
    title: ad.title,
    model: ad.vehicle?.model || '',
    version: ad.vehicle?.description || '',
    year: ad.vehicle?.year || 0,
    mileage: ad.vehicle?.mileage || 0,
    price: ad.price,
    image: `https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop&auto=format&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
    status: ad.status,
    isSponsored: false,
    isFactoryOffer: false,
    isZeroKm: (ad.vehicle?.mileage || 0) === 0,
    imageCount: 1,
    currentImage: 1
  });

  const filteredAds = getFilteredAds();
  const adCardProps = filteredAds.map(convertToAdCardProps);

  // Função para lidar com visualização de oferta
  const handleViewOffer = (adId: string) => {
    router.push(`/ad-details?id=${adId}`);
  };

  // Função para lidar com clique na imagem
  const handleImageClick = (adId: string) => {
    console.log('Visualizar galeria do anúncio:', adId);
    // Aqui seria implementada a visualização da galeria de imagens
  };

  const handleNewAdClick = () => {
    router.push("/new-ad");
  };

  const totalAds = ads.length;
  const activeAds = ads.filter(ad => ad.status === "active").length;
  const totalViews = 0; // Não temos dados de visualizações no banco ainda
  const totalContacts = 0; // Não temos dados de contatos no banco ainda

  // Mostrar loading
  if (isLoading) {
    return (
      <ResponsivePage
        title="Anúncios"
        subtitle="Gestão de anúncios em múltiplas plataformas"
        actions={
          <Button
            variant="primary"
            onClick={handleNewAdClick}
          >
            Novo Anúncio
          </Button>
        }
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando anúncios...</p>
          </div>
        </div>
      </ResponsivePage>
    );
  }

  // Mostrar erro
  if (error) {
    return (
      <ResponsivePage
        title="Anúncios"
        subtitle="Gestão de anúncios em múltiplas plataformas"
        actions={
          <Button
            variant="primary"
            onClick={handleNewAdClick}
          >
            Novo Anúncio
          </Button>
        }
      >
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar anúncios</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            variant="primary"
            onClick={fetchAds}
          >
            Tentar Novamente
          </Button>
        </div>
      </ResponsivePage>
    );
  }

  return (
    <ResponsivePage
      title="Anúncios"
      subtitle="Gestão de anúncios em múltiplas plataformas"
      actions={
        <Button
          variant="primary"
          onClick={handleNewAdClick}
        >
          Novo Anúncio
        </Button>
      }
    >
      {/* Insights da IA */}
      <div className="mb-6 sm:mb-8">
        <AIInsightCard 
          pageData={ads} 
          pageType="integrator" 
          className="w-full"
        />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <ResponsiveCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Anúncios</p>
              <p className="text-2xl font-bold text-gray-900">{totalAds}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Anúncios Ativos</p>
              <p className="text-2xl font-bold text-green-600">{activeAds}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Visualizações</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(totalViews)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Contatos</p>
              <p className="text-2xl font-bold text-purple-600">{totalContacts}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>
      </div>

      {/* Filtros */}
      <ResponsiveCard className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Canal"
            value={filtroCanal}
            onChange={(e) => setFiltroCanal(e.target.value)}
          >
            <option value="todos">Todos os Canais</option>
            {Array.from(new Set(ads.map(ad => ad.platform))).map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </Select>
          <Select
            label="Status"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="sold">Vendido</option>
          </Select>
          <Select
            label="Marca"
            value={filtroMarca}
            onChange={(e) => setFiltroMarca(e.target.value)}
          >
            <option value="todos">Todas as Marcas</option>
            {Array.from(new Set(ads.map(ad => ad.vehicle?.brand).filter(Boolean))).map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </Select>
        </div>
      </ResponsiveCard>

      {/* Grid de Anúncios */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredAds.length} anúncios encontrados
          </h3>
        </div>
        
        {filteredAds.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum anúncio encontrado</h3>
            <p className="text-gray-600 mb-4">
              {ads.length === 0 
                ? "Você ainda não possui anúncios cadastrados." 
                : "Nenhum anúncio corresponde aos filtros selecionados."
              }
            </p>
            <Button
              variant="primary"
              onClick={handleNewAdClick}
            >
              Criar Primeiro Anúncio
            </Button>
          </div>
        ) : (
          <AdGrid
            ads={adCardProps}
            onViewOffer={handleViewOffer}
            onImageClick={handleImageClick}
          />
        )}
      </div>
    </ResponsivePage>
  );
}
