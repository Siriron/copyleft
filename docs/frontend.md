# Frontend

## Stack

React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion, talking to the
contract via `genlayer-js` (`^1.1.7`).

## Structure

```
src/
  App.tsx                 route shell, wallet + network state
  main.tsx                entry point
  index.css               Tailwind layers + design tokens
  config/chains.ts         network + contract address config (env-driven)
  lib/genlayerClient.ts    createClient wrappers (read vs write)
  lib/useCopyleft.ts       wallet hook + contract call hooks
  components/              Navbar, Footer, ErrorBoundary, NetworkToggle,
                           DiffShowcase (signature hero element)
  pages/                   Home, Disputes, DisputeDetail, FileDispute, Docs,
                           NotFound
```

## Design system

- **Palette:** ink `#12253E` (primary dark), paper `#EAEBE3` (neutral,
  deliberately non-cream), seal `#A47C1B` (brass-ochre accent, distinct
  from Ledger of Record's brass), slate `#3C6E71` (secondary accent),
  violation `#8B1E1E` / compliant `#2E6B4F` (status-only colors).
- **Type:** Fraunces (display, used only for headlines and verdict
  callouts) + IBM Plex Sans (body/UI) + IBM Plex Mono (code, diffs,
  addresses, stats).
- **Signature element:** an animated side-by-side diff view comparing SPDX
  canonical license text against a downstream repo's fetched state — the
  actual mechanism the contract performs, shown as the hero centerpiece.
- Light mode default. No dark-first treatment.

## Reads and writes

- Reads use `createClient({ chain })` with no account.
- Writes use `createClient({ chain, account })`, address-only — MetaMask
  signs, no `provider` field passed.
- `writeContract` always passes `value: BigInt(0)` even for non-payable
  calls that don't use it.
- `readContract` returns a JSON string; every call site parses it before use.
- Transaction confirmation waits on `TransactionStatus.ACCEPTED`.

## Network toggle

The navbar's network toggle switches between Bradbury and StudioNet without
a page reload; all reads/writes re-derive their client from the active
network on every call.
