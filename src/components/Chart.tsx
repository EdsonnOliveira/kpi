import React from 'react';

export interface ChartData {
  label: string;
  value: number;
  color?: string;
  tooltip?: string;
}

export interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'comparison';
  title: string;
  data: ChartData[];
  width?: number;
  height?: number;
  className?: string;
}

export default function Chart({ 
  type, 
  title, 
  data, 
  width = 400, 
  height = 200, 
  className = '' 
}: ChartProps) {
  const renderLineChart = () => {
    const maxValue = Math.max(...data.map(d => d.value));
    const points = data.map((item, index) => {
      const x = (index * (width - 40)) / (data.length - 1) + 20;
      const y = height - 20 - (item.value / maxValue) * (height - 40);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        <defs>
          <pattern id={`grid-${type}`} width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${type})`} />
        
        {/* Line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          points={points}
        />
        
        {/* Points */}
        {data.map((item, index) => {
          const x = (index * (width - 40)) / (data.length - 1) + 20;
          const y = height - 20 - (item.value / maxValue) * (height - 40);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#3b82f6"
              className="hover:r-6 transition-all cursor-pointer"
            >
              <title>{item.tooltip || `${item.label}: ${item.value.toLocaleString('pt-BR')}`}</title>
            </circle>
          );
        })}
        
        {/* Labels */}
        {data.map((item, index) => {
          const x = (index * (width - 40)) / (data.length - 1) + 20;
          return (
            <text
              key={index}
              x={x}
              y={height - 5}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    );
  };

  const renderBarChart = () => {
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = (width - 40) / data.length - 10;

    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        {data.map((item, index) => {
          const x = 20 + index * (barWidth + 10);
          const barHeight = (item.value / maxValue) * (height - 60);
          const y = height - 40 - barHeight;
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color || '#3b82f6'}
                rx="4"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{item.tooltip || `${item.label}: ${item.value.toLocaleString('pt-BR')}`}</title>
              </rect>
              
              {/* Value label */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {item.value.toLocaleString('pt-BR')}
              </text>
              
              {/* Category label */}
              <text
                x={x + barWidth / 2}
                y={height - 20}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const radius = 50; // Reduzi o raio para dar mais espaço
    const centerX = width * 0.35; // Movi o centro para a esquerda
    const centerY = height / 2;

    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        
        {data.map((item, index) => {
          const percentage = item.value / total;
          const angle = percentage * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const startAngleRad = (startAngle * Math.PI) / 180;
          const endAngleRad = (endAngle * Math.PI) / 180;
          
          const x1 = centerX + radius * Math.cos(startAngleRad);
          const y1 = centerY + radius * Math.sin(startAngleRad);
          const x2 = centerX + radius * Math.cos(endAngleRad);
          const y2 = centerY + radius * Math.sin(endAngleRad);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          currentAngle += angle;
          
          return (
            <path
              key={index}
              d={pathData}
              fill={item.color || `hsl(${index * 60}, 70%, 50%)`}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <title>{item.tooltip || `${item.label}: ${(percentage * 100).toFixed(1)}%`}</title>
            </path>
          );
        })}
        
        {/* Labels - apenas para fatias grandes */}
        {data.map((item, index) => {
          const percentage = item.value / total;
          if (percentage < 0.05) return null; // Não mostra label para fatias muito pequenas
          
          const angle = (currentAngle - (percentage * 360) / 2) * Math.PI / 180;
          const labelX = centerX + (radius + 15) * Math.cos(angle);
          const labelY = centerY + (radius + 15) * Math.sin(angle);
          
          return (
            <text
              key={index}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              className="text-xs fill-white font-medium"
            >
              {(percentage * 100).toFixed(0)}%
            </text>
          );
        })}
        
        {/* Legend - movida para a direita */}
        <g transform={`translate(${width * 0.6}, 20)`}>
          {data.map((item, index) => (
            <g key={index} transform={`translate(0, ${index * 25})`}>
              <rect
                width="12"
                height="12"
                fill={item.color || `hsl(${index * 60}, 70%, 50%)`}
                rx="2"
              />
              <text
                x="20"
                y="10"
                className="text-sm fill-gray-700"
              >
                {item.label} ({item.value.toLocaleString('pt-BR')})
              </text>
            </g>
          ))}
        </g>
      </svg>
    );
  };

  const renderComparisonChart = () => {
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = 80;
    const spacing = 80; // Aumentei ainda mais o espaçamento
    const topMargin = 50; // Margem superior para a legenda
    const bottomMargin = 60; // Margem inferior para os labels das categorias

    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Legend - posicionada no topo com mais espaço */}
        <g transform={`translate(20, 10)`}>
          {data.map((item, index) => (
            <g key={index} transform={`translate(${index * 160}, 0)`}>
              <rect
                width="12"
                height="12"
                fill={item.color || (index === 0 ? '#ef4444' : '#10b981')}
                rx="2"
              />
              <text
                x="20"
                y="10"
                className="text-sm fill-gray-700 font-medium"
              >
                {item.label}
              </text>
            </g>
          ))}
        </g>

        {data.map((item, index) => {
          const x = 60 + index * (barWidth + spacing);
          const availableHeight = height - topMargin - bottomMargin;
          const barHeight = (item.value / maxValue) * availableHeight;
          const y = height - bottomMargin - barHeight;
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color || (index === 0 ? '#ef4444' : '#10b981')}
                rx="4"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{item.tooltip || `${item.label}: ${item.value.toLocaleString('pt-BR')}`}</title>
              </rect>
              
              {/* Value label - posicionado dentro da barra se houver espaço, senão acima */}
              <text
                x={x + barWidth / 2}
                y={barHeight > 40 ? y + barHeight / 2 + 5 : y - 10}
                textAnchor="middle"
                className={`text-sm font-medium ${barHeight > 40 ? 'fill-white' : 'fill-gray-700'}`}
              >
                {item.value.toLocaleString('pt-BR')}
              </text>
              
              {/* Category label - posicionado na parte inferior com mais espaço */}
              <text
                x={x + barWidth / 2}
                y={height - 15}
                textAnchor="middle"
                className="text-sm fill-gray-600 font-medium"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'comparison':
        return renderComparisonChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 ${className}`}>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">{title}</h3>
      <div className="h-48 sm:h-64 lg:h-80 relative overflow-hidden">
        {renderChart()}
      </div>
    </div>
  );
}
