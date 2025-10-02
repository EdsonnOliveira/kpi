import React from 'react';

interface ResponsiveListProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  emptyState?: React.ReactNode;
  loading?: boolean;
}

export default function ResponsiveList({ 
  children, 
  className = "", 
  title, 
  subtitle, 
  actions, 
  emptyState,
  loading = false
}: ResponsiveListProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {(title || subtitle || actions) && (
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            {(title || subtitle) && (
              <div>
                {title && (
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-gray-600 text-sm sm:text-base">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {actions && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : (
          children || emptyState
        )}
      </div>
    </div>
  );
}

interface ResponsiveListItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
}

export function ResponsiveListItem({ 
  children, 
  onClick, 
  className = "", 
  hover = true 
}: ResponsiveListItemProps) {
  return (
    <div 
      className={`
        px-4 sm:px-6 py-4 sm:py-6 
        ${onClick ? 'cursor-pointer' : ''} 
        ${hover && onClick ? 'hover:bg-gray-50 transition-colors' : ''} 
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface ResponsiveListContentProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveListContent({ 
  children, 
  className = "" 
}: ResponsiveListContentProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveListMainProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveListMain({ 
  children, 
  className = "" 
}: ResponsiveListMainProps) {
  return (
    <div className={`flex-1 min-w-0 ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveListSecondaryProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveListSecondary({ 
  children, 
  className = "" 
}: ResponsiveListSecondaryProps) {
  return (
    <div className={`flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveListTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveListTitle({ 
  children, 
  className = "" 
}: ResponsiveListTitleProps) {
  return (
    <h4 className={`text-sm sm:text-base font-medium text-gray-900 truncate ${className}`}>
      {children}
    </h4>
  );
}

interface ResponsiveListSubtitleProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveListSubtitle({ 
  children, 
  className = "" 
}: ResponsiveListSubtitleProps) {
  return (
    <p className={`text-sm text-gray-500 truncate ${className}`}>
      {children}
    </p>
  );
}

interface ResponsiveListMetaProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveListMeta({ 
  children, 
  className = "" 
}: ResponsiveListMetaProps) {
  return (
    <div className={`text-xs sm:text-sm text-gray-400 ${className}`}>
      {children}
    </div>
  );
}
