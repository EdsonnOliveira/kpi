import { forwardRef, useState } from "react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onCopy'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  datalistId?: string;
  datalistOptions?: string[];
  allowCopy?: boolean;
  showPassword?: boolean;
  onCopy?: (text: string) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, size = 'md', className = "", datalistId, datalistOptions, allowCopy = false, showPassword = false, onCopy, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [copySuccess, setCopySuccess] = useState("");

    const handleCopyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopySuccess("Copiado com sucesso!");
        setTimeout(() => setCopySuccess(""), 2000);
        if (onCopy) {
          onCopy(text);
        }
      } catch (err) {
        console.error('Erro ao copiar:', err);
        setCopySuccess("Erro ao copiar");
        setTimeout(() => setCopySuccess(""), 2000);
      }
    };

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'px-3 py-2 text-sm';
        case 'md':
          return 'px-4 py-3 text-sm';
        case 'lg':
          return 'px-4 py-4 text-base';
        default:
          return 'px-4 py-3 text-sm';
      }
    };

    const getIconPadding = () => {
      if (leftIcon) return 'pl-10';
      if (rightIcon || allowCopy || showPassword) return 'pr-10';
      return '';
    };

    const getInputType = () => {
      if (showPassword && props.type === 'password') {
        return isPasswordVisible ? 'text' : 'password';
      }
      return props.type;
    };

    const renderActionButtons = () => {
      const buttons = [];
      
      if (allowCopy && props.value) {
        buttons.push(
          <button
            key="copy"
            type="button"
            onClick={() => handleCopyToClipboard(props.value as string)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copiar"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        );
      }
      
      if (showPassword && props.type === 'password') {
        buttons.push(
          <button
            key="password"
            type="button"
            onClick={togglePasswordVisibility}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
          >
            {isPasswordVisible ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        );
      }
      
      return buttons.length > 0 ? (
        <div className="flex items-center space-x-1">
          {buttons}
        </div>
      ) : rightIcon;
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}
          <input
            ref={ref}
            type={getInputType()}
            className={`
              w-full 
              ${props.type === 'color' ? 'h-11' : getSizeClasses()} 
              ${props.type === 'color' ? '' : getIconPadding()}
              ${props.type === 'color' ? 'border-0' : `border ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
              ${props.type === 'color' ? 'bg-white' : 'bg-white'} 
              ${props.type === 'color' ? 'text-gray-900' : 'text-gray-900'} 
              rounded-lg 
              ${props.type === 'color' ? '' : 'focus:ring-2'} 
              focus:outline-none 
              transition-colors 
              duration-200
              ${props.type === 'color' ? '' : 'placeholder-gray-400'}
              disabled:bg-gray-50 
              disabled:text-gray-500 
              disabled:cursor-not-allowed
              ${props.type === 'color' ? 'cursor-pointer' : ''}
              ${className}
            `}
            list={datalistId}
            {...props}
          />
          {renderActionButtons() && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="text-gray-400">
                {renderActionButtons()}
              </div>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
        {copySuccess && (
          <p className="mt-1 text-sm text-green-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {copySuccess}
          </p>
        )}
        {datalistId && datalistOptions && (
          <datalist id={datalistId}>
            {datalistOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
