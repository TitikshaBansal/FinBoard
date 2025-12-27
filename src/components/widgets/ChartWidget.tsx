'use client';

import React, { useMemo } from 'react';
import { WidgetConfig } from '@/types/widget';
import { BaseWidget } from './BaseWidget';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { extractFieldValue } from '@/lib/api/adapters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartWidgetProps {
  widget: WidgetConfig;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ widget }) => {
  const chartData = useMemo(() => {
    if (!widget.data || !widget.selectedFields.length) return null;

    // Extract data - try to find time-series data
    let dataArray: any[] = [];
    
    if (Array.isArray(widget.data)) {
      dataArray = widget.data;
    } else {
      // Try to find an array field
      const arrayField = widget.selectedFields.find((field) => {
        const value = extractFieldValue(widget.data, field.path);
        return Array.isArray(value);
      });

      if (arrayField) {
        const arrayValue = extractFieldValue(widget.data, arrayField.path);
        if (Array.isArray(arrayValue)) {
          dataArray = arrayValue;
        }
      } else {
        dataArray = [widget.data];
      }
    }

    // For now, use first field as X-axis (labels) and second as Y-axis (data)
    // In a production app, you'd want more sophisticated field selection
    const labelField = widget.selectedFields[0];
    const dataField = widget.selectedFields[1] || widget.selectedFields[0];

    const labels = dataArray.map((item) => {
      const value = extractFieldValue(item, labelField.path);
      return value !== null && value !== undefined ? String(value) : '';
    });

    const data = dataArray.map((item) => {
      const value = extractFieldValue(item, dataField.path);
      if (typeof value === 'number') return value;
      const numValue = parseFloat(String(value));
      return isNaN(numValue) ? 0 : numValue;
    });

    return {
      labels,
      datasets: [
        {
          label: dataField.displayName || dataField.alias || dataField.path.split('.').pop(),
          data,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [widget.data, widget.selectedFields]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        borderWidth: 1,
        padding: 8,
        titleFont: {
          size: 12,
        },
        bodyFont: {
          size: 11,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
          drawBorder: false,
        },
      },
    },
  };

  if (!chartData) {
    return (
      <BaseWidget widget={widget}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No data available for chart</p>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget widget={widget}>
      <div className="h-full min-h-[250px] -mx-4 px-4">
        <Line data={chartData} options={chartOptions} />
      </div>
    </BaseWidget>
  );
};

