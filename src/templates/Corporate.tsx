import TemplateBase from './TemplateBase';
import type { TemplateProps } from './types';

export default function Corporate(props: TemplateProps) {
  return <TemplateBase {...props} variant="corporate" />;
}
