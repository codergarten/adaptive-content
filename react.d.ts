import type { ComponentPropsWithRef, ReactElement } from 'react';
import type { AdaptiveChangeDetail, AdaptiveContent as AdaptiveContentElement } from './index.js';

export interface AdaptiveContentProps extends ComponentPropsWithRef<'div'> {
  basis?: 'container' | 'viewport';
  onChange?: (detail: AdaptiveChangeDetail) => void;
}

export const AdaptiveContent: (props: AdaptiveContentProps) => ReactElement | null;

