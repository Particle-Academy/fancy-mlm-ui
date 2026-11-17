# Contributing to @particle-academy/fancy-mlm-ui

Notes for anyone, human or agent, working ON this package's code. How to USE the
package is in [AGENTS.md](./AGENTS.md); what it is, is in [README.md](./README.md).
`CLAUDE.md` is a symlink to this file, so Claude Code reads these notes when it
works in this repo.

## Develop

```bash
npm install
npm test       # vitest
npm run build  # tsup -> dist (ESM + CJS + types + styles.css)
npm run lint   # tsc --noEmit && eslint .
```

- Tests sit beside the code (`src/**/*.test.ts(x)`).
- The `data-mlm-*` attributes are the components' stable handles; agents
  address the surfaces by them (they are documented in the README and
  `AGENTS.md`).

## Changelog

Update `CHANGELOG.md` (`## [Unreleased]`) in the same commit as the change.
