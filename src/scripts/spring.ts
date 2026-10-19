import { animate as motionAnimate, stagger, type DOMKeyframesDefinition } from 'motion';
import { mode } from './motion';

// Motion springs that follow the site's Motion setting (full, reduced or off).
export const structure = { type: 'spring', visualDuration: 0.3, bounce: 0 } as const;
export const small = { type: 'spring', visualDuration: 0.3, bounce: 0.35 } as const;

type Target = Element | Element[];
type Options = Record<string, unknown> & { delay?: number | ReturnType<typeof stagger> };

export function spring(target: Target, keyframes: DOMKeyframesDefinition, options: Options = structure) {
  if (mode() === 'off') return null;
  if (mode() === 'reduced') {
    if (!('opacity' in keyframes)) return null;
    return motionAnimate(target, { opacity: keyframes.opacity }, { duration: 0.1, delay: options.delay });
  }
  return motionAnimate(target, keyframes, options);
}

// Rows arriving one after another.
export const arrive = (targets: Element[], from = 6) =>
  spring(targets, { opacity: [0, 1], y: [from, 0], filter: ['blur(2px)', 'blur(0px)'] }, { ...structure, delay: stagger(0.035) });
