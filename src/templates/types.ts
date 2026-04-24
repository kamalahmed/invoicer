import type { Invoice, TemplateId } from '../types';

export interface TemplateProps {
  invoice: Invoice;
}

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  preview: string; // background used in the picker chip
}
