import TemplateBase from './TemplateBase';
import type { TemplateProps } from './types';

export default function Bold(props: TemplateProps) {
  return <TemplateBase {...props} variant="bold" />;
}
