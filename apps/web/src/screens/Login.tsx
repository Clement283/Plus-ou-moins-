import { useId, useState, type FormEvent } from 'react';
import { ApiError, login } from '../api';
import { sessionExpired, setSession } from '../store/sync';
import { go } from '../router';
import { Icon } from '../ui/Icon';
import { AppVersion } from '../ui/AppVersion';

type Status = 'repos' | 'envoi' | 'inconnu' | 'hors' | 'serveur';

const HELP = 'Les majuscules et les espaces n\'ont pas d\'importance.';

/** Affichage seul : majuscules, une espace après 4 caractères (les espaces tapées sont ignorées). */
export function showCode(raw: string): string {
  const s = raw.replace(/\s/g, '').toUpperCase();
  return s.length > 4 ? `${s.slice(0, 4)} ${s.slice(4)}` : s;
}

/**
 * Répercute sur `raw` (ce que l'élève a tapé, tel quel) une modification du champ affiché :
 * on compare l'ancien affichage et la nouvelle valeur (hors espaces), et on remplace dans `raw`
 * seulement la partie modifiée, avec les caractères tels que tapés (casse comprise).
 */
export function applyEdit(raw: string, value: string): string {
  const old = showCode(raw).replace(/ /g, '');
  const next = value.replace(/ /g, '').toUpperCase();
  if (old === next) return raw;
  let p = 0;
  while (p < old.length && p < next.length && old[p] === next[p]) p++;
  let s = 0;
  while (s < old.length - p && s < next.length - p && old[old.length - 1 - s] === next[next.length - 1 - s]) s++;
  // Position, dans `raw` et dans `value`, du n-ième caractère non espace.
  const at = (str: string, n: number) => {
    let seen = 0;
    for (let i = 0; i < str.length; i++) {
      if (/\s/.test(str[i]!)) continue;
      if (seen === n) return i;
      seen++;
    }
    return str.length;
  };
  const letters = (str: string) => str.replace(/\s/g, '').length;
  const rawFrom = at(raw, p);
  const rawTo = s === 0 ? raw.length : at(raw, letters(raw) - s);
  const valFrom = at(value, p);
  const valTo = s === 0 ? value.length : at(value, letters(value) - s);
  return raw.slice(0, rawFrom) + value.slice(valFrom, valTo) + raw.slice(rawTo);
}

export default function Login() {
  const [raw, setRaw] = useState('');
  const [status, setStatus] = useState<Status>('repos');
  const helpId = useId();
  const inputId = useId();
  const unknown = status === 'inconnu';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!raw.trim() || status === 'envoi') return;
    setStatus('envoi');
    try {
      const { token, user } = await login(raw);
      go(user.role === 'suiveur' ? { name: 'suivi' } : { name: 'accueil' });
      await setSession({ token, user });
    } catch (err) {
      // 0 : pas de réseau ; 401 : code inconnu ; toute autre réponse : le serveur est en panne.
      const code = err instanceof ApiError ? err.status : 401;
      setStatus(code === 0 ? 'hors' : code === 401 ? 'inconnu' : 'serveur');
    }
  }

  return (
    <main className="login" data-screen="connexion">
      <div className="mark" aria-hidden="true">+ {'−'}</div>
      <div className="login__intro">
        <h1 className="t-h2">Plus ou moins</h1>
        <p className="t-body1">Entre ton code pour retrouver tes cours.</p>
      </div>
      {sessionExpired() && (
        <div className="alert alert--neutral" role="status">
          <Icon name="info" />
          <div className="alert__title">Ta connexion a expiré</div>
          <div>Entre ton code pour continuer. C'est le même code que d'habitude : il marche autant de fois que tu veux.</div>
        </div>
      )}
      {status === 'hors' && (
        <div className="alert alert--neutral" role="status">
          <Icon name="wifi-off" />
          <div className="alert__title">Pas de connexion</div>
          <div>Pour entrer, ton téléphone doit être connecté à internet. Ensuite, l'appli marche aussi sans connexion.</div>
        </div>
      )}
      {status === 'serveur' && (
        <div className="alert alert--neutral" role="status">
          <Icon name="wifi-off" />
          <div>Le serveur ne répond pas. Réessaie dans un moment.</div>
        </div>
      )}
      <form className="login__form" onSubmit={submit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor={inputId}>Ton code</label>
          <div className={`field__box${unknown ? ' is-error' : ''}`}>
            <input
              id={inputId}
              className="field__code"
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="K7M2 9QXP"
              value={showCode(raw)}
              aria-describedby={helpId}
              aria-invalid={unknown ? 'true' : undefined}
              onChange={(e) => {
                setRaw(applyEdit(raw, e.target.value));
                if (status !== 'envoi') setStatus('repos');
              }}
            />
          </div>
          <p className={`field__help${unknown ? ' is-error' : ''}`} id={helpId} aria-live="polite">
            {unknown ? (
              <>
                <Icon name="x-circle" size="sm" />
                Ce code n'existe pas. Vérifie les lettres et les chiffres, puis réessaie.
              </>
            ) : (
              HELP
            )}
          </p>
        </div>
        <button className="btn btn--contained btn--block" type="submit" disabled={!raw.trim() || status === 'envoi'}>
          {status === 'hors' || status === 'serveur' ? 'Réessayer' : 'Entrer'}
        </button>
      </form>
      <p className="t-caption">Tu n'as pas de code ? Demande-le à la personne qui te suit.</p>
      <AppVersion />
    </main>
  );
}
