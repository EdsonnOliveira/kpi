import React from 'react';
import { ResponsiveGrid, ResponsiveFlex } from './ResponsiveCard';

interface ResponsiveFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function ResponsiveForm({ 
  children, 
  onSubmit, 
  className = "", 
  title, 
  subtitle, 
  actions 
}: ResponsiveFormProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 ${className}`}>
      {(title || subtitle || actions) && (
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            {(title || subtitle) && (
              <div>
                {title && (
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {title}
                  </h2>
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
      
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
      </form>
    </div>
  );
}

interface ResponsiveFormSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function ResponsiveFormSection({ 
  children, 
  title, 
  description, 
  className = "" 
}: ResponsiveFormSectionProps) {
  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4 sm:space-y-6">
        {children}
      </div>
    </div>
  );
}

interface ResponsiveFormRowProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveFormRow({ 
  children, 
  cols = { default: 1, sm: 2 },
  gap = 4,
  className = "" 
}: ResponsiveFormRowProps) {
  const getColsClass = () => {
    const classes = [];
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    return classes.join(' ');
  };

  return (
    <div className={`grid ${getColsClass()} gap-${gap} w-full ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveFormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

export function ResponsiveFormActions({ 
  children, 
  align = 'right',
  className = "" 
}: ResponsiveFormActionsProps) {
  const getAlignClass = () => {
    switch (align) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      case 'between':
        return 'justify-between';
      default:
        return 'justify-end';
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${getAlignClass()} ${className}`}>
      {children}
    </div>
  );
}
