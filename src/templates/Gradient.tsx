import TemplateBase from './TemplateBase';
import type { TemplateProps } from './types';

export default function Gradient(props: TemplateProps) {
  return <TemplateBase {...props} variant="gradient" />;
}
