import React from 'react';

interface ResponsivePageProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function ResponsivePage({ 
  children, 
  title, 
  subtitle, 
  actions, 
  className = "" 
}: ResponsivePageProps) {
  return (
    <main className={`max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="py-4 sm:py-6">
        {(title || subtitle || actions) && (
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              {(title || subtitle) && (
                <div>
                  {title && (
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-gray-600">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
              {actions && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
    </main>
  );
}
