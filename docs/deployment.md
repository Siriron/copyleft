# Deployment

## Live deployment record

Redeployed Jul 18 2026 with the confirmed `resolve_dispute` fix — see
`docs/contracts.md` for what was wrong and what changed.

| Network | Contract Address | Deployment TX |
|---|---|---|
| StudioNet | `0x9261d128EA0813144395247e7d7b6f7e12B1bCeC` | https://explorer-studio.genlayer.com/tx/0xcc09b93c710532ff4c70900271c771de8614d54ede2443e976e601a15f2c61d6 |
| Bradbury (testnet) | `0x58daEDCee44D1Cd2ae78f339A782CCA5B36314f0` | https://explorer-bradbury.genlayer.com/tx/0x217412a75efe48061c27011da78ed5c2b05df88ce092395fa2f1bb2053a98f1f |

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

Redeployed Jul 18 2026. Status as of the redeploy:

- [x] Both network contract addresses populated in `.env` with the new
      post-fix addresses (via env vars, never hardcoded elsewhere)
- [x] Network toggle in the navbar switches correctly between Bradbury and
      StudioNet (confirmed working in practice — a dispute filed while
      StudioNet was selected correctly landed on StudioNet, not Bradbury)
- [ ] `file_dispute` succeeds on both networks with a small test stake —
      **not yet re-tested on this fresh deployment** (dispute IDs reset
      to 1 on the new contract; prior confirmation was against the
      superseded pre-fix contract)
- [ ] `rebut` succeeds and moves status to `rebutted` — not yet re-tested
      on this fresh deployment
- [ ] `resolve_dispute` succeeds without an `Undetermined`/error result —
      **this is the specific failure this redeploy fixes; it has not yet
      been exercised against the new contract**. Confirm this actually
      resolves cleanly on both networks before considering the fix proven,
      not just theoretically correct.
- [x] Explorer links in the docs page resolve to the correct new contract
- [x] README, docs/contracts.md, and docs/deployment.md updated with the
      new addresses and TX links
