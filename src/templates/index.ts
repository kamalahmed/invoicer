import type { ComponentType } from 'react';
import type { TemplateId } from '../types';
import type { TemplateMeta, TemplateProps } from './types';
import Classic from './Classic';

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
};

export const TEMPLATE_LIST: TemplateMeta[] = Object.values(TEMPLATES).map((t) => t!.meta);
