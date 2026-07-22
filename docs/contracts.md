# Smart Contracts

## Confirmed fix history (Jul 17–22 2026) — all four now live-verified

A live `resolve_dispute` failure went through four confirmed, sequential
bug fixes, each exposed only once the previous one let execution reach
further into the same code path. **All four are now confirmed working
end-to-end** on the current deployment (see "Live verification" below) —
this is not just a theoretical fix, real GEN moved correctly and stderr
came back empty on an actual test transaction.

### Jul 18: nondet/consensus handling

The transaction finalized as `Undetermined`, with all validators erroring
identically:

1. **`gl.nondet.web.get()` returns a `Response` object, not a string.**
   The contract passed this object directly into a text-processing
   function, which crashed every validator identically with
   `TypeError: 'Response' object is not iterable`. Fixed by reading
   `response.body.decode("utf-8")` before any string operation touches it.

2. **`run_nondet_unsafe`'s validator argument is a `gl.vm.Return` wrapper,
   not the plain value.** The contract treated it as a raw JSON string and
   called `json.loads()` on values that were already-decoded objects.
   Fixed to check `isinstance(leaders_res, gl.vm.Return)` first and read
   the actual value from `leaders_res.calldata`, matching GenLayer's
   official WizardOfCoin example and non-determinism docs exactly.

### Jul 19: value transfer + storage-in-nondet handling

With the above fixed, `resolve_dispute` reached settlement code for the
first time — exposing two further bugs invisible until then:

3. **`gl.get_contract_at(address).send(amount)` does not exist.** Real
   error: `AttributeError: '_ContractAt' object has no attribute 'send'`.
   Fixed to use `gl.get_contract_at(address).emit_transfer(value=amount)`,
   the confirmed-correct method per GenLayer's official "Working with
   Balances" documentation.

4. **Storage objects (e.g. a `Dispute` record read from a `TreeMap`)
   cannot be used directly inside a nondet leader/validator function.**
   The leader functions were reading `self.disputes[dispute_id]` directly
   from within the function passed as `leader_fn`, which GenVM flagged
   with `UserWarning: Detected pickling storage class. Reading storage in
   nondet mode is not supported`. Fixed by calling
   `gl.storage.copy_to_memory(d)` on the dispute record in the plain
   deterministic body, before it crosses into `run_nondet_unsafe`.

### Jul 20: the pickling warning persisted — a deeper, two-part cause

Fix #4 alone did **not** eliminate the warning; it reappeared identically
on the next redeploy. Root cause was two-fold:

5. **`CHARTER` was declared as a class-body attribute with a type
   annotation** (`CHARTER: str = (...)` inside `class Copyleft(gl.Contract)`).
   Per GenLayer's own storage docs, any such attribute is treated as a
   genuine persistent storage field — even though it was semantically
   meant to be an immutable constant. Reading it via `self.CHARTER` inside
   a leader function crossed a storage-backed value into the nondet
   block, the same class of bug as #4 but far less obvious. Fixed by
   moving it to a plain module-level constant (`_CHARTER = "..."`,
   outside the class body entirely).

6. **More fundamentally: leader/validator functions were defined as
   instance methods** (`def _resolve_leader(self, d):`) called via
   bound-method references (`lambda: self._resolve_leader(d_mem)`) — this
   carries `self` (the whole contract instance, which owns every storage
   field) into the nondet closure regardless of which specific field the
   method body touches. Confirmed via independent real-developer
   testimony ("you cannot access self inside a non-deterministic block")
   and via GenLayer's own official WizardOfCoin example, which defines
   leader/validator logic as **nested functions** directly inside the
   write method, closing only over local variables, never calling
   `self.something()` from inside them. Fixed by restructuring both
   `resolve_dispute` and `request_cure` this way — no more standalone
   `_resolve_leader`/`_resolve_validator`/`_check_cure_leader`/
   `_check_cure_validator` instance methods at all.

### Live verification (Jul 22 2026)

A full `file_dispute` → `rebut` → `resolve_dispute` run was executed
directly against the deployed contract:

- **Stderr came back empty** — the pickling warning is confirmed gone.
- **Execution Result: `SUCCESS`**, clean JSON return
  (`{"dispute_id": 1, "verdict": "compliant", "confidence_bps": 320,
  "status": "resolved"}`).
- **Settlement transfers landed correctly** — the contract's on-chain
  balance after settlement (0.002 GEN) exactly matches the settlement
  formula's expected remainder, and both `emit_transfer` payouts appear
  as `FINALIZED`/`IN` transactions in the recipient wallet's own
  transaction history.
- Leader rotation occurred once (a first-round leader's confidence score
  was rejected by two independent validators, triggering a new leader),
  then the second round reached a legitimate majority and finalized as
  `Accepted`. This is expected, correct GenLayer behavior for a
  genuinely ambiguous test dispute, not a defect — see the note below.

All six fixes were cross-verified against official GenLayer documentation
(and, for #3, a full official worked example) before being applied. Full
design rationale is in the contract's own module docstring and inline
comments.

**Known characteristic, not a bug:** some rate of validator disagreement
on `confidence_bps`, and occasional leader rotation, is expected, healthy
behavior of multi-validator LLM consensus on a genuinely ambiguous
dispute — not every disagreement or rotation indicates a problem. Watch
`execution_result`/`contract_state_hash` for actual crashes; a vote split
that still reaches a majority and finalizes as `Accepted` is the system
working correctly. Confidence scores observed varied fairly widely
(320–720 bps) across repeated tests of the same intentionally-ambiguous
test dispute — this has not yet been tested against a dispute with
clear-cut, decisive evidence, which would be the real test of whether
this variance is inherent to ambiguous cases specifically or wider than
that.

**Not yet tested:** the `request_cure` remediation path, and the
`_settle_violation_final` slashing path (only the compliant-verdict
settlement path has been exercised so far).

## Deployed addresses

| Network | Address | Deployment TX |
|---|---|---|
| StudioNet | `0x076B412E3B1ff517E1fC0bEF8C90d769276555F1` | [view tx](https://explorer-studio.genlayer.com/tx/0x2422f6fb8c7d2b9b3fb366e80b317978217464a7ca80ec49e1e832a03428f4a6) |
| Bradbury (testnet) | `0x3D1EcE7272cb55410EC93036A9805Cb55fB8C94a` | [view tx](https://explorer-bradbury.genlayer.com/tx/0xf42f88c48b231298aac589847e34fd8b8c978c3c46fe9403857600d33dc8bc8b) |

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

Two `run_nondet_unsafe` call sites: one inside `resolve_dispute`, one
inside `request_cure`. Both follow the identical pattern — `leader_fn` and
`validator_fn` are defined as **nested functions directly inside the
write method** (never as separate instance methods called via
`self.method_name(...)`), closing only over a `gl.storage.copy_to_memory`'d
dispute record and module-level constants/helpers. `leader_fn` performs
all fetches and the LLM judgment in one call; `validator_fn` independently
re-invokes `leader_fn()` directly (the nested function, never a bound
method) and compares stable fields with a tolerance band on the numeric
confidence value. Neither validator accepts a merely well-shaped or
non-empty response. See the fix history above (#5, #6) for why this
specific structure — not instance methods — is required.

## Settlement logic

- **Compliant verdict:** claimant's stake splits 80/20 to respondent/protocol
  pool; respondent's counter-stake is returned.
- **Violation, cured:** both stakes returned in full (mirrors GPLv3
  reinstatement — no penalty once remediated in time).
- **Violation, not cured:** respondent's stake splits 80/20 to
  claimant/protocol pool; claimant's original stake is returned.

All splits are fixed percentages applied to a judged outcome — never a
chance-based or odds-based mechanism.
