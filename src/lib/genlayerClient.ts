import { createClient } from 'genlayer-js';
import { studionet, testnetBradbury } from 'genlayer-js/chains';
import { NETWORKS, NetworkKey } from '../config/chains';

const chainFor = (network: NetworkKey) =>
  network === 'studionet' ? studionet : testnetBradbury;

export function getReadClient(network: NetworkKey) {
  return createClient({ chain: chainFor(network) });
}

export function getWriteClient(network: NetworkKey, account: `0x${string}`) {
  return createClient({ chain: chainFor(network), account });
}

export function getContractAddress(network: NetworkKey): string {
  return NETWORKS[network].contractAddress;
}
