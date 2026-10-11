'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * The address is shipped reversed and only assembled in the browser, which
 * keeps it out of naive scrapers. Without JavaScript a readable form is shown.
 */
export function ObfuscatedEmail({ reversed, label = 'Email' }: { reversed: string; label?: string }) {
  const address = useSyncExternalStore(
    subscribe,
    () => reversed.split('').reverse().join(''),
    () => null,
  );
  if (!address) {
    const readable = reversed.split('').reverse().join('').replace('@', ' [at] ').replace(/\./g, ' [dot] ');
    return <span>{readable}</span>;
  }
  return <a href={`mailto:${address}`}>{label}</a>;
}
