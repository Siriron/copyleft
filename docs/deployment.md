# Deployment

## Live deployment record

Current deployment (Jul 22 2026) includes all six confirmed fixes from
the debugging history — nondet/consensus handling, value transfers, and
a two-part storage-crossing-into-nondet issue — and has been live-tested
end to end with confirmed clean execution. See `docs/contracts.md` for
the full fix history and verification detail.

| Network | Contract Address | Deployment TX |
|---|---|---|
| StudioNet | `0x076B412E3B1ff517E1fC0bEF8C90d769276555F1` | https://explorer-studio.genlayer.com/tx/0x2422f6fb8c7d2b9b3fb366e80b317978217464a7ca80ec49e1e832a03428f4a6 |
| Bradbury (testnet) | `0x3D1EcE7272cb55410EC93036A9805Cb55fB8C94a` | https://explorer-bradbury.genlayer.com/tx/0xf42f88c48b231298aac589847e34fd8b8c978c3c46fe9403857600d33dc8bc8b |

**Frontend:** https://copyleft.vercel.app/

The steps below document how this deployment was performed, for reference
and for any future redeploys.

## Prerequisites

- Python 3.11+, `pip install genvm-linter`
- MetaMask (or compatible wallet) configured with GEN testnet tokens from
  `https://testnet-faucet.genlayer.foundation`
- Node.js 18+ for the frontend build

## Contract deployment (manual, per GenLayer workflow)

1. **Lint locally.** From the repo root:
   ```
   pip install genvm-linter
   genvm-lint contracts/copyleft.py
   ```
   Exit code `0` means it passed. Fix and re-lint on any failure — a lint
   failure is an instant rejection on the portal.

2. **Deploy via Studio UI only.** Go to `https://studio.genlayer.com/contracts`
   and upload `contracts/copyleft.py` directly through the UI. Never paste
   the code into a text field, and never attempt a MetaMask/raw EVM deploy —
   both are rejected by the network.

3. **Repeat for both networks.** Deploy once with the Bradbury testnet
   selected, once with StudioNet selected. Copy each resulting contract
   address and explorer transaction link.

4. **Update environment config.**
   ```
   VITE_CONTRACT_ADDRESS_BRADBURY=0x...
   VITE_CONTRACT_ADDRESS_STUDIONET=0x...
   ```
   into a local `.env` (never commit this file — see `.env.example`).

## Frontend deployment

1. `npm install`
2. `npm run build`
3. Deploy the `dist/` folder to Vercel (or run `vercel` from the repo root
   if the Vercel CLI is linked). `vercel.json` already includes the SPA
   rewrite rule required for client-side routing.
4. Set the same `VITE_CONTRACT_ADDRESS_*` environment variables in the
   Vercel project settings.

## Post-deploy checklist

Current deployment, Jul 22 2026. Status:

- [x] Both network contract addresses set (via `VITE_CONTRACT_ADDRESS_*`
      env vars — Vercel project settings for the live deployment, never
      hardcoded elsewhere)
- [x] Network toggle in the navbar switches correctly between Bradbury and
      StudioNet — confirmed working in practice
- [x] `file_dispute` succeeds — confirmed live on this exact deployment
- [x] `rebut` succeeds and moves status to `rebutted` — confirmed live on
      this exact deployment
- [x] `resolve_dispute` reaches a real consensus verdict (not
      `Undetermined`, no crash) — confirmed live on this exact
      deployment, stderr came back empty
- [x] `resolve_dispute` completes a full **compliant-verdict settlement**
      — confirmed live: contract's post-settlement balance exactly
      matches the settlement formula's expected remainder, and both
      `emit_transfer` payouts appear as finalized transactions in the
      recipient wallet's own history
- [x] The `copy_to_memory` + nested-function fix — confirmed live: the
      `UserWarning: Detected pickling storage class` warning is
      genuinely gone (empty stderr on a real `resolve_dispute` call)
- [ ] `request_cure` (the cure/remediation path) — **not yet tested**
- [ ] `_settle_violation_final` (the violation/slash settlement path) —
      **not yet tested**; only the compliant-verdict path has been
      exercised so far
- [x] Explorer links in the docs page resolve to the correct contract
- [x] README, docs/contracts.md, and docs/deployment.md updated with the
      current addresses and TX links
