import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useCopyleftContract, DisputeRecord } from '../lib/useCopyleft';
import { NETWORKS, NetworkKey } from '../config/chains';

interface Props {
  network: NetworkKey;
  account: `0x${string}` | null;
  onConnect: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="border-b border-ink/8 py-3">
      <div className="font-mono text-[11px] uppercase tracking-wider text-ink/40">{label}</div>
      <div className="mt-1 text-sm leading-relaxed text-ink/80 break-words">{value}</div>
    </div>
  );
}

export default function DisputeDetail({ network, account, onConnect }: Props) {
  const { id } = useParams();
  const { getDispute, rebut, resolveDispute, requestCure, loading, error } = useCopyleftContract(network);
  const [dispute, setDispute] = useState<DisputeRecord | null>(null);
  const [counterEvidenceUrl, setCounterEvidenceUrl] = useState('');
  const [rebuttalText, setRebuttalText] = useState('');
  const [rebutStake, setRebutStake] = useState('0.01');
  const [cureUrl, setCureUrl] = useState('');
  const [txError, setTxError] = useState<string | null>(null);
  const [txPending, setTxPending] = useState(false);

  const refresh = async () => {
    if (!id) return;
    const d = await getDispute(Number(id));
    setDispute(d);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, network]);

  const handleRebut = async () => {
    if (!account) return onConnect();
    if (!counterEvidenceUrl.trim() || !rebuttalText.trim()) return;
    setTxError(null);
    setTxPending(true);
    try {
      let stakeWei: bigint;
      try {
        const { parseEther } = await import('viem');
        stakeWei = parseEther(rebutStake);
      } catch {
        stakeWei = BigInt(Math.floor(Number(rebutStake) * 1e18));
      }
      await rebut(account, Number(id), counterEvidenceUrl.trim(), rebuttalText.trim(), stakeWei);
      await refresh();
    } catch (e: any) {
      setTxError(e?.message || 'Rebuttal failed');
    } finally {
      setTxPending(false);
    }
  };

  const handleResolve = async () => {
    if (!account) return onConnect();
    setTxError(null);
    setTxPending(true);
    try {
      await resolveDispute(account, Number(id));
      await refresh();
    } catch (e: any) {
      setTxError(e?.message || 'Resolution failed');
    } finally {
      setTxPending(false);
    }
  };

  const handleCure = async () => {
    if (!account) return onConnect();
    if (!cureUrl.trim()) return;
    setTxError(null);
    setTxPending(true);
    try {
      await requestCure(account, Number(id), cureUrl.trim());
      await refresh();
    } catch (e: any) {
      setTxError(e?.message || 'Cure request failed');
    } finally {
      setTxPending(false);
    }
  };

  if (loading && !dispute) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-40 rounded bg-ink/10" />
          <div className="h-8 w-2/3 rounded bg-ink/10" />
          <div className="h-32 w-full rounded bg-ink/10" />
        </div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="font-display text-xl text-ink/70">
          {error || 'Dispute not found on this network.'}
        </p>
        <Link to="/disputes" className="mt-4 inline-block text-sm text-seal">
          Back to the register
        </Link>
      </div>
    );
  }

  const explorerTx = `${NETWORKS[network].explorerUrl}`;

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <Link to="/disputes" className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink">
        <ArrowLeft size={15} /> Back to register
      </Link>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <span className="font-mono text-xs text-ink/40">Dispute #{dispute.dispute_id}</span>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{dispute.license_id || 'Unspecified license'}</h1>
        </div>
        <span className="rounded-full bg-ink/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-ink/70">
          {dispute.status.replace('_', ' ')}
        </span>
      </div>

      {dispute.verdict && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 rounded-lg border p-5 ${
            dispute.verdict === 'violation'
              ? 'border-violation/30 bg-violation/5'
              : 'border-compliant/30 bg-compliant/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`font-display text-lg font-semibold ${dispute.verdict === 'violation' ? 'text-violation' : 'text-compliant'}`}>
              Verdict: {dispute.verdict}
            </span>
            <span className="font-mono text-xs text-ink/50">{dispute.confidence_bps} bps confidence</span>
          </div>
          {dispute.reasoning_summary && (
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{dispute.reasoning_summary}</p>
          )}
        </motion.div>
      )}

      {dispute.cure_verdict && (
        <div className={`mt-4 rounded-lg border p-5 ${dispute.cure_verdict === 'cured' ? 'border-compliant/30 bg-compliant/5' : 'border-ink/15 bg-ink/[0.03]'}`}>
          <span className={`font-display text-base font-semibold ${dispute.cure_verdict === 'cured' ? 'text-compliant' : 'text-ink/70'}`}>
            Cure verdict: {dispute.cure_verdict.replace('_', ' ')}
          </span>
          <span className="ml-3 font-mono text-xs text-ink/45">{dispute.cure_confidence_bps} bps</span>
        </div>
      )}

      <div className="mt-8 rounded-lg border border-ink/10 bg-paper-50 p-5">
        <Row label="Downstream repo" value={dispute.downstream_repo_url} />
        <Row label="Disputed paths" value={dispute.disputed_paths} />
        <Row label="Alleged clause" value={dispute.alleged_clause} />
        <Row label="Claimant statement" value={dispute.claim_text} />
        <Row label="Counter-evidence" value={dispute.counter_evidence_url} />
        <Row label="Rebuttal" value={dispute.rebuttal_text} />
        <Row label="Cure commit" value={dispute.cure_commit_url} />
        <Row label="Claimant stake (wei)" value={String(dispute.claimant_stake)} />
        <Row label="Respondent stake (wei)" value={String(dispute.respondent_stake)} />
      </div>

      {txError && (
        <div className="mt-4 rounded-lg border border-violation/30 bg-violation/5 px-4 py-3 text-sm text-violation">
          {txError}
        </div>
      )}

      <div className="mt-8 space-y-4">
        {dispute.status === 'filed' && (
          <div className="rounded-lg border border-ink/10 bg-paper-50 p-5">
            <h3 className="font-display text-base font-semibold text-ink">Submit a rebuttal</h3>
            <p className="mt-1 text-sm text-ink/60">
              Counter-stake and submit your own evidence. This unlocks consensus resolution.
            </p>

            <label className="mt-4 block font-mono text-[11px] uppercase tracking-wider text-ink/50">
              Counter-evidence URL
            </label>
            <input
              type="url"
              value={counterEvidenceUrl}
              onChange={(e) => setCounterEvidenceUrl(e.target.value)}
              placeholder="https://github.com/org/repo/blob/main/LICENSE"
              className="mt-1.5 w-full rounded-md border border-ink/15 bg-paper px-3 py-2.5 text-sm focus:border-seal focus:outline-none"
            />

            <label className="mt-4 block font-mono text-[11px] uppercase tracking-wider text-ink/50">
              Rebuttal
            </label>
            <textarea
              rows={4}
              value={rebuttalText}
              onChange={(e) => setRebuttalText(e.target.value)}
              maxLength={2000}
              placeholder="Explain why the claim doesn't hold, citing the counter-evidence above."
              className="mt-1.5 w-full rounded-md border border-ink/15 bg-paper px-3 py-2.5 text-sm focus:border-seal focus:outline-none"
            />

            <label className="mt-4 block font-mono text-[11px] uppercase tracking-wider text-ink/50">
              Counter-stake (GEN)
            </label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={rebutStake}
              onChange={(e) => setRebutStake(e.target.value)}
              className="mt-1.5 w-40 rounded-md border border-ink/15 bg-paper px-3 py-2.5 text-sm focus:border-seal focus:outline-none"
            />

            <button
              onClick={handleRebut}
              disabled={txPending || !counterEvidenceUrl.trim() || !rebuttalText.trim()}
              className="mt-4 w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper-50 disabled:opacity-50"
            >
              {txPending ? 'Submitting…' : account ? 'Counter-stake & Rebut' : 'Connect Wallet to Rebut'}
            </button>
            {txPending && (
              <p className="mt-2 text-center text-xs text-ink/45">
                Waiting for validator consensus — this can take a few minutes.
              </p>
            )}
          </div>
        )}

        {dispute.status === 'rebutted' && (
          <div>
            <button
              onClick={handleResolve}
              disabled={txPending}
              className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper-50 disabled:opacity-50"
            >
              {txPending ? 'Resolving…' : account ? 'Run Consensus Resolution' : 'Connect Wallet to Resolve'}
            </button>
            {txPending && (
              <p className="mt-2 text-center text-xs text-ink/45">
                Fetching evidence and running validator consensus — this can take several minutes.
              </p>
            )}
          </div>
        )}

        {dispute.status === 'cure_pending' && (
          <div className="rounded-lg border border-ink/10 bg-paper-50 p-5">
            <h3 className="font-display text-base font-semibold text-ink">Request a cure</h3>
            <p className="mt-1 text-sm text-ink/60">
              Mirrors GPLv3's cure provision — submit a remediation commit for one re-judgment.
            </p>
            <input
              type="text"
              value={cureUrl}
              onChange={(e) => setCureUrl(e.target.value)}
              placeholder="https://github.com/org/repo/commit/…"
              className="mt-3 w-full rounded-md border border-ink/15 bg-paper px-3 py-2.5 text-sm focus:border-seal focus:outline-none"
            />
            <button
              onClick={handleCure}
              disabled={txPending || !cureUrl.trim()}
              className="mt-3 w-full rounded-full bg-seal px-6 py-3 text-sm font-semibold text-ink disabled:opacity-50"
            >
              {txPending ? 'Submitting…' : account ? 'Submit Cure' : 'Connect Wallet to Submit'}
            </button>
            {txPending && (
              <p className="mt-2 text-center text-xs text-ink/45">
                Re-fetching evidence and re-judging — this can take a few minutes.
              </p>
            )}
          </div>
        )}
      </div>

      <a
        href={explorerTx}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex items-center gap-1.5 text-xs text-ink/45 hover:text-ink/70"
      >
        View on {NETWORKS[network].label} explorer <ExternalLink size={12} />
      </a>
    </div>
  );
}
