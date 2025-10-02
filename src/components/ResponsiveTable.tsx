import React from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export default function ResponsiveTable({ children, className = "" }: ResponsiveTableProps) {
  return (
    <div className={`overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-gray-200 ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
    </div>
  );
}

interface ResponsiveTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableHeader({ children, className = "" }: ResponsiveTableHeaderProps) {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
}

interface ResponsiveTableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableHeaderCell({ children, className = "" }: ResponsiveTableHeaderCellProps) {
  return (
    <th className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 ${className}`}>
      <div className="truncate">
        {children}
      </div>
    </th>
  );
}

interface ResponsiveTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableBody({ children, className = "" }: ResponsiveTableBodyProps) {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
}

interface ResponsiveTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export function ResponsiveTableRow({ children, className = "", onClick, onDoubleClick }: ResponsiveTableRowProps) {
  return (
    <tr 
      className={`${onClick || onDoubleClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${className}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </tr>
  );
}

interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
}

export function ResponsiveTableCell({ children, className = "", isHeader = false }: ResponsiveTableCellProps) {
  const baseClasses = "px-3 sm:px-4 md:px-6 py-3 sm:py-4";
  const textClasses = isHeader 
    ? "text-xs sm:text-sm font-medium text-gray-900" 
    : "text-xs sm:text-sm text-gray-500";
  
  return (
    <td className={`${baseClasses} ${textClasses} ${className}`}>
      <div className="truncate">
        {children}
      </div>
    </td>
  );
}
