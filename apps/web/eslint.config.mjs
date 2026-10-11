import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/**',
    'drizzle/**',
    'playwright-report/**',
    'test-results/**',
    // Unlinked side projects kept as-is.
    'src/app/harsimran/**',
    'src/app/trident-coach/**',
    'src/lib/trident/**',
    'tests/trident-*.mjs',
  ]),
]);
