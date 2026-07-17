import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCopyleftContract, DisputeRecord } from '../lib/useCopyleft';
import { NetworkKey } from '../config/chains';

const STATUS_STYLES: Record<string, string> = {
  filed: 'bg-slate/10 text-slate-dark',
  rebutted: 'bg-seal/10 text-seal-dark',
  resolved: 'bg-compliant/10 text-compliant',
  cure_pending: 'bg-violation/10 text-violation',
  cured: 'bg-compliant/10 text-compliant',
  closed: 'bg-ink/10 text-ink/60',
};

function DisputeSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-ink/10 bg-paper-50 p-5">
      <div className="h-3 w-24 rounded bg-ink/10" />
      <div className="mt-3 h-4 w-3/4 rounded bg-ink/10" />
      <div className="mt-2 h-3 w-1/2 rounded bg-ink/10" />
    </div>
  );
}

interface Props {
  network: NetworkKey;
}

export default function Disputes({ network }: Props) {
  const { listDisputes, loading, error } = useCopyleftContract(network);
  const [disputes, setDisputes] = useState<Pick<DisputeRecord, 'dispute_id' | 'claimant' | 'respondent' | 'status'>[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listDisputes().then((d) => {
      if (!cancelled) setDisputes(d as any);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <div className="flex items-end justify-between">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate">The register</span>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Open &amp; resolved disputes</h1>
        </div>
        <Link
          to="/file"
          className="hidden rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-paper-50 md:inline-block"
        >
          File a Dispute
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-violation/30 bg-violation/5 px-4 py-3 text-sm text-violation">
          {error} — contract address may not be configured yet for this network.
        </div>
      )}

      <div className="mt-8 space-y-3">
        {disputes === null && loading && (
          <>
            <DisputeSkeleton />
            <DisputeSkeleton />
            <DisputeSkeleton />
          </>
        )}

        {disputes !== null && disputes.length === 0 && !loading && (
          <div className="rounded-lg border border-dashed border-ink/20 px-6 py-14 text-center">
            <p className="font-display text-lg text-ink/70">No disputes filed yet.</p>
            <p className="mt-2 text-sm text-ink/50">The docket is empty. Be the first to bring a claim.</p>
            <Link
              to="/file"
              className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-paper-50"
            >
              File a Dispute
            </Link>
          </div>
        )}

        {disputes?.map((d, i) => (
          <motion.div
            key={d.dispute_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              to={`/disputes/${d.dispute_id}`}
              className="flex items-center justify-between rounded-lg border border-ink/10 bg-paper-50 p-5 transition-colors hover:border-ink/25"
            >
              <div>
                <span className="font-mono text-xs text-ink/45">Dispute #{d.dispute_id}</span>
                <div className="mt-1 font-body text-sm text-ink/80">
                  {d.claimant.slice(0, 8)}… vs {d.respondent && d.respondent !== '0x' + '0'.repeat(40) ? d.respondent.slice(0, 8) + '…' : 'unassigned'}
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wide ${STATUS_STYLES[d.status] || 'bg-ink/10 text-ink/60'}`}>
                {d.status.replace('_', ' ')}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
