'use client';

import React from 'react';
import { WidgetConfig } from '@/types/widget';
import { CardWidget } from '@/components/widgets/CardWidget';
import { TableWidget } from '@/components/widgets/TableWidget';
import { ChartWidget } from '@/components/widgets/ChartWidget';

interface WidgetRendererProps {
  widget: WidgetConfig;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  switch (widget.displayMode) {
    case 'card':
      return <CardWidget widget={widget} />;
    case 'table':
      return <TableWidget widget={widget} />;
    case 'chart':
      return <ChartWidget widget={widget} />;
    default:
      return <CardWidget widget={widget} />;
  }
};

