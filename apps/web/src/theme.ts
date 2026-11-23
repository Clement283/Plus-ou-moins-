/** Le thème suit le réglage du téléphone : `data-theme="dark"` sur <html>, retiré en clair. */
export function followSystemTheme(win: Window = window): () => void {
  if (!win.matchMedia) return () => {};
  const mq = win.matchMedia('(prefers-color-scheme: dark)');
  const apply = () => {
    const root = win.document.documentElement;
    if (mq.matches) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
  };
  apply();
  mq.addEventListener('change', apply);
  return () => mq.removeEventListener('change', apply);
}
