import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Select from "../../../components/Select";
import Textarea from "../../../components/Textarea";
import Switch from "../../../components/Switch";
import ResponsiveCard from "../../../components/ResponsiveCard";
import { applyCurrencyMask, removeCurrencyMask } from "../../../lib/formatting";

interface AdDetails {
  id: string;
  company_id?: string;
  vehicle_id?: string;
  platform?: string;
  title?: string;
  description?: string;
  price?: number;
  status?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface ChannelStatus {
  enabled: boolean;
  adId?: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const AVAILABLE_CHANNELS = ['OLX', 'Webmotors', 'Mercado Livre'];

export default function EditAd() {
  const router = useRouter();
  const { id } = router.query;
  const [adDetails, setAdDetails] = useState<AdDetails | null>(null);
  const [allAds, setAllAds] = useState<AdDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
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

  const fetchAdDetails = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/ads?id=eq.${id}&company_id=eq.${user.company_id}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const ad = data[0];
          setAdDetails(ad);
          setFormData({
            titulo: ad.title || "",
            preco: ad.price ? applyCurrencyMask(ad.price.toString()) : "",
            descricao: ad.description || "",
            cidade: "",
            estado: "",
            vendedor: "",
            telefone: "",
            email: "",
            observacoes: ""
          });

          if (ad.vehicle_id) {
            const allAdsResponse = await fetch(`${SUPABASE_URL}/rest/v1/ads?vehicle_id=eq.${ad.vehicle_id}&company_id=eq.${user.company_id}`, {
              method: 'GET',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });

            if (allAdsResponse.ok) {
              const allAdsData = await allAdsResponse.json();
              setAllAds(allAdsData || []);

              const channelsState: Record<string, ChannelStatus> = {
                OLX: { enabled: false },
                Webmotors: { enabled: false },
                "Mercado Livre": { enabled: false }
              };

              allAdsData.forEach((adItem: AdDetails) => {
                if (adItem.platform && AVAILABLE_CHANNELS.includes(adItem.platform)) {
                  channelsState[adItem.platform] = {
                    enabled: adItem.status === 'active',
                    adId: adItem.id
                  };
                }
              });

              setChannels(channelsState);
            }
          }
        } else {
          setError('Anúncio não encontrado');
        }
      } else {
        setError('Erro ao carregar anúncio');
      }
      
    } catch (error) {
      console.error('Erro ao buscar anúncio:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAdDetails();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChannelToggle = async (channelName: string, enabled: boolean) => {
    if (!adDetails) return;

    const userData = localStorage.getItem('user_data');
    const accessToken = localStorage.getItem('supabase_access_token');
    
    if (!userData || !accessToken) {
      router.push('/');
      return;
    }
    
    const user = JSON.parse(userData);
    const channelStatus = channels[channelName];

    try {
      if (enabled) {
        if (channelStatus.adId) {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/ads?id=eq.${channelStatus.adId}&company_id=eq.${user.company_id}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              status: 'active',
              published_at: new Date().toISOString()
            })
          });

          if (response.ok) {
            setChannels(prev => ({
              ...prev,
              [channelName]: {
                enabled: true,
                adId: channelStatus.adId
              }
            }));
          }
        } else {
          const adData = {
            company_id: user.company_id,
            vehicle_id: adDetails.vehicle_id,
            platform: channelName,
            title: formData.titulo || adDetails.title,
            description: formData.descricao || adDetails.description,
            price: parseFloat(removeCurrencyMask(formData.preco)) || adDetails.price || 0,
            status: 'active',
            published_at: new Date().toISOString()
          };
          
          const response = await fetch(`${SUPABASE_URL}/rest/v1/ads`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(adData)
          });

          if (response.ok) {
            const newAd = await response.json();
            setChannels(prev => ({
              ...prev,
              [channelName]: {
                enabled: true,
                adId: Array.isArray(newAd) ? newAd[0]?.id : newAd?.id
              }
            }));
            await fetchAdDetails();
          }
        }
      } else {
        if (channelStatus.adId) {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/ads?id=eq.${channelStatus.adId}&company_id=eq.${user.company_id}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              status: 'paused',
              published_at: null
            })
          });

          if (response.ok) {
            setChannels(prev => ({
              ...prev,
              [channelName]: {
                enabled: false,
                adId: channelStatus.adId
              }
            }));
          }
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar canal:', error);
      alert('Erro ao atualizar canal. Tente novamente.');
    }
  };

  const handleSave = async () => {
    if (!adDetails) return;

    try {
      setIsSaving(true);
      setError(null);
      
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        router.push('/');
        return;
      }
      
      const user = JSON.parse(userData);
      
      const dataToSave = {
        title: formData.titulo,
        description: formData.descricao,
        price: parseFloat(removeCurrencyMask(formData.preco)) || 0
      };

      const enabledChannels = Object.entries(channels).filter(([_, status]) => status.adId);
      
      for (const [channelName, channelStatus] of enabledChannels) {
        if (channelStatus.adId) {
          await fetch(`${SUPABASE_URL}/rest/v1/ads?id=eq.${channelStatus.adId}&company_id=eq.${user.company_id}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(dataToSave)
          });
        }
      }
      
      setSuccessMessage('Anúncio atualizado com sucesso!');
      setTimeout(() => {
        router.push('/ads');
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao salvar anúncio:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/ads');
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando dados do anúncio...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !adDetails) {
    return (
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Anúncio não encontrado</h1>
            <p className="text-gray-600 mt-2">{error || 'O anúncio solicitado não foi encontrado.'}</p>
            <Button
              variant="primary"
              onClick={() => router.back()}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
            >
              Voltar
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <Button
                variant="ghost"
                onClick={handleCancel}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              >
                Voltar
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mt-4">Editar Anúncio</h1>
              <p className="text-gray-600 mt-2">
                Anúncio #{adDetails.id} - {adDetails.title || 'Sem título'}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form className="space-y-6">
          <ResponsiveCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Canais de Publicação</h3>
            <p className="text-sm text-gray-600 mb-4">
              Gerencie os canais onde este anúncio está publicado. Você pode habilitar ou desabilitar cada canal a qualquer momento.
            </p>
            <div className="space-y-4">
              {Object.entries(channels).map(([channelName, channelStatus]) => (
                <div key={channelName} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
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
                </div>
              ))}
            </div>
          </ResponsiveCard>

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
        </form>
      </div>
    </main>
  );
}

