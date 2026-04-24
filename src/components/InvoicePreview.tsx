import { TEMPLATES } from '../templates';
import type { Invoice } from '../types';

export default function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const entry = TEMPLATES[invoice.style.templateId] ?? TEMPLATES.classic;
  const { Component } = entry;
  return <Component invoice={invoice} />;
}
