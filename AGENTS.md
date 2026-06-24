# Agent Rules

## Documentation Lookup

- Check available project skills before using Context7. Prefer a relevant project-local skill under `.agents/skills/` over Context7 when both could apply.
- Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service. This includes API syntax, configuration, version migration, library-specific debugging, setup instructions, and CLI tool usage.
- Always start with `resolve-library-id` using the library name and the user's question, unless the user provides an exact library ID in `/org/project` format.
- Use `query-docs` with the selected library ID and the user's full question, then answer using the fetched documentation.
- Do not use Context7 for refactoring, writing scripts from scratch, debugging business logic, code review, or general programming concepts.

## shadcn/ui

- Use shadcn/ui components from the registry for UI work whenever a matching component exists.
- If a needed shadcn/ui component is not installed yet, install/add that component from the registry instead of hand-rolling a custom replacement.
- Prefer the project's existing shadcn/ui component patterns and variants before adding new abstractions.
- Keep shadcn/ui components aligned with `DESIGN.md` tokens and the CSS variables in `src/styles.css`.

## UI Work

- Before creating or changing any UI, read and follow `.agents/skills/frontend-design/SKILL.md`.
- Before creating or changing any shadcn/ui-based UI, read and follow `.agents/skills/shadcn/SKILL.md`.
- Apply both skills together for dashboard, forms, tables, navigation, empty states, loading states, responsive layouts, and visual polish.
- Do not start UI implementation until the relevant project-local UI skills have been checked.
- Design UI with a modern, clean look and a little fun: clear hierarchy, calm spacing, crisp controls, and subtle playful accents without making the interface noisy.
- Use Bahasa Indonesia for user-facing UI copy, labels, messages, empty states, and dashboard text.
- Keep UI copy concise. Do not add descriptive or explanatory text in the interface unless it is necessary for the user to complete the task.
- Keep the codebase in English: file names, route names, variables, functions, types, database fields, comments, and technical identifiers should remain English.
- Use `react-hot-toast` for user feedback when a button submits a form or triggers a mutation. Show loading, success, and error states where applicable, with Bahasa Indonesia toast copy.

## Next.js Work

- For any Next.js or React work in this project, always read and follow the workspace skill `../.agents/skills/vercel-react-best-practices/SKILL.md`.
- Apply this skill before changing routes, layouts, server components, client components, server actions, metadata, caching, data fetching, forms, or React state.
- If this skill is unavailable, stop and report that the required Next.js skill is missing before continuing.

## Database Work

- For any database, Drizzle ORM, schema, migration, query, relation, transaction, seed, or PostgreSQL/pgvector work, always read and follow the workspace skill `../.agents/skills/prisma-postgres/SKILL.md`.
- Apply this skill before changing `lib/db/schema.ts`, Drizzle config, database clients, migrations, SQL helpers, repository functions, or worker code that reads/writes database records.
- If this skill is unavailable, stop and report that the required Drizzle/database skill is missing before continuing.

## Skills

- Check available project skills before starting work when the request may match a specialized workflow, including before using Context7.
- If a relevant skill exists, read its `SKILL.md` first and follow the workflow in that skill.
- Prefer project-local skills under `.agents/skills/` over global skills when both are relevant.
- Prefer relevant skills over Context7 unless the user specifically asks for current external documentation or the skill workflow requires documentation lookup.
- Do not use a skill blindly; only apply it when its description matches the user's request.

## Command Policy

- Use Bun for package and script commands because this project uses `bun.lock`.
- Do not use npm, pnpm, or yarn unless the user explicitly asks for it.
- Ask for user confirmation before installing any dependency, package, CLI tool, plugin, or external service integration.
- Do not run lint commands.
- Do not run build commands.
- Do not run dev server commands.
- Do not run Prisma migration commands.
- Do not run Prisma generate commands.
- Typecheck commands are allowed.
- Unit test commands are allowed when they do not require external services or destructive database access.
- Ask before running integration tests, end-to-end tests, seed scripts, database resets, or commands that may modify persistent data.
