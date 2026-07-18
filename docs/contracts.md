# Smart Contracts

## Jul 18 2026 — confirmed bug fix, redeployed same day

A live `resolve_dispute` failure (transaction finalized as `Undetermined`,
all validators erroring identically) was traced to two confirmed bugs in
the nondet/consensus handling, fixed in this version of `contracts/copyleft.py`:

1. **`gl.nondet.web.get()` returns a `Response` object, not a string.**
   The previous version passed this object directly into a text-processing
   function, which crashed every validator identically with
   `TypeError: 'Response' object is not iterable`. Fixed by reading
   `response.body.decode("utf-8")` before any string operation touches it.

2. **`run_nondet_unsafe`'s validator argument is a `gl.vm.Return` wrapper,
   not the plain value.** The previous version treated it as a raw JSON
   string and called `json.loads()` on values that were already-decoded
   objects. Fixed to check `isinstance(leaders_res, gl.vm.Return)` first
   and read the actual value from `leaders_res.calldata`, matching
   GenLayer's official WizardOfCoin example and non-determinism docs
   exactly.

Both fixes were cross-verified against 8 independent official GenLayer
documentation sources and a real deployed reference contract before being
applied. Full design rationale is in the contract's own module docstring.

Redeployed to both networks the same day — see addresses below.

## Deployed addresses

| Network | Address | Deployment TX |
|---|---|---|
| StudioNet | `0x9261d128EA0813144395247e7d7b6f7e12B1bCeC` | [view tx](https://explorer-studio.genlayer.com/tx/0xcc09b93c710532ff4c70900271c771de8614d54ede2443e976e601a15f2c61d6) |
| Bradbury (testnet) | `0x58daEDCee44D1Cd2ae78f339A782CCA5B36314f0` | [view tx](https://explorer-bradbury.genlayer.com/tx/0x217412a75efe48061c27011da78ed5c2b05df88ce092395fa2f1bb2053a98f1f) |

## `contracts/copyleft.py`

Single contract, `Copyleft`. See inline docstrings for full detail; summary
of the public interface:

### Writes

| Function | Payable | Description |
|---|---|---|
| `file_dispute(downstream_repo_url, disputed_paths, license_id, alleged_clause, claim_text)` | Yes | Claimant opens a dispute and stakes GEN. |
| `rebut(dispute_id, counter_evidence_url, rebuttal_text)` | Yes | Respondent counter-stakes and rebuts. |
| `resolve_dispute(dispute_id)` | No | Triggers three-way evidence fetch + consensus verdict. |
| `request_cure(dispute_id, cure_commit_url)` | No | Respondent-only. Triggers remediation re-judgment. |

### Views

| Function | Returns |
|---|---|
| `get_dispute(dispute_id)` | Full dispute record, JSON string |
| `list_disputes()` | Array of `{dispute_id, claimant, respondent, status}` |
| `get_protocol_pool()` | `{protocol_pool: int}` |

## Storage

- `disputes: TreeMap[u256, Dispute]` — full dispute records.
- `dispute_index: TreeMap[u256, DisputeIndexEntry]` — lightweight index for
  list views.
- `next_dispute_id: u256`, `protocol_pool: u256`.

All structs are `@allow_storage @dataclass`. No `gl.Record` usage anywhere.

## Nondeterministic blocks

Two `run_nondet_unsafe` call sites: one inside `resolve_dispute`, one inside
`request_cure`. Both follow the identical pattern — `leader_fn` performs all
fetches and the LLM judgment in one call; `validator_fn` independently
re-invokes `leader_fn` and compares stable fields with a tolerance band on
the numeric confidence value. Neither validator accepts a merely
well-shaped or non-empty response.

## Settlement logic

- **Compliant verdict:** claimant's stake splits 80/20 to respondent/protocol
  pool; respondent's counter-stake is returned.
- **Violation, cured:** both stakes returned in full (mirrors GPLv3
  reinstatement — no penalty once remediated in time).
- **Violation, not cured:** respondent's stake splits 80/20 to
  claimant/protocol pool; claimant's original stake is returned.

All splits are fixed percentages applied to a judged outcome — never a
chance-based or odds-based mechanism.
