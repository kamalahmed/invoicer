import TemplateBase from './TemplateBase';
import type { TemplateProps } from './types';

export default function Creative(props: TemplateProps) {
  return <TemplateBase {...props} variant="creative" />;
}
