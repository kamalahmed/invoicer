import type { ComponentType } from 'react';
import type { TemplateId } from '../types';
import type { TemplateMeta, TemplateProps } from './types';
import Classic from './Classic';
import Modern from './Modern';
import Minimal from './Minimal';
import Corporate from './Corporate';

export const TEMPLATES: Partial<
  Record<TemplateId, { Component: ComponentType<TemplateProps>; meta: TemplateMeta }>
> & { classic: { Component: ComponentType<TemplateProps>; meta: TemplateMeta } } = {
  classic: {
    Component: Classic,
    meta: {
      id: 'classic',
      name: 'Classic',
      description: 'Clean white paper. Matches contractor-style invoices.',
      preview: 'linear-gradient(135deg,#f8fafc,#e2e8f0)',
    },
  },
  modern: {
    Component: Modern,
    meta: {
      id: 'modern',
      name: 'Modern',
      description: 'Bold header bar, strong typography, tidy columns.',
      preview: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
    },
  },
  minimal: {
    Component: Minimal,
    meta: {
      id: 'minimal',
      name: 'Minimal',
      description: 'Airy layout, hairline rules, no colour blocks.',
      preview: 'linear-gradient(135deg,#ffffff,#f1f5f9)',
    },
  },
  corporate: {
    Component: Corporate,
    meta: {
      id: 'corporate',
      name: 'Corporate',
      description: 'Blue accent, formal grid, ideal for agencies.',
      preview: 'linear-gradient(135deg,#1d4ed8,#60a5fa)',
    },
  },
};

export const TEMPLATE_LIST: TemplateMeta[] = Object.values(TEMPLATES).map((t) => t!.meta);
