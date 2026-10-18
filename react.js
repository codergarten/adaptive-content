import { createElement, useEffect, useRef, forwardRef } from 'react';
import './index.js';

/**
 * React wrapper for <adaptive-content>.
 * Props: basis ('container' | 'viewport'), onChange(detail), plus any div-like props.
 */
export const AdaptiveContent = forwardRef(function AdaptiveContent({ basis, onChange, children, ...rest }, ref) {
  const innerRef = useRef(null);
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const handler = e => cb.current && cb.current(e.detail);
    el.addEventListener('adaptive-change', handler);
    return () => el.removeEventListener('adaptive-change', handler);
  }, []);

  const setRef = node => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return createElement('adaptive-content', { ref: setRef, basis, ...rest }, children);
});

