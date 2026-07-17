import { NETWORKS, NetworkKey } from '../config/chains';

interface Props {
  network: NetworkKey;
  onChange: (n: NetworkKey) => void;
}

export default function NetworkToggle({ network, onChange }: Props) {
  return (
    <div className="inline-flex items-center rounded-full border border-ink/15 bg-paper-50 p-0.5 text-xs font-medium">
      {(Object.keys(NETWORKS) as NetworkKey[]).map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-1.5 rounded-full transition-colors duration-200 ${
            network === key
              ? 'bg-ink text-paper-50'
              : 'text-ink/60 hover:text-ink'
          }`}
          aria-pressed={network === key}
        >
          {NETWORKS[key].label}
        </button>
      ))}
    </div>
  );
}
