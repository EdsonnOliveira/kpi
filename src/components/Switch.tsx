import { forwardRef } from "react";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, error, helperText, size = 'md', variant = 'primary', className = "", ...props }, ref) => {
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return {
            container: 'w-9 h-5',
            thumb: 'h-4 w-4 after:top-[1px] after:left-[1px] after:h-4 after:w-4'
          };
        case 'md':
          return {
            container: 'w-11 h-6',
            thumb: 'h-5 w-5 after:top-[2px] after:left-[2px] after:h-5 after:w-5'
          };
        case 'lg':
          return {
            container: 'w-14 h-7',
            thumb: 'h-6 w-6 after:top-[1px] after:left-[1px] after:h-6 after:w-6'
          };
        default:
          return {
            container: 'w-11 h-6',
            thumb: 'h-5 w-5 after:top-[2px] after:left-[2px] after:h-5 after:w-5'
          };
      }
    };

    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return 'peer-checked:bg-primary peer-focus:ring-primary';
        case 'secondary':
          return 'peer-checked:bg-gray-600 peer-focus:ring-gray-300';
        case 'success':
          return 'peer-checked:bg-green-500 peer-focus:ring-green-300';
        case 'warning':
          return 'peer-checked:bg-yellow-500 peer-focus:ring-yellow-300';
        case 'danger':
          return 'peer-checked:bg-red-500 peer-focus:ring-red-300';
        default:
          return 'peer-checked:bg-primary peer-focus:ring-primary';
      }
    };

    const sizeClasses = getSizeClasses();
    const variantClasses = getVariantClasses();

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <div className={`
            ${sizeClasses.container}
            bg-gray-200 
            peer-focus:outline-none 
            peer-focus:ring-4 
            ${variantClasses}
            rounded-full 
            peer 
            peer-checked:after:translate-x-full 
            peer-checked:after:border-white 
            after:content-[''] 
            after:absolute 
            ${sizeClasses.thumb}
            after:bg-white 
            after:border-gray-300 
            after:border 
            after:rounded-full 
            after:transition-all
          `}></div>
        </label>
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

Switch.displayName = "Switch";

export default Switch;
