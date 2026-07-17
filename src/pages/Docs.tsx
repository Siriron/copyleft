import { useParams, Link } from 'react-router-dom';
import { NETWORKS } from '../config/chains';

const SECTIONS = [
  { key: 'overview', label: 'Overview' },
  { key: 'how-it-works', label: 'How It Works' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'contracts', label: 'Smart Contracts' },
  { key: 'api', label: 'API Reference' },
  { key: 'faq', label: 'FAQ' },
];

function Overview() {
  return (
    <>
      <h2 className="font-display text-2xl font-semibold text-ink">Overview</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink/70">
        Copyleft arbitrates GPL-family license compliance disputes on GenLayer. A claimant
        stakes GEN and accuses a downstream repository of violating a GPLv2, GPLv3, or LGPL
        obligation. A respondent counter-stakes and rebuts with their own evidence. Resolution
        fetches three independent pieces of evidence — the SPDX canonical license text, the
        downstream repo's own LICENSE/NOTICE file, and the disputed source path — and judges
        the claim against all three, not against either party's framing alone.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink/70">
        If a violation is found, the respondent gets a cure window modeled on GPLv3's real
        30-day-from-notice reinstatement mechanic: submit a remediation commit and receive one
        re-judgment before stakes settle.
      </p>
    </>
  );
}

function HowItWorks() {
  return (
    <>
      <h2 className="font-display text-2xl font-semibold text-ink">How It Works</h2>
      <ol className="mt-4 space-y-4 text-sm leading-relaxed text-ink/70">
        <li><strong className="text-ink">1. File.</strong> Claimant calls <code className="font-mono text-xs">file_dispute()</code>, staking GEN and citing the repo, paths, license, and clause.</li>
        <li><strong className="text-ink">2. Rebut.</strong> Respondent calls <code className="font-mono text-xs">rebut()</code>, counter-staking and submitting counter-evidence.</li>
        <li><strong className="text-ink">3. Resolve.</strong> Anyone calls <code className="font-mono text-xs">resolve_dispute()</code>. A leader/validator nondeterministic pair fetches all three evidence sources and returns a verdict, confidence, and reasoning. The validator independently re-runs the leader's logic rather than checking response shape.</li>
        <li><strong className="text-ink">4. Settle or cure.</strong> A compliant verdict settles immediately. A violation verdict opens a cure window — the respondent can call <code className="font-mono text-xs">request_cure()</code> once with a remediation commit, triggering a fresh fetch and re-judgment before final settlement.</li>
      </ol>
    </>
  );
}

function Architecture() {
  return (
    <>
      <h2 className="font-display text-2xl font-semibold text-ink">Architecture</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink/70">
        The contract runs on GenVM (Python, never Solidity/EVM). All nondeterministic work —
        web fetches and LLM judgment — happens inside a single <code className="font-mono text-xs">gl.vm.run_nondet_unsafe</code> call
        per resolution step. Storage writes (stakes, statuses, settlements) happen strictly
        after that call returns. Dispute records use <code className="font-mono text-xs">TreeMap</code> storage with
        <code className="font-mono text-xs"> @allow_storage</code> dataclasses; all views return JSON strings.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink/70">
        The frontend is React + Vite + TypeScript + Tailwind, talking to the contract via
        <code className="font-mono text-xs"> genlayer-js</code>, with a network toggle between Bradbury testnet and StudioNet.
      </p>
    </>
  );
}

function Contracts() {
  return (
    <>
      <h2 className="font-display text-2xl font-semibold text-ink">Smart Contracts</h2>
      <div className="mt-4 space-y-3 text-sm text-ink/70">
        <div className="rounded-lg border border-ink/10 bg-paper-50 p-4">
          <div className="font-mono text-xs text-ink/45">Bradbury</div>
          <div className="mt-1 font-mono text-sm">
            {NETWORKS.bradbury.contractAddress || 'Pending deployment'}
          </div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper-50 p-4">
          <div className="font-mono text-xs text-ink/45">StudioNet</div>
          <div className="mt-1 font-mono text-sm">
            {NETWORKS.studionet.contractAddress || 'Pending deployment'}
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink/70">
        Full source: <code className="font-mono text-xs">contracts/copyleft.py</code> in the repository.
      </p>
    </>
  );
}

function Api() {
  return (
    <>
      <h2 className="font-display text-2xl font-semibold text-ink">API Reference</h2>
      <div className="mt-4 space-y-4 text-sm text-ink/70">
        {[
          ['file_dispute(downstream_repo_url, disputed_paths, license_id, alleged_clause, claim_text)', 'Payable write. Claimant stakes GEN and opens a dispute.'],
          ['rebut(dispute_id, counter_evidence_url, rebuttal_text)', 'Payable write. Respondent counter-stakes and rebuts.'],
          ['resolve_dispute(dispute_id)', 'Write. Runs three-way evidence fetch + consensus judgment.'],
          ['request_cure(dispute_id, cure_commit_url)', 'Write. Respondent-only. Triggers a re-judgment against remediation evidence.'],
          ['get_dispute(dispute_id)', 'View. Returns full dispute record as JSON.'],
          ['list_disputes()', 'View. Returns all disputes with id/claimant/respondent/status.'],
          ['get_protocol_pool()', 'View. Returns accumulated protocol pool balance.'],
        ].map(([sig, desc]) => (
          <div key={sig} className="rounded-lg border border-ink/10 bg-paper-50 p-4">
            <code className="font-mono text-xs text-seal-dark">{sig}</code>
            <p className="mt-1.5">{desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function Faq() {
  return (
    <>
      <h2 className="font-display text-2xl font-semibold text-ink">FAQ</h2>
      <div className="mt-4 space-y-5 text-sm text-ink/70">
        <div>
          <h3 className="font-semibold text-ink">Why fetch the SPDX text instead of trusting either party?</h3>
          <p className="mt-1">Because neither party controls it. It's a fixed, independently-authoritative reference the model checks both claims against.</p>
        </div>
        <div>
          <h3 className="font-semibold text-ink">What happens if the respondent ignores the cure window?</h3>
          <p className="mt-1">The dispute stays in <code className="font-mono text-xs">cure_pending</code>. Anyone can still watch it, but settlement only finalizes once a cure is requested and judged, or the parties otherwise resolve it off-chain.</p>
        </div>
        <div>
          <h3 className="font-semibold text-ink">Is this gambling or speculation?</h3>
          <p className="mt-1">No. Stakes are a security-deposit consequence of a judged, evidence-based verdict — there's no odds or chance element anywhere in the contract.</p>
        </div>
      </div>
    </>
  );
}

const CONTENT: Record<string, JSX.Element> = {
  overview: <Overview />,
  'how-it-works': <HowItWorks />,
  architecture: <Architecture />,
  contracts: <Contracts />,
  api: <Api />,
  faq: <Faq />,
};

export default function Docs() {
  const { section = 'overview' } = useParams();
  const active = CONTENT[section] ? section : 'overview';

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <div className="grid gap-10 md:grid-cols-[200px_1fr]">
        <nav className="space-y-1">
          {SECTIONS.map((s) => (
            <Link
              key={s.key}
              to={`/docs/${s.key}`}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                active === s.key ? 'bg-ink text-paper-50' : 'text-ink/60 hover:bg-ink/5'
              }`}
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <div>{CONTENT[active]}</div>
      </div>
    </div>
  );
}
