import TemplateBase from './TemplateBase';
import type { TemplateProps } from './types';

export default function Dark(props: TemplateProps) {
  return <TemplateBase {...props} variant="dark" />;
}
