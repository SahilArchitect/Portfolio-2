/**
 * @engine-room/types — generated TS types from the FastAPI OpenAPI schema.
 *
 * The generated file lives at `./generated/api.ts` and is produced by
 * `pnpm types:generate`.
 *
 * Hand-written types live alongside this file for things that don't have
 * a backend representation (e.g., UI-only enums, view models). Anything
 * that crosses the API boundary MUST come from the generated module.
 */

export type * from './generated/api';

// Hand-written, UI-only types follow. Keep this list short.
export type Theme = 'light' | 'dark';
