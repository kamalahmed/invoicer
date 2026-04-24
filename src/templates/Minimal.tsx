import TemplateBase from './TemplateBase';
import type { TemplateProps } from './types';

export default function Minimal(props: TemplateProps) {
  return <TemplateBase {...props} variant="minimal" />;
}
