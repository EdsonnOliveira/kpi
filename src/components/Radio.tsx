import { forwardRef } from "react";

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div>
        <label className="flex items-center cursor-pointer">
          <input
            ref={ref}
            type="radio"
            className={`mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 ${className}`}
            {...props}
          />
          {label && (
            <span className="text-sm text-gray-700">{label}</span>
          )}
        </label>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Radio.displayName = "Radio";

export default Radio;
