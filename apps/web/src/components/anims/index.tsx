import type { ComponentType } from 'react';
import { CompterLesMoins } from './CompterLesMoins';
import { MoinsMoinsDevientPlus } from './MoinsMoinsDevientPlus';
import { SignesQuiSeCognent } from './SignesQuiSeCognent';

/** Les animations nommées des leçons. `ms` : durée, après quoi les blocs suivants apparaissent. */
export const ANIMS: Record<string, { Component: ComponentType; ms: number }> = {
  'signes-qui-se-cognent': { Component: SignesQuiSeCognent, ms: 1400 },
  'moins-moins-devient-plus': { Component: MoinsMoinsDevientPlus, ms: 2200 },
  'compter-les-moins': { Component: CompterLesMoins, ms: 2400 },
};
