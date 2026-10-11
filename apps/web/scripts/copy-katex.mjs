// Copies KaTeX's stylesheet and fonts into public/katex so pages with math can
// link them on demand instead of every page carrying them. Runs before dev/build.
import { cpSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const dist = path.dirname(require.resolve('katex/dist/katex.min.css'));
const out = path.join(import.meta.dirname, '..', 'public', 'katex');
mkdirSync(out, { recursive: true });
cpSync(path.join(dist, 'katex.min.css'), path.join(out, 'katex.min.css'));
cpSync(path.join(dist, 'fonts'), path.join(out, 'fonts'), { recursive: true });
