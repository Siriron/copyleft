import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper-100">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img src="/favicon.svg" alt="" className="h-7 w-7" />
              <span className="font-display text-base font-semibold">Copyleft</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper-300/80">
              Arbitration for GPL-family license disputes, judged against SPDX canonical
              text and the repositories themselves — not against either party's word.
            </p>
          </div>

          <div>
            <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-paper-300/60">
              Product
            </h4>
            <ul className="mt-3 space-y-2.5 text-sm text-paper-100/85">
              <li><Link to="/disputes" className="hover:text-seal-light">Disputes</Link></li>
              <li><Link to="/file" className="hover:text-seal-light">File a Dispute</Link></li>
              <li><Link to="/docs" className="hover:text-seal-light">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-paper-300/60">
              Network
            </h4>
            <ul className="mt-3 space-y-2.5 text-sm text-paper-100/85">
              <li><a href="https://portal.genlayer.foundation/" target="_blank" rel="noreferrer" className="hover:text-seal-light">GenLayer Portal</a></li>
              <li><a href="https://docs.genlayer.com/" target="_blank" rel="noreferrer" className="hover:text-seal-light">GenLayer Docs</a></li>
              <li><a href="https://testnet-faucet.genlayer.foundation" target="_blank" rel="noreferrer" className="hover:text-seal-light">Testnet Faucet</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-paper-100/10 pt-6 text-xs text-paper-300/60 md:flex-row md:items-center">
          <span>© 2026 Copyleft. Built on GenLayer.</span>
          <span>Not affiliated with the Free Software Foundation or SPDX.</span>
        </div>
      </div>
    </footer>
  );
}
