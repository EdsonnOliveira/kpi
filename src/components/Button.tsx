import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Variantes de cor
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-white hover:opacity-90 focus:ring-primary';
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500';
      case 'info':
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
      case 'light':
        return 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300';
      case 'dark':
        return 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-700';
      case 'outline':
        return 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500';
      case 'ghost':
        return 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300';
      default:
        return 'bg-primary text-white hover:opacity-90 focus:ring-primary';
    }
  };

  // Tamanhos
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-1 text-xs sm:px-3 sm:py-1.5';
      case 'sm':
        return 'px-3 py-2 text-sm sm:px-4 sm:py-2';
      case 'md':
        return 'px-4 py-2 text-sm sm:px-5 sm:py-2.5';
      case 'lg':
        return 'px-6 py-3 text-base sm:px-7 sm:py-3.5';
      case 'xl':
        return 'px-8 py-4 text-lg sm:px-10 sm:py-5';
      default:
        return 'px-4 py-2 text-sm sm:px-5 sm:py-2.5';
    }
  };

  // Classes base
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  // Classes de largura
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Classes de loading
  const loadingClasses = loading ? 'cursor-wait' : '';

  // Classes finais
  const finalClasses = `${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${widthClasses} ${loadingClasses} ${className}`.trim();

  return (
    <button
      className={finalClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!loading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      
      <span>{children}</span>
      
      {!loading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
}

// Componentes específicos para facilitar o uso
export const PrimaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="secondary" {...props} />
);

export const SuccessButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="success" {...props} />
);

export const DangerButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="danger" {...props} />
);

export const WarningButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="warning" {...props} />
);

export const InfoButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="info" {...props} />
);

export const OutlineButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="outline" {...props} />
);

export const GhostButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="ghost" {...props} />
);
