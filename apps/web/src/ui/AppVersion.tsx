/** Numéro de version de l'appli (date du build et commit), en petit, pour vérifier qu'une mise à jour est arrivée. */
export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';

export function AppVersion() {
  return (
    <p className="t-caption app-version" aria-label={`Version de l'appli : ${APP_VERSION}`}>
      Version {APP_VERSION}
    </p>
  );
}
