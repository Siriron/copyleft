import { createClient } from 'genlayer-js';
import { studionet, testnetBradbury } from 'genlayer-js/chains';
import { NETWORKS, NetworkKey } from '../config/chains';

const chainFor = (network: NetworkKey) =>
  network === 'studionet' ? studionet : testnetBradbury;

// The genlayer-js client's internal chain config does NOT force the
// connected wallet to switch chains — MetaMask stays on whatever chain it
// was last on, so a write can silently land on the wrong network unless we
// explicitly request a switch first. This mirrors Sigil's confirmed-working
// ensureChain fix.
const CHAIN_CONFIGS: Record<NetworkKey, {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: { name: string; symbol: string; decimals: number };
  blockExplorerUrls: string[];
}> = {
  bradbury: {
    chainId: NETWORKS.bradbury.chainIdHex,
    chainName: 'GenLayer Bradbury',
    rpcUrls: [NETWORKS.bradbury.rpcUrl],
    nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
    blockExplorerUrls: [NETWORKS.bradbury.explorerUrl],
  },
  studionet: {
    chainId: NETWORKS.studionet.chainIdHex,
    chainName: 'GenLayer StudioNet',
    rpcUrls: [NETWORKS.studionet.rpcUrl],
    nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
    blockExplorerUrls: [NETWORKS.studionet.explorerUrl],
  },
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function ensureChain(network: NetworkKey): Promise<void> {
  const eth = (window as any).ethereum;
  if (!eth) return;
  const cfg = CHAIN_CONFIGS[network];
  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: cfg.chainId }],
    });
  } catch (switchErr: any) {
    if (switchErr?.code === 4902) {
      // Chain not registered in the wallet yet — add it, then switch.
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [cfg],
      });
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: cfg.chainId }],
      });
    } else if (switchErr?.code === -32002) {
      // A wallet_switchEthereumChain request is already pending in the
      // wallet UI — give the user a moment to respond to it.
      await sleep(3000);
    } else {
      throw switchErr;
    }
  }
}

export function getReadClient(network: NetworkKey) {
  return createClient({ chain: chainFor(network) });
}

export function getWriteClient(network: NetworkKey, account: `0x${string}`) {
  return createClient({
    chain: chainFor(network),
    account,
    provider: (window as any).ethereum,
  });
}

export function getContractAddress(network: NetworkKey): string {
  return NETWORKS[network].contractAddress;
}

