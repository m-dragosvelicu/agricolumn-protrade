# Repository Guidelines

## Project Structure & Module Organization
- `Layout.js` contains the shared shell and report loader; extend `navigationItems` when adding routes.
- `Pages/` hosts route components (`PortConstanta`, `DailyPrices`, `COTCFTC`, `DGAgri`) that call entity clients; keep data fetching inside hooks.
- `Components/port_constanta/` holds page-specific UI such as `FilterBar`; create new subfolders per feature to keep components focused.
- `Entities/` contains JSON schema definitions for upstream contracts; evolve schemas and calling code in the same patch.

## Build, Test, and Development Commands
- `npm install` — restore React, React Router, date-fns, lucide-react, recharts, and shared UI dependencies declared in `package.json`.
- `npm run dev` — start the configured React dev server; iterate here to validate routing and layouts.
- `npm run build` — create the production bundle; gate releases on a successful build.
- `npm run lint` — run ESLint/Prettier; fix alias or formatting issues before committing.
Document any additional scripts you add so contributors can reuse them.

## Coding Style & Naming Conventions
- Use function components, two-space indentation, and trailing commas; avoid class components and `any` typing.
- Name components and files in `PascalCase`; keep hooks and helpers `camelCase`.
- Prefer Tailwind utilities and shared `@/components/ui/*` primitives over custom CSS.
- Maintain the `@/` alias in tooling configs when moving folders or adding tests.

## Testing Guidelines
- Use Vitest or Jest with React Testing Library; co-locate specs as `<Name>.test.js`.
- Stub entity calls (e.g., `PortConstanta.list`) and craft fixtures from `Entities/*.json` to cover edge cases.
- Test critical flows such as `filterData` in `Pages/PortConstanta.js` and the price change math in `Pages/DailyPrices.js`.

## Commit & Pull Request Guidelines
- Adopt Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) since the history is blank.
- Keep each commit focused and flag schema updates in the body.
- PRs should describe user impact, link tracking issues, and add screenshots for UI changes.
- Run `npm run lint` and `npm run build` before opening a PR; call out any skipped checks.

## Data & Configuration Notes
- Treat `Entities/*.json` as the source of truth for backend contracts; update descriptions alongside API changes.
- Store secrets and endpoints in environment variables consumed by the host app—never commit credentials.
