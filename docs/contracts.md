# Smart Contracts

## Deployed addresses

| Network | Address | Deployment TX |
|---|---|---|
| StudioNet | `0xc843D529A317dA2E372D75D48011C4784855A82C` | [view tx](https://explorer-studio.genlayer.com/tx/0x59030061815b0eb2fd8354270c79f25a742885f569ec0a92e375944d837d19ca) |
| Bradbury (testnet) | `0xFb5a86cC64b780636515304710Ff691114B5953D` | [view tx](https://explorer-bradbury.genlayer.com/tx/0xd082c8497eafa07b3eb6e7024ed3b12c094949899a2c00f4d7aee3db56273dba) |

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
