import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Configurações do Supabase
  const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Fazer login usando fetch diretamente para a API do Supabase
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Login bem-sucedido - agora verificar se usuário e empresa estão ativos
        const userCheckResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=id,name,active,company_id,companies(id,name,active)`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${data.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (userCheckResponse.ok) {
          const userData = await userCheckResponse.json();
          
          if (userData.length === 0) {
            setError('Usuário não encontrado no sistema.');
            return;
          }

          const user = userData[0];
          
          // Verificar se usuário está ativo
          if (!user.active) {
            setError('Sua conta está inativa. Entre em contato com o administrador.');
            return;
          }

          // Verificar se empresa está ativa
          if (!user.companies || !user.companies.active) {
            setError('A empresa vinculada à sua conta está inativa. Entre em contato com o administrador.');
            return;
          }

          // Salvar dados do usuário e empresa no localStorage
          localStorage.setItem('supabase_access_token', data.access_token);
          localStorage.setItem('supabase_refresh_token', data.refresh_token);
          localStorage.setItem('user_data', JSON.stringify({
            id: user.id,
            name: user.name,
            email: email,
            company_id: user.company_id,
            company_name: user.companies.name
          }));
          
          // Redirecionar para o dashboard
          router.push("/dashboard");
        } else {
          setError('Erro ao verificar dados do usuário.');
        }
      } else {
        // Erro no login
        setError(data.msg || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Seção da esquerda com background */}
      <div className="flex-1 relative">
        <Image
          src="/bg.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay azul escuro */}
        <div className="absolute inset-0 bg-secondary-overlay"></div>
        
        {/* Texto sobreposto */}
        <div className="absolute bottom-8 left-8 text-white">
          <h2 className="text-2xl font-bold leading-tight">
            Tornando as revendas<br />
            de veículos mais eficientes
          </h2>
        </div>
      </div>

      {/* Seção da direita com formulário */}
      <div className="w-1/3 min-w-[400px] bg-white flex flex-col justify-center items-center px-12">
        <div className="w-full">
          {/* Logo */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold text-primary">Novo KPI</h1>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
            {/* Exibir erro se houver */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 bg-white"
                placeholder="Digite seu e-mail"
                required
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 bg-white"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Link Esqueci minha senha */}
            <div className="flex justify-end">
              <a href="#" className="text-sm text-primary hover:opacity-80">
                Esqueci minha senha
              </a>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* Links adicionais */}
          <div className="mt-8 space-y-3 text-center">
            <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">
              Atendimento online
            </a>
            <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">
              Acesso remoto
            </a>
          </div>

          {/* Versão do build */}
          <div className="mt-auto pt-8 text-center">
            <p className="text-xs text-gray-400">
              Version Build: 24/09/2025, 13:18:59
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
