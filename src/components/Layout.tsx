import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import FloatingAIButton from "./FloatingAIButton";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Não mostrar sidebar na página de login
  const shouldShowSidebar = router.pathname !== "/";

  // Detectar tipo de dispositivo
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      // Mobile: < 768px, Tablet: 768px - 1024px, Desktop: > 1024px
      setIsMobile(width < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Função para receber estado do sidebar
  const handleSidebarState = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  return (
    <>
      {/* Estilos para impressão */}
      <style jsx global>{`
        @media print {
          .print-no-margin {
            margin-left: 0 !important;
          }
          
          .print-full-width {
            width: 100% !important;
            max-width: none !important;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50">
        {shouldShowSidebar && <Sidebar onStateChange={handleSidebarState} />}
        <div className={`${shouldShowSidebar ? (isMobile ? "" : isCollapsed ? "md:ml-16" : "md:ml-72") : ""} print-no-margin`}>
          {children}
        </div>
        {shouldShowSidebar && <FloatingAIButton />}
      </div>
    </>
  );
}
