export interface AdaptiveChangeDetail {
  /** Value of the variant's data-name attribute, if any. */
  variant: string | null;
  /** Width in px that was used to decide (container or viewport). */
  width: number;
  element: Element;
}

export class AdaptiveContent extends HTMLElement {
  /** Selection basis: 'container' (default, uses element width) or 'viewport' (uses window.innerWidth). */
  basis: 'container' | 'viewport';
  /** The currently selected variant element (or template element for lazily rendered variants). */
  readonly current: Element | null;
  /** Force re-evaluation of which variant should be displayed. */
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
