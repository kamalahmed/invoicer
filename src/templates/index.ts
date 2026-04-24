import type { ComponentType } from 'react';
import type { TemplateId } from '../types';
import type { TemplateMeta, TemplateProps } from './types';
import Classic from './Classic';
import Modern from './Modern';
import Minimal from './Minimal';
import Corporate from './Corporate';
import Creative from './Creative';
import Elegant from './Elegant';
import Dark from './Dark';
import Gradient from './Gradient';
import Bold from './Bold';
import Playful from './Playful';

export const TEMPLATES: Record<
  TemplateId,
  { Component: ComponentType<TemplateProps>; meta: TemplateMeta }
> = {
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
  creative: {
    Component: Creative,
    meta: {
      id: 'creative',
      name: 'Creative',
      description: 'Side accent bar with serif headline — freelancers.',
      preview: 'linear-gradient(135deg,#f43f5e,#fb7185)',
    },
  },
  elegant: {
    Component: Elegant,
    meta: {
      id: 'elegant',
      name: 'Elegant',
      description: 'Serif heading, thin gold rules, premium services.',
      preview: 'linear-gradient(135deg,#a16207,#fde68a)',
    },
  },
  dark: {
    Component: Dark,
    meta: {
      id: 'dark',
      name: 'Dark',
      description: 'Dark header with light body — studios & agencies.',
      preview: 'linear-gradient(135deg,#020617,#334155)',
    },
  },
  gradient: {
    Component: Gradient,
    meta: {
      id: 'gradient',
      name: 'Gradient',
      description: 'Bright gradient header — SaaS & startups.',
      preview: 'linear-gradient(135deg,#6366f1,#ec4899)',
    },
  },
  bold: {
    Component: Bold,
    meta: {
      id: 'bold',
      name: 'Bold',
      description: 'Large block total, confident sans — contractors.',
      preview: 'linear-gradient(135deg,#16a34a,#84cc16)',
    },
  },
  playful: {
    Component: Playful,
    meta: {
      id: 'playful',
      name: 'Playful',
      description: 'Rounded, friendly colours — small businesses.',
      preview: 'linear-gradient(135deg,#f97316,#facc15)',
    },
  },
};

export const TEMPLATE_LIST: TemplateMeta[] = Object.values(TEMPLATES).map((t) => t.meta);
