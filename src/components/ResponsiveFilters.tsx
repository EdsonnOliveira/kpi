import React, { useState } from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';

interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface ResponsiveFiltersProps {
  fields: FilterField[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onApply: () => void;
  onClear: () => void;
  className?: string;
  showClearButton?: boolean;
  showApplyButton?: boolean;
}

export default function ResponsiveFilters({
  fields,
  values,
  onChange,
  onApply,
  onClear,
  className = "",
  showClearButton = true,
  showApplyButton = true
}: ResponsiveFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderField = (field: FilterField) => {
    const commonProps = {
      label: field.label,
      value: values[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onChange(field.name, e.target.value);
      }
    };

    switch (field.type) {
      case 'text':
        return (
          <Input
            {...commonProps}
            placeholder={field.placeholder}
            size="sm"
          />
        );
      case 'select':
        return (
          <Select
            {...commonProps}
            size="sm"
          >
            <option value="">Todos</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      case 'date':
        return (
          <Input
            {...commonProps}
            type="date"
            size="sm"
          />
        );
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            placeholder={field.placeholder}
            size="sm"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="sm:hidden"
        >
          {isExpanded ? 'Ocultar' : 'Mostrar'} Filtros
        </Button>
      </div>

      {/* Filters */}
      <div className={`space-y-4 ${isExpanded ? 'block' : 'hidden sm:block'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {fields.map(field => (
            <div key={field.name}>
              {renderField(field)}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-200">
          {showApplyButton && (
            <Button
              onClick={onApply}
              size="sm"
              className="w-full sm:w-auto"
            >
              Aplicar Filtros
            </Button>
          )}
          {showClearButton && (
            <Button
              variant="outline"
              onClick={onClear}
              size="sm"
              className="w-full sm:w-auto"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ResponsiveSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
  className?: string;
}

export function ResponsiveSearch({
  value,
  onChange,
  placeholder = "Pesquisar...",
  onSearch,
  className = ""
}: ResponsiveSearchProps) {
  return (
    <div className={`relative ${className}`}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        leftIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        rightIcon={
          onSearch && (
            <button
              onClick={onSearch}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )
        }
      />
    </div>
  );
}
