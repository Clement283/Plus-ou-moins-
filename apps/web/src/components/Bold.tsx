import { Fragment } from 'react';

/** Texte des cours : `**gras**` devient <b>. Rien d'autre n'est interprété. */
export function Bold({ text }: { text: string }) {
  return (
    <>
      {text.split('**').map((part, i) => (i % 2 === 1 ? <b key={i}>{part}</b> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}
