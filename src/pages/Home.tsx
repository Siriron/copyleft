import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileSearch, ShieldCheck, GitBranch, ScrollText, ArrowRight } from 'lucide-react';
import DiffShowcase from '../components/DiffShowcase';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="register-lines relative overflow-hidden border-b border-ink/10 px-5 pb-20 pt-16 md:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-seal/30 bg-seal/[0.06] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-seal-dark">
              Three-way evidence arbitration
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink md:text-5xl">
              License claims, judged against the text — not the argument.
            </h1>
            <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-ink/65">
              A downstream project ships GPL-family code without source, attribution,
              or a compliant NOTICE. Copyleft resolves the dispute by fetching the
              SPDX canonical license, the repo's own filings, and the disputed code —
              then lets AI validator consensus decide, with a real cure window before
              any stake is slashed.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/file"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper-50 transition-transform hover:-translate-y-0.5"
              >
                File a Dispute
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/disputes"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold text-ink/80 hover:border-ink/40"
              >
                View Open Disputes
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <DiffShowcase />
          </motion.div>
        </div>
      </section>

      {/* Features — Bento */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate">How it holds up</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
            Every verdict traces to something fetched, not something asserted.
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ScrollText,
              title: 'SPDX ground truth',
              body: "The claimant's clause and the respondent's rebuttal are both checked against the license's actual canonical text — neither party's framing is taken on faith.",
            },
            {
              icon: FileSearch,
              title: 'Three-way fetch',
              body: 'The leader fetches the SPDX text, the downstream LICENSE/NOTICE file, and the disputed source path — all inside one nondeterministic call, before any judgment.',
            },
            {
              icon: ShieldCheck,
              title: 'Independent re-derivation',
              body: "The validator doesn't check that a response exists — it re-runs the entire leader logic and compares the verdict and confidence band itself.",
            },
            {
              icon: GitBranch,
              title: 'Real cure window',
              body: "Mirrors GPLv3's actual reinstatement mechanic: a respondent found in violation can submit a remediation commit and have it re-judged before any stake is slashed.",
            },
            {
              icon: ScrollText,
              title: 'Deterministic settlement',
              body: 'Stake accounting and payouts happen strictly after consensus resolves — never inside the nondeterministic block, and never on chance.',
            },
            {
              icon: FileSearch,
              title: 'Dual-network live',
              body: 'Deployed on both Bradbury and StudioNet from day one, with a network toggle so any dispute can be filed or watched on either.',
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-ink/10 bg-paper-50 p-6"
            >
              <f.icon size={20} className="text-seal" strokeWidth={1.75} />
              <h3 className="mt-4 font-display text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-ink/10 bg-ink/[0.03] px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate">The docket, end to end</span>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink">From filing to cure.</h2>
          </motion.div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              { step: 'File', body: 'Claimant stakes GEN, cites the repo, the file paths, and which license clause was allegedly breached.' },
              { step: 'Rebut', body: 'Respondent counter-stakes and submits their own LICENSE/NOTICE evidence or an independent-derivation claim.' },
              { step: 'Resolve', body: 'Validator consensus fetches all three evidence legs and returns a verdict with a reasoning summary tied to what was fetched.' },
              { step: 'Cure', body: 'If found in violation, the respondent can submit a remediation commit for one re-judgment before stakes settle.' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                transition={{ delay: i * 0.08 }}
              >
                <div className="font-mono text-xs text-seal">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">{s.step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="mx-auto max-w-3xl rounded-2xl border border-ink/10 bg-ink px-8 py-14 text-center"
        >
          <h2 className="font-display text-3xl font-semibold text-paper-50">
            Have a compliance claim worth arbitrating?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-paper-100/70">
            File it on-chain. The evidence speaks for itself, and so does the license.
          </p>
          <Link
            to="/file"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-seal px-7 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            File a Dispute
            <ArrowRight size={15} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
