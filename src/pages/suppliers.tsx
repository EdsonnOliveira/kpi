import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Input from "../components/Input";
import Select from "../components/Select";

interface Supplier {
  id: string;
  company_id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  contact_person: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Suppliers() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    document: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    contact_person: "",
    active: true
  });

  const fetchSuppliers = async () => {
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
      
      const response = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/suppliers?company_id=eq.${user.company_id}&select=*&order=name.asc`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      } else {
        setError('Erro ao carregar fornecedores');
      }
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      const url = editingId 
        ? `https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/suppliers?id=eq.${editingId}`
        : 'https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/suppliers';
      
      const method = editingId ? 'PATCH' : 'POST';
      
      const dataToSave = editingId ? formData : {
        ...formData,
        company_id: user.company_id
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        setSuccessMessage(editingId ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor criado com sucesso!');
        setIsCreatingNew(false);
        setEditingId(null);
        resetForm();
        fetchSuppliers();
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Erro ao salvar fornecedor');
      }
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const editSupplier = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      document: supplier.document,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      state: supplier.state,
      zip_code: supplier.zip_code,
      contact_person: supplier.contact_person,
      active: supplier.active
    });
    setEditingId(supplier.id);
    setIsCreatingNew(true);
  };

  const deleteSupplier = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        setIsLoading(true);
        setError(null);
        
        const accessToken = localStorage.getItem('supabase_access_token');
        
        if (!accessToken) {
          router.push('/');
          return;
        }
        
        const response = await fetch(`https://cvfacwfkbcgmnfuqorky.supabase.co/rest/v1/suppliers?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setSuccessMessage('Fornecedor excluído com sucesso!');
          fetchSuppliers();
          
          // Limpar mensagem de sucesso após 3 segundos
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setError('Erro ao excluir fornecedor');
        }
      } catch (error) {
        console.error('Erro ao excluir fornecedor:', error);
        setError('Erro de conexão. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      document: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      contact_person: "",
      active: true
    });
    setEditingId(null);
  };

  const cancelForm = () => {
    setIsCreatingNew(false);
    setEditingId(null);
    resetForm();
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const getStatusColor = (active: boolean) => {
    return active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
          <button
            onClick={() => setIsCreatingNew(true)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            Novo Fornecedor
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {isCreatingNew && (
          <div className="mb-6 p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </h3>
            
            <form onSubmit={saveSupplier} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nome da Empresa"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome da empresa"
                  required
                />
                <Input
                  label="CNPJ"
                  type="text"
                  name="document"
                  value={formData.document}
                  onChange={(e) => setFormData({...formData, document: e.target.value})}
                  placeholder="00.000.000/0000-00"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@empresa.com"
                  required
                />
                <Input
                  label="Telefone"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  required
                />
                <Input
                  label="Endereço"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Rua, número"
                  required
                />
                <Input
                  label="Cidade"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Cidade"
                  required
                />
                <Input
                  label="Estado"
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  placeholder="SP"
                  required
                />
                <Input
                  label="CEP"
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                  placeholder="00000-000"
                  required
                />
                <Input
                  label="Pessoa de Contato"
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  placeholder="Nome do contato"
                  required
                />
                <Select
                  label="Status"
                  name="active"
                  value={formData.active ? "true" : "false"}
                  onChange={(e) => setFormData({...formData, active: e.target.value === "true"})}
                  required
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </Select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Salvar')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Lista de Fornecedores
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Gerencie seus fornecedores
            </p>
          </div>
          
          {isLoading ? (
            <div className="px-4 py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-gray-500">Carregando fornecedores...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500">Nenhum fornecedor encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {supplier.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.document}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.active)}`}>
                        {supplier.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => editSupplier(supplier)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteSupplier(supplier.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}