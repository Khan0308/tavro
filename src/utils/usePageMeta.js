import { useEffect } from 'react';
export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | TAVRO` : 'TAVRO: Simple. Fast. Powerful.';
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
