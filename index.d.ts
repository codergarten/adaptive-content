export interface AdaptiveChangeDetail {
  /** Value of the variant's data-name attribute, if any. */
  variant: string | null;
  /** Width in px that was used to decide (container or viewport). */
  width: number;
  element: Element;
}

export class AdaptiveContent extends HTMLElement {
  basis: 'container' | 'viewport';
  readonly current: Element | null;
  update(): void;
  addEventListener(
    type: 'adaptive-change',
    listener: (ev: CustomEvent<AdaptiveChangeDetail>) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
}

declare global {
  interface HTMLElementTagNameMap { 'adaptive-content': AdaptiveContent; }
}
