# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # Install deps, generate Prisma client, run migrations (first-time setup)
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all Vitest tests
npm run db:reset     # Drop and recreate the SQLite database
```

To run a single test file:
```bash
npx vitest run src/lib/__tests__/some-test.test.ts
```

## Environment

Copy `.env` and set `ANTHROPIC_API_KEY` for live Claude AI. Without it, the app falls back to a `MockLanguageModel` that returns a static component — useful for testing without an API key.

## Architecture

UIGen is an AI-powered React component generator. Users describe components in a chat interface; Claude generates code using tool calls; the result is rendered instantly in a live preview iframe.

### Request flow

```
Chat UI (ChatContext)
  → POST /api/chat (streaming via Vercel AI SDK)
  → Claude with two tools: str_replace_editor, file_manager
  → Virtual FileSystem (in-memory Map)
  → Preview iframe (Babel standalone + esm.sh CDN + Tailwind CDN)
```

### Key modules

- **`src/app/api/chat/route.ts`** — Streaming API route. Calls `streamText` with Claude, defines the two AI tools, and streams tool results back.
- **`src/lib/tools/`** — Tool implementations invoked by Claude:
  - `str-replace.ts`: `str_replace_editor` tool — create, view, and patch files
  - `file-manager.ts`: `file_manager` tool — rename and delete files
- **`src/lib/contexts/`** — Two React contexts that own shared state:
  - `chat-context.tsx`: Chat messages, AI streaming state, tool call dispatch
  - `file-system-context.tsx`: Virtual file system CRUD, active file selection
- **`src/lib/file-system.ts`** — The virtual file system (Map-based, no disk I/O). Serializes to/from JSON for DB persistence.
- **`src/lib/transform/jsx-transformer.ts`** — Client-side Babel transpilation. Generates an import map that redirects all `import` statements to `esm.sh` CDN, then injects the result into an iframe via `document.write`.
- **`src/lib/prompts/generation.tsx`** — System prompt that instructs Claude how to generate components (conventions, file layout, tool usage).
- **`src/lib/provider.ts`** — Returns the real Anthropic model or `MockLanguageModel` depending on whether `ANTHROPIC_API_KEY` is set.
- **`src/lib/auth.ts`** — JWT sessions (jose), stored in httpOnly cookies, 7-day expiry.
- **`src/actions/`** — Next.js Server Actions for project CRUD (get, create, list).

### Database

Prisma with SQLite (`prisma/dev.db`). Two models:
- `User` — email/password (bcrypt)
- `Project` — stores serialized chat history and file system as JSON strings; `userId` is optional (anonymous projects)

After schema changes run `npx prisma migrate dev`.

### Preview rendering

The preview iframe does not load an actual URL. `jsx-transformer.ts` builds a full HTML document string (including an import map for esm.sh, Babel standalone, and Tailwind CDN) and writes it into the iframe via `document.write`. All npm imports in generated code resolve to `esm.sh`.

### Path aliases

`@/*` maps to `src/*` (configured in `tsconfig.json` and `vitest.config.mts`).
