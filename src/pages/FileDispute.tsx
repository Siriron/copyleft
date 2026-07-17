import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseEther } from 'viem';
import { useCopyleftContract } from '../lib/useCopyleft';
import { NetworkKey } from '../config/chains';

const LICENSE_OPTIONS = ['GPL-2.0-only', 'GPL-3.0-only', 'LGPL-2.1-only', 'LGPL-3.0-only'];

interface Props {
  network: NetworkKey;
  account: `0x${string}` | null;
  onConnect: () => void;
}

export default function FileDispute({ network, account, onConnect }: Props) {
  const navigate = useNavigate();
  const { fileDispute, loading } = useCopyleftContract(network);

  const [form, setForm] = useState({
    downstreamRepoUrl: '',
    disputedPaths: '',
    licenseId: LICENSE_OPTIONS[1],
    allegedClause: '',
    claimText: '',
    stake: '0.05',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return onConnect();
    setSubmitError(null);
    setSubmitting(true);
    try {
      let stakeWei: bigint;
      try {
        stakeWei = parseEther(form.stake);
      } catch {
        stakeWei = BigInt(Math.floor(Number(form.stake) * 1e18));
      }
      const hash = await fileDispute(
        account,
        {
          downstreamRepoUrl: form.downstreamRepoUrl,
          disputedPaths: form.disputedPaths,
          licenseId: form.licenseId,
          allegedClause: form.allegedClause,
          claimText: form.claimText,
        },
        stakeWei,
      );
      void hash;
      navigate('/disputes');
    } catch (e: any) {
      setSubmitError(e?.message || 'Failed to file dispute. Check your wallet and network.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <span className="font-mono text-[11px] uppercase tracking-wider text-slate">New filing</span>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">File a Dispute</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">
        Stake GEN and cite the alleged violation. The respondent will be able to counter-stake
        and rebut once you submit.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/50">
            Downstream repository URL
          </label>
          <input
            required
            type="url"
            value={form.downstreamRepoUrl}
            onChange={update('downstreamRepoUrl')}
            placeholder="https://github.com/org/downstream-project"
            className="mt-1.5 w-full rounded-md border border-ink/15 bg-paper-50 px-3 py-2.5 text-sm focus:border-seal focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/50">
            Disputed file path(s)
          </label>
          <input
            required
            type="text"
            value={form.disputedPaths}
            onChange={update('disputedPaths')}
            placeholder="src/core/engine.c, src/core/engine.h"
            className="mt-1.5 w-full rounded-md border border-ink/15 bg-paper-50 px-3 py-2.5 text-sm focus:border-seal focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/50">
            License
          </label>
          <select
            value={form.licenseId}
            onChange={update('licenseId')}
            className="mt-1.5 w-full rounded-md border border-ink/15 bg-paper-50 px-3 py-2.5 text-sm focus:border-seal focus:outline-none"
          >
            {LICENSE_OPTIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/50">
            Alleged clause violated
          </label>
          <input
            required
            type="text"
            value={form.allegedClause}
            onChange={update('allegedClause')}
            placeholder="Failure to provide Corresponding Source (§6)"
            maxLength={500}
            className="mt-1.5 w-full rounded-md border border-ink/15 bg-paper-50 px-3 py-2.5 text-sm focus:border-seal focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/50">
            Claim details
          </label>
          <textarea
            required
            rows={4}
            value={form.claimText}
            onChange={update('claimText')}
            maxLength={2000}
            placeholder="Describe what was shipped, what's missing, and why it breaches the license."
            className="mt-1.5 w-full rounded-md border border-ink/15 bg-paper-50 px-3 py-2.5 text-sm focus:border-seal focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/50">
            Stake (GEN)
          </label>
          <input
            required
            type="number"
            step="0.001"
            min="0.001"
            value={form.stake}
            onChange={update('stake')}
            className="mt-1.5 w-40 rounded-md border border-ink/15 bg-paper-50 px-3 py-2.5 text-sm focus:border-seal focus:outline-none"
          />
        </div>

        {submitError && (
          <div className="rounded-lg border border-violation/30 bg-violation/5 px-4 py-3 text-sm text-violation">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-paper-50 disabled:opacity-50"
        >
          {submitting ? 'Filing…' : account ? 'Stake & File Dispute' : 'Connect Wallet to File'}
        </button>
        {submitting && (
          <p className="text-center text-xs text-ink/45">
            Waiting for the network to confirm — this can take a few minutes.
          </p>
        )}
      </form>
    </div>
  );
}
