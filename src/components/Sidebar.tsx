import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Button from "./Button";

interface UserData {
  id: string;
  name: string;
  email: string;
  company_id: string;
  company_name: string;
}

interface MenuItem {
  label: string;
  name: string;
  icon: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    name: '/dashboard',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z'
  },
  {
    label: 'Ficha de atendimento',
    name: '/attendance-form',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    label: 'Comercial',
    name: '/commercial',
    icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    children: [
      { label: 'Vendas', name: '/sales', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { label: 'Propostas', name: '/proposals', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
    ]
  },
  {
    label: 'Integrador',
    name: '/integrator',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    children: [
      { label: 'Anúncios', name: '/ads', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' }
    ]
  },
  {
    label: 'CRM',
    name: '/crm',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    children: [
      { label: 'Leads', name: '/leads', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { label: 'Clientes', name: '/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
      { label: 'Usuários', name: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
      { label: 'Fornecedores', name: '/suppliers', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' }
    ]
  },
  {
    label: 'Financeiro',
    name: '/finance',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    children: [
      { label: 'DRE', name: '/dre', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { label: 'Evolução de Faturamento', name: '/revenue-evolution', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { label: 'Contas a Pagar/Receber', name: '/accounts', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' },
      { label: 'Mov. Financeiras', name: '/transactions', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { label: 'Conciliações Financeiras', name: '/reconciliations', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
    ]
  },
  {
    label: 'Estoque',
    name: '/stock',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    children: [
      { label: 'Veículos', name: '/vehicles', icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2' },
      { label: 'Peças', name: '/parts', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' }
    ]
  },
  {
    label: 'Oficina',
    name: '/workshop',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    children: [
      { label: 'Ordens de Serviço', name: '/service-orders', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { label: 'Agenda', name: '/schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
    ]
  },
  {
    label: 'Configurações',
    name: '/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
  }
];

interface SidebarProps {
  onStateChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ onStateChange }: SidebarProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = () => {
      const userDataString = localStorage.getItem('user_data');
      if (userDataString) {
        try {
          const user = JSON.parse(userDataString);
          setUserData(user);
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
        }
      }
    };

    loadUserData();
  }, []);

  // Detectar tipo de dispositivo
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      // Mobile: < 768px, Tablet: 768px - 1024px, Desktop: > 1024px
      setIsMobile(width < 768);
      if (width >= 768) {
        setIsMobileMenuOpen(false);
      }
      // Em tablets, colapsar automaticamente o sidebar se estiver muito estreito
      if (width >= 768 && width < 1024 && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [isCollapsed]);

  // Notificar o Layout sobre mudanças no estado do sidebar
  useEffect(() => {
    if (onStateChange) {
      onStateChange(isCollapsed);
    }
  }, [isCollapsed, onStateChange]);

  const handleLogout = () => {
    router.push("/");
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? [] // Se já está aberto, fecha (remove todos)
        : [itemName] // Se não está aberto, abre apenas este (substitui todos)
    );
  };

  const isActivePage = (path: string) => {
    return router.pathname === path;
  };

  const isExpanded = (itemName: string) => {
    return expandedItems.includes(itemName);
  };

  // Se for mobile, renderizar header com botão hamburger
  if (isMobile) {
    return (
      <>
        {/* Header Mobile */}
        <div className="bg-secondary p-4 flex items-center justify-between md:hidden">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
              <span className="text-primary font-bold text-sm">N</span>
            </div>
            <span className="text-white font-semibold text-lg">Novo KPI</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:bg-transparent"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </Button>
        </div>

        {/* Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ease-in-out no-print"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Mobile */}
        <div className={`fixed top-0 left-0 h-full bg-secondary z-50 transform transition-all duration-300 ease-in-out md:hidden no-print ${
          isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        } w-72 shadow-2xl`}>
          <div className="flex flex-col h-full">
            {/* Header do Sidebar Mobile */}
            <div className="p-4 flex items-center justify-between border-b border-white border-opacity-20">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                  <span className="text-primary font-bold text-sm">N</span>
                </div>
                <span className="text-white font-semibold text-lg">Novo KPI</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            {/* Menu Items Mobile */}
            <div className="flex-1 overflow-y-auto py-4 px-2">
              {menuItems.map((item) => (
                <div key={item.name}>
                  <button
                    onClick={() => {
                      if (item.children) {
                        toggleExpanded(item.name);
                      } else {
                        handleNavigation(item.name);
                      }
                    }}
                    className={`cursor-pointer w-full flex items-center px-4 py-4 text-left hover:opacity-10 transition-colors ${
                      isActivePage(item.name) ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <svg className="w-5 h-5 text-white mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className="text-white font-medium">{item.label}</span>
                    {item.children && (
                      <svg className={`w-4 h-4 text-white ml-auto transition-transform ${
                        expandedItems.includes(item.name) ? 'rotate-180' : ''
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  
                  {item.children && expandedItems.includes(item.name) && (
                    <div>
                      {item.children.map((child) => (
                        <button
                          key={child.name}
                          onClick={() => handleNavigation(child.name)}
                          className={`w-full flex items-center px-4 py-3 pl-12 text-left hover:bg-opacity-10 transition-colors ${
                            isActivePage(child.name) ? 'opacity-100' : 'opacity-50'
                          }`}
                        >
                          <svg className="w-4 h-4 text-white mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={child.icon} />
                          </svg>
                          <span className="text-white text-sm">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* User Section Mobile */}
            <div className="border-t border-white border-opacity-20 p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary font-semibold text-sm">
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {userData?.name || 'Usuário'}
                  </p>
                  <p className="text-white text-opacity-70 text-xs">
                    {userData?.email || 'admin@novokpi.com'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                fullWidth
                onClick={handleLogout}
                className="hover:bg-white hover:bg-opacity-10 justify-start !text-white"
                leftIcon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                }
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Sidebar Desktop
  return (
    <div className={`bg-secondary text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-72'
    } min-h-screen hidden md:flex flex-col fixed left-0 top-0 z-30 shadow-lg no-print`}>
      <section className={`flex flex-col h-full ${isCollapsed ? 'w-16' : 'w-72'}`}>
        {/* Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">N</span>
                </div>
                <span className="text-xl font-bold">Novo KPI</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-full hover:bg-white/10 flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-3">
            {menuItems.map((item) => (
              <div key={item.name}>
                <button
                  onClick={() => {
                    if (item.children) {
                      if (isCollapsed) {
                        return;
                      }
                      toggleExpanded(item.name);
                    } else {
                      handleNavigation(item.name);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (isCollapsed && item.children) {
                      setHoveredItem(item.name);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMousePosition({ x: rect.left, y: rect.top + 200 });
                    }
                  }}
                  onMouseLeave={() => {
                    if (isCollapsed && item.children) {
                      setHoveredItem(null);
                      setMousePosition(null);
                    }
                  }}
                  className={`w-full flex items-center rounded-lg transition-colors cursor-pointer group relative ${
                    isCollapsed ? 'justify-center p-3' : 'justify-between p-4'
                  } ${
                    isActivePage(item.name) 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-white/10'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </div>
                  
                  {/* Tooltip para sidebar colapsado */}
                  {isCollapsed && !item.children && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                  {item.children && !isCollapsed && (
                    <svg 
                      className={`w-4 h-4 transition-transform ${
                        isExpanded(item.name) ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {/* Submenu para sidebar colapsado */}
                {isCollapsed && item.children && hoveredItem === item.name && mousePosition && (
                  <div className="absolute left-full bg-gray-900 rounded-lg shadow-lg py-2 z-50 min-w-48"
                       style={{ top: `${mousePosition.y - 200}px` }}
                       onMouseEnter={() => setHoveredItem(item.name)}
                       onMouseLeave={() => {
                         setHoveredItem(null);
                         setMousePosition(null);
                       }}>
                    <div className="px-3 py-2 text-white text-sm font-medium border-b border-gray-700">
                      {item.label}
                    </div>
                    {item.children.map((child) => (
                      <button
                        key={child.name}
                        onClick={() => handleNavigation(child.name)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-800 transition-colors ${
                          isActivePage(child.name) ? 'bg-primary/20 text-primary' : 'text-white'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={child.icon} />
                        </svg>
                        <span className="text-sm">{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Submenu */}
                {item.children && isExpanded(item.name) && !isCollapsed && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <button
                        key={child.name}
                        onClick={() => handleNavigation(child.name)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                          isActivePage(child.name)
                            ? 'bg-primary/20 text-primary'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={child.icon} />
                        </svg>
                        <span className="text-sm">{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-sm font-medium">
                  {userData?.name || 'Usuário'}
                </p>
                <p className="text-xs text-white/70">
                  {userData?.email || 'admin@novokpi.com'}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            fullWidth
            onClick={handleLogout}
            className={`hover:bg-white/10 !text-white ${isCollapsed ? 'justify-center' : 'justify-start'}`}
            leftIcon={
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            }
          >
            {!isCollapsed && "Sair"}
          </Button>
        </div>
      </section>
    </div>
  );
}
