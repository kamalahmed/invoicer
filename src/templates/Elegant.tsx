import TemplateBase from './TemplateBase';
import type { TemplateProps } from './types';

export default function Elegant(props: TemplateProps) {
  return <TemplateBase {...props} variant="elegant" />;
}
