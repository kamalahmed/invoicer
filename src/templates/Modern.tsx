import TemplateBase from './TemplateBase';
import type { TemplateProps } from './types';

export default function Modern(props: TemplateProps) {
  return <TemplateBase {...props} variant="modern" />;
}
