import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="register-lines relative flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="font-mono text-xs uppercase tracking-widest text-seal">Docket 404</span>
      <h1 className="mt-4 font-display text-4xl font-semibold text-ink">No entry at this address.</h1>
      <p className="mt-3 max-w-md text-sm text-ink/60">
        This page isn't on the register. Check the link, or head back to the docket.
      </p>
      <Link
        to="/"
        className="mt-7 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper-50"
      >
        Return home
      </Link>
    </div>
  );
}
