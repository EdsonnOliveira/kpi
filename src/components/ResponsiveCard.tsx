import React from 'react';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export default function ResponsiveCard({ 
  children, 
  className = "", 
  title, 
  actions 
}: ResponsiveCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          {title && (
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">{title}</h3>
          )}
          {actions && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, sm: 2, lg: 3 },
  gap = { default: 4, sm: 6 },
  className = ""
}: ResponsiveGridProps) {
  const getColsClass = () => {
    const classes = [];
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    return classes.join(' ');
  };

  const getGapClass = () => {
    const classes = [];
    if (gap.default) classes.push(`gap-${gap.default}`);
    if (gap.sm) classes.push(`sm:gap-${gap.sm}`);
    if (gap.md) classes.push(`md:gap-${gap.md}`);
    if (gap.lg) classes.push(`lg:gap-${gap.lg}`);
    return classes.join(' ');
  };

  return (
    <div className={`grid ${getColsClass()} ${getGapClass()} w-full ${className}`}>
      {children}
    </div>
  );
}

// Componente para layout flexível responsivo
interface ResponsiveFlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  wrap?: boolean;
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: number;
  className?: string;
}

export function ResponsiveFlex({ 
  children, 
  direction = 'row',
  wrap = false,
  justify = 'start',
  align = 'start',
  gap = 4,
  className = ""
}: ResponsiveFlexProps) {
  const getDirectionClass = () => {
    return direction === 'col' ? 'flex-col' : 'flex-row';
  };

  const getJustifyClass = () => {
    const justifyMap = {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    };
    return justifyMap[justify];
  };

  const getAlignClass = () => {
    const alignMap = {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch'
    };
    return alignMap[align];
  };

  return (
    <div className={`
      flex 
      ${getDirectionClass()} 
      ${getJustifyClass()} 
      ${getAlignClass()} 
      ${wrap ? 'flex-wrap' : 'flex-nowrap'}
      gap-${gap}
      w-full
      ${className}
    `}>
      {children}
    </div>
  );
}
