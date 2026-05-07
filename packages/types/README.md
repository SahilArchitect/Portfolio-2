# @engine-room/types

Generated TS types from the FastAPI Pydantic schemas. **Never hand-edit `src/generated/`.**

## Regenerate

```bash
pnpm types:generate
```

The script:
1. Boots the FastAPI app and dumps its OpenAPI schema.
2. Pipes the schema through `datamodel-code-generator`.
3. Writes `src/generated/api.ts`.

## Usage

```ts
import type { ProjectRead, PostRead } from '@engine-room/types';
```

## Why OpenAPI, not direct Pydantic?

The OpenAPI schema is what clients actually receive at runtime. Generating from it makes drift between server contract and client types impossible.
