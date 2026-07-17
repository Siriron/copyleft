# Architecture

## Overview

Copyleft is a two-party dispute arbitration contract for GPL-family license
compliance, deployed on GenVM. It resolves disputes by fetching three
independent evidence sources and judging them via AI validator consensus,
rather than trusting either party's narrative.

## Evidence model

Every resolution step (`resolve_dispute`, `request_cure`) fetches:

1. **SPDX canonical license text** — a fixed, independently-authoritative
   reference neither party controls.
2. **The downstream repository's own LICENSE/NOTICE file** (or, on cure,
   the current repo state) — corroborating or undermining the respondent's
   claim of compliance.
3. **The disputed source path content** — the actual code alleged to trigger
   the obligation.

All three fetches and the LLM judgment happen inside a single
`gl.nondet.web.get()` / `gl.nondet.exec_prompt()` sequence within one
`leader_fn`, called via `gl.vm.run_nondet_unsafe`. This is a hard TIER 1
requirement: fetch and judgment are never split across separate nondet calls.

## Validator design

The `validator_fn` never checks response shape alone. It independently
re-invokes `leader_fn()` and compares:

- `verdict` — exact match required (`"violation"` / `"compliant"` or
  `"cured"` / `"not_cured"`).
- `confidence_bps` — must fall within a 150bps tolerance band of the
  re-derived value.
- `reasoning_summary` — must be non-trivial (>20 characters after
  stripping), so an empty or placeholder field fails validation.

This mirrors the staff-flagged weakness in a prior accepted project (Sigil),
where a validator only checked `bool(field.strip())`. Every nondet write in
this contract — including the secondary `request_cure` path — uses the same
independent re-derivation rigor as the primary `resolve_dispute` path.

## Settlement

All storage writes — stake accounting, dispute status transitions, and
settlement transfers — happen strictly *after* `run_nondet_unsafe` returns.
Nothing is written to storage inside `leader_fn` or `validator_fn`.

Settlement splits are fixed percentages computed from the judged outcome
only (80% to the prevailing party, 20% to the protocol pool) — never a
chance-based or odds-based payout.

## Cure mechanic

GPLv3 §8 gives first-time violators a real cure path: 30 days from notice
to fix the violation and have rights reinstated, or automatic provisional
reinstatement if the copyright holder doesn't re-contact within 60 days of
a self-corrected violation. `request_cure()` mirrors this as a
remediation-triggered second-order step, distinct from a confidence-triggered
appeal: the respondent submits a remediation commit URL, and a fresh
leader/validator pair re-fetches the *current* downstream state (not the
original snapshot) and judges whether the cure is sufficient.

## Untrusted input handling

All user-submitted text (claim text, rebuttal text, alleged clause) and all
fetched evidence content is sanitized before entering any prompt: control
characters stripped, length capped, code-fence-like sequences and
prompt-injection-style delimiters (`<|`, `[SYSTEM]`, `[INST]`, etc.) neutralized,
and the result wrapped in explicit `<<<UNTRUSTED_*_START/END>>>` delimiters
instructing the model to treat the content as inert data.
