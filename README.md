# Copyleft

On-chain arbitration for GPL-family license compliance disputes (GPLv2,
GPLv3, LGPL), built on GenLayer.

A downstream project is accused of shipping copyleft-licensed code without
providing source, attribution, or a compliant NOTICE. The claimant stakes
GEN and cites the alleged violation; the respondent counter-stakes and
rebuts. Resolution fetches evidence **three ways** — the SPDX canonical
license text, the downstream repo's own LICENSE/NOTICE file, and the
disputed source path — and judges compliance against the license's actual
terms, not against either party's narrative. A cure window modeled on
GPLv3's real reinstatement mechanic lets a respondent found in violation
submit remediation evidence before any stake is finally slashed.

**Live:** https://copyleft.vercel.app/

**Contracts:**

| Network | Address | Deployment TX |
|---|---|---|
| StudioNet | `0xc843D529A317dA2E372D75D48011C4784855A82C` | [explorer-studio.genlayer.com/tx/0x59030061815b0eb2fd8354270c79f25a742885f569ec0a92e375944d837d19ca](https://explorer-studio.genlayer.com/tx/0x59030061815b0eb2fd8354270c79f25a742885f569ec0a92e375944d837d19ca) |
| Bradbury (testnet) | `0xFb5a86cC64b780636515304710Ff691114B5953D` | [explorer-bradbury.genlayer.com/tx/0xd082c8497eafa07b3eb6e7024ed3b12c094949899a2c00f4d7aee3db56273dba](https://explorer-bradbury.genlayer.com/tx/0xd082c8497eafa07b3eb6e7024ed3b12c094949899a2c00f4d7aee3db56273dba)

## Why three-way evidence

Two arbitrary URLs chosen by opposing parties is just narrative vs.
narrative. Copyleft's third leg — SPDX canonical text — is fixed and
non-optional: the model checks both parties' claims against an external
ground truth neither party controls, not just against each other.

## Tech stack

- **Contract:** Python on GenVM, `gl.vm.run_nondet_unsafe` leader/validator
  consensus, independent re-derivation validators (no shape-only checks).
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion,
  `genlayer-js` for chain interaction.
- **Networks:** Bradbury testnet + StudioNet, toggle in the navbar.

## Quick start

```bash
npm install
cp .env.example .env   # or use the committed .env — contracts are already deployed
npm run dev
```

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — evidence model, validator
  design, cure mechanic
- [`docs/contracts.md`](docs/contracts.md) — full contract interface
- [`docs/deployment.md`](docs/deployment.md) — lint, deploy, and Vercel steps
- [`docs/frontend.md`](docs/frontend.md) — frontend structure and design
  system
- In-app docs: `/docs` route once deployed

## Repository structure

```
contracts/copyleft.py     GenVM contract
src/                       frontend source
docs/                      architecture, deployment, frontend, contracts docs
public/                    favicon, OG image
```

## License

MIT for this application's own code. Not affiliated with the Free Software
Foundation or SPDX; SPDX license text is fetched from `spdx.org` at
resolution time, not redistributed here.
