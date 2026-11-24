import { Bold } from '../Bold';

/** « Pas tout à fait. <message> Essaie encore. » : jamais de rouge, rien n'est noté. */
export function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="etape-error" role="alert">
      <b>Pas tout à fait.</b> <Bold text={message} /> Essaie encore.
    </div>
  );
}
