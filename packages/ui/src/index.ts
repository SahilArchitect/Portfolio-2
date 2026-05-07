/**
 * @engine-room/ui — public API.
 *
 * Apps consume this package via three subpath imports plus the root:
 *   import { tokens } from '@engine-room/ui/tokens'
 *   import { fadeUp } from '@engine-room/ui/motion'
 *   import preset from '@engine-room/ui/tailwind-preset'
 *   import { Cursor, cn } from '@engine-room/ui'
 */

export { cn } from './lib/cn';
export * from './primitives';
