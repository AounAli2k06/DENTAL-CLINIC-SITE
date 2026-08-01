'use client';

import { MotionConfig } from 'framer-motion';

/**
 * The `prefers-reduced-motion` rule in globals.css only affects CSS
 * transitions/animations — it has no effect on Framer Motion's JS-driven
 * animations (like the Hero's ambient drift, or any `animate={{...}}` prop
 * anywhere in the app), since those aren't CSS animations at all.
 *
 * MotionConfig's `reducedMotion="user"` makes every Framer Motion animation
 * in the tree automatically respect the OS-level reduced-motion setting,
 * without having to remember to check `useReducedMotion()` in every
 * individual component.
 */
export default function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
