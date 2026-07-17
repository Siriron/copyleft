import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiffLine {
  text: string;
  kind: 'context' | 'add' | 'remove';
}

const SPDX_LINES: DiffLine[] = [
  { text: 'Each contributor grants you a non-exclusive,', kind: 'context' },
  { text: 'worldwide, royalty-free copyright license to', kind: 'context' },
  { text: 'reproduce, modify, and distribute the Program.', kind: 'context' },
  { text: 'You must provide a copy of this License along', kind: 'add' },
  { text: 'with the Corresponding Source to every recipient.', kind: 'add' },
  { text: 'You may not impose further restrictions on the', kind: 'context' },
  { text: "recipients' exercise of the rights granted herein.", kind: 'context' },
];

const REPO_LINES: DiffLine[] = [
  { text: 'Each contributor grants you a non-exclusive,', kind: 'context' },
  { text: 'worldwide, royalty-free copyright license to', kind: 'context' },
  { text: 'reproduce, modify, and distribute the Program.', kind: 'context' },
  { text: '// no LICENSE file found in downstream repo', kind: 'remove' },
  { text: '// no Corresponding Source link provided', kind: 'remove' },
  { text: 'You may not impose further restrictions on the', kind: 'context' },
  { text: "recipients' exercise of the rights granted herein.", kind: 'context' },
];

export default function DiffShowcase() {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= SPDX_LINES.length) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), 420);
    return () => clearTimeout(t);
  }, [revealed]);

  const lineClass = (kind: DiffLine['kind']) => {
    if (kind === 'add') return 'diff-add px-2 rounded-sm';
    if (kind === 'remove') return 'diff-remove px-2 rounded-sm';
    return 'text-ink/55 px-2';
  };

  return (
    <div className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-ink/15 bg-paper-50 shadow-[0_20px_60px_-15px_rgba(18,37,62,0.25)]">
      <div className="flex items-center justify-between border-b border-ink/10 bg-ink px-4 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-paper-100/70">
          resolve_dispute() — evidence comparison
        </span>
        <span className="font-mono text-[11px] text-seal-light">GPL-3.0-only</span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-ink/10">
        <div className="p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate">
            SPDX canonical text
          </div>
          <div className="space-y-1.5 font-mono text-[12.5px] leading-relaxed">
            <AnimatePresence>
              {SPDX_LINES.slice(0, revealed).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className={lineClass(line.kind)}
                >
                  {line.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-violation">
            Downstream repo (fetched)
          </div>
          <div className="space-y-1.5 font-mono text-[12.5px] leading-relaxed">
            <AnimatePresence>
              {REPO_LINES.slice(0, revealed).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className={lineClass(line.kind)}
                >
                  {line.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {revealed >= SPDX_LINES.length && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center justify-between border-t border-ink/10 bg-violation/[0.06] px-4 py-3"
          >
            <span className="font-mono text-[11px] text-violation">
              verdict: violation · confidence: 870bps
            </span>
            <span className="font-mono text-[10px] text-ink/45">
              missing Corresponding Source obligation
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
