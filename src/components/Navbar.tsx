import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import NetworkToggle from './NetworkToggle';
import { NetworkKey } from '../config/chains';

interface Props {
  network: NetworkKey;
  onNetworkChange: (n: NetworkKey) => void;
  account: string | null;
  onConnect: () => void;
  connecting: boolean;
}

const links = [
  { to: '/disputes', label: 'Disputes' },
  { to: '/file', label: 'File a Dispute' },
  { to: '/docs', label: 'Docs' },
];

export default function Navbar({ network, onNetworkChange, account, onConnect, connecting }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          <span className="font-display text-lg font-semibold tracking-tight text-ink">Copyleft</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-ink' : 'text-ink/55 hover:text-ink'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <NetworkToggle network={network} onChange={onNetworkChange} />
          <button
            onClick={onConnect}
            disabled={connecting}
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper-50 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {account ? `${account.slice(0, 6)}…${account.slice(-4)}` : connecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/10 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink/70"
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between gap-3">
            <NetworkToggle network={network} onChange={onNetworkChange} />
          </div>
          <button
            onClick={onConnect}
            disabled={connecting}
            className="mt-4 w-full rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-paper-50"
          >
            {account ? `${account.slice(0, 6)}…${account.slice(-4)}` : connecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        </div>
      )}
    </header>
  );
}
