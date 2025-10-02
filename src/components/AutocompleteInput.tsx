import { useState, useRef, useEffect, forwardRef } from "react";

interface AutocompleteInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  options?: string[];
  onOptionSelect?: (option: string) => void;
}

const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, size = 'md', className = "", options = [], onOptionSelect, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (rightIcon) return 'pr-10';
      return '';
    };

    // Filtrar opções baseado no valor do input
    useEffect(() => {
      if (props.value && typeof props.value === 'string' && props.value.length > 0) {
        const filtered = options.filter(option =>
          option.toLowerCase().includes(props.value.toString().toLowerCase())
        );
        setFilteredOptions(filtered);
        setIsOpen(filtered.length > 0);
      } else {
        setFilteredOptions(options);
        setIsOpen(false);
      }
      setHighlightedIndex(-1);
    }, [props.value, options]);

    // Fechar dropdown quando clicar fora
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
            inputRef.current && !inputRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (props.onFocus) {
        props.onFocus(e);
      }
      if (filteredOptions.length > 0) {
        setIsOpen(true);
      }
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (props.onBlur) {
        props.onBlur(e);
      }
      // Delay para permitir clique no dropdown
      setTimeout(() => {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }, 150);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          e.preventDefault();
          setIsOpen(true);
          setHighlightedIndex(0);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            selectOption(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    };

    const selectOption = (option: string) => {
      if (props.onChange) {
        const syntheticEvent = {
          target: { value: option, name: props.name || '' }
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange(syntheticEvent);
      }
      if (onOptionSelect) {
        onOptionSelect(option);
      }
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    };

    return (
      <div className="w-full relative">
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
            ref={ref || inputRef}
            className={`
              w-full 
              ${getSizeClasses()} 
              ${getIconPadding()}
              border 
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'} 
              bg-white 
              text-gray-900 
              rounded-lg 
              focus:ring-2 
              focus:outline-none 
              transition-colors 
              duration-200
              placeholder-gray-400
              disabled:bg-gray-50 
              disabled:text-gray-500 
              disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {rightIcon}
              </div>
            </div>
          )}
        </div>

        {/* Dropdown customizado */}
        {isOpen && filteredOptions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            style={{ zIndex: 9999 }}
          >
            {filteredOptions.map((option, index) => (
              <div
                key={option}
                className={`px-4 py-2 cursor-pointer text-sm ${
                  index === highlightedIndex
                    ? 'bg-primary text-white'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option}
              </div>
            ))}
          </div>
        )}

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
      </div>
    );
  }
);

AutocompleteInput.displayName = "AutocompleteInput";

export default AutocompleteInput;
