import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  name: string;
  email: string;
  company_id: string;
  company_name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const SUPABASE_URL = 'https://cvfacwfkbcgmnfuqorky.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE';

export const useAuth = () => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  // Função para renovar token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem('supabase_refresh_token');
      if (!refreshToken) return null;

      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('supabase_access_token', data.access_token);
        localStorage.setItem('supabase_refresh_token', data.refresh_token);
        return data.access_token;
      }
      return null;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return null;
    }
  }, []);

  // Função para fazer requisição autenticada
  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const accessToken = localStorage.getItem('supabase_access_token');
    
    // Tentar fazer a requisição
    let response = await fetch(url, {
      ...options,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // Se receber 401, tentar renovar o token
    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        // Tentar novamente com o novo token
        response = await fetch(url, {
          ...options,
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
      } else {
        // Se não conseguir renovar, fazer logout
        logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
    }

    return response;
  }, [refreshToken]);

  // Função para verificar autenticação
  const checkAuth = useCallback(async () => {
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('supabase_access_token');
      
      if (!userData || !accessToken) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
        return;
      }

      const user = JSON.parse(userData);
      
      // Verificar se o token ainda é válido fazendo uma requisição simples
      const response = await authenticatedFetch(`${SUPABASE_URL}/rest/v1/users?select=id&limit=1`);
      
      if (response.ok) {
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        });
      } else {
        // Token inválido, fazer logout
        logout();
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      logout();
    }
  }, [authenticatedFetch]);

  // Função de logout
  const logout = useCallback(() => {
    localStorage.removeItem('supabase_access_token');
    localStorage.removeItem('supabase_refresh_token');
    localStorage.removeItem('user_data');
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    });
    router.push('/');
  }, [router]);

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    authenticatedFetch,
    logout,
    checkAuth
  };
};
