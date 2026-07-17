# Deployment

## Live deployment record

| Network | Contract Address | Deployment TX |
|---|---|---|
| StudioNet | `0xc843D529A317dA2E372D75D48011C4784855A82C` | https://explorer-studio.genlayer.com/tx/0x59030061815b0eb2fd8354270c79f25a742885f569ec0a92e375944d837d19ca |
| Bradbury (testnet) | `0xFb5a86cC64b780636515304710Ff691114B5953D` | https://explorer-bradbury.genlayer.com/tx/0xd082c8497eafa07b3eb6e7024ed3b12c094949899a2c00f4d7aee3db56273dba |

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

- [x] Both network contract addresses populated in `.env`
      (via env vars, never hardcoded elsewhere)
- [x] Network toggle in the navbar switches correctly between Bradbury and
      StudioNet
- [ ] `file_dispute` succeeds on both networks with a small test stake
- [x] Explorer links in the docs page resolve to the correct contract
- [x] README updated with live URL, contract addresses, and TX links
